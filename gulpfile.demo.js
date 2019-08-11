var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat')
var rename = require('gulp-rename');
var sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');

gulp.task('minjs', async function() {
  gulp
    .src(['js/*.js', '!js/*.min*']) // 读取文件并排除min标识的压缩文件
    .pipe(connect.reload()) // 热更新
    .pipe(uglify()) // 压缩文件
    .pipe(rename({
      suffix: '.min'
    })) // 重命名
    .pipe(gulp.dest('js')); // 输出
});
// 编译sass 并合并压缩
gulp.task('mincss', async function() {
  gulp
    .src('css/main.scss') // 读取文件
    .pipe(connect.reload()) // 热更新
    .pipe(sass()) // 编辑sass
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
    .pipe(rename({ // 重命名
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'));
});
// 压缩img图片
gulp.task('minimg', async function() {
  gulp
    .src(['img/*', '!img/*.min*']) // 读取文件并排除min标识的压缩文件
    .pipe(connect.reload()) // 热更新
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(rename({
      suffix: '.min' // 重命名
    }))
    .pipe(gulp.dest('img'));
});

gulp.task('reloadhtml', async function() {
  gulp.src('./*.html')
    .pipe(connect.reload()); // 热更新
});

// 热更新
gulp.task('server', async function() {
  connect.server({
    livereload: true //实时刷新
  });
});

// 开启开发监视
gulp.task('watch', async function() {
  gulp.watch(['js/*.js', '!js/*.min*'], gulp.series('minjs'));
  gulp.watch(['css/*.scss', '!css/*.min*'], gulp.series('mincss'));
  gulp.watch(['img/*', '!img/*.min*'], gulp.series('minimg'));
  gulp.watch('./index.html', gulp.series('reloadhtml'));
});

// default 默认执行命令
gulp.task('default', gulp.parallel('minjs', 'mincss', 'minimg'));
// 开启服务
gulp.task('dev',
  gulp.series('server', gulp.parallel('watch'))
);
