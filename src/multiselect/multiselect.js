angular
  .module('org.bonitasoft.selectable',['org.bonitasoft.bonitable'])
  /**
   * @ngdoc directive
   * @name bonita.selectable:boSelectall
   * @module bonita.selectable
   *
   * @description
   *
   * This directive will insert a checkbox that reflect the current
   * selection status (checked / unckeched / indeterminate) of the row.
   *
   * It will also allow user to check the ``input[bo-selector]`` all at once.
   * Internally, this directive rely on ``$toggleAll()`` and ``$allSelected``,
   * wich are both exposed by the {@link bonitable.bonitable directive}.
   *
   * @example
    <example module="selectableExample">
      <file name="index.html">

        <table bonitable>
          <thead>

              <tr>
                  <th><div bo-selectall></div></th>
                  <th>Name</th>
                  <th>Country</th>
              </tr>
          </thead>
          <tbody>
              <tr ng-repeat="user in users">
                  <td><input bo-selector="user" type="checkbox" /></td>
                  <td>{{user.name}}</td>
                  <td>{{user.country}}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>$allSelected</td>
              <td colspan="2"><pre>{{$allSelected | json}}</pre></td>
            </tr>
            <tr>
              <td>$indeterminate</td>
              <td colspan="2"><pre>{{$indeterminate | json}}</pre></td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('selectableExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.selectable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
          })
      </file>
    </example>
   */
  .directive('boSelectall', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = *Attribute, C = Class, M = Comment
      require: '^bonitable',
      replace: true,
      template: '<input type="checkbox" ng-checked="$allSelected" ng-click="$toggleAll()">',
      link: function(scope, elem){
        scope.$watch(function(){
          return scope.$indeterminate;
        }, function(newVal){
          elem[0].indeterminate  = newVal;
        });
      }
    };
  })
  /**
   * @ngdoc directive
   * @name bonita.selectable:boSelector
   * @module bonita.selectable
   * @element input
   * @description
   *
   * This directive could be used in association with {@link bonita.selectable:boSelector boSelector}.
   *
   *
   * The directive __bo-selector__ will updates ``$selectedItems`` which is exposed by {@link bonitable:bonitable bonitable} for all its child elements.
   *
   * By default, the directive will refer to a local property for defining the selected state of a row.
   * If you want to associate these property on the current row data, you use a ng-model
   *
   *
   * ```html
   * <input bo-selector="tag" ng-model="tag.selected" /></td>
   * ```
   *
   * @param {String} boSelector the data associated to the row from a ng-repeat
   *
   * @example
    <example module="selectorExample">
      <file name="index.html">

        <table bonitable>
          <thead>

              <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Country</th>
              </tr>
          </thead>
          <tbody>
              <tr ng-repeat="user in users">
                  <td><input bo-selector="user" type="checkbox" /></td>
                  <td>{{user.name}}</td>
                  <td>{{user.country}}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><pre>{{$selectedItems | json}}</pre></td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('selectorExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.selectable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
          })
      </file>
    </example>
   */
  .directive('boSelector', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
      require: '^bonitable',
      link: function($scope, elem, attr, bonitableCtrl) {
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
        $scope.$on('$destroy', onDestroy);

        function onChange(){
          $scope.$apply();
        }

        function onDestroy(){
          bonitableCtrl.unregisterSelector(item);
        }
        bonitableCtrl.registerSelector(item);

      }
    };
  });
