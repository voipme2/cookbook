const fetch = require("node-fetch");
const jsdom = require("jsdom");
const moment = require("moment");
const parseDuration = require("parse-duration");

const JSDOM = jsdom.JSDOM;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
};

const parseIngredients = (ing) => {
  if (ing.length === 1 && ing[0].indexOf("\n") !== -1) {
    return ing[0].split("\n");
  } else {
    return ing;
  }
};

const parseSteps = (steps) => {
  if (!Array.isArray(steps)) {
    // handlers for barefoot contessa site :/
    const doc = getDocument(steps);
    return Array.from(doc.querySelectorAll("p")).map((p) => p.innerHTML);
  } else {
    return steps;
  }
};

const getRecipeImage = (recipe) => {
  const images = recipe.image;
  if (Array.isArray(images)) {
    return images[0];
  } else {
    return images;
  }
}

const getRecipeData = (recipe) => {
  const author = Array.isArray(recipe.author)
    ? recipe.author[0]
    : recipe.author;
  const ingredients = parseIngredients(recipe.recipeIngredient);
  const steps = parseSteps(recipe.recipeInstructions);

  const recipeData = {
    name: recipe.name,
    author: author.name,
    servings: recipe.recipeYield,
    ingredients: ingredients.map((ing) => ({text: ing})),
    steps: steps.map((step) => ({text: step.text})),
  };



  if (recipe.prepTime) {
    recipeData.prepTime = getTime(recipe.prepTime).asMinutes() + " min";
  }
  if (recipe.cookTime) {
    recipeData.inactiveTime =
      getTime(recipe.totalTime).subtract(getTime(recipe.cookTime)).asMinutes() +
      " min";
    recipeData.cookTime = getTime(recipe.cookTime).asMinutes() + " min";
  }
  return recipeData;
};

function getTime(time) {
  return moment.duration(parseDuration(time));
}

const getDocument = (text) => {
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", () => {
  });
  const env = new JSDOM(text, {virtualConsole});
  return env.window.document;
};

module.exports = {
  fetch: async (recipeUrl) => {
    const page = await fetch(recipeUrl, {headers: HEADERS});
    if (page && page.ok) {
      const text = await page.text();
      const document = getDocument(text);
      const ldJsonNodes = Array.from(
        document.querySelectorAll("script[type='application/ld+json']")
      );
      let rawldData = ldJsonNodes.map((s) => JSON.parse(s.textContent)).flat();
      let ldData = rawldData.reduce((allNodes, current) => {
        if (current.hasOwnProperty("@graph")) {
          return allNodes.concat(
            current["@graph"].filter(
              (g) => g.hasOwnProperty("@type") && g["@type"] === "Recipe"
            )
          );
        } else if (
          current.hasOwnProperty("@type") &&
          (current["@type"] === "Recipe" ||
            current["@type"].indexOf("Recipe") !== -1)
        ) {
          return allNodes.concat(current);
        }
        return allNodes;
      }, []);

      const recipe = ldData
        .filter((l) => l.hasOwnProperty("@type"))
        .find(
          (l) => l["@type"] === "Recipe" || l["@type"].indexOf("Recipe") !== -1
        );

      if (recipe) {
        return getRecipeData(recipe);
      } else {
        throw new Error(
          `No ld+json/@Recipe data tag, can't parse recipe ${recipeUrl}`
        );
      }
    } else {
      console.error(`Unable to fetch ${recipeUrl}`, page);
      throw new Error(`Unable to fetch ${recipeUrl}`);
    }
  },
};
