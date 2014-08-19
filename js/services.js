angular.module('cookbook.services', [])
.factory('Recipe', [ '$resource', function($resource) {
	return $resource("http://192.168.1.10/cookbook/:recipeId", { recipeId: '@id'});
}]);