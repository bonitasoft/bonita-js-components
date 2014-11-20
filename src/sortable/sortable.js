angular
  .module('bonita.sortable',[])
  .directive('boSorter', function(){

    /**
     * Translate the boolean direction for the order of the sort
     * @param  {Boolean} isDesc
     * @return {Strinc}
     */
    function getDirectionSort(isDesc) {
      return isDesc ? 'DESC' : 'ASC';
    }

    /**
     * Find the attribute title for the directive for desc mode or asc mode (default one)
     * @param  {Object} attr Angular directive attr
     * @param  {String} sort cf {@link getDirectionSort}
     * @return {String}
     */
    function generateTitle(attr, sort) {
      // Try to find boSorterTitle{Desc|Asc}
      var title = attr['boSorterTitle' + sort.charAt() + sort.substring(1).toLowerCase()];
      return title;
    }

    return {
      restrict: 'A',
      scope: true,
      require:'^bonitable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, bonitableCtrl) {
        $scope.property =  (attr.boSorter || attr.id || '').trim();

        if ($scope.property.length === 0){
          throw new Error('bo-sorter: no id found. Please specify on wich property the sort is applied to or add an id');
        }

        $scope.sortOptions = bonitableCtrl.getOptions();

        var sort = getDirectionSort($scope.sortOptions.direction);

        // Set de default title if no title exist
        $scope.titleSortAttr = generateTitle(attr, sort) || 'Sort by ' + sort;

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = false;
          }

          sort = getDirectionSort($scope.sortOptions.direction);
          $scope.titleSortAttr = generateTitle(attr, sort) || 'Sort by ' + sort;

          bonitableCtrl.triggerSortHandler($scope.sortOptions);
        };
      }
    };
  });
