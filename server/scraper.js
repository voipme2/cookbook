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

var fetchFoodNetwork = function (recipeUrl, success, error) {
    request({url: recipeUrl, headers: HEADERS}, function (err, resp, body) {
        if (!err && resp.statusCode === 200) {
            var env = new JSDOM(body);
            var document = env.window.document;

            var recipeData = {
                name: document.querySelector("span.o-AssetTitle__a-HeadlineText").textContent,
                author: document.querySelector("span.o-Attribution__a-Name > a").textContent,
                servings: document.querySelector("section.o-RecipeInfo.o-Yield dd.o-RecipeInfo__a-Description").textContent.trim(),
                ingredients: Array.prototype.slice.call(document.querySelectorAll("label.o-Ingredients__a-ListItemText")).map(function (ing) {
                    return {text: ing.textContent};
                }),
                steps: Array.prototype.slice.call(document.querySelectorAll("div.o-Method__m-Body > p"), 1).map(function (step) {
                    return {text: step.textContent.trim()};
                })
            };

            var timeLabels =  Array.prototype.slice.call(document.querySelectorAll("section.o-RecipeInfo.o-Time > dl > dt"))
                .map(function (n) {
                    return n.textContent.replace(":", "");
                });
            var timeValues = Array.prototype.slice.call(document.querySelectorAll("section.o-RecipeInfo.o-Time > dl > dd"))
                .map(function (n) {
                    return moment.duration(parseDuration(n.textContent.replace(":", "")));
                });

            var times = {};
            timeLabels.forEach(function(label, ind) {
                times[label] = timeValues[ind];
            });
            if (times.Active) {
                recipeData.inactiveTime = times.Total.subtract(times.Active).asMinutes() + " min";
                recipeData.cookTime = times.Active.asMinutes() + " min";
            } else {
                if (times.Prep) {
                    recipeData.prepTime = times.Prep.asMinutes() + " min";
                }
                if (times.Cook) {
                    recipeData.cookTime = times.Cook.asMinutes() + " min";
                }
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