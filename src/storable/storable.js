/**
 * Created by fabiolombardi on 15/07/2015.
 */
angular
  .module('org.bonitasoft.bonitable.storable',['org.bonitasoft.bonitable'])
/**
 * @ngdoc directive
 * @module bonita.storable
 * @name bonita.storable:boStore
 *
 * @description
 * Stores the current table configuration in the browser local sotrage
 *
 * ## Requirements
 * To initialiaze the storable properties, you will need to set a ``storable-id`` to the
 * {@link bonitable.bonitable bonitable}.
 *
 *
 * @param {String} boStorable the property name on which apply the store _(optional)_
 *                          if __bo-storable__ is empty, it will rely on the id attribute
 *                          to find the property name
 *
 * @example
 <example module="storableExample">
 <file name="index.html">
 <p>sort called {{count}} times</p>
 <pre>{{options|json}}</pre>
 <table bonitable sortable-id="caselist">
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
 .module('storableExample', [
 'ui.bootstrap.tpls',
 'org.bonitasoft.bonitable',
 'org.bonitasoft.templates',
 'org.bonitasoft.bonitable.storable'
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
  .directive('boStorable', function($localStorage){

    return {
      restrict: 'A',
      scope: true,
      require:'^bonitable',
      priority: 1,
      link: function($scope, $rootScope, iElm, attr, bonitableCtrl) {
        //$scope.sortOptions = localSortrage.("sortOptions");
        //$scope.columns = localSortrage.("columns");
        console.log($scope.columns);

        $scope.$watch('sortOptions', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $localStorage.sortOptions = $scope.sortOptions;
          }
        });

        $scope.$watch('columns', function(newValue, oldValue) {
          console.log($scope.columns);
          console.log('newValue: ', newValue);
          console.log('old:', oldValue);
          if (newValue !== oldValue) {
            $localStorage.columns = $scope.columns;
          }
        });
      }
    };
  });
