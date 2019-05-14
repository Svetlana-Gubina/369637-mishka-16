"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var del= require('del');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("normalize", function () {
  return gulp.src("source/css/normalize.css")
    .pipe(csso())
    .pipe(rename('normalize.min.css'))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
  .pipe(posthtml([
      include()
  ]))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html','refresh'));
  gulp.watch("source/*.html", gulp.series('html','refresh'));
});

gulp.task('refresh', function(done) {
server.reload();
done();
});

gulp.task('images', function() {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo({
          plugins: [
              {cleanupIDs: false}
          ]
      })
  ]))
  .pipe(gulp.dest('build/img'));
  });

  gulp.task('webp', function() {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(rename({
    extname: ".webp"
  }))
  .pipe(gulp.dest('build/img'));
  });

  gulp.task('sprite', function () {
  return gulp.src('source/img/icon-*.svg')
  .pipe(svgstore({
      inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
  });

  gulp.task('compress', function () {
    return pipeline(
          gulp.src('source/js/**/*.js'),
          uglify(),
          rename({
            suffix: ".min",
            extname: ".js"
          }),
          gulp.dest('build/js')
    );
  });

  var realFavicon = require ('gulp-real-favicon');
  var fs = require('fs');

  // File where the favicon markups are stored
  var FAVICON_DATA_FILE = 'faviconData.json';

  // Generate the icons. This task takes a few seconds to complete.
  // You should run it at least once to create the icons. Then,
  // you should run it whenever RealFaviconGenerator updates its
  // package (see the check-for-favicon-update task below).
  gulp.task('generate-favicon', function(done) {
  realFavicon.generateFavicon({
  masterPicture: 'build/img/htmlacademy.svg',
  dest: 'build/img',
  iconsPath: '/',
  design: {
  ios: {
  pictureAspect: 'noChange',
  assets: {
  ios6AndPriorIcons: false,
  ios7AndLaterIcons: false,
  precomposedIcons: false,
  declareOnlyDefaultIcon: true
  }
  },
  desktopBrowser: {},
  windows: {
  pictureAspect: 'noChange',
  backgroundColor: '#da532c',
  onConflict: 'override',
  assets: {
  windows80Ie10Tile: false,
  windows10Ie11EdgeTiles: {
  small: false,
  medium: true,
  big: false,
  rectangle: false
  }
  }
  },
  androidChrome: {
  pictureAspect: 'noChange',
  themeColor: '#ffffff',
  manifest: {
  display: 'standalone',
  orientation: 'notSet',
  onConflict: 'override',
  declared: true
  },
  assets: {
  legacyIcon: false,
  lowResolutionIcons: false
  }
  },
  safariPinnedTab: {
  pictureAspect: 'silhouette',
  themeColor: '#5bbad5'
  }
  },
  settings: {
  scalingAlgorithm: 'Mitchell',
  errorOnImageTooSmall: false,
  readmeFile: false,
  htmlCodeFile: false,
  usePathAsIs: false
  },
  markupFile: FAVICON_DATA_FILE
  }, function() {
  done();
  });
  });

  // Inject the favicon markups in your HTML pages. You should run
  // this task whenever you modify a page. You can keep this task
  // as is or refactor your existing HTML pipeline.
  gulp.task('inject-favicon-markups', function() {
  return gulp.src([ 'build//*.html' ])
  		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
  		.pipe(gulp.dest('build/'));
  });

  // Check for updates on RealFaviconGenerator (think: Apple has just
  // released a new Touch icon along with the latest version of iOS).
  // Run this task from time to time. Ideally, make it part of your
  // continuous integration system.
  gulp.task('check-for-favicon-update', function(done) {
  	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  	realFavicon.checkForUpdates(currentVersion, function(err) {
  		if (err) {
  			throw err;
  		}
  	});
  });

  gulp.task('copy', function() {
    return gulp.src([
        'source/fonts/**/*.{woff,woff2}',
        'source/img/**',
        'source/js/**',
        'source/*.ico'
    ], {
        base: 'source'
    })
    .pipe(gulp.dest('build'));
  });

  gulp.task('clean', function() {
    return del('build');
  });

  gulp.task('build', gulp.series(
    'clean',
    'copy',
    'css',
    "normalize",
    'sprite',
    'compress',
    'images',
    'webp',
    'html',
    'generate-favicon',
    'inject-favicon-markups'
  ));

  gulp.task('start', gulp.series('build', 'server'));
