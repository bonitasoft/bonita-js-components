(function() {
  'use strict';

  var triggerEvent;

  beforeEach(module('bonita.dragAndDrop'));

  describe('Directove: boDropzone', function() {

    var compile, scope, rootScope, $document, $window, boDragUtils, boDragEvent;

    beforeEach(inject(function ($injector, $rootScope) {

      compile         = $injector.get('$compile');
      $document       = $injector.get('$document');
      $window         = $injector.get('$window');
      boDragUtils     = $injector.get('boDragUtils');
      boDragEvent     = $injector.get('boDragEvent');
      rootScope       = $rootScope;
      scope           = $rootScope.$new();

    }));



    describe('Work as an attribute', function() {

      var dom, dom2, dom3, dom4, spyEvent = {
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
        dom4 = compile('<div id="robert"></div>')(scope);


        $document.find('body').append(dom);
        scope.$digest();

        if(!triggerEvent) {
          triggerEvent =  function triggerEvent(event, target, dataTransfer) {
            var e = angular.element.Event(event);
            e.target = target;
            e.dataTransfer = dataTransfer || {};
            $document.triggerHandler(e);
          };
        }
      });

      afterEach(function() {
        $document.off('drop');
        $document.off('dragover');
        $document.off('dragenter');
      });

      describe('attach some classNames to the dropZone', function() {

        beforeEach(function() {
          dom2 = compile('<div id="toto1" draggable><div bo-dropzone bo-drop-success="boDropSuccess($event, $data)" data-drop-id="drop56uzxueg66r" bo-drag-over="boDragOver($event)">bonjour</div></div>')(scope);
          dom3 = compile('<div id="master" ><div id="toto" draggable><div bo-dropzone bo-drop-success="boDropSuccess($event, $data)" bo-drag-over="boDragOver($event)">bonjour</div></div> </div>')(scope);
          scope.$digest();
        });

        it('should do nothing if it is not on a dropZone', function() {
          $document.find('body').append(dom4);
          triggerEvent('dragenter', dom4[0]);
          expect(dom4[0].classList.contains('bo-dropzone-hover')).toBe(false);
        });

        it('should add bo-dropzone-hover', function() {
          triggerEvent('dragenter', dom[0]);
          expect(dom[0].classList.contains('bo-dropzone-hover')).toBe(true);
        });

        it('should add bo-drag-dropzone-child if the dropZone is inside the draggable item', function() {
          $document.find('body').append(dom2);
          boDragEvent.currentDragItemId = 'toto1';
          triggerEvent('dragenter', dom2.find('[bo-dropzone]').get(0));
          expect(dom2.find('[bo-dropzone]').get(0).classList.contains('bo-drag-dropzone-child')).toBe(true);
        });

        it('should add bo-drag-dropzone-child if the dropZone is inside the draggable item and has another draggable item between', function() {
          $document.find('body').append(dom3);
          boDragEvent.currentDragItemId = 'master';
          triggerEvent('dragenter', dom3.find('[bo-dropzone]').get(0));
          expect(dom3.find('[bo-dropzone]').get(0).classList.contains('bo-drag-dropzone-child')).toBe(true);
        });

      });

      describe('you can attach some callback', function() {

        it('should do nothing if it is not on a dropZone', function() {
          $document.find('body').append(dom4);
          triggerEvent('dragover', dom4[0]);
          expect(dom4[0].classList.contains('bo-dropzone-hover')).toBe(false);
        });

        // Do not try to put it at another position. There is some WTF
        it('should be triggered on dragover', function () {
          triggerEvent('dragover', dom[0]);
          expect(spyEvent.boDragOver).toHaveBeenCalledWith();
        });


        it('should be triggered on dragover for originalEvent', function () {
          triggerEvent('dragover', dom[0], {dataTransfer: {}});
          expect(spyEvent.boDragOver).toHaveBeenCalledWith();
        });

        it('should do nothing if it is not on a dropZone', function() {
          $document.find('body').append(dom4);
          triggerEvent('drop', dom4[0]);
          expect(dom4[0].classList.contains('bo-dropzone-hover')).toBe(false);
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

          triggerEvent('drop', dom[0],  {
            getData: function() {
              return JSON.stringify({
                dragItemId: 'test',
                isDropZoneChild: true
              });
            }
          });

          expect(spyEvent.boDropSuccess).toHaveBeenCalled();
        });

        // Do not try to put it at another position. There is some WTF
        it('should be triggered on drop for originalEvent', function () {

          var newScope = rootScope.$new();
          newScope.data = {
            name: 'Yolo'
          };
          var domDrag = compile('<div id="test" bo-draggable bo-draggable-data="data"></div>')(newScope);
          $document.find('body').append(domDrag);
          rootScope.$apply();

          triggerEvent('drop', dom[0], {
            getData: function() {
              return JSON.stringify({
                dragItemId: 'test',
                isDropZoneChild: true
              });
            }
          });
          expect(spyEvent.boDropSuccess).toHaveBeenCalled();
        });

        describe('We are not a child of a dropZone', function() {

          var current = 'drop' + Date.now();

          beforeEach(function() {

            spyOn(boDragUtils,'generateUniqId').and.returnValue(current);

            var newScope = rootScope.$new();

            boDragEvent.map[current] = {
              scope: newScope
            };

            var domDrag = compile('<div id="test" bo-draggable bo-draggable-data="data"></div>')(newScope);
            $document.find('body').append(domDrag);
            rootScope.$apply();

            dom[0].classList.add('bo-drag-enter');

            triggerEvent('drop', dom[0], {
              getData: function() {
                return JSON.stringify({
                  dragItemId: 'test',
                  isDropZoneChild: false
                });
              }
            });
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

      it('should remove a clasName bo-drag-enter', function() {
        expect(dom[0].classList.contains('bo-drag-enter')).toBe(false);
      });

    });


  });


})();
