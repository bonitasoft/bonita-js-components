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
          '       <th remove-column="false" visible="">content</th>'+
          '       <th remove-column="{{1===1}}">key</th>'+
          '       <th data-ignore remove-column="{{false}}">last</th>'+
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
    var createTable;
    var $compile;

    beforeEach(inject(function($rootScope, $injector, $timeout) {
      $compile = $injector.get('$compile');

      scope = $rootScope.$new();
      scope.tags = [{ id: 1, name: 'blue' }, { id: 3, name: 'red' }, { id: 2, name: 'green' }];

      createTable = function(scope, template) {
        scope.template = template;
        var table = $compile(angular.element('<table><tr><td column-template="{{ template }}"></td></tr></table>'))(scope);
        scope.$digest();
        $timeout.flush();
        return table;
      }
    }));

    it('should preserve attribute on column', function() {
      scope.name = 'Bob';

      var element = createTable(scope, '<td data-title="{{name}}"></td>');

      expect(element.find('td').attr('data-title')).toBe('Bob');
    });

    it('should render data using template', function() {
      scope.username = "Bob";

      var element = createTable(scope, '<td>{{username}}</td>');

      expect(element[0].textContent).toBe('Bob');
    });

    it('should render a bound data with filter', function() {
      scope.username = 'bob';

      var element = createTable(scope, '<td ng-bind="username | uppercase"></td>');

      expect(element.text()).toBe('BOB');
    });
  });
});
