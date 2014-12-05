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


})();
