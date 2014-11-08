(function(){
  'use strict';
  angular
  .module('bonita.sortable',['bonita.templates'])
  .directive('boSorter', function(){
    return {
      restrict: 'A',
      scope: {
        sortOptions : '=',
        onSort : '&'
      },
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr) {
        $scope.property =  (attr.id || attr.boSorter || '').trim();
        if($scope.property){
          iElm.addClass('pointer');
        }

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.ascendant = !$scope.sortOptions.ascendant;
          } else if ($scope.property){
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.ascendant = true;
          }
          $scope.onSort()($scope.sortOptions);

        };
      }
    };
  });
})();
