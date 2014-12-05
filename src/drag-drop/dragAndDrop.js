angular.module('bonita.dragAndDrop',[])
  .service('boDragMap', function() {
    'use strict';
    var map = {};

    /**
     * Save data for a drag item
     * @param {String} id   uniq identifier for a node
     * @param {Object} data
     */
    this.set = function set(id, data) {

      if('string' !== typeof id) {
        throw new TypeError('The map key must be a string');
      }
      map[id] = data;
    };

    /**
     * Update a key. When we drag an item into a container its id changes so we
     * need to map the data to the new id
     * @param  {String} id    old id
     * @param  {string} newId new id
     * @return {void}
     */
    this.updateKey = function updateKey(id, newId) {
      map[newId] = map[id];
      delete map[id];
    };

    /**
     * Get data for a node id
     * @param  {String} id
     * @return {Object}
     */
    this.get = function get(id) {
      return map[id];
    };

    /**
     * Reset the map
     * @return {void}
     */
    this.reset = function reset() {
      map = {};
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
  .directive('boDropzone', function ($document, boDragUtils, boDragMap){

    'use strict';

    // Register some callback for the directive
    var eventMap = {};

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {
        eventMap[e.target.getAttribute('data-drop-id')].onDragOver.apply(this,[angular.element(e.target).scope()]);
        e.dataTransfer.dropEffect = 'copy';
        return false;
      }
    });

    // Add a delegate for event detection. One event to rule them all
    $document.on('drop', function (e) {
      e.preventDefault(); // allows us to drop

      // Drop only in dropZone container
      if(e.target.hasAttribute('data-drop-id')) {
        /**
         * Defines in the directive boDraggable inside the listener of dragStart
         * Format: element.id:(true|false)
         * So after a split, [0] is drag element id and [1] is is it a child of a dropZone
         */
        var dragData = e.dataTransfer.getData('Text').split(':');
        // Grab the drag element
        var el = document.getElementById(dragData[0]);

        // Was it a child of a dropzone ? If not then create a copy
        if('false' === dragData[1]) {
          var surrogate = el.cloneNode(true);
          surrogate.id = boDragUtils.generateUniqId();

          // Update the map reference
          boDragMap.updateKey(dragData[0], surrogate.id);

          try {
            surrogate.attributes.removeNamedItem('ng-repeat');
          }catch (e) {
            // You're trying to delete an ghost attribute. DOMException: Failed to execute 'removeNamedItem'
          }

          e.target.appendChild(surrogate);
          eventMap[e.target.getAttribute('data-drop-id')].onDropSuccess.apply(this,[angular.element(e.target).scope(), boDragMap.get(surrogate.id)]);
          return;
        }

        eventMap[e.target.getAttribute('data-drop-id')].onDropSuccess.apply(this,[angular.element(e.target).scope(), boDragMap.get(el.id)]);
        e.target.appendChild(el);
      }
    });

    return {
      type: 'A',
      scope: {
        onDropSuccess: '&boDropSuccess',
        onDragOver: '&boDragOver'
      },
      link: function(scope, el, attr) {
        el.addClass('bo-dropzone-container');
        attr.$set('data-drop-id',boDragUtils.generateUniqId('drop'));

        // Register event for this node
        eventMap[attr['data-drop-id']] = {
          onDropSuccess: scope.$eval(scope.onDropSuccess) || angular.noop,
          onDragOver: scope.$eval(scope.onDragOver) || angular.noop
        };
      }
    };

  })
  .directive('boDraggable', function ($document, boDragMap, boDragUtils){
    'use strict';

    var eventMap = {};

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragstart', function (e) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('Text', e.target.id + ':' +e.target.parentElement.hasAttribute('data-drop-id'));
      boDragMap.set(e.target.id, angular.element(e.target).isolateScope().data);
      eventMap[e.target.id].onDragStart.apply(this,[angular.element(e.target).isolateScope()]);
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
        eventMap[attr.id] = {
          onDragStart: scope.$eval(scope.onDragStart) || angular.noop
        };
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

        var el = element.find('[bo-draggable]').get(0);

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
