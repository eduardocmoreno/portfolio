//global
var browserSync    = require('browser-sync').create();
var gulp           = require('gulp');

//css
var autoprefixer   = require('gulp-autoprefixer');
var cleanCSS       = require('gulp-clean-css');
var sass           = require('gulp-sass');

//Log de erros
function logError (error) {
    console.log(error.toString());
    this.emit('end');
}

//SASS-CSS - development
gulp.task('sass:dev', function() {
    return gulp.src('docs/assets/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('docs/assets/css'))
    .pipe(browserSync.stream());
});

//SASS-CSS - distribution
gulp.task('sass:dist', function() {
    return gulp.src('docs/assets/scss/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('docs/assets/css'));
});

//Default task
gulp.task('default', function(){
    browserSync.init({
        server: "docs"
    });
    gulp.watch('docs/assets/scss/**/*.scss', ['sass:dev']);
    gulp.watch('**/*.html').on('change', browserSync.reload);
    return gulp.start('sass:dev');
});

//Dist task
gulp.task('dist', function(){
    return gulp.start('sass:dist');
});