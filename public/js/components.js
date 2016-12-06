function SearchController($http) {
    var ctrl = this;

    ctrl.selectRecipe = function (item, model, label) {
        ctrl.onSelect({ recipe: model });
    };

    ctrl.getRecipes = function (search) {
        return $http.get('/api/search',
            {
                params: {query: search}
            }).then(function (response) {
            return response.data.sort(function (a, b) {
                return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
            });
        });
    }
}

angular.module("cookbook.components", [])
    .component("searchBox", {
        templateUrl: "partials/search-box.html",
        controller: SearchController,
        controllerAs: "$ctrl",
        bindings: {
            onSelect: '&'
        }
    });
