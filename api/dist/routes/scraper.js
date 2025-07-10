"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = __importDefault(require("jsdom"));
const parse_duration_1 = __importDefault(require("parse-duration"));
const { JSDOM } = jsdom_1.default;
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
};
const parseIngredients = (ing) => {
    if (!Array.isArray(ing))
        return [];
    if (ing.length === 1 &&
        typeof ing[0] === 'string' &&
        ing[0].indexOf('\n') !== -1) {
        return ing[0].split('\n');
    }
    else {
        return ing;
    }
};
const parseStep = (step) => {
    if (step && step['@type'] && step['@type'] === 'HowToSection') {
        return step.itemListElement || [];
    }
    else {
        return [step];
    }
};
const parseSteps = (steps) => {
    if (!steps)
        return [];
    if (!Array.isArray(steps)) {
        const doc = getDocument(steps);
        return Array.from(doc.querySelectorAll('p')).map((p) => p.innerHTML);
    }
    else {
        return steps.map(parseStep).flat();
    }
};
function getTime(time) {
    if (!time || typeof time !== 'string')
        return 0;
    if (time.indexOf('P') === 0) {
        return Math.round(parseISODurationToMs(time) / 60000);
    }
    else {
        return Math.round(((0, parse_duration_1.default)(time) || 0) / 60000);
    }
}
function parseISODurationToMs(isoDuration) {
    const match = isoDuration.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match)
        return 0;
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
const getRecipeData = (recipe) => {
    if (!recipe)
        return {};
    let author = Array.isArray(recipe.author) ? recipe.author[0] : recipe.author;
    let authorName = typeof author === 'object' && author?.name
        ? author.name
        : typeof author === 'string'
            ? author
            : '';
    const ingredients = parseIngredients(recipe.recipeIngredient);
    const stepsRaw = parseSteps(recipe.recipeInstructions);
    const steps = stepsRaw.map((step) => {
        if (typeof step === 'string')
            return { text: step };
        if (typeof step === 'object' && step?.text)
            return { text: step.text };
        if (typeof step === 'object' && step?.name)
            return { text: step.name };
        return { text: JSON.stringify(step) };
    });
    const recipeData = {
        name: recipe?.name || '',
        author: authorName,
        servings: recipe?.recipeYield || '',
        ingredients: ingredients.map((ing) => ({ text: ing })),
        steps,
    };
    if (recipe?.prepTime) {
        try {
            recipeData.prepTime = getTime(recipe.prepTime) + ' min';
        }
        catch { }
    }
    if (recipe?.cookTime && recipe?.totalTime) {
        try {
            recipeData.inactiveTime =
                (getTime(recipe.totalTime) - getTime(recipe.cookTime)) + ' min';
            recipeData.cookTime = getTime(recipe.cookTime) + ' min';
        }
        catch { }
    }
    else if (recipe?.cookTime) {
        try {
            recipeData.cookTime = getTime(recipe.cookTime) + ' min';
        }
        catch { }
    }
    if (!recipe?.cookTime && !recipe?.prepTime && recipe?.totalTime) {
        try {
            recipeData.cookTime = getTime(recipe.totalTime) + ' min';
        }
        catch { }
    }
    return recipeData;
};
const getDocument = (text) => {
    const virtualConsole = new jsdom_1.default.VirtualConsole();
    virtualConsole.on('error', () => { });
    const env = new JSDOM(text, { virtualConsole });
    return env.window.document;
};
const getHeadersForUrl = (url) => {
    if (url.includes('foodnetwork.com')) {
        return {
            ...HEADERS,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.foodnetwork.com/',
            'Connection': 'keep-alive',
            'Cookie': 'euConsent=true;',
        };
    }
    return HEADERS;
};
const scraper = {
    fetch: async (recipeUrl) => {
        const page = await fetch(recipeUrl, { headers: getHeadersForUrl(recipeUrl) });
        if (page && page.ok) {
            const text = await page.text();
            const document = getDocument(text);
            const ldJsonNodes = Array.from(document.querySelectorAll("script[type='application/ld+json']"));
            let rawldData = [];
            for (const s of ldJsonNodes) {
                try {
                    const parsed = JSON.parse(s.textContent || '');
                    if (Array.isArray(parsed)) {
                        rawldData.push(...parsed);
                    }
                    else {
                        rawldData.push(parsed);
                    }
                }
                catch (e) {
                }
            }
            let ldData = rawldData.reduce((allNodes, current) => {
                if (current && current.hasOwnProperty('@graph')) {
                    return allNodes.concat(current['@graph'].filter((g) => {
                        const t = g?.['@type'];
                        return ((typeof t === 'string' && t === 'Recipe') ||
                            (Array.isArray(t) && t.includes('Recipe')));
                    }));
                }
                else if (current &&
                    current.hasOwnProperty('@type') &&
                    ((typeof current['@type'] === 'string' &&
                        current['@type'] === 'Recipe') ||
                        (typeof current['@type'] === 'string' &&
                            current['@type'].indexOf('Recipe') !== -1) ||
                        (Array.isArray(current['@type']) &&
                            current['@type'].includes('Recipe')))) {
                    return allNodes.concat(current);
                }
                return allNodes;
            }, []);
            const recipe = ldData
                .filter((l) => l?.hasOwnProperty('@type'))
                .find((l) => {
                const t = l['@type'];
                return ((typeof t === 'string' &&
                    (t === 'Recipe' || t.indexOf('Recipe') !== -1)) ||
                    (Array.isArray(t) && t.includes('Recipe')));
            });
            if (recipe) {
                return getRecipeData(recipe);
            }
            else {
                throw new Error(`No ld+json/@Recipe data tag, can't parse recipe ${recipeUrl}`);
            }
        }
        else {
            throw new Error(`Unable to fetch ${recipeUrl}`);
        }
    },
};
exports.default = scraper;
//# sourceMappingURL=scraper.js.map