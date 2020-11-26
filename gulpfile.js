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
const yaml                 = require('js-yaml');
const fs                   = require('fs');
const data                 = require('gulp-data');

// ### nunjucks
gulp.task('render_markup', function () {
  return gulp.src(['./_markup/**/*.+(html|nunjucks)', '!./_markup/_layouts/*.+(html|nunjucks)', '!./_markup/_partials/*.+(html|nunjucks)'])
    .pipe(data(yaml.safeLoad(fs.readFileSync('./_data/content.yml', 'utf8'))))
    .pipe(nunjucks({
        path: ['./_markup/_layouts', './_markup/_partials']
      }))
    .pipe(gulp.dest('./_site'))
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
    file: './_site/assets/js/bundle.js',
    format: 'iife',
    sourcemap: false
  };

  if (argv.production) {
    opts.file = './_site/assets/js/bundle.min.js';
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

  return gulp.src(['./_sass/main.scss'])
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
    .pipe(rename({ basename: 'style' }))
    .pipe(gulpif(argv.production, rename({suffix: '.min'})))
    .pipe(gulp.dest('./_site/assets/css'))
    .pipe(connect.reload());
});

// ### JSHint
// `gulp jshint`
gulp.task('jshint', function() {
  return gulp.src(['./_scripts/**/*.js'])
    .pipe(jshint({
      "esversion": 10
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(connect.reload());
});

gulp.task('reload', function () {
  return gulp.src([
    './_site/**/*.html',
    './_site/assets/**/*.png',
    './_site/assets/**/*.jpg',
    './_site/assets/**/*.jpeg',
    './_site/assets/**/*.svg'])
    .pipe(connect.reload());
});

gulp.task('server', async function () {
  connect.server({
    root: '_site',
    port: 4040,
    livereload: true
  });
});

gulp.task('watch', async function () {
  gulp.watch(['./_sass/**/*.scss'], gulp.series('sass'));
  gulp.watch(['./_scripts/**/*.ts', './_scripts/**/*.js'], gulp.series('jshint', 'rollup'));
  gulp.watch(['./_markup/**/*.+(html|nunjucks)'], gulp.series('render_markup'));
  gulp.watch([
    './_site/assets/**/*.png',
    './_site/assets/**/*.jpg',
    './_site/assets/**/*.jpeg',
    './_site/assets/**/*.svg'
  ], gulp.series('reload'));
});

// ### Build
// `gulp build`
gulp.task('build', gulp.series('render_markup', 'rollup','sass'));

// ### Serve
// `gulp serve`
gulp.task('serve', gulp.series('render_markup', 'jshint', 'rollup', 'sass', 'server', 'watch'));

gulp.task('default', gulp.series('serve'));
