(function(){
  'use strict';
  angular
  .module('bonita.sortable',['template/sortable/sorter.tpl.html'])
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

  angular.module('template/sortable/sorter.tpl.html', []).run(['$templateCache', function($templateCache) {
    $templateCache.put('template/sortable/sorter.tpl.html',
      '<span ng-click=\"sort()\" ng-transclude></span>'+
      '<span ng-click=\"sort()\" class=\"glyphicon\" ng-class=\"{\'glyphicon-chevron-up\':sortOptions.ascendant &amp;&amp; sortOptions.property === property, \'glyphicon-chevron-down\':!sortOptions.ascendant &amp;&amp; sortOptions.property === property}\"></i>');
  }]);
})();
