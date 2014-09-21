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
            controller: function ($rootScope, $state, recipes, Recipe) {
                // always have the recipes available.
                $rootScope.recipes = recipes;

                $rootScope.updateRecipes = function () {
                    return Recipe.query(function (recipes) {
                        $rootScope.recipes = recipes;
                    });
                };

                $rootScope.selectRecipe = function (item, model, label) {
                    $state.go('recipes.detail', { id: model.id });
                };
            }
        })
            .state('recipes.list', {
                url: '/list',
                templateUrl: "partials/recipes.html",
                controller: function ($scope) {
                    $scope.deleteRecipe = function (recipe) {
                        recipe.$remove(function () {
                            $scope.updateRecipes();
                        })
                    }
                }
            })
            .state('recipes.detail', {
                url: "/show/:id",
                templateUrl: "partials/show.html",
                controller: function ($scope, $stateParams) {
                    if ($scope.recipes.length == 0) {
                        var update = $scope.updateRecipes().$promise;
                        update.then(function () {
                            $scope.recipe = $scope.recipes[$stateParams.id];
                        });
                    } else {
                        $scope.recipe = $scope.recipes[$stateParams.id];
                    }
                }
            })
            .state("recipes.add", {
                url: "/add",
                templateUrl: "partials/new-recipe.html",
                controller: 'ModifyRecipeCtrl'
            })
            .state("recipes.edit", {
                url: "/edit/:id",
                templateUrl: "partials/new-recipe.html",
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
