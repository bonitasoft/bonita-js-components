describe('repeatable directive', function(){
  var element;
  var scope;
  var controller;

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.repeatable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend, $document) {
    scope = $rootScope.$new();

    $httpBackend.whenGET(/^template/).respond('');

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
