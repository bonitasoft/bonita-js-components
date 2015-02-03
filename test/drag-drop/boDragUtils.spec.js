(function() {
  'use strict';

  beforeEach(module('org.bonitasoft.dragAndDrop'));

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


})();
