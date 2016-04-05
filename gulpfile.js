var gulp = require('gulp');
var jshint = require('gulp-jshint');
var replace = require('gulp-replace');
var each = require('lodash/each');
var sass = require('gulp-sass');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var through2 = require('through2');
var rename = require('gulp-rename');
var config = require('config');

/**
 *  Bundle
 */

gulp.task('assets', function () {
  // Index HTML
  var metaTags = [];
  each(config.app, function(val, key) {
    metaTags.push('<meta name="'+key+'" content="'+val+'">');
  });
  gulp.src('./index.html')
    .pipe(replace('<!--CONFIG-->', metaTags.join('')))
    .pipe(gulp.dest('./dist'));

  // Assets
  gulp.src('./styles/assets/**/*')
    .pipe(gulp.dest('./dist/assets'));

  // Font Awesome
  gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('sass', function() {
  gulp.src('./app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', function() {
  gulp.src('./app.js')
    .pipe(through2.obj(function (file, enc, next) {
        browserify(file.path)
        .bundle(function (err, res) {
          if (err) { return next(err); }
          file.contents = res;
          next(null, file);
        });
    }))
    .on('error', function (error) {
        console.log(error.stack);
        this.emit('end');
    })
    .pipe(uglify().on('error', function(err){console.log(err); }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('bundle', ['assets', 'sass', 'browserify']);

/**
 *  Tests
 */

gulp.task('lint', function() {
  return gulp.src([
    './model/**/*.js',
    './client/**/*.js',
    './server/**/*.js',
  ]).pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter("fail"));
});

gulp.task('test:server', ['lint'], function() {
  // requiring instead of doing 'node test/run.js'
  require('./test/run');
});

gulp.task('test', ['lint', 'test:server']);

gulp.task('default', ['bundle']);