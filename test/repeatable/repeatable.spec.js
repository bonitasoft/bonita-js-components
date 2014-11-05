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
          '<table bo-repeatable>'+
          '  <thead>'+
          '    <tr>'+
          '       <th data-ignore>test</th>'+
          '       <th>id</th>'+
          '       <th>name</th>'+
          '    </tr>'+
          '  </thead>'+
          '  <tbody>'+
          '    <tr ng-repeat="tag in tags">'+
          '       <td>toto</td>'+
          '       <td>{{tag.id}}</td>'+
          '       <td>{{tag.name}}</td>'+
          '    </tr>'+
          '  </tbody>'+
          '</table>';

      scope.tags = [{id:1, name:'blue'},{id:3, name:'red'}, {id:2, name:'green'}];
      element = $compile(markup)(scope);
      scope.$digest();
    }));

    it('should expose a $columns object', function(){
      expect(element.scope().$columns).toBeDefined();
      expect(element.scope().$columns.length).toBe(2);
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
