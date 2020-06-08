const gulp = require('gulp')
const hash = require('gulp-hash');
const hash_references = require('gulp-hash-references');
const pug = require('gulp-pug');

function versionAssets() {
  return gulp.src(
    [
      'ui/js/**/*.js',
      'ui/css/**/*.css'
    ],
    { base: 'ui' }
  )
    .pipe(hash())
    .pipe(gulp.dest('dist')) // Save the renamed CSS files (e.g. style.123456.css)
    .pipe(hash.manifest('asset-manifest.json')) // Generate a manifest file
    .pipe(gulp.dest('build')); // Save the manifest file
}

function generateHtml() {
  return gulp.src('ui/pages/**/*.pug', { base: 'ui/pages' })
    .pipe(pug({ basedir: 'ui', data: { base_url: '' } }))
    .pipe(hash_references('build/asset-manifest.json'))
    .pipe(gulp.dest('dist'))
}

exports.default = gulp.series(versionAssets, generateHtml)
