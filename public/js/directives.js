angular.module("cookbook.directives", [])
    .directive("listCreator", [function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<input type="text" ng-model="input" class="form-control" ng-keypress="checkEnter($event)" ng-paste="handlePaste($event)">'
                + '<div class="input-group" ng-repeat="item in list">'
                + '<input type="text" class="form-control" value="{{item.text}}" ng-model="item.text" />'
                + '<span class="input-group-btn"><button type="button" class="btn btn-danger" ng-click="removeItem($index)">'
                + '<i class="glyphicon glyphicon-remove"></i></button></span></div>',
            scope: {
                'list': "="
            },
            controller: function ($scope) {
                $scope.checkEnter = function (event) {
                    if (event.keyCode == 13) {
                        if ($scope.input && $scope.input.length > 0) {
                            $scope.list.push({ text: $scope.input });
                            $scope.input = '';
                        }
                        event.preventDefault();
                    }
                };

                $scope.removeItem = function (index) {
                    $scope.list.splice(index, 1);
                };

                $scope.handlePaste = function (event) {
                    var data = event.clipboardData.getData('text/plain');
                    var toAdd = data.split("\n");
                    toAdd.forEach(function (item) {
                        var ind = item.trim();
                        if (ind.length > 0 && ind.indexOf("Read more") == -1) {
                            $scope.list.push({ text: ind });
                        }
                    });
                    event.preventDefault();
                };
            }
        }
    }])
    .directive("listStepCreator", [function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<input type="text" ng-model="input" class="form-control" ng-keypress="checkEnter($event)" ng-paste="handlePaste($event)">'
                + '<div class="input-group" ng-repeat="item in list">'
                + '<input type="text" class="form-control" value="{{item.text}}" ng-model="item.text" />'
                + '<span class="input-group-btn"><button type="button" class="btn btn-danger" ng-click="removeItem($index)">'
                + '<i class="glyphicon glyphicon-remove"></i></button></span></div>',
            scope: {
                'list': "="
            },
            controller: function ($scope) {
                $scope.checkEnter = function (event) {
                    if (event.keyCode == 13) {
                        if ($scope.input && $scope.input.length > 0) {
                            $scope.list.push({ text: $scope.input });
                            $scope.input = '';
                        }
                        event.preventDefault();
                    }
                };

                $scope.removeItem = function (index) {
                    $scope.list.splice(index, 1);
                };

                $scope.handlePaste = function (event) {
                    var data = event.clipboardData.getData('text/plain');
                    var toAdd = data.split("\n");
                    toAdd.forEach(function (item) {
                        var ind = item.trim();
                        if (ind.length > 0 && ind.indexOf("Read more") == -1) {
                            $scope.list.push({ text: ind });
                        }
                    });
                    event.preventDefault();
                };
            }
        }
    }]);
