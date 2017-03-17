var gulp = require('gulp'),

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



gulp.task('styles', function() {
	var processors = [autoprefixer({browsers: ['last 2 versions']})];

	return gulp.src('./dev/style.css')
		.pipe(postcss(processors))
    .pipe(gulp.dest('./build/'))
    .pipe(notify('Styles task completed'));
});



gulp.task('scripts', function() {

	browserify('dev/scroller.js', {entries: 'dev/scroller.js', debug: true})
		.transform(babelify, {
			presets: ['es2015'],
			plugins: ['transform-class-properties']
		})
		.bundle()
    .pipe(source('scroller.js'))
    .pipe(jshint())
    .pipe(gulp.dest('build/'))
		.pipe(notify('Scripts task completed'));
});



gulp.task('styles-minify', function() {

	var processors = [autoprefixer({browsers: ['last 2 versions']})];

	return gulp.src('./dev/style.css')
		.pipe(postcss(processors))
		.pipe(csso())
		.pipe(rename('styles-min.css'))
    .pipe(gulp.dest('./build/'))
    .pipe(notify('Styles-minify task completed'));
});



gulp.task('scripts-minify', function() {
	return gulp.src('build/scroller.js')
		.pipe(minify())
    .pipe(gulp.dest('build/js/'))
		.pipe(notify('Scripts-minify task completed'));
});



gulp.task('default', ['styles', 'scripts'], function(){
	gulp.watch('./dev/**/*.css', ['styles']);
	gulp.watch('./dev/**/*.js', ['scripts']);
});


gulp.task('build', ['styles-minify', 'scripts-minify']);
