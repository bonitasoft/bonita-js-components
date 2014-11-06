'use strict';

describe('sortable directive', function(){
  var element;
  var scope;
  var $timeout;

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.sortable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend, _$timeout_) {
    scope = $rootScope.$new();
    $timeout =  _$timeout_;

    $httpBackend.whenGET(/^template/).respond('');

    var markup =
        '<table bonitable bo-sortable'+
        '       sort-options="sortOptions" on-sort="onSort(options)">'+
        '  <thead>'+
        '    <tr>'+
        '       <th bo-sorter="id">ID</th>'+
        '       <th bo-sorter="name">Name</th>'
        '    </tr>'+
        '  </thead>'+
        '</table>';

    scope.sortOptions = {
      direction:true,
      property:'name'
    };

    scope.onSort = function(){};
    spyOn(scope, 'onSort');
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
      var icon = element.find('.SortButton--active .SortButton-icon').get(0);
      expect(icon.classList.contains('icon-sort-up')).toBe(true);
      scope.sortOptions.direction =  false;
      scope.$digest();
      expect(icon.classList.contains('icon-sort-down')).toBe(true);
    });
  });

  describe('sorter', function() {
    it('should trigger onSort when click', function(){
      var button = element.find('.SortButton:not(.SortButton--active)');
      button.click();
      expect(scope.onSort).toHaveBeenCalledWith({property:'id', direction:true});
    });

    it('should reverse order if active th is clicked', function(){
      var button = element.find('.SortButton--active');
      expect(scope.sortOptions).toEqual({property:'name', direction:true});
      button.click();
      expect(scope.sortOptions).toEqual({property:'name', direction:false});
      expect(scope.onSort).toHaveBeenCalledWith({property:'name', direction:false});
    });
  });

  describe('icon class', function(){
    it('should reflect initial sortOption', function(){
      var button = element.find('.SortButton--active');
      expect(button.get(0).textContent.trim()).toEqual('Name');

      var icon = element.find('.SortButton-icon', button);
      expect(icon.get(0).classList.contains('icon-sort-up')).toBe(true);
    });

    it('should reflect sortOption when reverse order', function(){
      var button = element.find('.SortButton--active');
      var icon = element.find('.SortButton-icon');

      button.click();
      expect(scope.sortOptions.direction).toBe(false);
    });
  });

});
