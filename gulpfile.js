'use strict';

/***********
 * PLUGINS *
 ***********/

var gulp            = require('gulp'),                          // Task runner
    clc             = require('cli-color'),                     // Adds colors to console logs
    requireDir      = require('require-dir'),                   // Node helper to require() directories.
    runSequence     = require('run-sequence').use(gulp);        // Runs tasks in order

// Paths
var app_paths = require('./gulp/paths.js');

// Project information
var pkg = require('./package.json');

// Require all tasks
requireDir('./gulp/tasks', { recurse: true });



// Colored log messages
var red     = clc.red.bold,
    yellow  = clc.yellow,
    blue    = clc.blue,
    blue2   = clc.blue.bold,
    green   = clc.green,
    cyan    = clc.cyan;

// Done message
gulp.task('done', function() {
  console.log(green('\n\n------------------------------------------------------------------------'));
  console.log(yellow('Biticons v' + pkg.version) + green(' build process is complete! \n'));
  console.log(blue('> Author:       ') + red(pkg.author.name + ' <' + pkg.author.email + '>'));
  console.log(blue('> Author url:   ') + blue2(pkg.author.url));
  console.log(blue('> Project url:  ') + blue2(pkg.homepage));
  console.log(green('------------------------------------------------------------------------\n\n'));
});



// Default task
// ------------
gulp.task('default', function () {
  runSequence(
    // Initial cleanup
    'clean',
    // BitIcons
    'cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconsGuide', 'iconsGuideMin', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'copyFont',
    // Done
    'done'
  );
});
