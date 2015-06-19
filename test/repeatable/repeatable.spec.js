describe('repeatable', function(){

  beforeEach(module('org.bonitasoft.bonitable'));
  beforeEach(module('org.bonitasoft.bonitable.repeatable'));
  beforeEach(module('org.bonitasoft.templates'));

  beforeEach(inject(function($httpBackend){
    $httpBackend.whenGET(/^template/).respond('');
  }));

  describe('repeatable directive', function(){
    var element;
    var innerScope;
    var scope;

    beforeEach(inject(function($rootScope, $compile, $document) {
      scope = $rootScope.$new();

      var markup =
          '<div>'+
          '<table bonitable bo-repeatable="thead tr:first-child">'+
          '  <thead>'+
          '    <tr>'+
          '       <th data-ignore>first</th>'+
          '       <th>id</th>'+
          '       <th visible="false">name</th>'+
          '       <th visible="">content</th>'+
          '       <th remove-column="true">key</th>'+
          '       <th data-ignore remove-column="false">last</th>'+
          '    </tr>'+
          '    <tr>'+
          '      <th colspan="4">another heading</th>'+
          '    </tr>'+
          '  </thead>'+
          '  <tbody>'+
          '    <tr ng-repeat="tag in tags">'+
          '       <td>toto</td>'+
          '       <td title="{{tag.id}}">{{tag.id}}</td>'+
          '       <td>{{tag.name}}</td>'+
          '       <td>{{tag.content}}</td>'+
          '       <td>{{tag.key}}</td>'+
          '       <td>test</td>'+
          '    </tr>'+
          '  </tbody>'+
          '</table>'+
          '</div>';

      scope.tags = [{id:1, name:'blue', content: 'blue'},{id:3, name:'red', content: 'red'}, {id:2, name:'green', content: 'green'}];
      element = $compile(markup)(scope);
      innerScope = element.find('table').scope();
      $document.find('body').append(element);
      scope.$digest();
    }));

    it('should throw an error if th don\'t match td number', inject(function($compile){
       var markup =
          '<div>'+
          '<table bonitable bo-repeatable>'+
          '  <thead>'+
          '    <tr>'+
          '       <th>id</th>'+
          '    </tr>'+
          '  </thead>'+
          '  <tbody>'+
          '    <tr ng-repeat="tag in tags">'+
          '       <td>{{tag.id}}</td>'+
          '       <td>{{tag.name}}</td>'+
          '    </tr>'+
          '  </tbody>'+
          '</table>'+
          '</div>';
      function test() {
        var el = $compile(markup)(scope);
        scope.$digest();
      }

      expect(test).toThrow();
    }));

    it('should ignore [data-ignore] and not visible columns', function(){
      var th = element.find('tr:first-child th:not([data-ignore])')
      expect(innerScope.$columns.length).toBe(th.length+1);
    });

    it('should insert the column-template node at the correct index ', function(){
      var th = element.find('thead tr:first-child th:last-child');
      expect(th.text().trim()).toBe('last');
    });

    it('should target the correct header without hidden columns', function(){
      var selector = element.find('table').attr('bo-repeatable');
      var th = element.find( selector + ' > *:not([data-ignore])' );

      expect(th.length).toBe(innerScope.$columns.length-1);
    });

    it('should expose a $columns object', function(){
      expect(innerScope.$columns).toBeDefined();
      expect(innerScope.$columns.length).toBe(3);
    });

    it('should filter visible $columns ', function(){
      var selector =  element.find('table').attr('bo-repeatable')+' > *';
      var cols = element.find(selector).length;

      innerScope.$columns[0].visible = false;
      scope.$digest();
      expect(element.find(selector).length).toBe(cols - 1);
    });
  });

  describe('repeatableConfig', function(){
    var scope;

    beforeEach(inject(function($rootScope, $compile){
      var markup =
        '<div>'+
        '<table bonitable bo-repeatable repeatable-config="config">'+
        '  <thead>'+
        '    <tr>'+
        '       <th>id</th>'+
        '       <th>name</th>'+
        '    </tr>'+
        '  </thead>'+
        '  <tbody>'+
        '    <tr ng-repeat="tag in tags">'+
        '       <td>{{tag.id}}</td>'+
        '       <td>{{tag.name}}</td>'+
        '    </tr>'+
        '  </tbody>'+
        '</table>'+
        '</div>';

      scope = $rootScope.$new();
      scope.tags = [{id:1, name:'blue'},{id:3, name:'red'}, {id:2, name:'green'}];
      scope.config = [true, false];
      element = $compile(markup)(scope);
      scope.$digest();
    }));

    it('should set columns visibility according config values', function(){
      var th = element.find('thead th');
      expect(th.length).toEqual(1);

      //Set the 2 columns visible
      scope.config = [true, true];
      scope.$digest();

      th = element.find('thead th');
      expect(th.length).toEqual(2);
    })
  })

  describe('columnTemplate directive', function(){
    var scope;
    var createDirective;
    var $compile;

    beforeEach(inject(function($rootScope, $injector){
      $compile = $injector.get('$compile');

      scope = $rootScope.$new();
      scope.tags = [{id:1, name:'blue'},{id:3, name:'red'}, {id:2, name:'green'}];

      createDirective = function(scope, tpl){
        var markup = angular.element('<span></span>');
        markup.attr('column-template', tpl);
        var element = $compile(markup.get(0).outerHTML)(scope);
        scope.$digest();
        return element;
      }
    }));

    it('should leave attribute on the root node ', function(){
      scope.name = "Bob";
      var tpl = "<em data-title='{{name}}'>{{name}}</em>";
      var element = createDirective(scope, tpl);


      var dataEl = element[0].getAttribute('data-title')
      expect(dataEl).toEqual(scope.name);
    });

    it('should remove attribute on the em node ', function(){
      var tpl = "<em data-title='{{name}}'>{{name}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope, tpl);
      var dataEl = element[0].children[0].getAttribute('data-title')
      expect(dataEl).toBeNull();
    });

    it('should render data using template', function(){
      var tpl = "<em>{{username}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope, tpl);
      expect(element[0].textContent).toBe('Bob');
    })

    it('should render binded data using bind', function(){
      var tpl = '<em ng-bind="username"></em>';
      scope.username = "Bob";

      var element = createDirective(scope, tpl);
      expect(element[0].textContent).toBe('Bob');
    });

    it('should render a binded data with filter', function(){
      var tpl = '<em ng-bind="username | uppercase"></em>';
      scope.username = "bob";

      var element = createDirective(scope, tpl);
      expect(element[0].textContent).toBe('BOB');
    });
  });
});
