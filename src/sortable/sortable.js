angular
  .module('bonita.sortable',[])
  .directive('boSortable', function(){
    return {
      scope:{
        onSort:'&'
      },
    };
  })
  .directive('boSorter', function(){
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr) {
        $scope.property =  attr.id || attr.boSorter;

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = true;
          }

          $scope.onSort($scope.sortOptions);
        };
      }
    };
  });
