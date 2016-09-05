var request = require('request'),
    jsdom = require('jsdom');

const HEADERS = {
    'User-Agent': "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
};

var fetchAllRecipes = function (recipeUrl, success, error) {
    request({url: recipeUrl, headers: HEADERS}, function (err, resp, body) {
        if (!err && resp.statusCode === 200) {
            jsdom.env(body, function (err, window) {
                var document = window.document;
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
                    prepTime: document.querySelector("time[itemprop='prepTime']").textContent,
                    cookTime: document.querySelector("time[itemprop='cookTime']").textContent
                };

                success(recipeData);

            })
        } else {
            error(err);
        }
    });
}

var fetchFoodNetwork = function (recipeUrl, success, error) {
    request({url: recipeUrl, headers: HEADERS}, function (err, resp, body) {
        if (!err && resp.statusCode === 200) {
            jsdom.env(body, function (err, window) {
                var document = window.document;

                var recipeData = {
                    name: document.querySelector("div.title h1").textContent,
                    author: document.querySelector("div.lead-overview .media h6").textContent.replace("Recipe courtesy of ", ""),
                    servings: document.querySelector("div.difficulty > dl > dd").textContent,
                    ingredients: Array.prototype.slice.call(document.querySelectorAll("div.ingredients li")).map(function (ing) {
                        return {text: ing.textContent};
                    }),
                    steps: Array.prototype.slice.call(document.querySelectorAll("ul.recipe-directions-list > li > p")).map(function (step) {
                        return {text: step.textContent};
                    })
                };

                var timeLabels = Array.prototype.slice.call(document.querySelectorAll("div.cooking-times > dl > dt"))
                    .slice(1).map(function (n) {
                        return n.textContent.replace(":", "");
                    });
                var timeValues = Array.prototype.slice.call(document.querySelectorAll("div.cooking-times > dl > dd"))
                    .slice(1).map(function (n) {
                        return n.textContent.replace(":", "");
                    });

                timeLabels.forEach(function (l, i) {
                    // TODO convert the times to minutes
                    if (l != "Total time") {
                        recipeData[l.toLowerCase() + "Time"] = timeValues[i];
                    }
                });

                success(recipeData);

            })
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
