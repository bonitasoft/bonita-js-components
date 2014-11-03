'use strict';

describe('multiselect directive', function(){
  var element;
  var scope;
  var controller;

  beforeEach(module('bonitable'));
  beforeEach(module('bonita.selectable'));
  beforeEach(module('bonita.templates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend) {
    scope = $rootScope.$new();

    $httpBackend.whenGET(/^template/).respond('');

    var markup =
        '<table bo-selectable>'+
        '  <thead>'+
        '    <tr>'+
        '       <th><div bo-selectall></div></th>'+
        '       <th>label</th>'+
        '    </tr>'+
        '  </thead>'+
        '  <tbody>'+
        '    <tr ng-repeat="tag in tags">'+
        '       <td><input type="checkbox" bo-selector="tag" ng-model="tag.$selected"></td>'+
        '       <td>{{tag.label}}</td>'+
        '    </tr>'+
        '  </tbody>'+
        '</table>';

    scope.tags = [{label:'blue'},{label:'red'}, {label:'green'}];
    element = $compile(markup)(scope);
    controller = element.controller('boSelectable');
    scope.$digest();
  }));

  describe('bo-selecter', function(){
    it('should  update $selected items', function(){
      var checkbox = element.find('tbody input[type=checkbox]').eq(0);
      expect(controller.$selectedItems.length).toBe(0);
      checkbox.click();
      expect(controller.$selectedItems.length).toBe(1);
    });
  });

  describe('selectAll', function(){
    it('should toggle all items', function(){
      var checkbox = element.find('th input[type=checkbox]');
      checkbox.click();
      scope.$digest();
      expect(controller.$selectedItems.length).toBe(scope.tags.length);
      checkbox.click();
      expect(controller.$selectedItems.length).toBe(0);
    });
  });

  describe('SelectableController', function(){
    var controller;
    var item = {
      data: 1,
      value: false,
      isChecked:function(){
        return this.value;
      },
      setChecked: function (val) {
        this.value = val === true;
      }
    };


    beforeEach(inject(function($controller ){
      controller = $controller('SelectableController', {'$scope': scope});
      spyOn(controller, 'registerSelector').and.callThrough();
      item.setChecked(false);
    }));

    it('should expose a registerSelector', function(){
      controller.registerSelector(item);
      expect(controller.registerSelector).toHaveBeenCalledWith(item);
    });

    it('should expose a $selectedItems', function(){
      expect(controller.$selectedItems.length).toBe(0);
      controller.registerSelector(item);
      item.setChecked(true);
      expect(controller.$selectedItems.length).toBe(1);
    });

    it('should expose $allSelected', function(){
      controller.registerSelector(item);
      controller.registerSelector(item);
      expect(controller.$allSelected).toBe(false);
      item.setChecked(true);
      expect(controller.$allSelected).toBe(true);
    });

    it('should toggle all the items ', function(){
      controller.registerSelector(item);
      controller.registerSelector(item);
      expect(controller.$allSelected).toBe(false);
      controller.$toggleAll();
      expect(controller.$allSelected).toBe(true);
    });
  })

});
