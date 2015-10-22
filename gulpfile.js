var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    streamify = require('gulp-streamify'),
    del = require('del'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    source = require('vinyl-source-stream'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    uglify = require('gulp-uglify');

var production = process.env.NODE_ENV === 'production';

var dependencies = [
    'alt',
    'axios',
    'react',
    'react-router'
];

// Cleans the dist folder
gulp.task('clean', function (callback) {
    del(['public/js/*.js', 'public/css/*.css'], callback);
});

// Concatenate external libraries
gulp.task('vendor', function () {
    return gulp.src([
        'app/vendor/*.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulpif(production, uglify({mangle: false})))
    .pipe(gulp.dest('public/js'));
});

// Browserify dependencies
gulp.task('browserify-vendor', function () {
    return browserify()
    .require(dependencies)
    .bundle()
    .pipe(source('vendor.bundle.js'))
    .pipe(gulpif(production, streamify(uglify({mangle: false}))))
    .pipe(gulp.dest('public/js'));
});

// Browserify project files including dependencies
gulp.task('browserify', ['browserify-vendor'], function () {
    return browserify('app/main.js')
    .external(dependencies)
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulpif(production, streamify(uglify({mangle: false}))))
    .pipe(gulp.dest('public/js'));
});

// Browserify and watch for changes
gulp.task('browserify-watch', ['browserify-vendor'], function () {
    var bundler = watchify(browserify('app/main.js', watchify.args));
    bundler.external(dependencies);
    bundler.transform(babelify);
    bundler.on('update', rebundle);
    return rebundle();

    function rebundle() {
        var start = Date.now();
        return bundler.bundle()
        .on('error', function (err) {
            gutil.log(gutil.colors.red(err.toString()));
        })
        .on('end', function () {
            gutil.log(gutil.colors.green('Finished rebundling in', (Date.now() - start) + 'ms.'));
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('public/js/'));
    }
});

// Compile SCSS stylesheets
gulp.task('styles', function () {
    return gulp.src([
        'app/stylesheets/**/*.scss'
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(production, sass({outputStyle: 'compressed'})))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function () {
    gulp.watch('app/stylesheets/**/*.scss', ['styles']);
});

gulp.task('default', ['clean', 'styles', 'vendor', 'browserify-watch', 'watch']);
gulp.task('build', ['clean', 'styles', 'vendor', 'browserify']);
