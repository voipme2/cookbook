angular.module("cookbook.controllers", [])
    .controller("NewRecipeCtrl", [ '$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.newRecipe = {
            ingredients: [],
            steps: []
        };

        $scope.addIngredient = function () {
            $scope.newRecipe.ingredients.push("");
        };

        $scope.removeIngredient = function (index) {
            $scope.newRecipe.ingredients.splice(index, 1);
        };

        $scope.addStep = function () {
            $scope.newRecipe.steps.push("")
        };

        $scope.removeStep = function (index) {
            $scope.newRecipe.steps.splice(index, 1);
        };

        $scope.save = function () {
            // save the recipe
            $modalInstance.close($scope.newRecipe);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
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