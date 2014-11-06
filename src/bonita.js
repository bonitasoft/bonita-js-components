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
    //allow require bonitable form child directive
  })
  .directive('bonitable', function(){
    return {
      controller: 'BonitableController'
    };
  })
  .filter('slice', function() {
    return function(input, start) {
      start = parseInt(start,10) || 0 ;
      return input.slice(start);
    };
  });
