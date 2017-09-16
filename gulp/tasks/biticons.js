'use strict';

/***********
 * PLUGINS *
 ***********/

var gulp = require('gulp') // Task runner
var sass = require('gulp-sass') // Converts SASS to CSS
var rename = require('gulp-rename') // Renames output file
var cssmin = require('gulp-cssmin') // Minifies CSS - best minification results
var iconfont = require('gulp-iconfont') // Creates webfont with icons from SVG files
var iconfontCss = require('gulp-iconfont-css') // Creates CSS for glyphs from icon font
var resolver = require('gulp-resolver') // Replace references to source files with references to generated files
var del = require('del') // Deletes files
var plumberNotifier = require('gulp-plumber-notifier') // Reports compile errors through OS messages
var header = require('gulp-header') // Adds a header to file(s) in the pipeline
var timestamp = require('time-stamp') // Get a formatted time stamp
var htmlmin = require('gulp-htmlmin') // Minifies HTML files
var runSequence = require('run-sequence').use(gulp) // Runs tasks in order

// Project information
var pkg = require('../../package.json');

// Paths
var app_paths = require('../paths.js');

// Icon font settings
/*
  FILE REVVING
  ------------
  This feature ensures that latest version of icon-font will always be loaded.

  For `true` option, add these lines to .htaccess files:

    # Turn on mod_rewrite (must be turned on in Apache httpd.conf)
    Options +FollowSymlinks
    RewriteEngine On

    ######################
    # Icons file revving #
    ######################

    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.+)\.(\d+)\.(eot|svg|woff2?|ttf)$ $1.$3 [L]
*/

var fontName = 'biticons',
    fileRevving = true,                     // Turn off on nginx servers
    fontVersion = Math.floor(Date.now());   // Timestamp in miliseconds

// Header
var fontBanner = ['/*!',
  ' *  BitIcons v<%= pkg.version %> are part of Bitframe',
  ' * ',
  ' *  Build process created by <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' *  <%= pkg.author.url %>',
  ' * ',
  ' *  Styles rendered on '+timestamp('DD.MM.YYYY. at HH:mm')+'h',
  ' */',
  ''].join('\n');


/*******************************************************************************************
 * FONT ICONS                                                                              *
 * --------------------------------------------------------------------------------------- *
 * 1. Delete old font before making a new one                                              *
 * 2. Make new web font from SVG in icons folder and separate Glyphs from fontFace files   *
 * 3. Create guide for glyphs                                                              *
 * 4. Append version to fonts. For this to work, mod rewrite must be present on the server *
 * 5. Finalize with CSS                                                                    *
 * 6. Copy final font to public folder                                                     *
 *******************************************************************************************/

// 1. Delete everything old
gulp.task('cleanIcons', function () {
  return del([
    // app_paths.iconFontIn + 'generated/',
    app_paths.iconFontOut
  ]);
});

// 2. Make web fonts from SVG and create SCSS files
gulp.task('iconFontFace', function () {
  return gulp.src(app_paths.iconFontFiles)
    .pipe(plumberNotifier())
    .pipe(iconfontCss({
      fontName: fontName,
      appendUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      path: app_paths.iconFontTemplate + '/biticons-template.scss',
      targetPath: fontName + '.scss',
      fontPath: fontName
    }))
    .pipe(iconfont({
      fontHeight: 1024,
      normalize: true,
      descent: 64,
      fontName: fontName
    }))
    .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
});
gulp.task('iconGlyphs', function () {
  return gulp.src(app_paths.iconFontFiles)
    .pipe(plumberNotifier())
    .pipe(iconfontCss({
      fontName: fontName,
      appendUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      path: app_paths.iconFontTemplate + '/biticons-template-glyphs.scss',
      targetPath: '_' + fontName + '-glyphs.scss',
      fontPath: fontName
    }))
    .pipe(iconfont({
      fontHeight: 1024,
      normalize: true,
      descent: 64,
      fontName: fontName
    }))
    .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
});

// 3. Create Guide for icon glyphs
gulp.task('iconsGuide', function () {
  return gulp.src(app_paths.iconFontFiles)
    .pipe(plumberNotifier())
    .pipe(iconfontCss({
      fontName: fontName,
      appendUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      path: app_paths.iconFontTemplate + '/biticons-template-guide.html',
      targetPath: 'index.html',
      fontPath: fontName
    }))
    .pipe(iconfont({
      fontHeight: 1024,
      normalize: true,
      descent: 64,
      fontName: fontName
    }))
    .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
});
gulp.task('iconsGuideMin', function () {
  return gulp.src(app_paths.iconFontIn + 'generated/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
});

// 4. Append version for font files
gulp.task('iconRename', function () {
  if (fileRevving === true) {
    return gulp.src(app_paths.iconFontIn + 'generated/*.*')
      .pipe(rename({
        suffix: "." + fontVersion,
      }))
      .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
  }
});

// 4.1. Add revving to scss
gulp.task('iconRev', function () {
  if (fileRevving === true) {
    return gulp.src(app_paths.iconFontIn + 'generated/*.scss')
      .pipe(resolver.css({
        assetsDir: app_paths.iconFontIn + 'generated/'
      }))
      .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'))
  }
});

// 4.2. Delete unneeded rev files
gulp.task('cleanRev', function () {
  if (fileRevving === true) {
    return del([
      app_paths.iconFontIn + 'generated/*.*.*'
    ]);
  }
});

// 5. Create CSS from SCSS
gulp.task('iconSass', function () {
  return gulp.src(app_paths.iconFontIn + 'generated/*.scss')
    .pipe(sass())
    .pipe(cssmin())
    .pipe(header(fontBanner, { pkg : pkg } ))
    .pipe(gulp.dest(app_paths.iconFontIn + 'generated/'));
});

// 6. Copy finished font to public folder
gulp.task('copyFont', function () {
  return gulp.src([app_paths.iconFontIn + 'generated/**/*.*', '!' + app_paths.iconFontIn + 'generated/**/*.scss', app_paths.iconFontIn + '.htaccess'])
    .pipe(gulp.dest(app_paths.iconFontOut));
});

// Final build - Icon font
gulp.task('buildFont', function () {
  runSequence('cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconsGuide', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'copyFont');
});
