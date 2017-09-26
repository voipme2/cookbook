angular.module('cookbook', [
    'ui.router',
    'ngResource',
    'cookbook.services',
    'cookbook.controllers',
    'cookbook.filters',
    'cookbook.components',
    'cookbook.directives',
    'ngMaterial'])
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
            controller: function ($scope, $state, $http, $mdDialog, recipes, Recipe) {
                // always have the recipes available.
                $scope.recipeCount = recipes.length;

                $scope.selectRecipe = function (recipe) {
                    $state.go('view', {id: recipe.recipe.id});
                };

                $scope.createRecipe = function () {
                    $state.go('add');
                };

                $scope.downloadRecipe = function () {
                    var confirm = $mdDialog.prompt()
                        .title('Download a recipe')
                        .textContent('Enter the URL for the recipe to be downloaded.')
                        .placeholder('Recipe URL (foodnetwork.com or allrecipes.com)')
                        .ariaLabel('Recipe URL')
                        .ok('Do it')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function (result) {
                        $http({
                            method: 'GET',
                            url: '/api/fetch',
                            params: {recipeUrl: result}
                        }).then(function (foundRecipe) {
                            $state.go('add', {recipe: foundRecipe.data});
                        }, function (err) {
                            console.log("error downloading: ", err);
                        });
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
                controller: function ($scope, $state, $mdDialog, recipe) {
                    $scope.recipe = recipe;
                    $scope.menu = {isOpen: false};
                    $scope.uploadImage = function () {
                        alert("Upload an image!");
                    };

                    $scope.deleteRecipe = function () {
                        var confirm = $mdDialog.confirm()
                            .title("Delete this recipe?")
                            .textContent("This will completely remove this recipe.")
                            .ok("Delete")
                            .cancel("Cancel")
                        $mdDialog.show(confirm).then(function () {
                            $scope.recipe.$remove(function () {
                                $state.go("home");
                            });
                        });
                    }
                }
            })
            .state("list", {
                url: "/list",
                templateUrl: "partials/recipes.html",
                resolve: {
                    recipes: ['Recipe', function (Recipe) {
                        return Recipe.query().$promise;
                    }]
                },
                controller: function ($scope, recipes) {
                    $scope.recipes = recipes;
                }
            })
            .state("add", {
                url: "/add",
                templateUrl: "partials/edit/new-recipe.html",
                params: {"recipe": null},
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
                templateUrl: "partials/edit/new-recipe.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams',
                        function (Recipe, $stateParams) {
                            return Recipe.get({recipeId: $stateParams.id}).$promise;
                        }]
                },
                controller: 'ModifyRecipeCtrl'
            })
            .state("print", {
                url: "/print/:id",
                templateUrl: "partials/print-recipe.html",
                resolve: {
                    recipe: ['Recipe', '$stateParams',
                        function (Recipe, $stateParams) {
                            return Recipe.get({recipeId: $stateParams.id}).$promise;
                        }]
                },
                controller: function ($scope, $state, recipe) {
                    $scope.recipe = recipe;
                    $scope.back = function () {
                        $state.go("view", {id: recipe.id});
                    }
                }
            });
    });
