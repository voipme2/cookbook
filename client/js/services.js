angular.module('cookbook.services', [])
.factory('Recipe', [ '$resource', function($resource) {
	return $resource("/api/recipes/:recipeId", { recipeId: '@id'});
}]);