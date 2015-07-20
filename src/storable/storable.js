/**
 * Created by fabiolombardi on 15/07/2015.
 */
angular
  .module('org.bonitasoft.bonitable.storable',[
    'org.bonitasoft.bonitable',
    'ngStorage'
    ])
  .directive('boStorable', function($localStorage){
    return {
      restrict: 'A',

      require:'^bonitable',
      priority: 1,
      link: function(scope,elt, attr, bonitableCtrl) {
        var storageId = attr.boStorable;
        if(!storageId){
          throw new Error('you must set a storageId to bo-storable');
        }


        scope.init = function init(){
          if(!$localStorage[storageId]){
            $localStorage[storageId] = {};
          }
          if($localStorage[storageId].columns){
            scope.$columns = $localStorage[storageId].columns;
          }else{
            $localStorage[storageId].columns = null;
          }
          if($localStorage[storageId].sortOptions){
            bonitableCtrl.setOptions($localStorage[storageId].sortOptions);
          }else{
            $localStorage[storageId].sortOptions = null;
          }
        };

        scope.clearTableStorage = function clearTableStorage(storageId){
          delete $localStorage[storageId];
        };
        scope.init();

        scope.$watch(bonitableCtrl.getOptions, function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $localStorage[storageId].sortOptions = newValue;
          }
        }, true);

        scope.$watch('$columns', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $localStorage[storageId].columns = newValue;
          }
        }, true);
      }
    };
  });
