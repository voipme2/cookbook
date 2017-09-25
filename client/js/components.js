angular.module("cookbook.components", [])
    .component("searchBox", {
        templateUrl: "partials/search-box.html",
        controller: function ($http) {
            var ctrl = this;

            ctrl.selectRecipe = function (recipe) {
                ctrl.onSelect({recipe: recipe});
            };

            ctrl.getRecipes = function (search) {
                return $http.get('/api/search',
                    {
                        params: {query: search}
                    }).then(function (response) {
                    return response.data.sort(function (a, b) {
                        return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
                    });
                });
            }
        },
        controllerAs: "$ctrl",
        bindings: {
            onSelect: '&'
        }
    })
    .component("ingredientList", {
        bindings: {
            ingredients: "="
        },
        templateUrl: "partials/edit/ingredient-list.html",
        controller: function () {
            var ctrl = this;
            ctrl.moveUp = function (index) {
                // swap the specified one with the earlier one.
                // TODO: handle 0 case?
                var ing = ctrl.ingredients.splice(index, 1)[0];
                ctrl.ingredients.splice(index - 1, 0, ing);
            };

            ctrl.moveDown = function (index) {
                var ing = ctrl.ingredients.splice(index, 1)[0];
                ctrl.ingredients.splice(index + 1, 0, ing);
            };

            ctrl.remove = function(index) {
               ctrl.ingredients.splice(index, 1);
            }
        }
    })
    .component("stepList", {
        bindings: {
            "steps": "="
        },
        templateUrl: "partials/edit/step-list.html",
        controller: function () {
            var ctrl = this;
            ctrl.moveUp = function (index) {
                // swap the specified one with the earlier one.
                // TODO: handle 0 case?
                var ing = ctrl.steps.splice(index, 1)[0];
                ctrl.steps.splice(index - 1, 0, ing);
            };

            ctrl.moveDown = function (index) {
                var ing = ctrl.steps.splice(index, 1)[0];
                ctrl.steps.splice(index + 1, 0, ing);
            };

            ctrl.remove = function(index) {
                ctrl.steps.splice(index, 1);
            }
        }
    });
