angular.module('bonitable', [])
  .controller('BonitableController', ['$scope', function($scope){

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

  }])
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

angular.module('bonita.dragAndDrop',[])
  .provider('boDraggableItem', function() {

    'use strict';

    var defaultConfig = {
      cloneOnDrop: true
    };

    /**
     * Allow the creation of a new node when we drag the item
     * Default is true;
     * @param  {Boolean} allowClone
     * @return {[type]}            [description]
     */
    this.cloneOnDrop = function cloneOnDrop(allowClone) {
      defaultConfig.cloneOnDrop = allowClone;
    };

    this.$get = function() {
      return {
        config: function config() {
          return angular.copy(defaultConfig);
        },
        allowCloneOnDrop: function allowCloneOnDrop() {
          return this.config().cloneOnDrop || false;
        }
      };
    };

  })
  .service('boDragUtils', function() {
    'use strict';
    /**
     * Generate a uniq identifier from 6/7 to 11 caracters (90% between 9 and 11)
     * @param  {String} key prefix
     * @return {String}
     */
    this.generateUniqId = function generateUniqId(key) {
      return (key || 'drag-') + Math.random().toString(36).substring(7);
    };
  })
  .directive('boDropzone', ['$document', '$parse', '$compile', 'boDragUtils', 'boDragEvent', 'boDraggableItem', function ($document, $parse, $compile, boDragUtils, boDragEvent, boDraggableItem){

    'use strict';

    // Register some callback for the directive
    var eventMap = {},
        DROPZONE_CLASSNAME_HOVER = 'bo-dropzone-hover';

    function removeClassNames(target, className) {
      target.className = target.className.replace(new RegExp(' ' + className),'');
    }

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {

        if(-1 === e.target.className.indexOf(DROPZONE_CLASSNAME_HOVER)) {
          // Remove all other dropZone with the className
          angular
            .element(document.getElementsByClassName(DROPZONE_CLASSNAME_HOVER))
            .removeClass(DROPZONE_CLASSNAME_HOVER);

          e.target.className += ' ' + DROPZONE_CLASSNAME_HOVER;
        }

        eventMap[e.target.getAttribute('data-drop-id')].onDragOver(angular.element(e.target).scope(), {$event: e});
        (e.dataTransfer || e.originalEvent.dataTransfer).dropEffect = 'copy';
        return false;
      }
    });

    // Add a delegate for event detection. One event to rule them all
    $document.on('drop', function (e) {
      e.preventDefault(); // allows us to drop

      // Drop only in dropZone container
      if(e.target.hasAttribute('data-drop-id')) {

        var dragElmId = e.target.getAttribute('data-drop-id');

        /**
         * Defines in the directive boDraggable inside the listener of dragStart
         * Format: element.id:(true|false)
         * So after a split, [0] is drag element id and [1] is is it a child of a dropZone
         */
        var dragData = (e.dataTransfer || e.originalEvent.dataTransfer).getData('Text').split(':');

        // Grab the drag element
        var el          = document.getElementById(dragData[0]),
            targetScope = angular.element(e.target).scope(),
            newScope    = targetScope.$new(),
            scopeData   = angular.element(el).isolateScope().data || angular.element(el).scope().data;

        // Was it a child of a dropzone ? If not then create a copy
        if('false' === dragData[1]) {
          var surrogate = el.cloneNode(true);
          surrogate.id = boDragUtils.generateUniqId();

          // Update the event map reference
          boDragEvent.copy(dragData[0], surrogate.id);

          try {
            surrogate.attributes.removeNamedItem('ng-repeat');
          }catch (e) {
            // You're trying to delete an ghost attribute. DOMException: Failed to execute 'removeNamedItem'
          }

          // Default is true so we clone the node
          if(boDraggableItem.allowCloneOnDrop()) {
            e.target.appendChild(surrogate);
          }
          newScope.data = scopeData;

          // Compile a new isolate scope for the drag element
          $compile(angular.element(surrogate))(newScope);

          targetScope.$apply(function() {
            removeClassNames(e.target,DROPZONE_CLASSNAME_HOVER);
            eventMap[dragElmId].onDropSuccess(targetScope, {$data : newScope.data,  $event: e});
          });

          return;
        }

        targetScope.$apply(function() {
          removeClassNames(e.target,DROPZONE_CLASSNAME_HOVER);
          eventMap[dragElmId].onDropSuccess(targetScope, {$data: scopeData, $event: e});
        });

        e.target.appendChild(el);
      }
    });



    return {
      type: 'A',
      link: function(scope, el, attr) {

        el.addClass('bo-dropzone-container');
        attr.$set('data-drop-id',boDragUtils.generateUniqId('drop'));

        // Register event for this node
        eventMap[attr['data-drop-id']] = {
          onDropSuccess: $parse(attr.boDropSuccess) || angular.noop,
          onDragOver: $parse(attr.boDragOver) || angular.noop
        };
      }
    };

  }])
  .factory('boDragEvent',function() {
    var eventMap = {};
    return {
      // Store each cb reference for a any draggable element
      map: eventMap,
      /**
       * Copy an event reference
       * @param  {String} from Identifier draggable item
       * @param  {String} to   Identifier other draggable event
       * @return {void}
       */
      copy: function copy(from, to) {
        eventMap[to] = eventMap[from];
      }
    };
  })
  .directive('boDraggable', ['$document', 'boDragEvent', 'boDragUtils', function ($document, boDragEvent, boDragUtils){
    'use strict';

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragstart', function (e) {

      var target     = e.target,
          eventData  = (e.dataTransfer || e.originalEvent.dataTransfer);

      eventData.effectAllowed = 'copy';
      eventData.setData('Text', target.id + ':' + target.parentElement.hasAttribute('data-drop-id'));

      // Trigger the event if we need to
      if (boDragEvent.map[target.id]){
        boDragEvent.map[target.id].onDragStart();
      }
    });

    return {
      type: 'EA',
      scope: {
        data: '=boDraggableData',
        onDragStart: '&boDragStart'
      },
      link: function(scope, el, attr) {
        attr.$set('draggable',true);
        attr.$set('id',attr.id || boDragUtils.generateUniqId());
        // Register event for the current node
        if(attr.boDragStart) {
          boDragEvent.map[attr.id] = {
            onDragStart: scope.onDragStart || angular.noop
          };
        }
      }
    };
  }])
  .directive('boDragPolyfill', ['$window', function ($window) {

    /**
     * Before angular bind the scope to the dom, we update the dom for IE
     * We find the declaration of boDraggable and change the dom to a <a href> since the div is buggy with IE9.
     *
     * Why do not use compile on boDraggable ?
     * Because angular create a fragment, and a fragment does not have any parents, so we cannot replace the old node by a polyfill.
     */
    'use strict';

    return {
      type: 'EA',
      compile: function compile() {

        var elmts = document.querySelectorAll('[bo-draggable]');

        // Drag&drop API works on IE9 if the element is a <a href="#"> so replace the tag with it
        if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {

          [].forEach.call(elmts, function (el) {
            // IE, where the WTF is real
            var nodeA = document.createElement('A');
            // Duplicate attributes
            [].forEach.call(el.attributes, function (attr) {
              nodeA.setAttribute(attr.name,attr.value);
            });

            nodeA.innerHTML = el.innerHTML;
            nodeA.href = '#';
            el.parentNode.replaceChild(nodeA,el);
          });
        }
      }
    };

  }]);

