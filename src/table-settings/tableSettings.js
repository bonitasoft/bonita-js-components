'use strict';
/**
 *
 */
angular.module('bonita.settings', [
  'ui.bootstrap.dropdown',
  'ui.bootstrap.buttons'
  ])

  /**
   * @ngdoc directive
   * @name bonita.settings:tableSettings
   * @module bonita.settings
   *
   * @description
   *
   * Table settings create a simple widget to manage table settings.
   * ## pagination settings
   * table settings create a small component to choose pageSize.
   * If you do it on the client side, here how you can achieve it.
   * simply create this slice filter
   * ```js
   * //Create a slice filter
   * app.filter('slice', function() {
   *   return function(input, start) {
   *     start = parseInt(start,10) || 0 ;
   *     return input.slice(start);
   *   };
   * })
   * ```
   *and add the slice filter with a limitTo filter on a ng-repeat
   *``ng-repeat="user in users | slice: (pagination.currentPage-1) * pagination.pageSize | limitTo:pagination.pageSize">``
   *
   * ## columns visibility
   * If you provide a columns attributes, the component will also render a list of columns with a checkbox associated to it.
   * the checlkbox value will represent the column visibility, so you can easily toggle their visibility.
   *
   * ## column reordering
   *
   * the table-settings component also permit to re-order the columns from the columsn list, using drag and drop.
   * this behaviour is optionnal, so if you need that feature, you will also need to add a ``<script>`` tag
   * to include the ng-sortable library (in the bower_components dir, since __ng-sortable__ is as a bower dependency.
   *
   * @example
   *
   * ```html
   *     <table bonitable class="table">
   *       <thead>
   *         <tr>
   *           <th colspan="2">
   *             <table-settings page-size="pageSize" sizes="sizes" columns="columns"></table-settings>
   *           </th>
   *         </tr>
   *         <tr>
   *           <th ng-repeat="col in columns | filter: col.visible">{{col.name}}</th>
   *         </tr>
   *       </thead>
   *       <tbody>
   *         <tr ng-repeat="user in users">
   *           <td ng-repeat="col in columns | filter: col.visible">{{user[col.name]}}</td>
   *         </tr>
   *       </tbody>
   *     </table>
   * ```
   * ```javascript
   *     angular
   *       .module('settingsExample', [
   *         'bonitable',
   *         'bonita.settings',
   *         'bonita.templates',
   *         'ui.bootstrap.tpls'
   *       ])
   *       .filter('slice', function() {
   *         return function(input, start) {
   *           start = parseInt(start,10) || 0 ;
   *           return input.slice(start);
   *         };
   *       })
   *       .filter('translate', function() {
   *         return function(input) {
   *           return input;
   *         };
   *       })
   *       .run(function($rootScope){
   *         $rootScope.users = [
   *           {name:'Paul', country:'Uk'},
   *           {name:'Sarah', country:'Fr'},
   *           {name:'Jacques', country:'Us'},
   *           {name:'Joan', country:'Al'},
   *           {name:'Tite', country:'Jp'},
   *         ];
   *         $rootScope.pageSize = 10;
   *         $rootScope.sizes = [1, 10, 100];
   *         $rootScope.columns = [{name:'name', visible:true},{name:'country', visible:true}];
   *       })
   *  ```
   *
   * @param {Array} columns an array of object representing the columns of the table.
   *                        Each object should have a  ``visible`` property and a ``name`` property
   *                          The name of these properties is customizable
   * @param {Array} sizes an array of int, containing the different number of element per pages
   * @param {int} pageSize the actual number per page value
   * @param {String} labelProp the name of the property reprensenting the columns name
   * @param {String} visibleProp the name of the property reprensenting the columns visibility
   * @param {function} updatePageSize a handler function wich is called each time the pageSize settings changed
   * @param {function} updateVisibility a handler function wich is called each time o columns visibility changes
   *
   */
  .directive('tableSettings', function(){
    // Runs during compile
    return {
      templateUrl: 'template/table-settings/tableSettings.tpl.html',
      replace: true,
      scope:{
        columns: '=',
        sizes: '=',
        pageSize: '=',
        labelProp:'@',
        visibleProp:'@',
        updatePageSize: '&',
        updateVisibility: '&'
      },
      link: function(scope, elem, attr) {
        scope.visible = attr.visibleProp || 'visible';
        scope.label = attr.labelProp || 'name';
        scope.isDragging = false;

        scope.sortableOptions = {
          containerPositioning: 'absolute'
        };

      }
    };
  });
