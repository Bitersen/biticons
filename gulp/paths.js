'use strict';

// Paths
module.exports = {
  // Clean DIST folder
  clean: ['dist/**/*'],

  // BitIcons
  iconFontIn: "src/biticons/",
  iconFontFiles: ["src/biticons/**/*.svg", "!src/biticons/**/_*.svg", "src/styles/**/icons/*.svg", "!src/styles/**/icons/_*.svg", "!src/styles/**/_*/icons/*.svg"],
  iconFontTemplate: "src/biticons/template",
  iconFontOut: 'dist/biticons/'
};
