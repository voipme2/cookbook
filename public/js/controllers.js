angular.module("cookbook.controllers", [])
    .controller("ModifyRecipeCtrl", [ '$scope', '$state', 'recipe', 'Recipe',
        function ($scope, $state, recipe, Recipe) {
            $scope.newRecipe = recipe;

            // hold off on this for now.
//            if (Array.isArray($scope.newRecipe.ingredients)) {
//                var oldIng = $scope.newRecipe.ingredients;
//                $scope.newRecipe.ingredients = {
//                    "Ingredients": oldIng
//                };
//            }

            $scope.save = function () {
                // save the recipe
                var recipe = new Recipe($scope.newRecipe);

                // refresh the list of recipes.
                recipe.$save(function (r) {
                    $scope.updateRecipes(function() {
                        $state.go('recipes.detail', { id: r.id });
                    });
                });
            };

            $scope.cancel = function () {
                $state.go('recipes.list');
            }
        }]);
