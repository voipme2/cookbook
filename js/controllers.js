angular.module("cookbook.controllers", [])
    .controller("NewRecipeCtrl", [ '$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.newRecipe = {
            ingredients: [],
            steps: []
        };

        $scope.addIngredient = function (index, data) {
            if (index == undefined) {
                index = $scope.newRecipe.ingredients.length - 1;
            }
            var text = data ? data : '';
            $scope.newRecipe.ingredients.splice(index + 1, 0,
                { text: text});
        };

        $scope.handleIngredientPaste = function(event, index) {
            var data = event.clipboardData.getData("text/plain");
            var itemsToAdd = data.split("\n");
            $scope.removeIngredient(index);
            itemsToAdd.forEach(function(item) {
                if (item.length > 0 && item.indexOf("Read more") == -1) {
                    $scope.addIngredient(undefined, item);
                }
            });
        };

        $scope.handleStepPaste = function(event, index) {
            var data = event.clipboardData.getData("text/plain");
            var itemsToAdd = data.split("\n");
            $scope.removeStep(index);
            itemsToAdd.forEach(function(item) {
                if (item.length > 0 && item.indexOf("Read more") == -1) {
                    $scope.addStep(undefined, item);
                }
            });
        };

        $scope.checkEnterIng = function (event, index) {
            if (event.keyCode == 13) {
                $scope.addIngredient(index);
            }
        };

        $scope.checkEnterStep = function (event, index) {
            if (event.keyCode == 13) {
                $scope.addStep(index)
            }
        };

        $scope.removeIngredient = function (index) {
            $scope.newRecipe.ingredients.splice(index, 1);
        };

        $scope.addStep = function (index, data) {
            if (index == undefined) {
                index = $scope.newRecipe.steps.length - 1;
            }
            var text = data ? data : '';
            $scope.newRecipe.steps.splice(index + 1, 0,
                { text: text});
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