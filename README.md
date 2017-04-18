bonita-js-components [![Build Status](https://travis-ci.org/bonitasoft/bonita-js-components.svg?branch=ag_dragdrop)](https://travis-ci.org/bonitasoft/bonita-js-components)
====================

Bonita angular components library.

## Dependencies
Required dependencies are:
- [AngularJS](https://angularjs.org/) 1.4.x
- [Bootstrap CSS](http://getbootstrap.com/) 3.3.x
- [Angular bootstrap](https://angular-ui.github.io/bootstrap/) 0.13.4
- [ngSortable](https://github.com/a5hik/ng-sortable) 1.3.1
- [ngStorage](https://github.com/gsklee/ngStorage) 0.3.9

## Installation
    bower install bonita-js-components --save
Include _bonita-lib-tpl.min.js_ in your html file.
```html
    <script src="bower_components/bonita-js-components/dist/bonita-lib-tpl.min.js"></script>
```
Then you need to declare dependency to the wanted component's module, exemple:
    angular.module('myModule', ['org.bonitasoft.bonitable']);

## Components
 - [x] bo-sortable (bo-sortable sort-options="sortOptions" on-sort="onSort( options)")
 - [x] bo-storable (bo-storable="storageId" on-storage-loaded="loadContent()")
 - [x] bo-sorter (default id=key, or bo-sorter='key')
 - [x] selectAll (bo-selectable, bo-selectAll, bo-selector)
 - [x] bo-repeatable
 - [x] table-settings 
 - [x] drag and drop
 - [x] draggable-columns (need to add ng-sortable dependency to make it work as it is not imported by default)

## Development
### Requirements
You need to have __nodejs__, __npm__ and __gulp__
This library also needs angular 1.4.5 to run properly.

### Available command

- ``$ npm start``: launch the developpement environnement with a local server+livreload. Also, unit tests ran in background
- ``$ npm run dist`` : create a dist folder with minified/concatenated files. Please not that this command is only available in the _release_ branch.
- ``$ npm test`` will run the unit test suite on PhantomJS
- ``$ npm run documentation`` will generate the a ngdoc documentation site inside a ``./docs/ directory``

### Publishing a new version

**The master branch do not contains any dist files.**

There is a dedicated branch which holds dist files to be distributed using [bower](http://bower.io). Once you're ready to ship a new version

0. If not already did, bump version number in both ``bower.json`` and ``package.json`` and commit changes.

1. Go to the ```release`` branch, marge master on it, and launch the dist build.
```console
$ git checkout release
$ git merge master
$ npm run dist
```

2. Commit the new dist files in ``release`` and tag the branch accordingly to your bower.json version number
```console
$ git commit -m"Release x.x.x"
$ git tag -a x.x.x
$ git push --follow-tags
```

3. Celebrate!

> The code coverage is build when you run a test, you can access to it by opening the `./coverage/Phantom*/index.html` in a browser.

### Documentation
To ease the documentation process
```console
$ npm run documentation
```
will run a local server (with livereload) and generate the docs sites each time you update the js files.

### Code coverage
The karma test suite provides code coverage through karma-istanbul. The generated coverage site is at the root of the project, in the ``/coverage/`` folder.
