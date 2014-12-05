(function() {
  'use strict';

  beforeEach(module('bonita.dragAndDrop'));

  describe('Directive boDragPolyfill', function() {

    var compile, scope, rootScope, $document, $window;
    var dom, boDragMap;

    beforeEach(inject(function ($injector, $rootScope) {

      compile   = $injector.get('$compile');
      $document = $injector.get('$document');
      $window   = $injector.get('$window');
      rootScope = $rootScope;
      boDragMap = $injector.get('boDragMap');
      scope     = $rootScope.$new();

    }));

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

})();
