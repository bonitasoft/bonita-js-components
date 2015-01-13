(function() {
  'use strict';

  beforeEach(module('bonita.dragAndDrop', function ($provide) {
    // Mock EventMap
    $provide.decorator('boDragEvent', function ($delegate) {
      $delegate.map = {
        test: {
          scope: {data: {}},
          onDragStart: angular.noop
        },
        lol: {
          scope: {data: {}},
          onDragStart: angular.noop
        }
      };
      $delegate.copy = function(from, to) {
        this.map[to] = this.map[from];
      };
      return $delegate;
    });
  }));

  describe('Directive boDragPolyfill', function() {

    var compile, scope, rootScope, $document, $window, $timeout, dom, boDragEvent;

    beforeEach(inject(function ($injector, $rootScope) {

      compile     = $injector.get('$compile');
      $document   = $injector.get('$document');
      $timeout    = $injector.get('$timeout');
      $window     = $injector.get('$window');
      boDragEvent = $injector.get('boDragEvent');
      rootScope   = $rootScope;
      scope       = $rootScope.$new();

      /**
       * Mock scope to prevent the error with event listener:
       * TypeError: 'undefined' is not an object (evaluating 'current.$$listenerCount[name]')
       */
      ['test','lol'].forEach(function (item) {
        boDragEvent.map[item].scope = $rootScope.$new();
        boDragEvent.map[item].scope.data = {date: Date.now(), name: 'item-' + item};
      });

    }));

    beforeEach(function() {
      spyOn($window,'navigator');

      dom = compile('<aside class="container-siderbar" bo-drag-polyfill><div class="item-drag" bo-draggable id="lol">test</div></aside>')(scope);
      scope.$apply();
    });

    it('should not replace anything if it is not IE9', function() {
      expect(dom.find('.item-drag').get(0).nodeName).toBe('DIV');
    });

    describe('polyfill if we detect IE9', function() {

      beforeEach(function() {
        document.body.innerHTML = '';
        $window.navigator.userAgent = 'Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)';
        dom = compile('<aside class="container-siderbar" bo-drag-polyfill><div class="item-drag" bo-draggable id="test">test</div><div class="item-drag" data-bo-draggable id="lol"></aside>')(scope);
        angular.element(document.body).append(dom);
        scope.$apply();

      });

      it('should replace the div to a A if it is IE9', function() {
        $timeout.flush();
        expect(dom.find('.item-drag').get(0).nodeName).toBe('A');
        expect(dom.find('.item-drag[href="#"]').get(0)).toBeDefined();
      });

      it('should compile for both attr, valid HTML5 or Angular', function() {
        $timeout.flush();
        expect(dom.find('.item-drag').get(0).nodeName).toBe('A');
        expect(dom.find('.item-drag').get(1).nodeName).toBe('A');
        expect(dom.find('a').length).toBe(2);
      });
    });

  });

})();
