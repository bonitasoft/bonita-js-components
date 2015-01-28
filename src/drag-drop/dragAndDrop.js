angular.module('bonita.dragAndDrop',[])
  .provider('boDraggableItem', function() {

    'use strict';

    var defaultConfig = {
      cloneOnDrop: true,
      bodyClass: false
    };

    /**
     * Allow the creation of a new node when we drag the item
     * Default is true;
     * @param  {Boolean} allowClone
     * @return {void}
     */
    this.cloneOnDrop = function cloneOnDrop(allowClone) {
      defaultConfig.cloneOnDrop = allowClone;
    };

    this.activeBodyClassName = function activeBodyClassName(activeClassName) {
      defaultConfig.bodyClass = activeClassName;
    };

    this.$get = function() {
      return {
        config: function config() {
          return angular.copy(defaultConfig);
        },
        allowCloneOnDrop: function allowCloneOnDrop() {
          return this.config().cloneOnDrop || false;
        },
        setBodyClass: function setBodyClass() {
          return !!this.config().bodyClass;
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

    /**
     * Use an API from Microsoft
     * Thanks to {@link http://stackoverflow.com/questions/5500615/internet-explorer-9-drag-and-drop-dnd}
     * @param {NodeList}
     */
    this.polyfillIE = function polyfillIE(list) {
      Array.prototype.forEach.call(list, function (el) {
        angular.element(el).on('selectstart', function(){
          this.dragDrop();
          return false;
        });
      });
    };

  })
  .directive('boDropzone', function ($document, $parse, $compile, boDragUtils, boDragEvent, boDraggableItem){

    'use strict';

    // Register some callback for the directive
    var eventMap = {},
        DROPZONE_CLASSNAME_HOVER = boDragEvent.events.DROPZONE_CLASSNAME_HOVER,
        DRAGITEM_OWN_DROPZONE    = boDragEvent.events.DRAGITEM_OWN_DROPZONE,
        CLASSNAME_DRAG_HOVER     = boDragEvent.events.CLASSNAME_DRAG_HOVER;

    $document.on('dragenter', function (e) {

      if(e.target.hasAttribute('data-drop-id')) {

        var dropZoneInsideAnotherDragItemBetweenDragItem = !!angular
              .element('#' + boDragEvent.currentDragItemId)
              .find('[draggable] [data-drop-id='+e.target.dataset.dropId+']')[0];

        var dropZoneInsideDragItem = !!angular
              .element('#' + boDragEvent.currentDragItemId)
              .find('[data-drop-id='+e.target.dataset.dropId+']')[0];


        angular
          .element(document.querySelectorAll('.' + DRAGITEM_OWN_DROPZONE))
          .removeClass(DRAGITEM_OWN_DROPZONE);

        // Check if the dropZone is not inside the current dragged item
        if(dropZoneInsideAnotherDragItemBetweenDragItem || dropZoneInsideDragItem) {
          e.target.className += ' ' + DRAGITEM_OWN_DROPZONE;
        }

        // Remove all other dropZone with the className
        angular
          .element(document.querySelectorAll('.' +  DROPZONE_CLASSNAME_HOVER))
          .removeClass(DROPZONE_CLASSNAME_HOVER);

        e.target.className += ' ' + DROPZONE_CLASSNAME_HOVER;
      }
    });


    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        eventMap[dragElmId].onDragOver(eventMap[dragElmId].scope, {$event: e});
        (e.dataTransfer || e.originalEvent.dataTransfer).dropEffect = 'copy';

        return false;
      }
    });

    // Add a delegate for event detection. One event to rule them all
    $document.on('drop', function (e) {
      e.preventDefault(); // allows us to drop

      // Remove ClassName to the body when a drag action is running
      if(boDraggableItem.setBodyClass()) {
        angular.element(document.body).removeClass('bo-drag-action');
      }

      // Drop only in dropZone container
      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        /**
         * Defines in the directive boDraggable inside the listener of dragStart
         * Format: JSON string
         *   - dragItemId: draggable item id
         *   - isDropZoneChild: Boolean
         */
        var eventData = JSON.parse((e.dataTransfer || e.originalEvent.dataTransfer).getData('Text'));

        // Grab the drag element
        var el              = document.getElementById(eventData.dragItemId),
            targetScope     = eventMap[dragElmId].scope,
            currentDragItem = boDragEvent.map[eventData.dragItemId],
            scopeData       = currentDragItem.data;

        // Was it a child of a dropzone ? If not then create a copy
        if(eventData.isDropZoneChild) {
          e.target.appendChild(el);
        }else {
          var surrogate = el.cloneNode(true);
          surrogate.id = boDragUtils.generateUniqId();

          // Update the event map reference
          boDragEvent.copy(eventData.dragItemId, surrogate.id);

          try {
            surrogate.attributes.removeNamedItem('ng-repeat');
          }catch (e) {
            // You're trying to delete an ghost attribute. DOMException: Failed to execute 'removeNamedItem'
          }

          // Default is true so we clone the node
          if(boDraggableItem.allowCloneOnDrop()) {
            e.target.appendChild(surrogate);
          }

          // Compile a new isolate scope for the drag element
          $compile(angular.element(surrogate))(boDragEvent.map[surrogate.id].scope);
        }

        targetScope.$apply(function() {
          angular
            .element(document.getElementsByClassName(DROPZONE_CLASSNAME_HOVER))
            .removeClass(DROPZONE_CLASSNAME_HOVER);

          angular
            .element(document.getElementsByClassName(CLASSNAME_DRAG_HOVER))
            .removeClass(CLASSNAME_DRAG_HOVER);

          // Hooks
          currentDragItem.onDropItem(targetScope,{$data: scopeData, $event: e});
          eventMap[dragElmId].onDropSuccess(targetScope, {$data: scopeData, $event: e});
        });

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
          onDropSuccess: $parse(attr.boDropSuccess),
          onDragOver: $parse(attr.boDragOver)
        };
      }
    };

  })
  .factory('boDragEvent',function() {

    'use strict';

    var eventMap = {};
    return {
      // Store each cb reference for a any draggable element
      map: eventMap,
      events: {
        DROPZONE_CLASSNAME_HOVER: 'bo-dropzone-hover',
        DRAGITEM_OWN_DROPZONE: 'bo-drag-dropzone-child',
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
  .directive('boDraggable', function ($document, $parse, boDragEvent, boDragUtils, boDraggableItem){
    'use strict';

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragstart', function (e) {

      var target     = e.target,
          eventData  = (e.dataTransfer || e.originalEvent.dataTransfer);

      // Add a ClassName to the body when a drag action is running
      if(boDraggableItem.setBodyClass()) {
        angular.element(document.body).addClass('bo-drag-action');
      }

      eventData.effectAllowed = 'copy';
      eventData.setData('Text', JSON.stringify({
        dragItemId      : target.id,
        isDropZoneChild : target.parentElement.hasAttribute('data-drop-id')
      }));

      // Cache for the current id as the event seems to not be fast enougth
      boDragEvent.currentDragItemId = target.id;

      // Trigger the event if we need to
      if (boDragEvent.map[target.id]){
        boDragEvent.map[target.id].onDragStart(boDragEvent.map[target.id].scope);
      }
    });

    $document.on('dragenter', function(e) {

      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        return;
      }

      // Remove the className for previous hovered items
      angular
        .element(document.getElementsByClassName(boDragEvent.events.CLASSNAME_DRAG_HOVER))
        .removeClass(boDragEvent.events.CLASSNAME_DRAG_HOVER);
      e.target.className += ' ' + boDragEvent.events.CLASSNAME_DRAG_HOVER;

    });

    $document.on('dragleave', function(e) {
      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        e.target.className = e.target.className.replace(' '+boDragEvent.events.CLASSNAME_DRAG_HOVER,'');
      }
    });

    return {
      link: function(scope, el, attr) {

        attr.$set('draggable',true);
        attr.$set('id',attr.id || boDragUtils.generateUniqId());

        // Register event for the current node and its scope
        boDragEvent.map[attr.id] = {
          key         : attr.boDraggableData, // Ref key to the scope custom data
          scope       : scope,
          onDragStart : $parse(attr.boDragStart),
          onDropItem  : $parse(attr.boDropItem)
        };

        // Some key in the scope are async (if it comes from directive)
        scope.$evalAsync(function (currentScope) {
          boDragEvent.map[attr.id].data = currentScope[attr.boDraggableData];
        });
      }
    };
  })
  .directive('boDragPolyfill', function ($window, $document, $timeout, boDragUtils) {

    /**
     * Before angular bind the scope to the dom, we update the dom for IE
     * We find the declaration of boDraggable and change the dom to a <a href> since the div is buggy with IE9.
     *
     * Why do not use compile on boDraggable ?
     * Because angular create a fragment, and a fragment does not have any parents, so we cannot replace the old node by a polyfill.
     */
    'use strict';

    // After a drop action, we reload the polyfill for new item
    if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {
      $document.on('drop', function (e) {
        e.preventDefault(); // allows us to drop
        $timeout(function() {
          boDragUtils.polyfillIE(document.querySelectorAll('[bo-draggable], [data-bo-draggable]'));
        },100);
      });
    }

    return {
      type: 'EA',
      link: function link() {

        if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {

          // run the polyfill after the digest, because some directive can be bind, so compile cannot see them
          $timeout(function() {
            boDragUtils.polyfillIE(document.querySelectorAll('[bo-draggable], [data-bo-draggable]'));
          },100);

        }
      }
    };

  });
