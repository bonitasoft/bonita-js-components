# Drag and drop module

Create draggable items and as many dropzone you wish. 

> Chrome - Firefox - Safari - IE >= 9

## Compenents

### Providers

- `boDraggableItemProvider`: configuration for a draggableItem
  - `cloneOnDrop(boolean)`: Clone the node on drop on not (*default true*)

### Services

- `boDragMap`: Temp database for drag and drop item
    - `set(id, data)`
    - `updateKey(id, newId)`
    - `get(id)`
    - `reset()`
- `boDragUtils`:  Utils
    - `generateUniqId(key)`: Generate a uniq ID (key is a prefix)
- `boDraggableItem`: Configuration for a draggableItem
  - `config()`: Return a copy of draggableItem config keys
  - `allowCloneOnDrop()`: Can we copy the item on drop ? (boolean)


### Directives

- `boDropzone`: Define a new dropzone
    - `boDropSuccess($event, $data)`: The callback is triggered on drop success
    - `boDragOver($event)`: The callback is triggered on drag over
- `boDraggable`: Define a draggable item
    - `boDragStart`: The callback is triggered on drag start
    - `boDropItem($event, $data)`: The callback is triggered on drag start
    - `boDraggableData` Attr to define some data bind to the scope.data of this directive
- `boDragPolyfill`: Patch drag&drop API for IE9

#### ClassNames

These directives can add some classNames to the dom for some events:
- **bo-dropzone-hover**: When you are hover a dropZone
- **bo-drag-enter**: When you hover an element

Ex: One col and two dropzones.
```html
<main  ng-controller="dragDropCtrl as dragDropCtrl">
  <aside class="container-siderbar" bo-drag-polyfill>
      <div class="item-drag" bo-draggable bo-draggable-data="data" ng-repeat="data in dragArray track by $index" bo-drop-item="dragDropCtrl.onDropItem($data, test)"  bo-drag-start="dragDropCtrl.onDragStart($index, data)">item-{{$index + 1}}</div>
  </aside>

  <section class="container-dropable" bo-dropzone bo-drop-success="dragDropCtrl.onDropSuccess($event, $data, test)"></section>
  <section class="container-dropable" bo-dropzone bo-drag-over="dragDropCtrl.onDragOver($event, test)"></section>

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
  
  this.onDropSuccess = function() {
    console.log('trigger dat event', arguments);
  };


  this.onDropItem = function() {
    console.log('drop item', arguments);
  };

  this.onDragOver = function() {
    console.log('Drag over', arguments);
  };
  this.onDragStart = function() {
    console.log('Drag start', arguments);
  };

  $scope.dragArray = dragArray;
  $scope.test = 'value';

});
```
