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
    describe('getDragInitiator', function() {
      var doc;
      beforeEach(inject(function ($document) {
        $document.find("body").append('<p>not draggable</p><div class="container" draggable="true"><div draggable="true"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" /></div></div>');
        doc =  $document[0];
      }));

      it('should return null if element is not draggable and has no draggable parent', function(){
        var node = doc.querySelector('p');
        expect(utils.getDragInitiatorNode(node)).toBe(null);
      });

      it('should return the node if has a draggable=true parameter', function(){
        var node = doc.querySelector('div[draggable]');
        expect(utils.getDragInitiatorNode(node)).toBe(node)
      });

      it('should return the parent node if has a draggable=true parameter', function(){
        var node = doc.querySelector('div[draggable]');
        var targetNode = doc.querySelector('div[draggable] img');
        expect(utils.getDragInitiatorNode(node)).toBe(node)
        expect(utils.getDragInitiatorNode(node)).toBe(node)
      });
    });

  });


})();
