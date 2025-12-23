import { JSDOM } from 'jsdom';

export interface ScrapedRecipe {
  name: string;
  description?: string;
  author?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  inactiveTime?: string;
  ingredients: string[];
  steps: string[];
}

// Pool of modern user agents to rotate through (looks less like a bot)
const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
];

// Pick a consistent but randomized user agent based on the URL
const getUserAgent = (url: string): string => {
  const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % USER_AGENTS.length;
  const agent = USER_AGENTS[index];
  return agent ?? USER_AGENTS[0]!;
};

const getDefaultHeaders = (url: string) => ({
  'User-Agent': getUserAgent(url),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
});

// Convert decimal fractions back to unicode fractions for readability
const decimalToFraction = (value: number): string => {
  const fractions: { [key: string]: string } = {
    '0.333333': '⅓',
    '0.333334': '⅓',
    '0.33333': '⅓',
    '0.5': '½',
    '0.666666': '⅔',
    '0.666667': '⅔',
    '0.66667': '⅔',
    '0.25': '¼',
    '0.75': '¾',
    '0.2': '⅕',
    '0.4': '⅖',
    '0.6': '⅗',
    '0.8': '⅘',
    '0.166666': '⅙',
    '0.166667': '⅙',
    '0.16667': '⅙',
    '0.125': '⅛',
    '0.375': '⅜',
    '0.625': '⅝',
    '0.875': '⅞',
    '0.111111': '⅑',
    '0.111112': '⅑',
    '0.11111': '⅑',
    '0.142857': '⅐',
    '0.142858': '⅐',
    '0.14286': '⅐',
  };

  const str = value.toString();
  for (const [decimal, fraction] of Object.entries(fractions)) {
    if (str.startsWith(decimal)) {
      return fraction;
    }
  }
  return value.toString();
};

const cleanIngredient = (text: string): string => {
  // Replace decimal fractions with unicode fractions
  // Match patterns like "0.333333 " at the start or after whitespace
  return text.replace(/(\s|^)(0\.\d+)(\s)/g, (match, before, decimal, after) => {
    const num = parseFloat(decimal);
    const fraction = decimalToFraction(num);
    // Only replace if it's actually a fraction (not just any decimal)
    if (fraction !== decimal) {
      return before + fraction + after;
    }
    return match;
  });
};

const parseIngredients = (ing: any): string[] => {
  if (!Array.isArray(ing)) return [];
  if (
    ing.length === 1 &&
    typeof ing[0] === 'string' &&
    ing[0].indexOf('\n') !== -1
  ) {
    return ing[0].split('\n').map((i: string) => cleanIngredient(i.trim())).filter((i: string) => i.length > 0);
  } else {
    return ing.map((i: string) => {
      const text = typeof i === 'string' ? i.trim() : String(i);
      return cleanIngredient(text);
    }).filter((i: string) => i.length > 0);
  }
};

const parseStep = (step: any): any[] => {
  if (step && step['@type'] && step['@type'] === 'HowToSection') {
    return step.itemListElement || [];
  } else {
    return [step];
  }
};

const parseSteps = (steps: any): any[] => {
  if (!steps) return [];
  if (!Array.isArray(steps)) {
    const doc = getDocument(steps);
    return Array.from(doc.querySelectorAll('p')).map((p) => p.innerHTML);
  } else {
    return steps.map(parseStep).flat();
  }
};

function getTime(time: string): number {
  if (!time || typeof time !== 'string') return 0;
  if (time.indexOf('P') === 0) {
    // ISO-8601 duration
    return Math.round(parseISODurationToMs(time) / 60000);
  } else {
    // fallback to manual parsing
    return parseTimeStringToMinutes(time);
  }
}

export function parseISODurationToMs(isoDuration: string): number {
  const match = isoDuration.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (!match) return 0;

  const years = match[1] ? parseInt(match[1], 10) : 0;
  const months = match[2] ? parseInt(match[2], 10) : 0;
  const days = match[3] ? parseInt(match[3], 10) : 0;
  const hours = match[4] ? parseInt(match[4], 10) : 0;
  const minutes = match[5] ? parseInt(match[5], 10) : 0;
  const seconds = match[6] ? parseFloat(match[6]) : 0;

  const totalMs = (years * 365 * 24 * 60 * 60 * 1000) +
    (months * 30 * 24 * 60 * 60 * 1000) +
    (days * 24 * 60 * 60 * 1000) +
    (hours * 60 * 60 * 1000) +
    (minutes * 60 * 1000) +
    (seconds * 1000);

  return totalMs;
}

export function parseTimeStringToMinutes(timeStr: string): number {
  let totalMinutes = 0;
  
  const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
  const minMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*mins?/i);

  if (hourMatch) {
    totalMinutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }
  if (minMatch) {
    totalMinutes += Math.round(parseFloat(minMatch[1]));
  }

  return totalMinutes;
}

