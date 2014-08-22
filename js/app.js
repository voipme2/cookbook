angular.module('cookbook', [
	'ui.bootstrap', 
	'ui.router',
	'ngResource', 
	'cookbook.services', 
	'cookbook.controllers'])
.config(function($stateProvider, $urlRouterProvider) {

  //
  // Now set up the states
  $stateProvider.state('recipes', {
  	url: "/recipes",
  	abstract: true,
  	resolve: {
  		recipes: function(Recipe) {
  			return Recipe.query();
  		}
  	},
  	controller: function($scope, recipes) {
      console.log(recipes);
  		$scope.recipes = recipes;
	 }
  })
  .state('recipes.detail', {
  	url: "/:id",
  	templateUrl: "partials/show.html",
  	controller: function($scope, $stateParams) {
  		$scope.recipe = $scope.recipes[$stateParams.id];
  	}
  })
  .state("recipes.add", {
  	url: "/add",
  	onEnter: ['$stateParams', '$state', '$modal', 'Recipe', function($stateParams, $state, $modal, Recipe ) {
  		var rModal = $modal.open(
  		{
  			templateUrl: 'partials/new-recipe.html',
  			controller: 'NewRecipeCtrl',
  			size: 'lg'
  		}
  		);

  		rModal.result.then(function(recipe) {
  			var newRecipe = new Recipe(recipe);
  			newRecipe.$save();
  			$state.go('recipes.list');
  		}, function() {
				// cancel.
			});
  	}]
  })
  .state("recipes.download", {
  	url: "/download",
  	onEnter: ['$stateParams', '$state', '$modal', 'Recipe', function($stateParams, $state, $modal, Recipe ) {
  		var rModal = $modal.open(
  		{
  			templateUrl: 'partials/download-recipe.html',
  			controller: 'DownloadRecipeCtrl',
  			size: 'lg'
  		}
  		);

  		rModal.result.then(function(recipe) {
				// the recipe passed in is the newly downloaded recipe.
				var newRecipe = new Recipe(recipe);
				newRecipe.$save(function() {
					$state.go("recipes.list");
				})
			}, function() {
				// cancel.
			});
  	}]
  });

});