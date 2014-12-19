'use strict';

/* gulp */
var gulp = require('gulp');
var utils   = require('gulp-util');
var plumber = require('gulp-plumber');
var rename  = require('gulp-rename');
var del  = require('del');

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
var cssmin = require('gulp-csso');

/* dev */
var connect = require('gulp-connect');
var browser = require('gulp-open');

var exec = require('child_process').exec;


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
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
/**
 * html2js
 * transform templates to a templates.js file
 */
gulp.task('html2js', function() {
  return gulp.src('src/**/*.html')
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
gulp.task('bundle:js:tpl',['jshint', 'html2js'], function(){
  return gulp.src(['src/**/*.js', 'demo/templates.js'])
    .pipe(plumber())
    .pipe(ngAnnotage({
      remove: true,
      add: true,
      single_quotes: true
    }))
    .pipe(concat('bonita-lib-tpl.js'))
    .pipe(gulp.dest('demo'));
});

gulp.task('bundle:js',['jshint'], function(){
  return gulp.src(['src/**/*.js'])
    .pipe(plumber())
    .pipe(ngAnnotage({
      remove: true,
      add: true,
      single_quotes: true
    }))
    .pipe(concat('bonita-lib.js'))
    .pipe(gulp.dest('demo'));
});

/**
 * dist
 */
gulp.task('clean', function(done){
  return del(['dist/', 'demo/'], done);
});

gulp.task('dist:files', ['bundle:js:tpl', 'bundle:js', 'assets:css'], function(){
  return gulp.src(['demo/bonita-lib.js', 'demo/bonita-lib-tpl.js', 'demo/*.css'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify', ['dist:files'], function(){
  return gulp.src(['dist/bonita-lib.js', 'dist/bonita-lib-tpl.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({ suffix:'.min' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:css', ['dist:files'], function(){
  return gulp.src('dist/*.css')
    .pipe(rename({ suffix:'.min' }))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/'));
});


/**
 * assets
 */
gulp.task('assets:css', function(){
  return gulp.src('src/**/*.css')
    .pipe(concat('bonita-lib.css'))
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
  connect.server({
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
  gulp.watch(['src/**/*.js'], ['bundle:js:tpl']);
  gulp.watch(['src/**/*.html'], ['bundle:js:tpl']);
  gulp.watch(['misc/**/*.html'], ['assets:html']);
  gulp.watch(['src/**/*.css'], ['assets:css']);

  gulp
    .watch(['demo/**/*.*', 'demo/index.html'])
    .on('change', function() {
      gulp.src('').pipe(connect.reload());
    });

});

gulp.task('test', ['bower'], function (done) {
  return test(done, false);
});

gulp.task('tdd', function (done) {
  return test(done, true);
});

gulp.task('dist', ['clean', 'bower', 'test', 'dist:css', 'uglify']);
gulp.task('dev', ['bower', 'assets', 'bundle:js:tpl', 'watch', 'open']);

gulp.task('default', ['test']);

gulp.task('predist', function(done){
  exec('git rev-parse --abbrev-ref HEAD', {}, function(err, stdout){
    if (stdout.trim() !== 'release'){
      console.log('you can only run npm dist from the release branch');
      process.exit(-1);
    } else {
      done();
    }
  });
});
