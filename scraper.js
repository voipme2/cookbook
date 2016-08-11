var Nightmare = require('nightmare');
var recipeUrl = "http://www.foodnetwork.com/recipes/jeff-mauro/buffalo-chicken-sub-recipe.html";
var nightmare = Nightmare({show: false});

nightmare.goto(recipeUrl)
    .wait()
    .evaluate(function () {
        var recipeData = {
            title: document.querySelector("div.title h1").textContent,
            author: document.querySelector("div.lead-overview .media h6").textContent.replace("Recipe courtesy of ", ""),
            servings: document.querySelector("div.difficulty > dl > dd").textContent,
            ingredients: Array.prototype.slice.call(document.querySelectorAll("div.ingredients li .box-block")).map(function (ing) {
                return ing.textContent;
            }),
            steps: Array.prototype.slice.call(document.querySelectorAll("ul.recipe-directions-list > li > p")).map(function (step) {
                return step.textContent;
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
                recipeData[l.toLowerCase() + "Time"] = parseInt(timeValues[i].replace(" min", ""));
            }
        });

        return recipeData;
    })
    .end()
    .then(function (result) {
        console.log(result);
    })
    .catch(function (err) {
        console.error("Unable to get recipe from " + recipeUrl + ":", err);
    })