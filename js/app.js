angular.module('cookbook', [
	'ui.bootstrap', 
	'ngRoute',
	'ngResource', 
	'cookbook.services', 
	'cookbook.controllers'])
.config(['$routeProvider', function($routeProvider) {

	$routeProvider.when('/recipes', { templateUrl: 'partials/recipes.html', controller: 'ListCtrl'});
	$routeProvider.when('/show', { templateUrl: 'partials/show.html', controller: 'ShowCtrl'});
	$routeProvider.otherwise({ redirectTO: '/list'});
}]);
