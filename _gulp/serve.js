'use strict';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import open from 'open';

gulp.task('serve', cb => {
    let started = false,
        params = [global.env.port, global.paths.runtime.dest, global.paths.runtime.html];

    return nodemon({
        script: global.env.server,
        args: params,
        watch: [global.env.server],
        env: { 'NODE_ENV': 'development' }
    }).on('start', () => {
        open(`http://localhost:${global.env.port}`, "chrome");
        if (!started) {
            cb();
            started = true;
        }
    });

});
