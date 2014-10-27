var gulp = require('gulp');
var karma = require('karma').server;

function test(done, tdd) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: tdd,
    singleRun: !tdd
  }, done);
}

gulp.task('test', function (done) {
  test(done, false);
});

gulp.task('tdd', function (done) {
  test(done, true);
});

gulp.task('default', ['test']);