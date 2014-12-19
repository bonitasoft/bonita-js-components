(function() {
  'use strict';

  beforeEach(module('bonita.dragAndDrop'));

  describe('Directove: boDropzone', function() {

    var compile, scope, rootScope, $document, $window, boDragUtils;

    beforeEach(inject(function ($injector, $rootScope) {

      compile     = $injector.get('$compile');
      $document   = $injector.get('$document');
      $window     = $injector.get('$window');
      boDragUtils = $injector.get('boDragUtils');
      rootScope   = $rootScope;
      scope       = $rootScope.$new();

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

        dom = compile('<div bo-dropzone bo-drop-success="boDropSuccess($event, $data)" bo-drag-over="boDragOver($event)">bonjour</div>')(scope);
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
          expect(spyEvent.boDragOver).toHaveBeenCalledWith();
        });

        it('should have the className bo-dropzone-hover', function() {
          expect(angular.element('.bo-dropzone-hover')[0]).toBeDefined();
        });

        // Do not try to put it at another position. There is some WTF
        it('should be triggered on drop', function () {

          var newScope = rootScope.$new();
          newScope.data = {
            name: 'Yolo'
          };
          var domDrag = compile('<div id="test" bo-draggable bo-draggable-data="data"></div>')(newScope);
          $document.find('body').append(domDrag);
          rootScope.$apply();

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

        describe('We are not a child of a dropZone', function() {

          var current = 'drop' + Date.now();

          beforeEach(function() {

            spyOn(boDragUtils,'generateUniqId').and.returnValue(current);
            var newScope = rootScope.$new();
            newScope.data = {
              name: 'Yolo'
            };
            var domDrag = compile('<div id="test" bo-draggable bo-draggable-data="data"></div>')(newScope);
            $document.find('body').append(domDrag);
            rootScope.$apply();


            var e = angular.element.Event('drop');
            e.target = dom[0];
            e.dataTransfer = {
              getData: function() {
                return 'test:false';
              }
            };
            $document.triggerHandler(e);
          });

          it('should call onDropSuccess', function() {
            expect(spyEvent.boDropSuccess).toHaveBeenCalled();
          });

          it('should clone the node', function() {
            expect(boDragUtils.generateUniqId).toHaveBeenCalledWith();
          });

          it('should not have the className bo-dragzone-hover', function() {
            expect(dom.hasClass('bo-dragzone-hover')).toBe(false);
          });

        });

      });

      it('should create an data-drop-id', function() {
        expect(dom.attr('data-drop-id').length).toBeGreaterThan(0);
        expect(dom.attr('data-drop-id').indexOf('drop')).toBe(0);
      });

      it('should attach a className bo-dropzone-container', function() {
        expect(dom.hasClass('bo-dropzone-container')).toBeTruthy();
      });

      it('should not have the className bo-dragzone-hover', function() {
        expect(dom.hasClass('bo-dragzone-hover')).toBe(false);
      });

    });

  });


})();
