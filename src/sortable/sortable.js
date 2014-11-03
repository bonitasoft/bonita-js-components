angular
  .module('bonita.sortable',[])
  .controller('SortableController', function($scope){
    this.onSort = function(params){
      $scope.onSort(params);
    };
  })
  .directive('boSortable', function(){
    return {
      require:'bonitable',
      controller:'SortableController',
    };
  })
  .directive('boSorter', function(){
    return {
      restrict: 'A',
      scope: true,
      require:'^boSortable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, sortableController) {
        $scope.property =  (attr.id || attr.boSorter).trim();


        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = true;
          }

          sortableController.onSort($scope.sortOptions);
        };
      }
    };
  });
