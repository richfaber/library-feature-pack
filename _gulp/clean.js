'use strict';

import gulp from 'gulp';
import del from 'del';

// clean the build dir
gulp.task('clean', () => {
    del([global.paths.build.dest, global.paths.runtime.dest]);
});
