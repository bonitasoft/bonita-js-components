(function() {
  'use strict';

    beforeEach(module('org.bonitasoft.dragAndDrop', function ($provide) {
    // Mock EventMap
    // $provide.decorator('boDragEvent', function ($delegate) {
    //   $delegate.map = {
    //     yolo: {
    //       scope: {data: {}},
    //       onDragStart: angular.noop
    //     },
    //     yolo2: {
    //       scope: {data: {}},
    //       onDragStart: angular.noop
    //     }
    //   };
    //   return $delegate;
    // });
  }));

  describe('Directive boDraggable', function() {

    var compile, scope, rootScope, $document, $window, boDragEvent, boDraggableItem;
    var dom, spyEvent = {
      boDragStart: jasmine.any(Function),
    };

    beforeEach(inject(function ($injector, $rootScope) {

      compile         = $injector.get('$compile');
      $document       = $injector.get('$document');
      $window         = $injector.get('$window');
      boDraggableItem = $injector.get('boDraggableItem');
      boDragEvent     = $injector.get('boDragEvent');
      rootScope       = $rootScope;
      scope           = $rootScope.$new();

    }));


    beforeEach(function() {

      scope = rootScope.$new();
      scope.informations = {
        name: 'Jean pierre',
        date: '11/11/2011'
      };

      scope.boDragStart = function() {
        spyEvent.boDragStart();
      };

      spyOn(spyEvent,'boDragStart');
      spyOn(boDraggableItem, 'setBodyClass');

      dom = compile('<div class="item-drag" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart()">test</div>')(scope);
      scope.$apply();
      $document.find('body').append(dom);
    });

    afterEach(function() {
      $document.off('dragstart');
    });

    it('should add HTML5 draggable attribute', function() {
      expect(dom.attr('draggable')).toBe('true');
    });

    it('should generate a uuid if no id was specified', function() {
      expect(dom.attr('id')).toBeDefined();
    });

    it('should use the id if it was specified', function() {
      dom = compile('<div class="item-drag" id="yolo" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart()">test</div>')(scope);
      scope.$apply();
      $document.find('body').append(dom);
      expect(dom.attr('id')).toBe('yolo');
    });

    describe('listening the event dragstart', function() {

      var e;

      function triggerEvent() {
        e = angular.element.Event('dragstart');
        e.target = dom[0];
        e.dataTransfer = {
          setData: angular.noop
        };
        spyOn(e.dataTransfer,'setData');
        $document.triggerHandler(e);
      }

      it('should call boDraggableItem.setBodyClass', function() {
        triggerEvent();
        expect(boDraggableItem.setBodyClass).toHaveBeenCalled();
      });

      it('should not add a class aaction to the body if the provider is not configured', function() {
        triggerEvent();
        expect(document.body.classList.contains('bo-drag-action')).toBe(false);
      });

      it('should add an action class if the provider is configured', function() {
        boDraggableItem.setBodyClass = function() {
          return true;
        };
        expect(document.body.classList.contains('bo-drag-action')).toBe(false);
        triggerEvent();
        expect(document.body.classList.contains('bo-drag-action')).toBe(true);
      });

      it('should trigger the callback onDragStart', function() {
        triggerEvent();
        expect(spyEvent.boDragStart).toHaveBeenCalled();
      });

      it('should record some informations inside dataTransfer as a String', function() {
        triggerEvent();
        var dataEvent = {
          dragItemId: dom[0].id,
          isDropZoneChild: false
        };
        expect(e.dataTransfer.setData).toHaveBeenCalledWith('Text',JSON.stringify(dataEvent));
      });

      it('should set the dataTransfer effectAllowed to copy', function() {
        triggerEvent();
        expect(e.dataTransfer.effectAllowed).toBe('copy');
      });

    });

    it('should set the informations with true if it is a child of dropZone', function() {
      dom = compile('<div data-drop-id="test"><div class="item-drag" id="yolo" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart">test</div></div>')(scope);
      scope.$apply();
      $document.find('body').append(dom);
      var e = angular.element.Event('dragstart');
      e.target = dom.find('.item-drag').get(0);
      e.dataTransfer = {
        setData: angular.noop
      };
      spyOn(e.dataTransfer,'setData');
      $document.triggerHandler(e);

      var dataEvent = {
        dragItemId: e.target.id,
        isDropZoneChild: true
      };

      expect(e.dataTransfer.setData).toHaveBeenCalledWith('Text',JSON.stringify(dataEvent));
    });


    it('should set the informations with true if it is a child of dropZone for OriginalEvent', function() {
      dom = compile('<div data-drop-id="test"><div class="item-drag" id="yolo" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart">test</div></div>')(scope);
      scope.$apply();
      $document.find('body').append(dom);
      var e = angular.element.Event('dragstart');
      e.target = dom.find('.item-drag').get(0);
      e.originalEvent = {};
      e.originalEvent.dataTransfer = {
        setData: angular.noop
      };
      spyOn(e.originalEvent.dataTransfer,'setData');
      $document.triggerHandler(e);

      var dataEvent = {
        dragItemId: e.target.id,
        isDropZoneChild: true
      };

      expect(e.originalEvent.dataTransfer.setData).toHaveBeenCalledWith('Text',JSON.stringify(dataEvent));
    });

    describe('Listening on event dragenter', function() {

      var e;

      beforeEach(function() {
        e = angular.element.Event('dragenter');
        e.target = dom[0];
        $document.triggerHandler(e);
      });

      it('should add a clasName bo-drag-enter', function() {
        expect(dom[0].classList.contains('bo-drag-enter')).toBe(true);
      });

    });

    describe('Listening on event dragleave', function() {

      var e;

      beforeEach(function() {
        dom[0].classList.add('bo-drag-enter');
        e = angular.element.Event('dragleave');
        e.target = dom[0];
        $document.triggerHandler(e);
      });

      it('should remove a clasName bo-drag-enter', function() {
        expect(dom[0].classList.contains('bo-drag-enter')).toBe(false);
      });

    });


    describe('Fill an eventMap', function() {

      beforeEach(function() {
        boDragEvent.map = {};
        scope.yolo1 = {name: 'yolo-1'};
        scope.yolo2 = {name: 'yolo-2'};
        dom = compile('<div class="item-drag" id="yolo" bo-draggable bo-draggable-data="yolo1" bo-drag-start="boDragStart()">test</div><div class="item-drag" id="yolo2" bo-draggable bo-draggable-data="yolo2">test</div>')(scope);
        scope.$apply();
        $document.find('body').append(dom);
      });

      it('should record some item in the map', function() {
        expect(Object.keys(boDragEvent.map).length).toBe(2);
      });

      it('should record the current scope for each item', function() {
        expect(boDragEvent.map.yolo.data).toBe(scope.yolo1);
        expect(boDragEvent.map.yolo2.data).toBe(scope.yolo2);
      });

      it('should store a reference to onDragStart', function() {
        expect(typeof boDragEvent.map.yolo.onDragStart).toBe('function');
        expect(typeof boDragEvent.map.yolo2.onDragStart).toBe('function');
      });

    });


  });



})();
