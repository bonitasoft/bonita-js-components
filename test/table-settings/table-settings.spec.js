'use strict';

describe('TableSettings', function(){

  var createDirective;

  var markup =
    '<table-settings columns="columns" page-size="pagination.pageSize" ' +
    '                sizes="PAGE_SIZES" ' +
    '                update-visibility="onVisibility(field)"' +
    '                update-page-size="onSize(size)">' +
    '</table-settings>';

  var markup_custom =
    '<table-settings columns="columns" page-size="pagination.pageSize" ' +
    '                sizes="PAGE_SIZES" ' +
    '                label-prop="label" ' +
    '                visible-prop="display" ' +
    '                update-visibility="onVisibility(field)"' +
    '                update-page-size="onSize(size)">' +
    '</table-settings>';



  beforeEach(module('org.bonitasoft.bonitable'));
  beforeEach(module('org.bonitasoft.settings'));
  beforeEach(module('org.bonitasoft.templates'));

  beforeEach(module(function($filterProvider){
    $filterProvider.register('translate', function(){
      return function(input){
        return input;
      };
    });
  }));

  beforeEach(inject(function($rootScope, $compile, $httpBackend, $document) {
    $httpBackend.whenGET(/^template/).respond('');

    var scope = $rootScope.$new();
    scope.pagination = {
      pageSize: 5
    };
    scope.PAGE_SIZES = [5,10,50];
    scope.columns = [
      {
        name:'id',
        label:'ID',
        visible: true,
        display: true
      }, {
        name:'name',
        label:'Name',
        visible: true,
        display: true
      }, {
        name:'date',
        label:'Date',
        visible: false,
        display: false
      }
    ];
    scope.onSize = jasmine.createSpy('onSize');
    scope.onVisibility = jasmine.createSpy('onVisibility');

    createDirective = function(markup) {
      var element = $compile(markup)(scope);

      $document.find('body').append(element);

      scope.$digest();
      return element;
    }
  }));


  it('should create a dropdown button', function(){
    var element = createDirective(markup);
    expect(element.find('button.dropdown-toggle').length).toBe(1);
  });

  it('should create a dropdown menu', function(){
    var element = createDirective(markup);
    expect(element.find('button.dropdown-toggle').length).toBe(1);
  });

  describe('pagination', function(){
    var element;
    var scope ;
    beforeEach(function(){
      element = createDirective(markup);
      scope = element.scope();
    });

    it('should have one button for each pagesize', function(){
      expect(element.find('.btn-group.btn-group-justified button').length).toBe(scope.PAGE_SIZES.length);
    });

    it('should have a button selected if actual pageSize match', function() {
      var currentPagination = element.find('.btn-group.btn-group-justified button.active').text().trim()
      expect(parseInt(currentPagination, 10)).toEqual(scope.pagination.pageSize);
    });

    it('should update pagination.pageSize when selecting another pagination value', function(){
      // select paginatio 50
      element.find('.btn-group.btn-group-justified button').get(2).click();
      expect(scope.pagination.pageSize).toEqual(50);
    });

    it('should trigger pagination handler when selecting a pagination value', function(){
      // select pagination 50
      element.find('.btn-group.btn-group-justified button').get(2).click();
      expect(scope.onSize).toHaveBeenCalledWith(50);
    });

  });

  describe('Columns visibility with default parameter', function() {
    var element;
    var scope ;
    beforeEach(function(){
      element = createDirective(markup);
      scope = element.scope();
    });

    it('should display each columns', function(){
      var li = element.find('.bo-TableSettings-columns li');
      expect(li.length).toEqual(scope.columns.length)
    });

    it('should use name to identify colums', function(){
      var index = 1; // colum Name
      var columnLabel = element.find('.bo-TableSettings-columns li label').eq(index);
      var label = columnLabel.text().trim();
      expect(label).toEqual(scope.columns[index].name)
    });

    it('should trigger columns visibility when toggle a columns', function(){
      //initial
      element.find('input[type=checkbox]').eq(0).click();
      expect(scope.onVisibility).toHaveBeenCalledWith(scope.columns[0]);
    });

    it('should update columns visibility when toggle a columns', function(){
      //initial
      var nbChecked = element.find('input[type=checkbox]:checked').length;
      var visibleColumn = scope.columns.filter(function(item){
        return item.visible === true;
      }).length;

      expect(visibleColumn).toEqual(nbChecked);

      // unchecked the first column
      element.find('input[type=checkbox]').eq(0).click();

      nbChecked = element.find('input[type=checkbox]:checked').length;
      visibleColumn = scope.columns.filter(function(item){
        return item.visible === true;
      }).length;

      expect(nbChecked).toEqual(visibleColumn);
    });

  });


  describe('Columns visibility with custom parameter', function() {
    var element;
    var scope ;
    beforeEach(function(){
      element = createDirective(markup_custom);
      scope = element.scope();
    });

    it('should use visibility-prop to define visibility state', function(){
      var visibleProp = 'display';
      var visibleColumns = scope.columns.filter(function(item){
        return item[visibleProp] === true;
      }).length;

      var nbChecked = element.find('input[type=checkbox]:checked').length;

      expect(visibleColumns).toEqual(nbChecked)
    });

    it('should use label prop to identify colums', function(){
      var index = 1; // colum Name
      var labelProp = 'label';
      var columnLabel = element.find('.bo-TableSettings-columns li label').eq(index);
      var label = columnLabel.text().trim();
      expect(label).toEqual(scope.columns[index][labelProp]);
    });


  });



});
