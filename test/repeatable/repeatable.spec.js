describe('repeatable', function(){

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.repeatable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($httpBackend){
    $httpBackend.whenGET(/^template/).respond('');
  }));

  describe('repeatable directive', function(){
    var element;
    var scope;

    beforeEach(inject(function($rootScope, $compile) {
      scope = $rootScope.$new();

      var markup =
          '<table bo-repeatable="thead tr:first-child">'+
          '  <thead>'+
          '    <tr>'+
          '       <th data-ignore>test</th>'+
          '       <th>id</th>'+
          '       <th>name</th>'+
          '       <th data-ignore>test</th>'+
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
          '       <td>tata</td>'+
          '    </tr>'+
          '  </tbody>'+
          '</table>';

      scope.tags = [{id:1, name:'blue'},{id:3, name:'red'}, {id:2, name:'green'}];
      element = $compile(markup)(scope);
      scope.$digest();
    }));

    it('should ignore [data-ignore] columns', function(){
      var th = element.find('tr:first-child th:not([data-ignore])')
      expect(element.scope().$columns.length).toBe(th.length);
    });

    it('should target the correct header', function(){
      var selector = element.attr('bo-repeatable');
      var th = element.find( selector + ' > *:not([data-ignore])' );

      expect(th.length).toBe(element.scope().$columns.length);
    });

    it('should expose a $columns object', function(){
      expect(element.scope().$columns).toBeDefined();
      expect(element.scope().$columns.length).toBe(2);
    });

    it('should filter visible $columns ', function(){
      var selector =  element.attr('bo-repeatable')+' > *';
      var cols = element.find(selector).length;

      element.scope().$columns[0].visible = false;
      scope.$digest();
      expect(element.find(selector).length).toBe(cols - 1);
    });


  });

  describe('columnTemplate directive', function(){
    var scope;
    var createDirective;

    beforeEach(inject(function($rootScope, $compile){
      scope = $rootScope.$new();

      createDirective = function(scope){
        var markup = '<span column-template="tpl"></span>';
        var element = $compile(markup)(scope);
        scope.$digest();
        return element;
      }
    }));

    it('should render data using template', function(){
      scope.tpl = "<em>{{username}}</em>";
      scope.username = "Bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('Bob');
      expect(element[0].querySelector('em')).toBeDefined();
    })

    it('should render bind data using bind', function(){
      scope.tpl = '<em ng-bind="username"></em>';
      scope.username = "Bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('Bob');
    });

    it('should render a bind data with filter', function(){
      scope.tpl = '<em ng-bind="username | uppercase"></em>';
      scope.username = "bob";

      var element = createDirective(scope);
      expect(element[0].textContent).toBe('BOB');
    });
  })
});
