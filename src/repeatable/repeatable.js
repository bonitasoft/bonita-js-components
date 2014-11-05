angular.module('bonita.repeatable', [])
  .directive('columnTemplate', function ($compile) {
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
  })
  .directive('boRepeatable', function () {
    return {
      restrict: 'A',
      compile: function (elem, attr) {

        var thSelecter  = attr[this.name] || 'thead tr:last-child';
        var tdSelecter = 'tr[ng-repeat]';

        var header = elem[0].querySelector(thSelecter);
        var row = elem[0].querySelector(tdSelecter);

        if (!header || !row || header.children.length !== row.children.length) {
          throw new Error('bo-repeatable th number does not corespond to td number. please verify you html table');
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

        columns = [].map.call(header.children, function(th, index){
            return {th: th, td: tdCells[index]};
          })
          .filter(filterIgnoreCell)
          .map(function(item){
              angular.element(item.th).remove();
              angular.element(item.td).remove();
              return {
                name: item.th.textContent,
                visible: true,
                header: item.th.outerHTML,
                template: item.td.outerHTML
              };
            });

        angular.element(header)
          .append('<th column-template="column.header" ng-repeat="column in $columns | filter:{visible:true}"></th>');
        angular.element(row)
          .append('<td column-template="column.template" ng-repeat="column in $columns | filter:{visible:true}"></td>');

        return function (scope) {
          scope.$columns = columns;
        };
      }
    };
  });
