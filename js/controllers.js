angular.module("cookbook.controllers", [])
    .controller("ModifyRecipeCtrl", [ '$scope', '$state', '$stateParams', 'Recipe',
        function ($scope, $state, $stateParams, Recipe) {

            if ($stateParams.id) {
                $scope.newRecipe = $scope.recipes[$stateParams.id];
            } else {
                $scope.newRecipe = {
                    ingredients: [],
                    steps: []
                };
            }

            $scope.save = function () {
                // save the recipe
                var recipe = new Recipe($scope.newRecipe);

                // refresh the list of recipes.
                recipe.$save(function () {
                    $scope.updateRecipes();
                    $state.go('recipes.list');
                });
            };

            $scope.cancel = function () {
                $state.go('recipes.list');
            }
        }])

    .controller("DownloadRecipeCtrl", [ '$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.dl = {

        };

        $scope.download = function () {
            // given a URL, download the recipe and load it into our format.
            console.log($scope.dl.url);
            var newRecipe = {};
            // once downloaded:
            $modalInstance.close(newRecipe);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        }
    }]);