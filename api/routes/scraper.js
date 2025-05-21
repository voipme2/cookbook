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
  if (!Array.isArray(ing)) return [];
  if (
    ing.length === 1 &&
    typeof ing[0] === "string" &&
    ing[0].indexOf("\n") !== -1
  ) {
    return ing[0].split("\n");
  } else {
    return ing;
  }
};

const parseStep = (step) => {
  if (step && step["@type"] && step["@type"] === "HowToSection") {
    return step.itemListElement || [];
  } else {
    return [step];
  }
};

const parseSteps = (steps) => {
  if (!steps) return [];
  if (!Array.isArray(steps)) {
    // handlers for barefoot contessa site :/
    const doc = getDocument(steps);
    return Array.from(doc.querySelectorAll("p")).map((p) => p.innerHTML);
  } else {
    return steps.map(parseStep).flat();
  }
};

const getRecipeData = (recipe) => {
  if (!recipe) return {};
  let author = Array.isArray(recipe.author) ? recipe.author[0] : recipe.author;
  let authorName =
    typeof author === "object" && author?.name
      ? author.name
      : typeof author === "string"
        ? author
        : "";
  const ingredients = parseIngredients(recipe.recipeIngredient);
  const stepsRaw = parseSteps(recipe.recipeInstructions);
  // Step parsing: handle both string and object
  const steps = stepsRaw.map((step) => {
    if (typeof step === "string") return { text: step };
    if (typeof step === "object" && step?.text) return { text: step.text };
    if (typeof step === "object" && step?.name) return { text: step.name };
    return { text: JSON.stringify(step) };
  });

  const recipeData = {
    name: recipe?.name || "",
    author: authorName,
    servings: recipe?.recipeYield || "",
    ingredients: ingredients.map((ing) => ({ text: ing })),
    steps,
  };

  // Time fields: check for existence and validity
  if (recipe?.prepTime) {
    try {
      recipeData.prepTime = getTime(recipe.prepTime).asMinutes() + " min";
    } catch {}
  }
  if (recipe?.cookTime && recipe?.totalTime) {
    try {
      recipeData.inactiveTime =
        getTime(recipe.totalTime)
          .subtract(getTime(recipe.cookTime))
          .asMinutes() + " min";
      recipeData.cookTime = getTime(recipe.cookTime).asMinutes() + " min";
    } catch {}
  } else if (recipe?.cookTime) {
    try {
      recipeData.cookTime = getTime(recipe.cookTime).asMinutes() + " min";
    } catch {}
  }
  if (!recipe?.cookTime && !recipe?.prepTime && recipe?.totalTime) {
    try {
      recipeData.cookTime = getTime(recipe.totalTime).asMinutes() + " min";
    } catch {}
  }

  return recipeData;
};

function getTime(time) {
  if (!time || typeof time !== "string") return moment.duration(0);
  if (time.indexOf("P") === 0) {
    // ISO-8601 duration
    return moment.duration(time);
  } else {
    return moment.duration(parseDuration(time));
  }
}

const getDocument = (text) => {
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", () => {});
  const env = new JSDOM(text, { virtualConsole });
  return env.window.document;
};

module.exports = {
  fetch: async (recipeUrl) => {
    const page = await fetch(recipeUrl, { headers: HEADERS });
    if (page && page.ok) {
      const text = await page.text();
      const document = getDocument(text);
      const ldJsonNodes = Array.from(
        document.querySelectorAll("script[type='application/ld+json']"),
      );
      let rawldData = [];
      for (const s of ldJsonNodes) {
        try {
          const parsed = JSON.parse(s.textContent);
          if (Array.isArray(parsed)) {
            rawldData.push(...parsed);
          } else {
            rawldData.push(parsed);
          }
        } catch (e) {
          // skip invalid JSON
        }
      }
      let ldData = rawldData.reduce((allNodes, current) => {
        if (current && current.hasOwnProperty("@graph")) {
          return allNodes.concat(
            current["@graph"].filter((g) => {
              const t = g?.["@type"];
              return (
                (typeof t === "string" && t === "Recipe") ||
                (Array.isArray(t) && t.includes("Recipe"))
              );
            }),
          );
        } else if (
          current &&
          current.hasOwnProperty("@type") &&
          ((typeof current["@type"] === "string" &&
            current["@type"] === "Recipe") ||
            (typeof current["@type"] === "string" &&
              current["@type"].indexOf("Recipe") !== -1) ||
            (Array.isArray(current["@type"]) &&
              current["@type"].includes("Recipe")))
        ) {
          return allNodes.concat(current);
        }
        return allNodes;
      }, []);

      const recipe = ldData
        .filter((l) => l?.hasOwnProperty("@type"))
        .find((l) => {
          const t = l["@type"];
          return (
            (typeof t === "string" &&
              (t === "Recipe" || t.indexOf("Recipe") !== -1)) ||
            (Array.isArray(t) && t.includes("Recipe"))
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
      console.error(`Unable to fetch ${recipeUrl}`, page);
      throw new Error(`Unable to fetch ${recipeUrl}`);
    }
  },
};
