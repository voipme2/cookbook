angular.module("cookbook.controllers", [])
.controller("NewRecipeCtrl", [ '$scope', '$modalInstance', function($scope, $modalInstance) {

	$scope.newRecipe = {};

	$scope.save = function() {
		// save the recipe
		$modalInstance.close($scope.newRecipe);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss();
	}
}])
.controller("DownloadRecipeCtrl", [ '$scope', '$modalInstance', function($scope, $modalInstance) {
	
	$scope.dl = {

	};

	$scope.download = function() {
		// given a URL, download the recipe and load it into our format.
		console.log($scope.dl.url);
		var newRecipe = {};
		// once downloaded:
		$modalInstance.close(newRecipe);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss();
	}
}]);