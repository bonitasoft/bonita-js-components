(function() {
  'use strict';

  describe('Provider boDraggableItem', function() {

    var service;

    describe('Default setup', function() {

      beforeEach(module('bonita.dragAndDrop'));

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

    });


    describe('Disable clone node setup', function() {

      beforeEach(module('bonita.dragAndDrop', function (boDraggableItemProvider) {
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

  });

})();
