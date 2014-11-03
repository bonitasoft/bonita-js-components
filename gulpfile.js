'use strict';

/* gulp */
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename  = require('gulp-rename');

/* build */
var bower  = require('gulp-bower');

/* javascript */
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var html2js = require('gulp-ng-html2js');
var ngAnnotage = require('gulp-ng-annotate');
var concat = require('gulp-concat');

/* css */
var autoprefixer = require('gulp-autoprefixer');

/* dev */
var connect = require('gulp-connect');
var browser = require('gulp-open');

var opt = {
  port: 4000,
  livereload: 31357
};


/**
 * bower task
 * Fetch bower dependencies
 */
gulp.task('bower', function() {
  return bower()
    .pipe(plumber())
    .pipe(gulp.dest('bower_components'));
});

/**
 * JsHint
 * Validate js script
 */
gulp.task('jshint', function() {
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('fail'))
    .pipe(jshint.reporter('jshint-stylish'));
});
/**
 * html2js
 * transform templates to a templates.js file
 */
gulp.task('html2js', function() {
  gulp.src('src/**/*.html')
    .pipe(plumber())
    .pipe(html2js({
      moduleName: 'bonita.templates',
      prefix: 'template/'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('demo'));
});

/**
 * bundle
 * concat generated templates and javascript files
 */
gulp.task('bundle:js',['jshint', 'html2js'], function(){
  return gulp.src(['src/**/*.js', 'demo/templates.js'])
    .pipe(plumber())
    .pipe(ngAnnotage({
      remove: true,
      add: true,
      single_quotes: true
    }))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('demo'));
});

/**
 * uglify
 * minifiy generated javascript bundle
 */
gulp.task('uglify',['bundle:js'], function(){
  return gulp.src(['demo/bundle.js'])
    .pipe(plumber())
    .pipe(rename({ suffix:'.min' }))
    .pipe(gulp.dest('demo'));
});


/**
 * assets
 */
gulp.task('assets:css', function(){
  return gulp.src('src/**/*.css')
    .pipe(concat('styles.css'))
    .pipe(autoprefixer({
      browsers: ['last 3 version', 'ie 9']
    }))
    .pipe(gulp.dest('demo/'));
});

gulp.task('assets:html', function(){
  return gulp.src('misc/**/*.html')
    .pipe(gulp.dest('demo/'));
});
gulp.task('assets', ['assets:css', 'assets:html']);

/**
 * webserver
 * launch a local webserver with livereload, open
 */
gulp.task('webserver',['assets'], function() {
  return connect.server({
    root: ['demo', 'bower_components'],
    port: opt.port,
    livereload: true
  });
});

/**
 * Open task
 * Launch default browser on local server url
 */
gulp.task('open', ['webserver'],function() {
  return gulp.src('demo/index.html')
    .pipe(browser('', {
      url: 'http://localhost:'+opt.port+'/index.html'
    }));
});

/* Test */
var karma = require('karma').server;

function test(done, tdd) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: tdd,
    singleRun: !tdd
  }, done);
}

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['jshint', 'bower'], function() {
  gulp.watch(['src/**/*.js'], ['bundle:js']);
  gulp.watch(['src/**/*.html', 'misc/**/*.html'], ['assets:html']);
  gulp.watch(['src/**/*.css'], ['assets:css']);

  gulp
    .watch(['demo/**/*.*', 'demo/index.html'])
    .on('change', function() {
      gulp.src('').pipe(connect.reload());
    });

});

gulp.task('test', function (done) {
  return test(done, false);
});

gulp.task('tdd', function (done) {
  return test(done, true);
});

gulp.task('dist', ['bower', 'assets', 'uglify']);
gulp.task('dev', ['bower', 'assets', 'bundle:js', 'watch', 'open']);

gulp.task('default', ['test']);
