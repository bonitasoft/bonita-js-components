"use strict";
/**
 * @ngdoc overview
 * @name bonitable
 */
angular.module('bonitable', [])
  .controller('BonitableController', function($scope){

    /* bo-sortable */
    // sortOption accessors
    this.getOptions = function() {
      return $scope.sortOptions;
    };

    this.triggerSortHandler = function(params){
      $scope.onSort({options:params});
    };

    /* multiselect */
    var selectors = [];
    this.registerSelector = function registerSelector(item){
      selectors.push(item);
    };

    this.unregisterSelector = function unregisterSelector(item){
      var index = selectors.indexOf(item);
      selectors = selectors.slice(0, index).concat(selectors.slice(index+1));
    };

    var getters = {
      '$selectedItems': function() {
        return selectors
          .filter(isChecked)
          .map(getData);
      },
      '$allSelected': function() {
        return this.$selectedItems.length === selectors.length;
      },
      '$indeterminate': function () {
        return this.$selectedItems.length !== selectors.length &&
          this.$selectedItems.length > 0;
      }
    };

    this.prepareScope = function(scope){

      Object.keys(getters).forEach(function(property){
         Object.defineProperty(this, property, {
          get: getters[property],
          enumerable: true,
          iterable: true
        });
      }, scope);

      scope.$toggleAll = function toggleAll(){
        var selectedValue = !this.$allSelected;

        selectors.forEach( function(row){
          row.setChecked(selectedValue);
        });
      };
    };

   /**
    * helper method to check if row is checked
    * @param  {Object}  row
    * @return {Boolean}
    */
    function isChecked(row){
      return row.isChecked();
    }
    /**
     * accessor function for data
     * @param  {Object} row
     * @return {Object}     data associated to the row
     */
    function getData(row){
      return row.data;
    }

  })
  /**
   * @ngdoc directive
   * @name bonitable.bonitable
   *
   * @description
   * This is a base directive to use with  {@link bonita.sortable:boSorter bo-sorter} and {@link bonita.sortable:boSelector bo-selector}/{@link bonita.sortable:boSelectall bo-selectall}
   * You should not use it only
   * The __bonitable__ directive will create it's own transcluded scope and
   * exposes and API only available to it's children.
   * These properties are used by the directive from bonita.selectable
   *
   * | Variable          | Type             | Details                                                            |
   * |-------------------|------------------|--------------------------------------------------------------------|
   * | `$selectedItems`  | {@type Array}    | an array containing the selected items. @see bo_selector.          |
   * | `$indeterminate`  | {@type boolean}  | true if not all the items are selected.                            |
   * | `$allSelected`    | {@type boolean}  | true if all items are selected.                                    |
   * | `$toggleAll`      | {@type function} | select/unselect all the bo-selector at once.                       |
   *
   *
   * @element ANY
   * @scope
   * @prioriyt 100
   * @restrict A
   * @param {expression} onSort an  expression to be evaluate upon each time the sortProperties are updated
   * @param {Array} repeatableConfig an array of ``boolean`` representing the visibility status for  each columns in the table
   * @param {Object} sortOptions  an function an object with 2 property: ``property``{string} for current property
   *                                    sort is apply on, and, 'direction' {boolean} ``false`` for ascending sort, ``true`` for descending sort
   *
   * @example
    <example module="bonitableExample">
      <file name="index.html">
        <p>sort called {{count}} times</p>
        <pre>{{options|json}}</pre>
        <table bonitable sort-options="options" on-sort="sortHandler()">
          <thead>
            <tr>
              <th><div bo-selectall></div></th>
              <th bo-sorter="name">name</th>
              <th bo-sorter="country">country</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="user in users | orderBy: options.property : options.direction ">
              <td><input type="checkbox" bo-selector/></td>
              <td>{{user.name}}</td>
              <td>{{user.country}}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">You have selected {{$selectedItems.length}} items</td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('bonitableExample', [
            'ui.bootstrap.tpls',
            'bonitable',
            'bonita.templates',
            'bonita.sortable',
            'bonita.selectable'
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
            };
          })
      </file>
    </example>
   *
   */
  .directive('bonitable', function(){
    return {
      priority:100,
      scope: {
        //bo-sortable options
        onSort:'&',
        sortOptions:'=',

        //bo-repeatable-config
        repeatableConfig:'='
      },
      transclude:'element',
      controller: 'BonitableController',
      compile: function(){
        return function($scope, $element, $attr, ctrl, $transclude){
          $transclude( function(clone, scope){
            ctrl.prepareScope(scope);
            $element.after(clone);
          });
        };
      }
    };
  });
