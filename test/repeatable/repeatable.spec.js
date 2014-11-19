describe('repeatable', function(){

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.repeatable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($httpBackend){
    $httpBackend.whenGET(/^template/).respond('');
  }));

  describe('repeatable directive', function(){
    var element;
    var innerScope;
    var scope;

    beforeEach(inject(function($rootScope, $compile) {
      scope = $rootScope.$new();

      var markup =
          '<div>'+
          '<table bonitable bo-repeatable="thead tr:first-child">'+
          '  <thead>'+
          '    <tr>'+
          '       <th data-ignore>test</th>'+
          '       <th>id</th>'+
          '       <th>name</th>'+
          '       <th data-ignore>last</th>'+
          '    </tr>'+
          '    <tr>'+
          '      <th colspan="4">another heading</th>'+
          '    </tr>'+
          '  </thead>'+
          '  <tbody>'+
          '    <tr ng-repeat="tag in tags">'+
          '       <td>toto</td>'+
          '       <td>{{tag.id}}</td>'+
          '       <td>{{tag.name}}</td>'+
          '       <td>test</td>'+
          '    </tr>'+
          '  </tbody>'+
          '</table>'+
          '</div>';

      scope.tags = [{id:1, name:'blue'},{id:3, name:'red'}, {id:2, name:'green'}];
      element = $compile(markup)(scope);
      innerScope = element.find('table').scope();
      scope.$digest();
    }));

    it('should ignore [data-ignore] columns', function(){
      var th = element.find('tr:first-child th:not([data-ignore])')

      expect(innerScope.$columns.length).toBe(th.length);
    });

    it('should insert the column-template node at the correct index ', function(){
      var th = element.find('thead tr:first-child th:last-child');
      expect(th.text().trim()).toBe('last');
    });

    it('should target the correct header', function(){
      var selector = element.find('table').attr('bo-repeatable');
      var th = element.find( selector + ' > *:not([data-ignore])' );

      expect(th.length).toBe(innerScope.$columns.length);
    });

    it('should expose a $columns object', function(){
      expect(innerScope.$columns).toBeDefined();
      expect(innerScope.$columns.length).toBe(2);
    });

    it('should filter visible $columns ', function(){
      var selector =  element.find('table').attr('bo-repeatable')+' > *';
      var cols = element.find(selector).length;

      innerScope.$columns[0].visible = false;
      scope.$digest();
      expect(element.find(selector).length).toBe(cols - 1);
    });


  });

  describe('columnTemplate directive', function(){
    var scope;
    var createDirective;

    beforeEach(inject(function($rootScope, $compile, $timeout){
      scope = $rootScope.$new();

      createDirective = function(scope){
        var markup = '<span column-template="tpl"></span>';
        var element = $compile(markup)(scope);
        scope.$digest();
        $timeout.flush();
        return element;
      }
    }));

    it('should leave attribute on the root node ', function(){
      scope.tpl = "<em data-title='{{username}}'>{{username}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope);

      var dataEl = element[0].getAttribute('data-title')
      expect(dataEl).toEqual(scope.username);
    });
    it('should remove attribute on the em node ', function(){
      scope.tpl = "<em data-title='{{username}}'>{{username}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope);
      var dataEl = element[0].children[0].getAttribute('data-title')
      expect(dataEl).toBeNull();
    });
    it('should render data using template', function(){
      scope.tpl = "<em>{{username}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('Bob');
    })

    it('should render binded data using bind', function(){
      scope.tpl = '<em ng-bind="username"></em>';
      scope.username = "Bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('Bob');
    });

    it('should render a binded data with filter', function(){
      scope.tpl = '<em ng-bind="username | uppercase"></em>';
      scope.username = "bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('BOB');
    });
  })
});