/* jshint sub:true*/
(function () {
  'use strict';
  angular.module('org.bonita.services.topurl', [])
    .service('manageTopUrl', ['$window', function ($window) {
      var manageTopUrlService = {};
      manageTopUrlService.getCurrentPageToken = function() {
        var pageTokenRegExp = /(^|[&\?])_p=([^&]*)(&|$)/;
        var pageTokenMatches = pageTokenRegExp.exec($window.top.location.hash);
        if (pageTokenMatches && pageTokenMatches.length) {
          return pageTokenMatches[2];
        }
        return '';
      };

      manageTopUrlService.addOrReplaceParam = function (param, paramValue) {
        if (paramValue !== undefined && $window.self !== $window.top) {
          var pageToken = manageTopUrlService.getCurrentPageToken();
          if (!!$window.top.location.hash) {
            var paramRegExp = new RegExp('(^|[&\\?])'+pageToken+param+'=[^&]*(&|$)');
            var paramMatches = $window.top.location.hash.match(paramRegExp);
            if (!paramMatches || !paramMatches.length) {
              var currentHash = $window.top.location.hash;
              if(paramValue) {
                $window.top.location.hash += ((currentHash.indexOf('&', currentHash.length - 2) >= 0) ? '' : '&') + pageToken + param + '=' + paramValue;
              }
            } else {
              var paramToSet = '';
              if(paramValue){
                paramToSet = pageToken + param + '=' + paramValue;
              }
              $window.top.location.hash = $window.top.location.hash.replace(paramRegExp, '$1'+ paramToSet + '$2');
            }
          } else {
            if(paramValue) {
              $window.top.location.hash = '#' + pageToken + param + '=' + paramValue;
            }
          }
        }
      };
      manageTopUrlService.getCurrentProfile = function () {
        if ($window && $window.top && $window.top.location && $window.top.location.hash) {
          var currentProfileMatcher = $window.top.location.hash.match(/\b_pf=\d+\b/);
          return (currentProfileMatcher && currentProfileMatcher.length) ? currentProfileMatcher[0] : '';
        }
      };
      manageTopUrlService.getPath = function () {
        return $window.top.location.pathname;
      };
      manageTopUrlService.getSearch = function () {
        return $window.top.location.search || '';
      };
      manageTopUrlService.getUrlToTokenAndId = function (id, token) {
        return manageTopUrlService.getPath() + manageTopUrlService.getSearch() + '#?id=' + (id || '') + '&_p=' + (token || '') + '&' + manageTopUrlService.getCurrentProfile();
      };

      manageTopUrlService.goTo = function(destination){
        var token = destination.token;
        if(!token){
          return;
        }
        var params = '&';
        if(destination){
          angular.forEach(destination, function(value, key){
            if(key && value && key !== 'token'){
              params += token + key + '=' + value + '&';
            }
          });
        }
        $window.top.location.hash = '?_p='+ token+'&' + manageTopUrlService.getCurrentProfile() + params;
      };
//cannot use module pattern or reveling since we would want to mock methods on test
      return manageTopUrlService;
    }]);
})();

