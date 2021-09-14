'use strict';

import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cssNano from 'gulp-cssnano';
import rename from 'gulp-rename';
import gutil from 'gulp-util';
import livereload from 'gulp-livereload';

const crumbs = {
    sass: {
        errorHandle: error => {
            gutil.log(error.toString());
            if(this) this.emit('end');
        }
    }
}

gulp.task('font', () => {

    gulp.src( `${global.paths.source.font}/**/*`  )
        .pipe(gulp.dest(global.paths.runtime.font));

});

gulp.task('font:dist', () => {

    gulp.src( `${global.paths.source.font}/**/*`  )
        .pipe(gulp.dest(global.paths.build.font));

});

gulp.task('sass', () => {
    gulp.src( `${global.paths.source.sass}/*.scss` )
        .pipe( sourcemaps.init() )
        .pipe(sass()).on('error', crumbs.sass.errorHandle)
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(global.paths.runtime.css))
        .pipe(livereload());
});

// compile SASS (excludes sourcemaps)
gulp.task('sass:dist', () => {
    gulp.src( `${global.paths.source.sass}/*.scss` )
        .pipe(sass()).on('error', crumbs.sass.errorHandle)
        .pipe(autoprefixer())
        .pipe(cssNano())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(global.paths.build.css));
});
