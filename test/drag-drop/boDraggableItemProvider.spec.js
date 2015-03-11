(function() {
  'use strict';

  describe('Provider boDraggableItem', function() {

    var service;

    describe('Default setup', function() {

      beforeEach(module('org.bonitasoft.dragAndDrop'));

      beforeEach(inject(function ($injector) {
        service = $injector.get('boDraggableItem');
      }));

      it('should return a config object', function() {

        var isObject = angular.isObject(service.config()),
            isNotArray = !Array.isArray(service.config());
        expect(isObject && isNotArray).toBe(true);
      });

      it('should enable the copy of a node on drop', function() {
        expect(service.allowCloneOnDrop()).toBe(true);
      });
      it('should enable disable the bodyClass action', function() {
        expect(service.setBodyClass()).toBe(false);
      });

    });


    describe('Disable clone node setup', function() {

      beforeEach(module('org.bonitasoft.dragAndDrop', function (boDraggableItemProvider) {
        expect(boDraggableItemProvider.cloneOnDrop).toBeDefined();
        boDraggableItemProvider.cloneOnDrop(false);
      }));

      beforeEach(inject(function ($injector) {
        service = $injector.get('boDraggableItem');
      }));

      it('should disable the copy of a node on drop', function() {
        expect(service.allowCloneOnDrop()).toBe(false);
      });

    });


    describe('Disable the body Class Action on setup', function() {

      beforeEach(module('org.bonitasoft.dragAndDrop', function (boDraggableItemProvider) {
        expect(boDraggableItemProvider.activeBodyClassName).toBeDefined();
        boDraggableItemProvider.activeBodyClassName(true);
      }));

      beforeEach(inject(function ($injector) {
        service = $injector.get('boDraggableItem');
      }));

      it('should not add active the bodyClass', function() {
        expect(service.setBodyClass()).toBe(true);
      });

    });

  });

})();
