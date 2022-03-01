const fetch = require('node-fetch');
const jsdom = require('jsdom');
const moment = require('moment');
const parseDuration = require('parse-duration');

const JSDOM = jsdom.JSDOM;
const HEADERS = {
  'User-Agent': "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
};

function getRecipeData(recipe) {
  const author = Array.isArray(recipe.author) ? recipe.author[0] : recipe.author;
  const recipeData = {
    name: recipe.name,
    author: author.name,
    servings: recipe.recipeYield,
    ingredients: recipe.recipeIngredient.map(function (ing) {
      return {text: ing};
    }),
    steps: recipe.recipeInstructions.map(function (step) {
      return {text: step.text};
    })
  };
  if (recipe.prepTime) {
    recipeData.prepTime = getTime(recipe.prepTime).asMinutes() + " min";
  }
  if (recipe.cookTime) {
    recipeData.inactiveTime = getTime(recipe.totalTime).subtract(getTime(recipe.cookTime)).asMinutes() + " min";
    recipeData.cookTime = getTime(recipe.cookTime).asMinutes() + " min";
  }
  return recipeData;
}

function getTime(time) {
  return moment.duration(parseDuration(time));
}

const getDocument = text => {
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", () => {
  });
  const env = new JSDOM(text, {virtualConsole});
  return env.window.document;
}

const fetchBonAppetit = async function (recipeUrl) {
  const res = await fetch(recipeUrl, {headers: HEADERS});
  if (res) {
    const text = await res.text();
    const document = getDocument(text);
    const recipe = JSON.parse(document.querySelector("head > script[type='application/ld+json']").textContent);
    return getRecipeData(recipe);
  } else {
    console.error(`Unable to read recipe at [${recipeUrl}`);
  }
};

const fetchEpicurious = async function (recipeUrl) {
  const res = await fetch(recipeUrl, {headers: HEADERS});
  if (res) {
    const text = await res.text();
    const document = getDocument(text);
    const recipe = JSON.parse(document.querySelector("head > script[type='application/ld+json']").textContent);
    return getRecipeData(recipe);
  } else {
    console.error(`Unable to read recipe at [${recipeUrl}`);
  }
};

const fetchOnceUponAChef = async function (recipeUrl) {
  const res = await fetch(recipeUrl, {headers: HEADERS});
  if (res) {
    const text = await res.text();
    const document = getDocument(text);
    const recipe = JSON.parse(document.querySelectorAll("head > script[type='application/ld+json']")[1].textContent);
    return getRecipeData(recipe);
  } else {
    console.error(`Unable to read recipe at [${recipeUrl}`);
  }
};

const fetchAllRecipes = async function (recipeUrl) {
  const res = await fetch(recipeUrl, {headers: HEADERS});
  if (res) {
    const text = await res.text();
    const document = getDocument(text);
    const ldData = JSON.parse(document.querySelector("head > script[type='application/ld+json']").textContent);
    const recipe = ldData[1];
    // console.log(JSON.stringify(recipe, null, 2));
    return getRecipeData(recipe);
  } else {
    console.error(`Unable to read recipe at [${recipeUrl}`);
  }
};

const fetchFoodNetwork = async function (recipeUrl) {
  const res = await fetch(recipeUrl, {headers: HEADERS});
  if (res) {
    const text = await res.text();
    const document = getDocument(text);
    const ldData = JSON.parse(document.querySelector("script[type='application/ld+json']").textContent);
    const recipe = ldData[0];
    // console.log(JSON.stringify(recipe, null, 2));
    return getRecipeData(recipe);
  } else {
    console.error(`Unable to read recipe at [${recipeUrl}`);
  }
};

module.exports = {
  fetch: async function (url) {
    if (url.indexOf("foodnetwork.com") !== -1) {
      return await fetchFoodNetwork(url)
    } else if (url.indexOf("allrecipes.com") !== -1) {
      return await fetchAllRecipes(url);
    } else if (url.indexOf("onceuponachef.com") !== -1) {
      return await fetchOnceUponAChef(url);
    } else if (url.indexOf("epicurious.com") !== -1) {
      return await fetchEpicurious(url);
    } else if (url.indexOf("bonappetit.com") !== -1) {
      return await fetchBonAppetit(url);
    } else {
      console.log(`Unknown recipe provider: ${url}`)
    }
  }
};
