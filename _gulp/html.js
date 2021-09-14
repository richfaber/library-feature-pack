'use strict';

import gulp from 'gulp';
import replace from "gulp-replace";
import htmlMin from "gulp-htmlmin";

gulp.task('html', () => {

    gulp.src( global.paths.source.html + '/**/*.html' )
        .pipe( htmlMin({ collapseWhitespace: true }) )
        .pipe( gulp.dest(global.paths.runtime.html) );

});

gulp.task('html:dist', () => {

    gulp.src( global.paths.source.html + '/**/*.html' )
        .pipe( replace('/resource/css/style.css', '/resource/css/style.min.css') )
        .pipe( replace(/(\/resource\/js.*js)/g, match => match.replace(/.js$/g, '.min.js') ) )
        .pipe( htmlMin({ collapseWhitespace: true }) )
        .pipe( gulp.dest(global.paths.build.html) );

});

