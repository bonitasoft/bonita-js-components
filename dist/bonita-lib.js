angular.module('bonita.ui', [
  'bonitable',
  'bonita.templates',
  'bonita.sortable',
  'bonita.selectable',
  'bonita.repeatable',
  'bonita.settings'
]);

angular.module('bonitable', [])
  .controller('BonitableController', function(){
    //allow require bonitable child directive
  })
  .directive('bonitable', function(){
    return {
      controller: 'BonitableController'
    };
  });

angular
  .module('bonita.selectable',[])
  .controller('SelectableController', function(){

    var selectors = [];
    this.registerSelector = function registerSelector(item){
      selectors.push(item);
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

    Object.keys(getters).forEach(function(property){
       Object.defineProperty(this, property, {
        get: getters[property],
        enumerable: true,
        iterable: true
      });
    },this);

    this.$toggleAll = function toggleAll(){
      var selectedValue = !this.$allSelected;

      selectors.forEach( function(row){
        row.setChecked(selectedValue);
      });
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
  .directive('boSelectable', function(){
    // Runs during compile
    return {
      scope:true,
      restrict: 'A', // E = Element, A = *Attribute, C = Class, M = Comment
      controller: 'SelectableController',
      controllerAs: 'selecter',
    };
  })
  .directive('boSelectall', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = *Attribute, C = Class, M = Comment
      require: '^boSelectable',
      replace: true,
      template: '<input type="checkbox" ng-checked="selecter.$allSelected" ng-click="selecter.$toggleAll()">',
      link: function(scope, elem, attr, selectableCtrl){
        scope.$watch(function(){
          return selectableCtrl.$indeterminate;
        }, function(newVal){
          elem[0].indeterminate  = newVal;
        });
      }
    };
  })
  .directive('boSelector', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
      require: '^boSelectable',
      link: function($scope, elem, attr, selectableCtrl) {
        var ngModel = elem.controller('ngModel');

         var item = {
          data: $scope.$eval(attr.boSelector),
          isChecked: function(){
            return ngModel && ngModel.$modelValue===true || elem[0].checked;
          },
          setChecked: function(value){
            if (ngModel){
              ngModel.$setViewValue(value===true);
              ngModel.$render();
            } else  {
              elem[0].checked = value;
            }
          }
        };

        elem.on('change', onChange);

        function onChange(){
          $scope.$apply();
        }

        selectableCtrl.registerSelector(item);

      }
    };
  });

angular.module('bonita.repeatable', [])
  .directive('columnTemplate', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      scope: {
        template: '=columnTemplate',
      },
      link: function (scope, element) {
        var template = angular.element(scope.template);
        var wrapper = angular.element('<div></div>');
        angular.forEach(template[0].attributes, function (attribute) {
          wrapper.attr(attribute.name, template.attr(attribute.name));
        });
        element.append($compile(wrapper.append(template.contents()))(scope.$parent));
      }
    };
  }])
  .directive('boRepeatable', function () {
    return {
      restrict: 'A',
      compile: function (elem, attr) {

        var thSelecter  = attr[this.name] || 'thead tr:last-child';
        var tdSelecter = 'tr[ng-repeat]';

        var header = elem[0].querySelector(thSelecter);
        var row = elem[0].querySelector(tdSelecter);

        if (!header || !row || header.children.length !== row.children.length) {
          throw new Error('bo-repeatable th number does not correspond to td number. please verify you html table');
        }

        var columns = [];
        var tdCells =  row.children;


        /**
         * filter helper to test if data-ignore attribute is present on a Node
         * @param  {Object} item  an object containing both th and td node
         * @return {Boolean}      true id data-ignore is present
         */
        function filterIgnoreCell(item){
          return item.th.getAttribute('data-ignore') === null;
        }

        /**
         * dynamic filter function for filtering repeated columns
         * @param  {string}  Prop
         * @param  {Object}  column
         * @return {Boolean}
         */
        function columnFilter(prop, column) {
          return column[prop] === true;
        }
        var prop = attr.visibleProp || 'visible';

        columns = [].map.call(header.children, function(th, index) {
            return {th: th, td: tdCells[index]};
          })
          .filter(filterIgnoreCell)
          .map(function(item){
              angular.element(item.th).remove();
              angular.element(item.td).remove();
              var o = {
                name: item.th.textContent,
                header: item.th.outerHTML,
                cell: item.td.outerHTML
              };
              o[prop] = true;
              return o;
            });

        angular.element(header)
          .append('<th column-template="column.header" ng-repeat="column in $columns | filter:$visibilityFilter"></th>');
        angular.element(row)
          .append('<td column-template="column.cell" ng-repeat="column in $columns | filter:$visibilityFilter"></td>');
        return function (scope) {
          scope.$columns = columns;
          scope.$visibilityFilter = columnFilter.bind(null, prop);
        };
      }
    };
  })
  .directive('repeatableConfig', function(){
    return {
      priority:1,
      link: function(scope, elem, attr){
        scope.$watch(attr.repeatableConfig, function(visibleConfig){

          var prop = attr.visibleProp || 'visible';
          if (visibleConfig.length !== scope.$columns.length) {
            throw new Error('repeatable-config size differ from $columns size. Please check your config attr');
          }

          scope.$columns.forEach(function(item, index){
            item[prop] = visibleConfig[index];
          });
        });
      }
    };
  });

(function(){
  'use strict';
  angular
  .module('bonita.sortable',[])
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

'use strict';

angular.module('bonita.settings', ['ui.bootstrap.dropdown', 'ui.bootstrap.buttons'])
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
        scope.label = attr.labelProp || 'id';
      }
    };
  });
