var { src, dest, lastRun, watch, series, parallel } = require('gulp');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
// var changed = require('gulp-change'); // 用于一对一输出
var newer = require('gulp-newer'); // 用于多对一输出
var cached = require('gulp-cached');
var remember = require('gulp-remember');

var del = require('del');

function deletePaths() {
  return del(['dist/js/**', 'dist/css/**', 'dist/img/**']);
}

function minJs() { // js处理
  return src(['src/js/**/*.js', '!src/js/**/*.min*'],
    {
      soucremaps: true,
      since: lastRun(minJs)
    })
    .pipe(cached('minJsing')) // 缓存
    .pipe(uglify()) // 压缩
    .pipe(rename({
      suffix: '.min' // 后缀
    }))
    .pipe(remember('minJsing')) // 记录缓存
    .pipe(dest('dist/js', { sourcemaps: true})) // 输出
    .pipe(connect.reload());
}

function minCss() { // css处理
  return src('src/css/**/*.scss',
    {
      soucremaps: true,
      since: lastRun(minCss)
    })
    .pipe(newer('dist/css/main.min.css'))
    .pipe(cached('minCssing'))
    .pipe(sass())
    .pipe(concat('main.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: [
        'Android 4.1',
        'iOS 7.1',
        'Chrome > 31',
        'ff > 31',
        'ie >= 8'
      ],
      cascade: false
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8' // 兼容ie8
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(remember('minCssing'))
    .pipe(dest('dist/css'))
    .pipe(connect.reload());
}

function minImg() {
  return src(['src/img/*', '!src/img/*.min*'])
    .pipe(cached('minImging'))
    .pipe(
      imagemin({
        optimizationLevel: 8,
        progressive: true
      })
    )
    .pipe(rename({
      suffix: '.min' // 后缀
    }))
    .pipe(dest('dist/img'))
    .pipe(connect.reload());
}

function connectServer() {
  connect.server({
    port: 8888,
    livereload: true // 开启实时刷新
  });
}

function watcher() {
  watch(['src/**', 'index.html'], parallel(minJs, minCss, minImg));
}

exports.default = parallel(deletePaths, series(minJs, minCss, minImg));
exports.watcher = parallel(connectServer, watcher);
