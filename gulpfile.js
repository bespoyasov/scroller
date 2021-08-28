const gulp = require('gulp'),

    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    csso = require('gulp-csso'),
    rename = require('gulp-rename'),

    browserify = require('browserify'),
    babelify = require('babelify');
    minify = require('gulp-minify'),
    jshint = require('gulp-jshint'),
    source = require('vinyl-source-stream'),

    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    fs = require('fs');

const { watch, series } = gulp;
const browsers = ['last 2 versions', 'ios 7'];


const styles = () => {
    const processors = [autoprefixer({browsers: browsers})];

    return gulp.src('./src/style.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('./build/'))
        .pipe(notify('Styles task completed'));
}

const scripts = () => {
    return browserify('src/scroller.js', {
        entries: ['src/scroller.js'],
        debug: true
    })
        .transform(babelify, {
            presets: ['es2015'],
            plugins: ['transform-class-properties']
        })
        .bundle()
        .pipe(source('scroller.js'))
        .pipe(gulp.dest('build/'))
        .pipe(notify('Scripts task completed'));
}

const styles_minify = () => {
    const processors = [autoprefixer({ browsers: browsers })];

    return gulp.src('./src/style.css')
        .pipe(postcss(processors))
        .pipe(csso())
        .pipe(rename('styles-min.css'))
        .pipe(gulp.dest('./build/'))
        .pipe(notify('Styles-minify task completed'));
}

const scripts_minify = () => {
    return gulp.src('build/scroller.js')
        .pipe(minify())
        .pipe(gulp.dest('build/'))
        .pipe(notify('Scripts-minify task completed'));
}

exports.default = series(styles, scripts, () => {
    watch('./src/**/*.css', styles);
    watch('./src/**/*.js', scripts);
})

exports.build = series(styles, scripts, styles_minify, scripts_minify);
