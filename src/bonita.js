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
