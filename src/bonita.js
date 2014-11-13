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
  .directive('bonitable', function(){
    return {
      // scope:true,
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
