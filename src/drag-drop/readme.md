# Drag and drop module

Create draggable items and as many dropzone you wish.

## Compenents

### Services

- `boDragEvent`: Callback events mapper
    - `onDropSuccess(DropZone.scope, dragItem.customData)`
    - `onDragStart(dragItem.scope)`
    - `onDragOver(dragItem.scope)`
- `boDragMap`: Temp database for drag and drop item
    `set(id, data)`
    `updateKey(id, newId)`
    `get(id)`
    `reset()`
- `boDragUtils`:  Utils
    - `generateUniqId(key)`: Generate a uniq ID (key is a prefix)


### Directives

- `boDropzone`: Define a new dropzone
- `boDraggable`: Define a draggable item
    - `boDraggableData` Attr to define some data bind to the scope.data of this directive
- `boDragPolyfill`: Patch drag&drop API for IE9

Ex: One col and two dropzones.
```html
<main  ng-controller="dragDropCtrl as dragDropCtrl">
    <aside class="container-siderbar" bo-drag-polyfill>
        <div class="item-drag" bo-draggable bo-draggable-data="data" ng-repeat="data in dragArray track by $index">item-{{$index + 1}}</div>
    </aside>

    <section class="container-dropable" bo-dropzone bo-dropzone-success="success()"></section>
    <section class="container-dropable" bo-dropzone bo-dropzone-success="success()"></section>

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
