'use strict';

describe('sortable directive', function(){
  var element;
  var scope;
  var $timeout;

  var titles = {
    id: {
      asc: 'Sort by ID'
    },
    name: {
      asc: 'Sort by name (reverse)',
      desc: 'Sort by name'
    }
  };

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
        '       <th bo-sorter="id" bo-sorter-title-asc="' + titles.id.asc + '">ID</th>'+
        '       <th bo-sorter="name" bo-sorter-title-desc="' + titles.name.desc + '" bo-sorter-title-asc="' + titles.name.asc + '">Name</th>'+
        '       <th bo-sorter="date">Date</th>'+
        '    </tr>'+
        '  </thead>'+
        '</table>'+
        '</div>';

    scope.sortableOptions = {
      direction:false,
      property:'name'
    };
    scope.sortHandler = function(){};
    spyOn(scope, 'sortHandler').and.callThrough();
    element = $compile(markup)(scope);
    scope.$digest();
  }));


  it('should create clickable columns header', function(){
    var buttons = element.find('button');
    expect(buttons.length).toBe(3);
    expect(buttons.get(0).textContent.trim()).toBe('ID');
    expect(buttons.get(1).textContent.trim()).toBe('Name');
    expect(buttons.get(2).textContent.trim()).toBe('Date');
  });

  describe('sortIcon', function() {
    it('should reflect sort direction', function(){
      var icon = element.find('.SortButton--active .SortButton-icon').get(0);
      expect(icon.classList.contains('icon-sort-up')).toBe(true);
      scope.sortableOptions.direction =  true;
      scope.$digest();
      expect(icon.classList.contains('icon-sort-down')).toBe(true);
    });
  });

  describe('sorter', function() {
    it('should trigger sort handler when click bo-sorter', function(){
      var button = element.find('.SortButton:not(.SortButton--active)');
      button.click();
      expect(scope.sortHandler).toHaveBeenCalledWith({property:'date', direction:false});
    });

    it('should reverse order if active th is clicked', function(){
      var button = element.find('.SortButton--active');
      button.click();
      expect(scope.sortableOptions).toEqual({property:'name', direction:true});
      expect(scope.sortHandler).toHaveBeenCalledWith({property:'name', direction:true});
      button.click();
      expect(scope.sortHandler).toHaveBeenCalledWith({property:'name', direction:false});
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
      button.click();
      expect(scope.sortableOptions.direction).toBe(true);
    });
  });

  describe('custom title attribute', function() {

    it('should have the default title if you do not set the any attr', function() {
      var buttons = element.find('button');
      expect(buttons.eq(2).get(0).title).toBe('Sort by ASC');
    });

    it('should have the same title as the boSorterTitleDesc', function() {
      var buttons = element.find('button');
      expect(buttons.get(0).title).toBe(titles.id.asc);
      expect(buttons.get(1).title).toBe(titles.name.asc);
    });


    it('should have the default title if you do not set the boSorterTitleAsc', function() {
      var buttons = element.find('button');
      buttons.eq(0).click();
      expect(buttons.eq(0).get(0).title).toBe('Sort by DESC');
    });

    it('should toggle the title', function() {
      var buttons = element.find('button');
      expect(buttons.eq(1).get(0).title).toBe(titles.name.asc);
      buttons.eq(1).click();
      expect(buttons.eq(1).get(0).title).toBe(titles.name.desc);
    });

  });

});
