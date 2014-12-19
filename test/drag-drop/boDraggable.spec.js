(function() {
  'use strict';

  beforeEach(module('bonita.dragAndDrop'));

  describe('Directive boDraggable', function() {

    var compile, scope, rootScope, $document, $window;
    var dom, spyEvent = {
      boDragStart: jasmine.any(Function),
    };

    beforeEach(inject(function ($injector, $rootScope) {

      compile   = $injector.get('$compile');
      $document = $injector.get('$document');
      $window   = $injector.get('$window');
      rootScope = $rootScope;
      scope     = $rootScope.$new();

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

    it('should bind a data key to the scope', function() {
      expect(dom.isolateScope().data.name).toBe('Jean pierre');
    });

    it('should bind a callback', function() {
      dom.isolateScope().onDragStart();
      expect(spyEvent.boDragStart).toHaveBeenCalled();
    });

    describe('listening the event dragstart', function() {

      var e;

      beforeEach(function() {
        e = angular.element.Event('dragstart');
        e.target = dom[0];
        e.dataTransfer = {
          setData: angular.noop
        };
        spyOn(e.dataTransfer,'setData');
        $document.triggerHandler(e);
      });

      it('should trigger the callback onDragStart', function() {
        expect(spyEvent.boDragStart).toHaveBeenCalled();
      });

      it('should record some informations inside dataTransfer as a String', function() {
        expect(e.dataTransfer.setData).toHaveBeenCalledWith('Text',dom[0].id + ':false');
      });

      it('should set the dataTransfer effectAllowed to copy', function() {
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
      expect(e.dataTransfer.setData).toHaveBeenCalledWith('Text',e.target.id + ':true');
    });


  });


})();
