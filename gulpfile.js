'use strict';

const argv                 = require('yargs').argv;
const gulp                 = require('gulp');
const gulpif               = require('gulp-if');
const connect              = require('gulp-connect');
const autoprefixer         = require('gulp-autoprefixer');
const sass                 = require('gulp-sass');
sass.compiler              = require('node-sass');
const cleanCSS             = require('gulp-clean-css');
const sourcemaps           = require('gulp-sourcemaps');
const rename               = require("gulp-rename");
const nunjucks             = require('gulp-nunjucks-render');
const rollup               = require('rollup');
const rollup_typescript    = require('@rollup/plugin-typescript');
const rollup_commonjs      = require('@rollup/plugin-commonjs');
const rollup_resolve       = require('@rollup/plugin-node-resolve');
const rollup_terser        = require('rollup-plugin-terser');
const jshint               = require('gulp-jshint');

// ### nunjucks
gulp.task('render_markup', function () {
  return gulp.src('./_markup/*.+(html|nunjucks)')
    .pipe(nunjucks({
        path: ['./_markup/layouts', './_markup/partials']
      }))
    .pipe(gulp.dest('./'))
    .pipe(connect.reload());
});

// ### Rollup
// `gulp rollup`
gulp.task('rollup', async function () {
  const bundle = await rollup.rollup({
    input: './_scripts/main.ts',
    context: 'window',
    plugins: [
      rollup_resolve.nodeResolve({
        main: false,
        mainFields: ['browser', 'module'],
        extensions: ['.js', '.ts'],
        customResolveoptsions: {
          package: {},
          moduleDirectory: ['node_modules']
        }
      }),
      rollup_typescript(),
      rollup_commonjs({
        include: 'node_modules/**'
      }),
      argv.production && rollup_terser.terser()
    ]
  });

  let opts = {
    file: './assets/js/bundle.js',
    format: 'iife',
    sourcemap: false
  };

  if (argv.production) {
    opts.file = './assets/js/bundle.min.js';
  }

  if (argv.sourcemap) {
    opts.sourcemap = true;
  }

  await bundle.write(opts);
});

// ### SASS
// `gulp sass`
gulp.task('sass', function () {
  let opts = {
    includePaths: ['node_modules', '_sass']
  };

/*
  if (argv.production) {
    opts.outputStyle = 'compressed';
    // unfortunately it appears that node-sass 's opts outFile and sourceMap don't work in gulp-sass context :(
    // it's such a shame to have to use minify-css and gulp-rename
  }
*/

  return gulp.src(['./_sass/style.scss'])
    .pipe(sass(opts).on('error', sass.logError))
    .pipe(autoprefixer(
      [
        'last 2 version',
        'safari 5',
        'ie 11',
        'ff 17',
        'opera 12.1',
        'ios 6',
        'android 4'
      ]
    ))
    .pipe(gulpif(argv.sourcemap, sourcemaps.init()))
    .pipe(gulpif(argv.production, cleanCSS()))
    .pipe(gulpif(argv.sourcemap, sourcemaps.write()))
    .pipe(gulpif(argv.production, rename({suffix: '.min'})))
    .pipe(gulp.dest('./assets/css'))
    .pipe(connect.reload());
});

// ### JSHint
// `gulp jshint`
gulp.task('jshint', function() {
  return gulp.src(['./_scripts/**/*.js'])
    .pipe(jshint({
      "esversion": 6
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(connect.reload());
});

gulp.task('reload', function () {
  return gulp.src([
    '*.html',
    './assets/**/*.png',
    './assets/**/*.jpg',
    './assets/**/*.jpeg',
    './assets/**/*.svg'])
    .pipe(connect.reload());
});

gulp.task('serve', async function () {
  connect.server({
    port: 4040,
    livereload: true
  });
});

gulp.task('watch', async function () {
  gulp.watch(['./_sass/**/*.scss'], gulp.series('sass'));
  gulp.watch(['./_scripts/**/*.ts', './_scripts/**/*.js'], gulp.series('jshint', 'rollup'));
  gulp.watch(['./_markup/**/*.+(html|nunjucks)'], gulp.series('render_markup'));
  gulp.watch([
    './assets/**/*.png',
    './assets/**/*.jpg',
    './assets/**/*.jpeg',
    './assets/**/*.svg'
  ], gulp.series('reload'));
});

// ### Build
// `gulp build`
gulp.task('build', gulp.series('render_markup', 'rollup','sass'));

// `gulp`
gulp.task('default', gulp.series('render_markup', 'jshint', 'rollup', 'sass', 'serve', 'watch'));
