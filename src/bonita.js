angular.module('bonita.ui', [
  'bonita.templates',
  'bonita.sortable',
  'bonita.selectable'
  ]);


angular.module('bonita.ui')
  .controller('BonitableController', function(){
    //allow require bonitable form child directive
  })
  .directive('bonitable', function(){
    return {
      scope:true,
      controller: 'BonitableController'
    };
  });
