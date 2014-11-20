'use strict';

describe('sortable directive', function(){
  var element;
  var scope;
  var $timeout;

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.sortable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend) {
    scope = $rootScope.$new();

    $httpBackend.whenGET(/^template/).respond('');

    var markup =
        '<div>'+
        '<table bonitable'+
        '       sort-options="sortableOptions" on-sort="sortHandler(options)">'+
        '  <thead>'+
        '    <tr>'+
        '       <th bo-sorter="id">ID</th>'+
        '       <th bo-sorter="name">Name</th>'
        '    </tr>'+
        '  </thead>'+
        '</table>'+
        '</div>';

    scope.sortableOptions = {
      direction:false,
      property:'name'
    };
    scope.sortHandler = function(){}
    spyOn(scope, 'sortHandler').and.callThrough();
    element = $compile(markup)(scope);
    scope.$digest();
  }));


  it('should create clickable columns header', function(){
    var buttons = element.find('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('ID');
    expect(buttons[1].textContent.trim()).toBe('Name');
  });

  describe('sortIcon', function() {
    it('should reflect sort direction', function(){
      var icon = element.find('.bo-SortButton--active .bo-SortButton-icon').get(0);
      expect(icon.classList.contains('icon-sort-up')).toBe(true);
      scope.sortableOptions.direction =  true;
      scope.$digest();
      expect(icon.classList.contains('icon-sort-down')).toBe(true);
    });
  });

  describe('sorter', function() {
    it('should trigger sort handler when click bo-sorter', function(){
      var button = element.find('.bo-SortButton:not(.bo-SortButton--active)');
      button.click();
      expect(scope.sortHandler).toHaveBeenCalledWith({property:'id', direction:false});
    });

    it('should reverse order if active th is clicked', function(){
      var button = element.find('.bo-SortButton--active');
      button.click();
      expect(scope.sortableOptions).toEqual({property:'name', direction:true});
      expect(scope.sortHandler).toHaveBeenCalledWith({property:'name', direction:true});
    });
  });

  describe('icon class', function(){
    it('should reflect initial sortOption', function(){
      var button = element.find('.bo-SortButton--active');
      expect(button.get(0).textContent.trim()).toEqual('Name');

      var icon = element.find('.bo-SortButton-icon', button);
      expect(icon.get(0).classList.contains('icon-sort-up')).toBe(true);
    });

    it('should reflect sortOption when reverse order', function(){
      var button = element.find('.bo-SortButton--active');
      var icon = element.find('.bo-SortButton-icon');

      button.click();
      expect(scope.sortableOptions.direction).toBe(true);
    });
  });

});
