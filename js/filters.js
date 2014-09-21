angular.module("cookbook.filters", [])
    .filter("recipeSearch", function () {
        return function (recipes, search) {
            var re = new RegExp(search, "i");
            return recipes.filter(function (r) {
                return r.name.match(re) || r.author.match(re) || r.ingredients.some(function (i) {
                    return i.text.match(re);
                });
            });
        }
    })
    .filter("asTime", function () {
        return function (timeInMin) {
            var hours = parseInt(timeInMin / 60) % 24;
            var minutes = timeInMin % 60;
            var dString = "";
            if (hours > 0) {
                dString += hours + " hr ";
            }
            if (minutes > 0) {
                dString += minutes + " min ";
            }

            if (timeInMin == undefined || timeInMin == 0) {
                dString = "0 min";
            }
            return dString;

        }
    });