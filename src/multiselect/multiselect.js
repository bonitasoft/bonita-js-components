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
