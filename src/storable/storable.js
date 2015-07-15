/**
 * Created by fabiolombardi on 15/07/2015.
 */
angular
  .module('org.bonitasoft.bonitable.storable',[
    'org.bonitasoft.bonitable'
    ])
  .directive('boStorable', function($localStorage){
    return {
      restrict: 'A',
      require:'^bonitable',
      priority: 1,
      link: function(scope,elt, attr, bonitableCtrl) {

        scope.init = function init(){
          if($localStorage.columns){
            scope.$columns = $localStorage.columns;
          }
          
          if($localStorage.sortOptions){
            bonitableCtrl.setOptions($localStorage.sortOptions);
          }

        };

        scope.clearLocalStorage = function init(){
          //TODO

        };
        
        scope.init();

        scope.$watch(bonitableCtrl.getOptions, function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $localStorage.sortOptions = newValue;
          }
        }, true);

        scope.$watch('$columns', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $localStorage.columns = newValue;
          }
        }, true);
      }
    };
  });
