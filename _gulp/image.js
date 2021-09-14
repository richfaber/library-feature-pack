'use strict';

import gulp from 'gulp';
import imagemin from "gulp-imagemin";
import pngquant from "imagemin-pngquant";

gulp.task('image', () => {

    gulp.src( global.paths.source.image + '/**/*')
        .pipe( imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }) )
        .pipe( gulp.dest(global.paths.runtime.image) );
});

gulp.task('image:dist', () => {

    gulp.src( global.paths.source.image + '/**/*')
        .pipe( imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }) )
        .pipe( gulp.dest(global.paths.build.image) );
});
