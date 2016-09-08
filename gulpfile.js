'use strict';
/* eslint-disable no-console, no-invalid-this */

var path = require('path');
var config = require('config');
var through2 = require('through2');
var browserify = require('browserify');
var Promise = require('bluebird');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var gulpFile = require('gulp-file');
var replace = require('gulp-replace');
var tape = require('gulp-tape');
var tapSpec = require('tap-spec');
var bundleStyles = require('substance/util/bundleStyles');

gulp.task('assets', function () {
  gulp.src('./client/index.html')
    .pipe(gulp.dest('./dist'));
  gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('sass', function(done) {
  return new Promise(function() {
    bundleStyles({
      rootDir: __dirname,
      configuratorPath: require.resolve('./packages/notes/NotesConfigurator'),
      configPath: require.resolve('./client/package'),
      sass: {
        sourceMap: false,
        outputStyle: 'compressed'
      }
    }).then(function(css) {
      var distPath = path.join(__dirname, 'dist');
      gulpFile('app.css', css, { src: true })
        .pipe(gulp.dest(distPath));
    }).catch(function(err) {
      console.error(err);
    });
  }).then(function() {
    done();
  });
});

gulp.task('browserify', function() {
  gulp.src('./client/app.js')
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
    .pipe(replace(
      '{"protocol":"http","host":"localhost","port":5000}',
      JSON.stringify(config.get('app'))
    ))
    .pipe(uglify().on('error', function(err){console.log(err); }))
    .pipe(gulp.dest('./dist'));
});


gulp.task('lint', function() {
  return gulp.src([
    './client/**/*.js',
    './packages/**/*.js',
    './server/**/*.js',    
    './server.js',  
    './seed.js'
  ]).pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test:server', ['lint'], function() {
  return gulp.src('test/server/*.test.js')
    .pipe(tape({
      //reporter: tapSpec()
    }));
});

gulp.task('test', ['test:server']);
gulp.task('bundle', ['assets', 'sass', 'browserify']);
gulp.task('default', ['bundle']);