angular
  .module('bonita.selectable',['bonitable'])
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

angular
  .module('bonita.repeatable', ['bonitable'])
  .service('domAttributes', function(){
    this.copy = function(source, destination, needRemove) {
      [].slice.call(source.attributes).forEach(function (attr) {
        destination.setAttribute(attr.name, source.getAttribute(attr.name));
        if (needRemove) {
          source.removeAttribute(attr.name);
        }
      });
    };
  })
  .directive('columnTemplate', ['$compile', 'domAttributes', function ($compile, domAttributes) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attr) {

        var template = angular.element(attr.columnTemplate);
        var wrapper = angular.element('<div></div>');

        // copying the root node attributes to the wrapper element to compile them
        domAttributes.copy(template[0], wrapper[0], false);

        //compile the element
        var el = $compile(wrapper.append(template.contents()))(scope.$parent);

        // copying the compiled attributes to the root node and remove them from the wrapper
        domAttributes.copy(wrapper[0], element[0], true);
        element.append(el);
      }
    };
  }])
  .directive('boRepeatable', function () {
    return {
      require:'bonitable',
      restrict: 'A',
      compile: function (elem, attr) {

        var thSelecter  = attr[this.name] || 'thead tr:last-child';
        var tdSelecter = 'tr[ng-repeat]';

        var header = elem[0].querySelector(thSelecter);
        var row = elem[0].querySelector(tdSelecter);

        if (!header || !row || header.children.length !== row.children.length) {
          throw new Error('bo-repeatable th number does not correspond to td number. please verify you html table');
        }

        var columns = [];
        var tdCells =  row.children;

        var insertIndex;
        [].some.call(header.children, function(th, index){
          insertIndex = index;
          return th.getAttribute('data-ignore') === null;
        });


        /**
         * filter helper to test if data-ignore attribute is present on a Node
         * @param  {Object} item  an object containing both th and td node
         * @return {Boolean}      true id data-ignore is present
         */
        function filterIgnoreCell(item){
          return item.th.getAttribute('data-ignore') === null;
        }

        /**
         * dynamic filter function for filtering repeated columns
         * @param  {string}  Prop
         * @param  {Object}  column
         * @return {Boolean}
         */
        function columnFilter(prop, column) {
          return column[prop] === true;
        }
        var prop = attr.visibleProp || 'visible';

        columns = [].map.call(header.children, function(th, index) {
            return {th: th, td: tdCells[index]};
          })
          .filter(filterIgnoreCell)
          .map(function(item){
              angular.element(item.th).remove();
              angular.element(item.td).remove();
              var o = {
                name: item.th.textContent,
                header: item.th.outerHTML,
                cell: item.td.outerHTML
              };
              o[prop] = true;
              return o;
            });

        /**
         * create an HTMLElement for column-template which hold the ng-repeat
         * @param  {String} tagName
         * @param  {String} template
         * @return {HTMLElement}
         */
        function createNode(tagName, template) {
          var el = document.createElement(tagName);
          el.setAttribute('column-template', template);
          el.setAttribute('ng-repeat', 'column in $columns | filter:$visibilityFilter');

          return el;
        }
        var thRepeat = createNode('th', '{{::column.header}}');
        var tdRepeat = createNode('td', '{{::column.cell}}');

        header.insertBefore(thRepeat, header.children[insertIndex]);
        row.insertBefore(tdRepeat, row.children[insertIndex]);

        return function (scope) {
          scope.$columns = columns;
          scope.$visibilityFilter = columnFilter.bind(null, prop);
        };
      }
    };
  })
  .directive('repeatableConfig', function(){
    return {
      priority:1,
      require: 'bonitable',
      link: function(scope, elem, attr){
        scope.$watch(attr.repeatableConfig, function(visibleConfig){
          var prop = attr.visibleProp || 'visible';
          if (visibleConfig.length !== scope.$columns.length) {
            throw new Error('repeatable-config size differ from $columns size. Please check your config attr');
          }

          scope.$columns.forEach(function(item, index){
            item[prop] = visibleConfig[index];
          });
        });
      }
    };
  });

