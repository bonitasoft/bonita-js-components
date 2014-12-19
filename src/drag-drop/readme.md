# Drag and drop module

Create draggable items and as many dropzone you wish.

## Compenents

### Services

- `boDragMap`: Temp database for drag and drop item
    - `set(id, data)`
    - `updateKey(id, newId)`
    - `get(id)`
    - `reset()`
- `boDragUtils`:  Utils
    - `generateUniqId(key)`: Generate a uniq ID (key is a prefix)

### Directives

- `boDropzone`: Define a new dropzone
    - `boDropSuccess($event, $data)`: The callback is triggered on drop success
    - `boDragOver($event)`: Pass a function name (not foo(), just foo). The callback is triggered on drag over (add a className **bo-dragzone-hover**) if is :hover a dropzone
- `boDraggable`: Define a draggable item
    - `boDragStart`: The callback is triggered on drag start
    - `boDraggableData` Attr to define some data bind to the scope.data of this directive
- `boDragPolyfill`: Patch drag&drop API for IE9

Ex: One col and two dropzones.
```html
<main  ng-controller="dragDropCtrl as dragDropCtrl">
    <aside class="container-siderbar" bo-drag-polyfill>
        <div class="item-drag" bo-draggable bo-draggable-data="data" bo-drag-start="cb" ng-repeat="data in dragArray track by $index">item-{{$index + 1}}</div>
    </aside>

    <section class="container-dropable" bo-dropzone bo-drop-success="success"></section>
    <section class="container-dropable" bo-dropzone bo-drop-success="success" bo-drag-over="cb"></section>

</main>
```

The controller (*generates the data and attach an event*):
```js
controller('dragDropCtrl', function ($scope, boDragEvent) {

  var dragArray = [];

  var i = 9;

  while(--i>=0) {
    dragArray.push({
      name: 'item-' + i,
      date: new Date()
    });
  }

  boDragEvent.onDropSuccess = function(scope, data) {
    console.log('trigger dat event');
  };

  $scope.dragArray = dragArray;

});
```

## Informations

The directive does not work if you use `$compileProvider.debugInfoEnabled(false);` inside the application cf [angular.element.scope() returns undefined](https://github.com/angular/angular.js/issues/9515#issuecomment-61990861).
