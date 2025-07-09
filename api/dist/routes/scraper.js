"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = __importDefault(require("jsdom"));
const date_fns_1 = require("date-fns");
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
function durationToMinutes(duration) {
    return (duration.hours || 0) * 60 + (duration.minutes || 0);
}
function getTime(time) {
    if (!time || typeof time !== 'string')
        return 0;
    if (time.indexOf('P') === 0) {
        const now = new Date();
        const duration = (0, date_fns_1.intervalToDuration)({ start: now, end: new Date(now.getTime() + parseISODurationToMs(time)) });
        return durationToMinutes(duration);
    }
    else {
        return Math.round(((0, parse_duration_1.default)(time) || 0) / 60000);
    }
}
function parseISODurationToMs(isoDuration) {
    const match = isoDuration.match(/P(?:T)?(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match)
        return 0;
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return (hours * 60 + minutes) * 60000;
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
const scraper = {
    fetch: async (recipeUrl) => {
        const page = await fetch(recipeUrl, { headers: HEADERS });
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