angular
  .module('bonita.sortable',['bonitable'])
  .directive('boSorter', function(){

    /**
     * Translate the boolean direction for the order of the sort
     * @param  {Boolean} isDesc
     * @return {Strinc}
     */
    function getDirectionSort(isDesc) {
      return isDesc ? 'DESC' : 'ASC';
    }

    /**
     * Find the attribute title for the directive for desc mode or asc mode (default one)
     * @param  {Object} attr Angular directive attr
     * @param  {String} sort cf {@link getDirectionSort}
     * @return {String}
     */
    function generateTitle(attr, sort) {
      // Add a suffix with ucFirst
      var key = 'boSorterTitle' + sort.charAt() + sort.substring(1).toLowerCase();
      return attr[key] || 'Sort by ' + sort;
    }

    return {
      restrict: 'A',
      scope: true,
      require:'^bonitable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, bonitableCtrl) {
        $scope.property =  (attr.boSorter || attr.id || '').trim();

        if ($scope.property.length === 0){
          throw new Error('bo-sorter: no id found. Please specify on wich property the sort is applied to or add an id');
        }

        $scope.sortOptions = bonitableCtrl.getOptions();

        var sort = getDirectionSort($scope.sortOptions.direction);

        // Set de default title if no title exist
        $scope.titleSortAttr = generateTitle(attr, sort);

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = false;
          }

          sort = getDirectionSort($scope.sortOptions.direction);
          $scope.titleSortAttr = generateTitle(attr, sort);

          bonitableCtrl.triggerSortHandler($scope.sortOptions);
        };
      }
    };
  });

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

(function(module) {
try {
  module = angular.module('bonita.templates');
} catch (e) {
  module = angular.module('bonita.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/sortable/sorter.tpl.html',
    '<button class="bo-SortButton"\n' +
    '        title="{{titleSortAttr}}"\n' +
    '        ng-class="{\'bo-SortButton--active text-primary\':sortOptions.property === property}" ng-click="sort()">\n' +
    '  <span class="bo-SortButton-label" ng-transclude></span>\n' +
    '  <i class="bo-SortButton-icon" ng-class="{\'icon-sort-up\': !sortOptions.direction || sortOptions.property !== property, \'icon-sort-down\': sortOptions.direction && sortOptions.property === property}"></i>\n' +
    '</button>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('bonita.templates');
} catch (e) {
  module = angular.module('bonita.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/table-settings/tableSettings.tpl.html',
    '<div class="bo-TableSettings pull-right" dropdown>\n' +
    '  <button type="button"\n' +
    '    id="aria-tablesettings"\n' +
    '    class="btn btn-default bo-Settings dropdown-toggle"\n' +
    '    title="{{\'Table settings\' | translate}}"\n' +
    '    ng-disabled="tasks.length === 0"\n' +
    '    aria-labelledby="aria-tablesettings">\n' +
    '    <i class="icon icon-gear"></i>\n' +
    '    <span class="sr-only">{{\'Table settings\' | translate}}</span>\n' +
    '  </button>\n' +
    '\n' +
    '  <div class="bo-TableSettings-content dropdown-menu pull-right" role="menu" aria-labelledby="aria-tablesettings">\n' +
    '    <h5 class="bo-TableSettings-title" >{{\'Items per page \'| translate}}</h5>\n' +
    '    <div class="btn-group btn-group-justified" role="group">\n' +
    '      <div class="btn-group" role="group" ng-repeat="size in sizes">\n' +
    '        <button class="btn btn-default"\n' +
    '          type="button"\n' +
    '          ng-model="$parent.pageSize" btn-radio="{{::size}}"\n' +
    '          ng-change="updatePageSize({size:size})" tabindex="0">\n' +
    '          {{size}}\n' +
    '        </button>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <h5 class="bo-TableSettings-title" >{{\'Columns Selection\' | translate}}</h5>\n' +
    '    <ul class="bo-TableSettings-columns">\n' +
    '      <li  ng-repeat="field in columns">\n' +
    '      <label\n' +
    '        class="bo-TableSettings-column"\n' +
    '        title="{{::((field.selected ? \'Hide\' : \'Show\') +\' \'+ field[label])}}"\n' +
    '        ng-click="$event.stopPropagation()">\n' +
    '        <input type="checkbox" ng-model="field[visible]" ng-change="updateVisibility({field:field})">\n' +
    '        {{::field[label]}}\n' +
    '      </label>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);
})();