angular.module("cookbook.controllers", [])
    .controller("NewRecipeCtrl", [ '$scope', '$state', 'Recipe',
        function ($scope, $state, Recipe) {

            console.log("new recipe ctrl");

            $scope.newRecipe = {
                ingredients: [],
                steps: []
            };
            
            $scope.save = function () {
                // save the recipe
                var newRecip = new Recipe($scope.newRecipe);
                newRecip.$save(function (updatedRecipe) {
                    $rootScope.getRecipes();
                    $state.go('recipes.detail', { id: updatedRecipe.id });
                });
            };

            $scope.cancel = function () {
                $state.go('recipes.list');
            }
        }])
    .controller("ModifyRecipeCtrl", [ '$scope', '$state', '$stateParams', 'Recipe',
        function ($scope, $state, $stateParams, Recipe) {

            $scope.newRecipe = $rootScope.recipes[$stateParams.id];

            $scope.save = function () {
                // save the recipe
                var newRecip = new Recipe($scope.newRecipe);
                newRecip.$save(function (updatedRecipe) {
                    $rootScope.getRecipes();
                    $state.go('recipes.detail', { id: updatedRecipe.id });
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
