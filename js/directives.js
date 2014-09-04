angular.module("cookbook.directives", [])
.directive("listCreator", [function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<input type="text" ng-model="input" ng-keypress="checkEnter($event)" ng-paste="handlePaste($event)">'
      + '<ul><li ng-repeat="item in list">{{item}} <button type="button" class="btn btn-sm btn-default" '
      + 'ng-click="removeItem($index)"><i class="glyphicon glyphicon-delete"></i></button></li></ul>",
    scope: {
      'list' : "="
    },
    controller: function($scope) {
      $scope.checkEnter = function(event) {
        if (event.keyCode == 13) {
          $scope.list.push($scope.input);
          $scope.input = '';
        }
      };
      
      $scope.removeItem = function(index) {
        $scope.list.splice(index, 1);
      };
      
      $scope.handlePaste = function(event) {
        var data = event.clipboardData.getData('text/plain');
        var toAdd = data.split("\n");
        toAdd.forEach(function(item) {
          if (item.length > 0 && item.indexOf("Read more") == -1) {
            $scope.list.push(item);
          }
        });
        
        // TODO: clear out input?
        
      };
    }
  }
}])
