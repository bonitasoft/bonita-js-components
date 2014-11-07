angular
  .module('bonita.sortable',[])
  .directive('boSorter', function(){
    return {
      restrict: 'A',
      scope: true,
      require:'^bonitable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, bonitableCtrl) {
        $scope.property =  (attr.id || attr.boSorter).trim();

        $scope.sortOptions = bonitableCtrl.getOptions();

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = false;
          }
          bonitableCtrl.triggerSortHandler($scope.sortOptions);
        };
      }
    };
  });
