'use strict';

import gulp from 'gulp';
import cache from 'gulp-cached';
import eslint from 'gulp-eslint';
import sassLint from 'gulp-sass-lint';
import plumber from 'gulp-plumber';

gulp.task('lint', ['lint:js', 'lint:sass']);

gulp.task('lint:js', () => {
    return gulp.src(`${global.paths.source.js}/**/*.js`)
        .pipe(plumber())
        .pipe(cache('lint:js'))
        .pipe(eslint().on('error', function(error) {
            gutil.log(error.toString());
            this.emit('end');
        }))
        .pipe(eslint.format());
});

gulp.task('lint:sass', () => {
    return gulp.src( `${global.paths.source.sass}/**/*.scss` )
        .pipe(plumber())
        .pipe(cache('lint:sass'))
        .pipe(sassLint().on('error', function(error) {
            gutil.log(error.toString());
            this.emit('end');
        }))
        .pipe(sassLint.format());
});
