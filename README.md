bonita-js-components
====================

bonita angular components library.

Todo
----

 - [x] bo-sortable (bo-sortable sort-options="sortOptions" on-sort="onSort( options)")
 - [x] bo-sorter (default id=key, or bo-sorter='key')
 - [x] selectAll (bo-selectable, bo-selectAll, bo-selector)
 - [x] bo-repeatable
 - [x] table-settings 
 - [x] drag and drop
 - [ ] Resizeable (see http://bz.var.ru/comp/web/resizable.html )
 - [ ] draggable-columns

# Publishing a new version

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
$ git tag x.x.x
$ git push --follow-tags
```

3. Celebrate!

> The code coverage is build when you run a test, you can access to it by opening the `./coverage/Phantom*/index.html` in a browser.
