angular.module("cookbook.controllers", [])
.controller("ListCtrl", ['$scope', 'Recipe', function($scope, Recipe) {
	console.log("listctrl")
	Recipe.query(function(data) {
		console.log("success", data);
		//$scope.recipes = recipes;
	}, function() {
		console.log("error", arguments[0].status);
	});
}])
.controller("ShowCtrl", ["$scope", "Recipe", function($scope, Recipe) {

}])
.controller("MenuCtrl", ['$scope', '$modal', function($scope, $modal) {

	$scope.createRecipe = function() {
		// pop up a modal to create a recipe
		var rModal = $modal.open(
		{
			templateUrl: 'partials/new-recipe.html',
			controller: 'NewRecipeCtrl',
			size: 'lg',
			/*resolve: {
				items: function () {
					return $scope.items;
				}
			}*/
		}
		);

		rModal.result.then(function(recipe) {
			console.log("recipe added: ", recipe);
		}, function() {
			// cancel.
		});
	}

	$scope.downloadRecipe = function() {
		// pop up a modal to ask for the URL, which then downloads the recipe
		var rModal = $modal.open(
		{
			templateUrl: 'partials/download-recipe.html',
			controller: 'DownloadRecipeCtrl',
			size: 'lg',
			/*resolve: {
				items: function () {
					return $scope.items;
				}
			}*/
		}
		);

		rModal.result.then(function(recipe) {
			// the recipe passed in is the newly downloaded recipe.

		}, function() {
			// cancel.
		});
	}
}])
.controller("NewRecipeCtrl", [ '$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.save = function() {
		// save the recipe
		$modalInstance.close({ "title": "New Recipe" });
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