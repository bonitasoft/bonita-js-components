angular.module('bonita.ui', [
  'bonitable',
  'bonita.templates',
  'bonita.sortable',
  'bonita.selectable',
  'bonita.repeatable'
  ]);


angular.module('bonitable', [])
  .controller('BonitableController', function(){
    //allow require bonitable form child directive
  })
  .directive('bonitable', function(){
    return {
      controller: 'BonitableController'
    };
  });