angular.module("cookbook.controllers", [])
.controller("ListCtrl", ['$scope', 'Recipe', function($scope, Recipe) {
	Recipe.query(function(recipes) {
		$scope.recipes = recipes;
	}, function() {
		console.log("error", arguments[0].status);
	});

	$scope.selectRecipe = function() {
		$scope.recipe = this.recipe;
	}
}])
.controller("ShowCtrl", ["$scope", "Recipe", function($scope, Recipe) {

}])
.controller("MenuCtrl", ['$scope', '$modal', 'Recipe', function($scope, $modal, Recipe) {

	$scope.createRecipe = function() {
		// pop up a modal to create a recipe
		var rModal = $modal.open(
		{
			templateUrl: 'partials/new-recipe.html',
			controller: 'NewRecipeCtrl',
			size: 'lg'
		}
		);

		rModal.result.then(function(recipe) {
			console.log("recipe added: ", recipe);
			var newRecipe = new Recipe(recipe);
			newRecipe.$save();
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
			size: 'lg'
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