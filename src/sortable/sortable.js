angular
  .module('org.bonitasoft.bonitable.sortable',['org.bonitasoft.bonitable'])
  /**
   * @ngdoc directive
   * @module bonita.sortable
   * @name bonita.sortable:boSorter
   *
   * @description
   * Tansforms a table heading into a button reflecting the current state of the sort
   * (sort upon which **property**, in which **direction**)?
   *
   * ## Requirements
   * To initialiaze the sort properties, you will need to set a ``sort-options`` to the
   * {@link bonitable.bonitable bonitable}. If you want to be notified each time
   * the sort have changed just provide a ``on-sort``  event handler to the
   *  {@link bonitable.bonitable bonitable} directive.
   *
   *
   * @param {String} boSorter the property name on which apply the sort _(optional)_
   *                          if __bo-sorter__ is empty, it will rely on the id attribute
   *                          to find the property name
   *
   * @example
    <example module="sorterExample">
      <file name="index.html">
        <p>sort called {{count}} times</p>
        <pre>{{options|json}}</pre>
        <table bonitable sort-options="options" on-sort="sortHandler()">
          <thead>
            <tr>
              <th bo-sorter="name">name</th>
              <th bo-sorter="country">country</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="user in users | orderBy: options.property : options.direction ">
              <td>{{user.name}}</td>
              <td>{{user.country}}</td>
            </tr>
          </tbody>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('sorterExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.templates',
            'org.bonitasoft.bonitable.sortable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
            $rootScope.count = 0;
            $rootScope.sortHandler = function() {
              $rootScope.count += 1 ;
            };
            $rootScope.options = {
              property: 'name',
              direction: false
            }
          })
      </file>
    </example>
   */
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
      // Add a suffix with ucFirst
      var key = 'boSorterTitle' + sort.charAt() + sort.substring(1).toLowerCase();
      return attr[key] || 'Sort by ' + sort;
    }

    return {
      restrict: 'A',
      require:'^bonitable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, bonitableCtrl) {
        $scope.property =  (attr.boSorter || attr.id || '').trim();

        if ($scope.property.length === 0){
          throw new Error('bo-sorter: no id found. Please specify on which property the sort is applied to or add an id');
        }

        $scope.sortOptions = bonitableCtrl.getOptions();

        var sort = getDirectionSort($scope.sortOptions.direction);

        // Set de default title if no title exist
        $scope.titleSortAttr = generateTitle(attr, sort);
        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = false;
          }

          sort = getDirectionSort($scope.sortOptions.direction);
          $scope.titleSortAttr = generateTitle(attr, sort);

          bonitableCtrl.triggerSortHandler($scope.sortOptions);
        };
      }
    };
  });
