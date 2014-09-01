angular.module("cookbook.filters", [])
.filter("recipeSearch", function() {
        return function(recipes, search) {
            var re = new RegExp(search, "i");
            return recipes.filter(function(r) {
                return r.name.match(re) || r.ingredients.some(function(i) {
                    return i.text.match(re);
                });
            });
        }
    })