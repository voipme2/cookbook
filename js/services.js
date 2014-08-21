angular.module('cookbook.services', [])
.factory('Recipe', [ '$resource', function($resource) {
	return $resource("/cookbook/api/recipes/:recipeId", { recipeId: '@id'});
}]);