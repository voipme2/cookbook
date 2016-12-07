angular.module('cookbook', [
    'ui.bootstrap',
    'ui.router',
    'ngResource',
    'cookbook.services',
    'cookbook.controllers',
    'cookbook.filters',
    'cookbook.components',
    'cookbook.directives'])
    .run(['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when("", "/home");
        $urlRouterProvider.when("/", "/home");

        $urlRouterProvider.otherwise("/home");

        $stateProvider.state('home', {
                url: "/home",
                resolve: {
                    recipes: ['Recipe', function (Recipe) {
                        return Recipe.query().$promise;
                    }]
                },
                templateUrl: "partials/home.html",
                controller: function ($rootScope, $state, $http, recipes, Recipe) {
                    // always have the recipes available.
                    $rootScope.recipeCount = recipes.length;

                    $rootScope.selectRecipe = function (recipe) {
                        $state.go('view', {id: recipe.id});
                    };
                    
                    $rootScope.createRecipe = function() {
                        $state.go('add');
                    }
                    
                    $rootScope.downloadRecipe = function() {
                        var rModal = $uibModal.open(
                            {
                                templateUrl: 'partials/download-recipe.html',
                                controller: 'DownloadRecipeCtrl',
                                size: 'lg'
                            }
                        );

                        rModal.result.then(function (resp) {
                            $state.go('add', { recipe: resp.data });
                        }, function (err) {
                            // dismiss
                        });
                    }
                }
            })
            .state('view', {
                url: "/view/:id",
                templateUrl: "partials/view-recipe.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams', function (Recipe, $stateParams) {
                        return Recipe.get({recipeId: $stateParams.id}).$promise;
                    }]
                },
                controller: function ($scope, $state, recipe) {
                    $scope.recipe = recipe;

                    $scope.uploadImage = function () {
                        alert("Upload an image!");
                    };

                    $scope.deleteRecipe = function () {
                        $scope.recipe.$remove(function () {
                            $scope.updateRecipes(function () {
                                $state.go("home");
                            });
                        });
                    }
                }
            })
            .state("add", {
                url: "/add",
                templateUrl: "partials/new-recipe.html",
                params: { "recipe": null },
                resolve: {
                    recipe: ['$stateParams', function ($stateParams) {
                        if ($stateParams.recipe) {
                            return $stateParams.recipe;
                        } else {
                            return {ingredients: [], steps: []};
                        }
                    }]
                },
                controller: 'ModifyRecipeCtrl'
            })
            .state("edit", {
                url: "/edit/:id",
                templateUrl: "partials/new-recipe.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams', 
                        function (Recipe, $stateParams) {
                            return Recipe.get({recipeId: $stateParams.id}).$promise;
                    }]
                },
                controller: 'ModifyRecipeCtrl'
            });
    });