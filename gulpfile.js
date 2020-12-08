'use strict';

/* gulp */
var gulp = require('gulp');
var utils = require('gulp-util');
var plumber = require('gulp-plumber');
var rename  = require('gulp-rename');
var del  = require('del');

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

var gettext = require('gulp-angular-gettext');

var exec = require('child_process').exec;


var opt = {
  port: 4000,
  livereload: 31357
};


/**
 * JsHint
 * Validate js script
 */
gulp.task('jshint', function() {
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(utils.env.dist ? jshint.reporter('fail') : utils.noop());
});
/**
 * html2js
 * transform templates to a templates.js file
 */
gulp.task('html2js', function() {
  return gulp.src('src/**/*.html')
    .pipe(plumber())
    .pipe(html2js({
      moduleName: 'org.bonitasoft.templates',
      prefix: 'template/'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('demo'));
});

gulp.task('pot', function () {
  return gulp.src(['src/**/*.html', 'src/**/*.js'])
    .pipe(gettext.extract('bonita-js-components.pot', {}))
    .pipe(gulp.dest('i18n/'));
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
    root: ['demo', 'node_modules'],
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
 * ngdocs : documentation generator
 */
gulp.task('docs:js',['jshint', 'html2js'], function() {
  return gulp.src(['src/**/*.js', 'demo/templates.js'])
    .pipe(plumber())
    .pipe(ngAnnotage({
      remove: true,
      add: true,
      single_quotes: true
    }))
    .pipe(concat('bonita-lib-tpl.js'))
    .pipe(gulp.dest('docs/js'));
});

gulp.task('docs:css', function(){
  return gulp.src('src/**/*.css')
    .pipe(concat('bonita-lib.css'))
    .pipe(autoprefixer({
      browsers: ['last 3 version', 'ie 9']
    }))
    .pipe(gulp.dest('docs/css'));
});

gulp.task('docs:assets', function(){

  gulp.src([
    'node_modules/angular-bootstrap/ui-bootstrap-tpls.js',
    'node_modules/ng-sortable/dist/ng-sortable.min.js'
  ]).pipe(gulp.dest('docs/js'));

  return gulp.src([
    'node_modules/ng-sortable/dist/ng-sortable.min.css'
  ]).pipe(gulp.dest('docs/css'));

});
gulp.task('clean:docs', function(done){
  del(['docs/'], done);
});
gulp.task('ngdocs', ['docs:js', 'docs:css', 'docs:assets'], function () {
  var gulpDocs = require('gulp-ngdocs');
  var options = {
    title:'bonita-js-components',
    html5Mode: false,
    startPage: '/api/bonitable',
    scripts:[
      'docs/js/bonita-lib-tpl.js',
      'docs/js/ui-bootstrap-tpls.js',
      'docs/js/ng-sortable.min.js'
    ],
    styles:[
      'docs/css/ng-sortable.min.css',
      'docs/css/bonita-lib.css'
    ]
  };
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest('./docs'));
});


gulp.task('server:docs',['assets'], function() {
  return connect.server({
    root: ['docs'],
    port: opt.port,
    livereload: true
  });
});

gulp.task('watch:docs', function() {
  gulp
    .watch(['src/**/*.js'], ['ngdocs'])
    .on('change', function() {
      gulp.src('').pipe(connect.reload());
    });
});
gulp.task('documentation', ['ngdocs', 'watch:docs', 'server:docs']);

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['jshint'], function() {
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

/**
 * Testing tasks
 */
gulp.task('test', function (done) {
  return test(done, false);
});

gulp.task('tdd', function (done) {
  return test(done, true);
});

gulp.task('env:dist', function() {
  utils.env.dist = true;
});

gulp.task('dist', ['env:dist','clean', 'test', 'dist:css', 'uglify', 'pot']);
gulp.task('dev', ['assets', 'bundle:js:tpl', 'watch', 'open']);

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
