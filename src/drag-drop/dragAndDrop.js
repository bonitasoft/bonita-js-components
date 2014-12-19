angular.module('bonita.dragAndDrop',[])
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
  .directive('boDropzone', function ($document, $parse, $compile, boDragUtils, boDragEvent){

    'use strict';

    // Register some callback for the directive
    var eventMap = {};

    function removeClassNames(target, className) {
      target.className = target.className.replace(new RegExp(' ' + className),'');
    }

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {

        if(-1 === e.target.className.indexOf('bo-dragzone-hover')) {
          // Remove all other dropZone with the className
          angular
            .element(document.getElementsByClassName('bo-dragzone-hover'))
            .removeClass('bo-dragzone-hover');

          e.target.className += ' bo-dragzone-hover';
        }

        eventMap[e.target.getAttribute('data-drop-id')].onDragOver(angular.element(e.target).scope(), {$event: e});
        e.dataTransfer.dropEffect = 'copy';
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
        var dragData = e.dataTransfer.getData('Text').split(':');

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

          e.target.appendChild(surrogate);
          newScope.data = scopeData;

          // Compile a new isolate scope for the drag element
          $compile(angular.element(surrogate))(newScope);

          targetScope.$apply(function() {
            removeClassNames(e.target,'bo-dragzone-hover');
            eventMap[dragElmId].onDropSuccess(targetScope, {$data : newScope.data,  $event: e});
          });

          return;
        }

        targetScope.$apply(function() {
          removeClassNames(e.target,'bo-dragzone-hover');
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

  })
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
  .directive('boDraggable', function ($document, boDragEvent, boDragUtils){
    'use strict';

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragstart', function (e) {

      var target = e.target;

      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('Text', target.id + ':' + target.parentElement.hasAttribute('data-drop-id'));

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
  })
  .directive('boDragPolyfill', function ($window) {

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
      compile: function compile(element) {

        var el = element.find('[bo-draggable]')[0];

        // Drag&drop API works on IE9 if the element is a <a href="#"> so replace the tag with it
        if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {

          // IE, where the WTF is real
          var nodeA = document.createElement('A');

          // Duplicate attributes
          [].forEach.call(el.attributes, function (attr) {
            nodeA.setAttribute(attr.name,attr.value);
          });

          nodeA.innerHTML = el.innerHTML;
          nodeA.href = '#';
          el.parentNode.replaceChild(nodeA,el);
        }
      }
    };

  });
