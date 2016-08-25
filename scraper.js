var request = require('request'),
    jsdom = require('jsdom');

var fetchFoodNetwork = function (recipeUrl, success, error) {
    var opts = {
        url: recipeUrl,
        headers: {
            'User-Agent': "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
        }
    };

    request(opts, function (err, resp, body) {
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
        if (url.indexOf("foodnetwork.com") != -1) {
            return fetchFoodNetwork(url, success, error)
        }
    },

    fetchFoodNetwork: fetchFoodNetwork
};
