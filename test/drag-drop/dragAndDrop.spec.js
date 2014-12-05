(function() {
  'use strict';

  beforeEach(module('bonita.dragAndDrop'));

  describe('Service boDragMap', function() {
    var map;

    beforeEach(inject(function ($injector) {
      map = $injector.get('boDragMap');
    }));

    describe('Store some data and read them', function() {

      var data = {
        'test1': {name: 'toto'},
        'test2': ['test'],
        'test3': void 0,
        'test4': null,
        'test5': 'string',
        'test6': 42,
        'test7': jasmine.any(Function),
        'test8': true
      };

      it('should throw an error if you pass an id !string', function() {
        var errorMsg = 'The map key must be a string';
        expect(function() {map.set({});}).toThrowError(errorMsg);
        expect(function() {map.set();}).toThrowError(errorMsg);
        expect(function() {map.set(null);}).toThrowError(errorMsg);
        expect(function() {map.set(1);}).toThrowError(errorMsg);
      });

      it('should record some data without any error', function() {

        var key;
        for(key in data) {
          map.set(key,data[key]);
        }

        expect(map.get('test1').name).toBe(data.test1.name);
        expect(map.get('test2').length).toBe(data.test2.length);
        expect(Array.isArray(map.get('test2'))).toBeTruthy();
        expect(map.get('test3')).toBeUndefined();
        expect(map.get('test4')).toBeNull();
        expect(typeof map.get('test5')).toBe('string');
        expect(map.get('test6')).toBe(data.test6);
        expect(map.get('test7')).toBe(data.test7);
        expect(map.get('test8')).toBe(true);

      });

    });


    describe('we can update a key', function() {

      it('should update a key', function() {
        map.set('test', 'bonjour');
        map.updateKey('test','updateKey');
        expect(map.get('updateKey')).toBe('bonjour');
        expect(map.get('test')).toBeUndefined();
      });

    });

    describe('we can reset the map', function() {

      it('should reset the map', function() {
        map.set('test', 'bonjour');
        expect(map.get('test')).toBe('bonjour');
        map.reset();
        expect(map.get('test')).toBeUndefined();
      });

    });

  });

  describe('Service boDragUtils', function() {

    var utils;
    beforeEach(inject(function ($injector) {
      utils = $injector.get('boDragUtils');
    }));

    describe('generate a uniq id', function() {

      it('should generate a uuid starting with drag-', function() {
        expect(utils.generateUniqId().indexOf('drag-')).toBe(0);
      });

      it('should be some random caracters', function() {
        var i = 1000;
        while(--i>0) {
          expect(utils.generateUniqId()).not.toBe(utils.generateUniqId());
        }
      });

      it('should be able to change the drag- to something else', function() {
        expect(utils.generateUniqId('test').indexOf('test')).toBe(0);
        expect(utils.generateUniqId('robert').indexOf('robert')).toBe(0);
        expect(utils.generateUniqId('true').indexOf('drag-')).toBe(-1);
      });

      it('should add drag- if the key is empty', function() {
        expect(utils.generateUniqId('').indexOf('drag-')).toBe(0);
        expect(utils.generateUniqId(null).indexOf('drag-')).toBe(0);
      });

    });

  });


  describe('Directove: boDropzone', function() {

    var compile, scope, rootScope, $document, $window;

    beforeEach(inject(function ($injector, $rootScope) {

      compile   = $injector.get('$compile');
      $document = $injector.get('$document');
      $window   = $injector.get('$window');
      rootScope = $rootScope;
      scope     = $rootScope.$new();

    }));

    describe('Work as an attribute', function() {

      var dom, spyEvent = {
        boDropSuccess: jasmine.any(Function),
        boDragOver: jasmine.any(Function)
      };

      beforeEach(function() {

        scope = rootScope.$new();
        scope.boDropSuccess = function() {
          spyEvent.boDropSuccess();
        };
        scope.boDragOver    = function() {
          spyEvent.boDragOver();
        };

        spyOn(spyEvent,'boDropSuccess');
        spyOn(spyEvent,'boDragOver');

        dom = compile('<div bo-dropzone bo-drop-success="boDropSuccess" bo-drag-over="boDragOver">bonjour</div>')(scope);
        $document.find('body').append(dom);
        scope.$digest();
      });

      afterEach(function() {
        $document.off('drop');
        $document.off('dragover');
      });

      describe('you can attach some callback', function() {

        // Do not try to put it at another position. There is some WTF
        it('should be triggered on dragover', function () {
          var e = angular.element.Event('dragover');
          e.target = dom[0];
          e.dataTransfer = {};
          $document.triggerHandler(e);
          expect(spyEvent.boDragOver).toHaveBeenCalled();
        });


        // Do not try to put it at another position. There is some WTF
        it('should be triggered on drop', function () {

          $document.find('body').append('<div id="test"></div>');
          var e = angular.element.Event('drop');
          e.target = dom[0];
          e.dataTransfer = {
            getData: function() {
              return 'test';
            }
          };
          $document.triggerHandler(e);
          expect(spyEvent.boDropSuccess).toHaveBeenCalled();
        });

        it('should trigger a drop success', function() {
          scope.$eval(dom.isolateScope().onDropSuccess)();
          expect(spyEvent.boDropSuccess).toHaveBeenCalled();
        });

        it('should trigger a dragover success', function() {
          scope.$eval(dom.isolateScope().onDragOver)();
          expect(spyEvent.boDragOver).toHaveBeenCalled();
        });

      });

      it('should create an data-drop-id', function() {
        expect(dom.attr('data-drop-id').length).toBeGreaterThan(0);
        expect(dom.attr('data-drop-id').indexOf('drop')).toBe(0);
      });

      it('should attach a className bo-dropzone-container', function() {
        expect(dom.hasClass('bo-dropzone-container')).toBeTruthy();
      });

    });


    describe('Directive boDragPolyfill', function() {

      var dom;

      beforeEach(function() {
        spyOn($window,'navigator');

        dom = compile('<aside class="container-siderbar" bo-drag-polyfill><div class="item-drag" bo-draggable>test</div></aside>')(scope);
        scope.$apply();
      });

      it('should not replace anything if it is not IE9', function() {
        expect(dom.find('.item-drag').get(0).nodeName).toBe('DIV');
      });

      it('should replace the div to a A if it is IE9', function() {
        $window.navigator.userAgent = 'Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)';
        dom = compile('<aside class="container-siderbar" bo-drag-polyfill><div class="item-drag" bo-draggable>test</div></aside>')(scope);
        scope.$apply();

        expect(dom.find('.item-drag').get(0).nodeName).toBe('A');
        expect(dom.find('.item-drag[href="#"]').get(0)).toBeDefined();
      });

    });


    describe('Directive boDraggable', function() {

      var dom, boDragMap, spyEvent = {
        boDragStart: jasmine.any(Function),
      };

      beforeEach(inject(function ($injector) {
        boDragMap = $injector.get('boDragMap');
      }));

      beforeEach(function() {

        scope = rootScope.$new();
        scope.informations = {
          name: 'Jean pierre',
          date: '11/11/2011'
        };

        spyOn(boDragMap,'set');

        scope.boDragStart = function() {
          spyEvent.boDragStart();
        };

        spyOn(spyEvent,'boDragStart');

        dom = compile('<div class="item-drag" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart">test</div>')(scope);
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
        dom = compile('<div class="item-drag" id="yolo" bo-draggable bo-draggable-data="informations" bo-drag-start="boDragStart">test</div>')(scope);
        scope.$apply();
        $document.find('body').append(dom);
        expect(dom.attr('id')).toBe('yolo');
      });

      it('should bind a data key to the scope', function() {
        expect(dom.isolateScope().data.name).toBe('Jean pierre');
      });

      it('should bind a callback', function() {
        scope.$eval(dom.isolateScope().onDragStart)();
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

        it('should listen the dragstart event and set data to boDragMap', function() {
          expect(boDragMap.set).toHaveBeenCalledWith(dom[0].id, scope.informations);
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


  });

})();
