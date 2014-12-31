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
  .directive('boDropzone', function ($document, $parse, $compile, boDragUtils, boDragEvent, boDraggableItem){

    'use strict';

    // Register some callback for the directive
    var eventMap = {},
        DROPZONE_CLASSNAME_HOVER = boDragEvent.events.DROPZONE_CLASSNAME_HOVER,
        CLASSNAME_DRAG_HOVER     = boDragEvent.events.CLASSNAME_DRAG_HOVER;

    /**
     * Remove a className on en element
     * ClassList is not available on IE9 :/
     * @param  {Node} target
     * @param  {String} className ClassName to remove
     * @return {void}
     */
    function removeClassNames(target, className) {
      target.className = target.className.replace(new RegExp(' ' + className),'');
    }

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        if(-1 === e.target.className.indexOf(DROPZONE_CLASSNAME_HOVER)) {
          // Remove all other dropZone with the className
          angular
            .element(document.getElementsByClassName(DROPZONE_CLASSNAME_HOVER))
            .removeClass(DROPZONE_CLASSNAME_HOVER);

          e.target.className += ' ' + DROPZONE_CLASSNAME_HOVER;
        }

        eventMap[dragElmId].onDragOver(eventMap[dragElmId].scope, {$event: e});
        (e.dataTransfer || e.originalEvent.dataTransfer).dropEffect = 'copy';
        return false;
      }
    });

    // Add a delegate for event detection. One event to rule them all
    $document.on('drop', function (e) {
      e.preventDefault(); // allows us to drop

      // Drop only in dropZone container
      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        /**
         * Defines in the directive boDraggable inside the listener of dragStart
         * Format: element.id:(true|false)
         * So after a split, [0] is drag element id and [1] is is it a child of a dropZone
         */
        var dragData = (e.dataTransfer || e.originalEvent.dataTransfer).getData('Text').split(':');
        // debugger;
        // Grab the drag element
        var el          = document.getElementById(dragData[0]),
            targetScope = eventMap[dragElmId].scope,
            newScope    = targetScope.$new(),
            scopeData   = boDragEvent.map[dragData[0]].scope.data;

        // Was it a child of a dropzone ? If not then create a copy
        if('false' !== dragData[1]) {
          e.target.appendChild(el);
        }else {
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
        }

        removeClassNames(e.target,DROPZONE_CLASSNAME_HOVER);
        removeClassNames(e.target,CLASSNAME_DRAG_HOVER);
        eventMap[dragElmId].onDropSuccess(targetScope, {$data: 'false' !== dragData[1] ? scopeData : newScope.data, $event: e});

      }
    });

    return {
      type: 'A',
      link: function(scope, el, attr) {

        el.addClass('bo-dropzone-container');
        attr.$set('data-drop-id',boDragUtils.generateUniqId('drop'));

        // Register event for this node
        eventMap[attr['data-drop-id']] = {
          scope: scope,
          onDropSuccess: $parse(attr.boDropSuccess) || angular.noop,
          onDragOver: $parse(attr.boDragOver) || angular.noop
        };
      }
    };

  })
  .factory('boDragEvent',function() {
    var eventMap = {};
    return {
      // Store each cb reference for a any draggable element
      map: eventMap,
      events: {
        DROPZONE_CLASSNAME_HOVER: 'bo-dropzone-hover',
        CLASSNAME_DRAG_HOVER: 'bo-drag-enter'
      },
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
  .directive('boDraggable', function ($document, boDragEvent, boDragUtils){
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

    $document.on('dragenter', function(e) {

      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        return;
      }
      e.target.className += ' ' + boDragEvent.events.CLASSNAME_DRAG_HOVER;

    });

    $document.on('dragleave', function(e) {
      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        e.target.className = e.target.className.replace(' '+boDragEvent.events.CLASSNAME_DRAG_HOVER,'');
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
            scope: scope,
            onDragStart: scope.onDragStart || angular.noop
          };
        }
      }
    };
  })
  .directive('boDragPolyfill', function ($window, $timeout, $rootScope, $compile, boDragEvent) {

    /**
     * Before angular bind the scope to the dom, we update the dom for IE
     * We find the declaration of boDraggable and change the dom to a <a href> since the div is buggy with IE9.
     *
     * Why do not use compile on boDraggable ?
     * Because angular create a fragment, and a fragment does not have any parents, so we cannot replace the old node by a polyfill.
     */
    'use strict';

    /**
     * Replace all node for IE9
     * And attach their scope
     * @param  {nodeList} list
     * @return {void}
     */
    function replaceNode(list) {

      var scope, newScope;
      Array.prototype.forEach.call(list, function (el) {

        // Find data for the draggable directive and copy it
        scope         = boDragEvent.map[el.id].scope.data;
        newScope      = $rootScope.$new(true, boDragEvent.map[el.id].scope);
        newScope.data = scope;

        // IE, where the WTF is real
        var nodeA = document.createElement('A');
        // Duplicate attributes
        [].forEach.call(el.attributes, function (attr) {
          nodeA.setAttribute(attr.name,attr.value);
        });

        nodeA.innerHTML = el.innerHTML;
        nodeA.href = '#';
        el.parentNode.replaceChild(nodeA,el);
        $compile(angular.element(nodeA))(newScope);
      });
    }

    return {
      type: 'EA',
      link: function link() {
        // Drag&drop API works on IE9 if the element is a <a href="#"> so replace the tag with it
        if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {

          // run the polyfill after the digest, because some directive can be bind, so compile cannot see them
          $timeout(function() {
            var elmts = document.querySelectorAll('[bo-draggable]'),
                elmts2 = document.querySelectorAll('[data-bo-draggable]');
            replaceNode(elmts);
            replaceNode(elmts2);
          });

        }
      }
    };

  });
