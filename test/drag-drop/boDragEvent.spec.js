describe('Factory boDragEvent', function() {

  'use strict';

  var factory;

  beforeEach(module('bonita.dragAndDrop'));

  describe('There is an eventMap', function() {

    beforeEach(inject(function ($injector) {
      factory = $injector.get('boDragEvent');
      factory.map = {};
    }));

    it('should have an empty object on init', function() {
      expect(Object.keys(factory.map).length).toBe(0);
    });

    it('should record many object', function() {

      var i = 50;
      while(--i >= 0) {
        factory.map['item-' + i] = Date.now();
      }

      expect(Object.keys(factory.map).length).toBe(50);
    });

    describe('You can copy an item from the map', function() {

      it('should copy an item', function() {
        factory.map.item = 'test';
        factory.copy('item','yolo');
        expect(Object.keys(factory.map).length).toBe(2);
      });

    });

    describe('It lists each className per events', function() {

      it('should list keys as UPPERCASE', function() {

        var test = Object.keys(factory.events).filter(function (item) {
          return item !== String.prototype.toUpperCase.call(item);
        });
        expect(test.length).toBe(0);
      });

    });

  });

});
