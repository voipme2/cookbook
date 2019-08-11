var request = require('request'),
  jsdom = require('jsdom'),
  moment = require('moment'),
  parseDuration = require('parse-duration');

const JSDOM = jsdom.JSDOM;
const HEADERS = {
  'User-Agent': "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
};

var fetchAllRecipes = function (recipeUrl, success, error) {
  request({url: recipeUrl, headers: HEADERS}, function (err, resp, body) {
    if (!err && resp.statusCode === 200) {
      var env = new JSDOM(body);
      var document = env.window.document;
      var sNumber = document.querySelector("meta[itemprop='recipeYield']").content;
      var recipeData = {
        name: document.querySelector("h1.recipe-summary__h1").textContent,
        author: document.querySelector("span.submitter__name").textContent,
        servings: sNumber + " " + document.querySelector("span.servings-count").textContent.trim(),
        ingredients: Array.prototype.slice.call(document.querySelectorAll("span.recipe-ingred_txt[itemprop='ingredients']")).map(function (ing) {
          return {text: ing.textContent};
        }).filter(function (ing) {
          return ing.text.length > 0 && ing.text !== "Add all ingredients to list";
        }),
        steps: Array.prototype.slice.call(document.querySelectorAll("span.recipe-directions__list--item")).map(function (step) {
          return {text: step.textContent};
        }).filter(function (ste) {
          return ste.text.length > 0
        }),
        prepTime: moment.duration(parseDuration(document.querySelector("time[itemprop='prepTime']").textContent)).asMinutes() + " min",
        cookTime: moment.duration(parseDuration(document.querySelector("time[itemprop='cookTime']").textContent)).asMinutes() + " min"
      };

      success(recipeData);

    } else {
      error(err);
    }
  });
};

function getTime(time) {
  return moment.duration(parseDuration(time));
}

var fetchFoodNetwork = function (recipeUrl, success, error) {
  request({url: recipeUrl, headers: HEADERS}, function (err, resp, body) {
    if (!err && resp.statusCode === 200) {
      var env = new JSDOM(body);
      var document = env.window.document;
      // thanks, foodnetwork!
      var ldData = JSON.parse(document.querySelector("script[type='application/ld+json']").textContent)[0];
      var recipeData = {
        name: ldData.name,
        author: ldData.author[0] ? ldData.author[0].name : '',
        servings: ldData.recipeYield,
        ingredients: ldData.recipeIngredient.map(function (ing) {
          return {text: ing};
        }),
        steps: ldData.recipeInstructions.map(function (step) {
          return {text: step};
        })
      };
      if (ldData.prepTime) {
        recipeData.prepTime = getTime(ldData.prepTime).asMinutes() + " min";
      }
      if (ldData.cookTime) {
        recipeData.inactiveTime = getTime(ldData.totalTime).subtract(getTime(ldData.cookTime)).asMinutes() + " min";
        recipeData.cookTime = getTime(ldData.cookTime).asMinutes() + " min";
      }
      success(recipeData);
    } else {
      error(err);
    }
  });
};

module.exports = {

  fetch: function (url, success, error) {
    if (url.indexOf("foodnetwork.com") !== -1) {
      return fetchFoodNetwork(url, success, error)
    } else if (url.indexOf("allrecipes.com") !== -1) {
      return fetchAllRecipes(url, success, error);
    }
  },

  fetchFoodNetwork: fetchFoodNetwork,
  fetchAllRecipes: fetchAllRecipes
};
