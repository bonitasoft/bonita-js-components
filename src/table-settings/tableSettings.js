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
        scope.label = attr.labelProp || 'name';
      }
    };
  });
