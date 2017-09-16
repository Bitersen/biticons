'use strict';

/***********
 * PLUGINS *
 ***********/

var gulp = require('gulp')
var del = require('del')


// Paths
var app_paths = require('../paths.js');


// Cleanup
gulp.task('clean', function () {
  return del(app_paths.clean);
});
