import jsdom from 'jsdom';
import parseDuration from 'parse-duration';
import { ScrapedRecipe } from '../types';

const { JSDOM } = jsdom;

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

const parseIngredients = (ing: any): string[] => {
  if (!Array.isArray(ing)) return [];
  if (
    ing.length === 1 &&
    typeof ing[0] === 'string' &&
    ing[0].indexOf('\n') !== -1
  ) {
    return ing[0].split('\n');
  } else {
    return ing;
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
    // Example: PT12M => 12 minutes, PT1H30M => 90 minutes
    return Math.round(parseISODurationToMs(time) / 60000);
  } else {
    // fallback to parse-duration (returns ms)
    return Math.round((parseDuration(time) || 0) / 60000);
  }
}

// Helper to parse ISO-8601 duration to ms
function parseISODurationToMs(isoDuration: string): number {
  // Handle full ISO-8601 duration format: P0Y0M0DT0H12M0.000S
  const match = isoDuration.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (!match) return 0;
  
  const years = match[1] ? parseInt(match[1], 10) : 0;
  const months = match[2] ? parseInt(match[2], 10) : 0;
  const days = match[3] ? parseInt(match[3], 10) : 0;
  const hours = match[4] ? parseInt(match[4], 10) : 0;
  const minutes = match[5] ? parseInt(match[5], 10) : 0;
  const seconds = match[6] ? parseFloat(match[6]) : 0;
  
  // Convert to milliseconds (approximate for months/years)
  const totalMs = (years * 365 * 24 * 60 * 60 * 1000) + 
                  (months * 30 * 24 * 60 * 60 * 1000) + 
                  (days * 24 * 60 * 60 * 1000) + 
                  (hours * 60 * 60 * 1000) + 
                  (minutes * 60 * 1000) + 
                  (seconds * 1000);
  
  return totalMs;
}

const getRecipeData = (recipe: any): ScrapedRecipe => {
  if (!recipe) return {} as ScrapedRecipe;
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
    if (typeof step === 'string') return { text: step };
    if (typeof step === 'object' && step?.text) return { text: step.text };
    if (typeof step === 'object' && step?.name) return { text: step.name };
    return { text: JSON.stringify(step) };
  });
  const recipeData: ScrapedRecipe = {
    name: recipe?.name || '',
    author: authorName,
    servings: recipe?.recipeYield || '',
    ingredients: ingredients.map((ing: string) => ({ text: ing })),
    steps,
  };
  if (recipe?.prepTime) {
    try {
      recipeData.prepTime = getTime(recipe.prepTime) + ' min';
    } catch {}
  }
  if (recipe?.cookTime && recipe?.totalTime) {
    try {
      recipeData.inactiveTime =
        (getTime(recipe.totalTime) - getTime(recipe.cookTime)) + ' min';
      recipeData.cookTime = getTime(recipe.cookTime) + ' min';
    } catch {}
  } else if (recipe?.cookTime) {
    try {
      recipeData.cookTime = getTime(recipe.cookTime) + ' min';
    } catch {}
  }
  if (!recipe?.cookTime && !recipe?.prepTime && recipe?.totalTime) {
    try {
      recipeData.cookTime = getTime(recipe.totalTime) + ' min';
    } catch {}
  }
  return recipeData;
};

const getDocument = (text: string): Document => {
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on('error', () => {});
  const env = new JSDOM(text, { virtualConsole });
  return env.window.document;
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
  
  return baseHeaders;
};

const scraper = {
  fetch: async (recipeUrl: string): Promise<ScrapedRecipe> => {
    const page = await fetch(recipeUrl, { headers: getHeadersForUrl(recipeUrl) });
    if (page && (page as any).ok) {
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
        throw new Error(
          `No ld+json/@Recipe data tag, can't parse recipe ${recipeUrl}`,
        );
      }
    } else {
      throw new Error(`Unable to fetch ${recipeUrl}`);
    }
  },
};

export default scraper; 