const getRecipeData = (recipe: any): ScrapedRecipe => {
  if (!recipe) return { name: '', ingredients: [], steps: [] } as ScrapedRecipe;

  let author = Array.isArray(recipe.author) ? recipe.author[0] : recipe.author;
  let authorName =
    typeof author === 'object' && author?.name
      ? author.name
      : typeof author === 'string'
        ? author
        : '';

  const ingredients = parseIngredients(recipe.recipeIngredient);
  const stepsRaw = parseSteps(recipe.recipeInstructions);
  const steps = stepsRaw.map((step: any) => {
    if (typeof step === 'string') return step;
    if (typeof step === 'object' && step?.text) return step.text;
    if (typeof step === 'object' && step?.name) return step.name;
    return JSON.stringify(step);
  }).filter((s: string) => s.length > 0);

  const recipeData: ScrapedRecipe = {
    name: recipe?.name || 'Unnamed Recipe',
    description: recipe?.description || undefined,
    author: authorName || undefined,
    servings: recipe?.recipeYield || undefined,
    ingredients,
    steps,
  };

  if (recipe?.prepTime) {
    try {
      const minutes = getTime(recipe.prepTime);
      if (minutes > 0) {
        recipeData.prepTime = minutes + ' min';
      }
    } catch { }
  }

  if (recipe?.cookTime && recipe?.totalTime) {
    try {
      const totalTime = getTime(recipe.totalTime);
      const cookTime = getTime(recipe.cookTime);
      const inactiveTime = totalTime - cookTime;
      if (cookTime > 0) {
        recipeData.cookTime = cookTime + ' min';
      }
      if (inactiveTime > 0) {
        recipeData.inactiveTime = inactiveTime + ' min';
      }
    } catch { }
  } else if (recipe?.cookTime) {
    try {
      const minutes = getTime(recipe.cookTime);
      if (minutes > 0) {
        recipeData.cookTime = minutes + ' min';
      }
    } catch { }
  }

  if (!recipe?.cookTime && !recipe?.prepTime && recipe?.totalTime) {
    try {
      const minutes = getTime(recipe.totalTime);
      if (minutes > 0) {
        recipeData.cookTime = minutes + ' min';
      }
    } catch { }
  }

  return recipeData;
};

const getDocument = (text: string): Document => {
  // Temporarily suppress console output during JSDOM parsing to hide CSS and resource errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = () => {};
  console.warn = () => {};
  
  try {
    const env = new JSDOM(text, {
      runScripts: "outside-only",
    });
    return env.window.document;
  } finally {
    // Restore original console methods
    console.error = originalError;
    console.warn = originalWarn;
  }
};

const getHeadersForUrl = (url: string) => {
  const baseHeaders = getDefaultHeaders(url);

  // Site-specific headers for picky websites
  if (url.includes('foodnetwork.com')) {
    return {
      ...baseHeaders,
      'Referer': 'https://www.foodnetwork.com/',
      'Origin': 'https://www.foodnetwork.com',
      'Cookie': 'euConsent=true;',
    };
  }

  if (url.includes('allrecipes.com')) {
    return {
      ...baseHeaders,
      'Referer': 'https://www.allrecipes.com/',
    };
  }

  if (url.includes('bonappetit.com')) {
    return {
      ...baseHeaders,
      'Referer': 'https://www.bonappetit.com/',
    };
  }

  if (url.includes('epicurious.com')) {
    return {
      ...baseHeaders,
      'Referer': 'https://www.epicurious.com/',
    };
  }

  if (url.includes('claude.ai')) {
    return {
      ...baseHeaders,
      'Referer': 'https://claude.ai/',
      'Origin': 'https://claude.ai',
    };
  }

  return baseHeaders;
};

export const scraper = {
  fetch: async (recipeUrl: string): Promise<ScrapedRecipe> => {
    try {
      const page = await fetch(recipeUrl, { 
        headers: getHeadersForUrl(recipeUrl),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!page.ok) {
        if (recipeUrl.includes('claude.ai') && page.status === 403) {
          throw new Error(`HTTP ${page.status}: Claude.ai artifacts require authentication. Please make sure the artifact is publicly accessible or copy the recipe content manually.`);
        }
        throw new Error(`HTTP ${page.status}: Unable to fetch the page`);
      }

      const text = await page.text();
      const document = getDocument(text);
      const ldJsonNodes = Array.from(
        document.querySelectorAll("script[type='application/ld+json']"),
      );

      let rawldData: any[] = [];
      for (const s of ldJsonNodes) {
        try {
          const parsed = JSON.parse(s.textContent || '');
          if (Array.isArray(parsed)) {
            rawldData.push(...parsed);
          } else {
            rawldData.push(parsed);
          }
        } catch (e) {
          // skip invalid JSON
        }
      }

      let ldData = rawldData.reduce((allNodes: any[], current: any) => {
        if (current && current.hasOwnProperty('@graph')) {
          return allNodes.concat(
            current['@graph'].filter((g: any) => {
              const t = g?.['@type'];
              return (
                (typeof t === 'string' && t === 'Recipe') ||
                (Array.isArray(t) && t.includes('Recipe'))
              );
            }),
          );
        } else if (
          current &&
          current.hasOwnProperty('@type') &&
          ((typeof current['@type'] === 'string' &&
            current['@type'] === 'Recipe') ||
            (typeof current['@type'] === 'string' &&
              current['@type'].indexOf('Recipe') !== -1) ||
            (Array.isArray(current['@type']) &&
              current['@type'].includes('Recipe')))
        ) {
          return allNodes.concat(current);
        }

        return allNodes;
      }, []);

      const recipe = ldData
        .filter((l: any) => l?.hasOwnProperty('@type'))
        .find((l: any) => {
          const t = l['@type'];
          return (
            (typeof t === 'string' &&
              (t === 'Recipe' || t.indexOf('Recipe') !== -1)) ||
            (Array.isArray(t) && t.includes('Recipe'))
          );
        });

      if (recipe) {
        return getRecipeData(recipe);
      } else {
        throw new Error('No recipe data found on this page. The website may not have properly formatted recipe information.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while scraping');
    }
  },
};

