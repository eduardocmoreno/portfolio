//global
var browserSync    = require('browser-sync').create();
var clean          = require('gulp-clean');
var filter         = require('gulp-filter');
var gulp           = require('gulp');
var rename         = require('gulp-rename');
var zip            = require('gulp-zip');

//css
var autoprefixer   = require('gulp-autoprefixer');
var cleanCSS       = require('gulp-clean-css');
var sass           = require('gulp-sass');

//js
var uglify         = require('gulp-uglify');

//bower
var bower          = require('bower');
var mainBowerFiles = require('gulp-main-bower-files');

//Log de erros
function logError (error) {
    console.log(error.toString());
    this.emit('end');
}

//Limpa os diretorios dos componentes do bower
gulp.task('bowerClean', function(){
    return gulp.src('docs/assets/components/*')
    .pipe(clean());
});

//Copia os arquivos bower para a pasta public
gulp.task('bower', ['bowerClean'], function(){
    return bower.commands.update().on('end', function(){
        var jsFilter = filter('**/*.js', {restore: true});
        var cssFilter = filter('**/*.css', {restore: true});

        gulp.src('bower.json')
        .pipe(mainBowerFiles())
        .pipe(jsFilter)
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('docs/assets/components'))
        .pipe(jsFilter.restore)

        .pipe(cssFilter)
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('docs/assets/components'));
    });
});

//JS - distribution
gulp.task('js:dist', function(){
    return gulp.src('docs/assets/js/**/*.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify({
        preserveComments: 'all'
    }))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//SASS-CSS - development
gulp.task('sass:dev', function() {
    return gulp.src('docs/assets/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('docs/assets/css'))
    .pipe(browserSync.stream());
});

//SASS-CSS - distribution
gulp.task('sass:dist', function() {
    return gulp.src('docs/assets/scss/styles.scss')
    .pipe(gulp.dest('dist'))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//Assets - distribution
gulp.task('assets:dist', function(){
    return gulp.src('docs/assets/images/loading.svg')
    .pipe(gulp.dest('dist'));
});

//Clean dist folder
gulp.task('clean:dist', function(){
    return gulp.src('dist')
    .pipe(clean());
});

//Default task
gulp.task('default', function(){
    browserSync.init({
        server: "docs"
    });
    gulp.watch('docs/assets/scss/**/*.scss', ['sass:dev']);
    gulp.watch(['**/*.html','docs/assets/js/**/*.js']).on('change', browserSync.reload);
});

//Dist task
gulp.task('dist', ['clean:dist'], function(){
    return gulp.start('sass:dist','js:dist','assets:dist');
});