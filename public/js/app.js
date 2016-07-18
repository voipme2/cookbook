angular.module('cookbook', [
    'ui.bootstrap',
    'ui.router',
    'ngResource',
    'cookbook.services',
    'cookbook.controllers',
    'cookbook.filters',
    'cookbook.directives'])
    .run([ '$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]
)
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when("", "/recipes/list");
        $urlRouterProvider.when("/", "/recipes/list");

        $urlRouterProvider.otherwise("/recipes/list")

        $stateProvider.state('recipes', {
            abstract: true,
            url: "/recipes",
            resolve: {
                recipes: ['Recipe', function (Recipe) {
                    return Recipe.query();
                }]
            },
            template: "<ui-view />",
            controller: function ($rootScope, $state, $http, recipes, Recipe) {
                // always have the recipes available.
                $rootScope.recipes = recipes;

                $rootScope.updateRecipes = function (callback) {
                    return Recipe.query(function (recipes) {
                        $rootScope.recipes = recipes;
                        callback();
                    });
                };

                $rootScope.selectRecipe = function (item, model, label) {
                    $state.go('recipes.detail', { id: model.id });
                };

                $rootScope.getRecipes = function(search) {
                    return $http.get('/api/search', {
                            params: {
                                query: search
                            }
                         }).then(function(response){
                            return response.data.sort(function(a,b) {
                                return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
                            });
                    });
                }

            }
        })
            .state('recipes.list', {
                url: '/list',
                templateUrl: "partials/recipes.html"
            })
            .state('recipes.detail', {
                url: "/show/:id",
                templateUrl: "partials/show.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams', function (Recipe, $stateParams) {
                        return Recipe.get({ recipeId: $stateParams.id});
                    }]
                },
                controller: function ($scope, $state, recipe) {
                    $scope.recipe = recipe;

                    $scope.deleteRecipe = function () {
                        $scope.recipe.$remove(function () {
                            $scope.updateRecipes(function() {
                                $state.go("recipes.list");
                            });
                        });
                    }
                }
            })
            .state("recipes.add", {
                url: "/add",
                templateUrl: "partials/new-recipe.html",
                resolve: {
                    recipe: function () {
                        return { ingredients: [], steps: [] }
                    }
                },
                controller: 'ModifyRecipeCtrl'
            })
            .state("recipes.edit", {
                url: "/edit/:id",
                templateUrl: "partials/new-recipe.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams', function (Recipe, $stateParams) {
                        return Recipe.get({ recipeId: $stateParams.id});
                    }]
                },
                controller: 'ModifyRecipeCtrl'
            })
            .state("recipes.download", {
                url: "/download",
                onEnter: ['$stateParams', '$state', '$modal', 'Recipe', function ($stateParams, $state, $modal, Recipe) {
                    var rModal = $modal.open(
                        {
                            templateUrl: 'partials/download-recipe.html',
                            controller: 'DownloadRecipeCtrl',
                            size: 'lg'
                        }
                    );

                    rModal.result.then(function (recipe) {
                        // the recipe passed in is the newly downloaded recipe.
                        var newRecipe = new Recipe(recipe);
                        newRecipe.$save(function () {
                            $state.go("recipes.list");
                        })
                    }, function () {
                        // cancel.
                    });
                }]
            });

    });
