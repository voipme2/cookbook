angular.module("cookbook.controllers", [])

    .controller("ModifyRecipeCtrl", [ '$scope', '$state', 'recipe', 'Recipe',
        function ($scope, $state, recipe, Recipe) {
            $scope.newRecipe = recipe;

            $scope.save = function () {
                // save the recipe
                var recipe = new Recipe($scope.newRecipe);

                // refresh the list of recipes.
                recipe.$save(function (r) {
                    $state.go('view', { id: r.id });
                });
            };

            $scope.cancel = function () {
                $state.go('home');
            }
        }])
    .controller("DownloadRecipeCtrl", [ '$scope', '$uibModalInstance', '$http',
        function ($scope, $uibModalInstance, $http) {
            
            $scope.isDownloading = false;
            
            $scope.download = function () {
                $scope.isDownloading = true;
                // save the recipe
                $http({
                    method: 'GET',
                    url: '/api/fetch',
                    params: { recipeUrl: $scope.recipeUrl }
                }).then(function(foundRecipe) {
                    $uibModalInstance.close(foundRecipe);
                }, function(err) {
                    console.log("error downloading: ", err);
                    $uibModalInstance.dismiss();
                });
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]);
