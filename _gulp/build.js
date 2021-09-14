'use strict';

import gulp from 'gulp';
import runSeq from 'run-sequence';

gulp.task('build', done => {
    runSeq('clean', ['build:sass', 'build:image', 'build:js', 'build:html'], done);
});

// build SASS for distribution
gulp.task('build:sass', ['sass:dist', 'lint:sass']);

// build JS for distribution
gulp.task('build:js', ['script:dist', 'lint:js']);

// build HTML for distribution
gulp.task('build:html', ['html:dist']);

// build images for distribution
gulp.task('build:image', ['image:dist']);
