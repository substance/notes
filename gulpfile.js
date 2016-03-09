var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
  return gulp.src([
    './model/**/*.js',
    './client/**/*.js',
    './server/**/*.js',
  ]).pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter("fail"));
});

gulp.task('test:server', function() {
  // requiring instead of doing 'node test/run.js'
  require('./test/run');
});

gulp.task('test', ['test:server']);
gulp.task('default', ['build']);
