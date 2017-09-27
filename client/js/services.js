angular.module('cookbook.services', [])
.factory('Recipe', [ '$resource', function($resource) {
	return $resource("http://" + location.host + "/api/recipes/:recipeId", { recipeId: '@id'});
}]);