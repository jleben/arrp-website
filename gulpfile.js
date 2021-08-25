const gulp = require('gulp')
const hash = require('gulp-hash');
const hash_references = require('gulp-hash-references');
const pug = require('gulp-pug');
const del = require('delete');

const build_dir = 'build';
const dist_dir = 'public';

function cleanDist(cb) {
  del([dist_dir], cb)
}

function versionAssets() {
  return gulp.src(
    [
      'ui/js/**/*.js',
      'ui/css/**/*.css'
    ],
    { base: 'ui' }
  )
    .pipe(hash())
    .pipe(gulp.dest(dist_dir))
    .pipe(hash.manifest('asset-manifest.json'))
    .pipe(gulp.dest(build_dir));
}

function generateHtml() {
  return gulp.src(['ui/pages/**/*.pug', '!ui/pages/**/*.template.pug'], { base: 'ui/pages' })
    .pipe(pug({ basedir: 'ui', data: { base_url: '' } }))
    .pipe(hash_references('build/asset-manifest.json'))
    .pipe(gulp.dest(dist_dir))
}

exports.default = gulp.series(cleanDist, versionAssets, generateHtml)
