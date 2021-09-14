'use strict';

import gulp from 'gulp';
import path from 'path';
import util from 'gulp-util';
import runSeq from 'run-sequence';
import livereload from 'gulp-livereload';

function logChanges(event) {
    if(event) {
        util.log(
            util.colors.green('File ' + event.type + ': ') +
            util.colors.magenta(path.basename(event.path))
        );
        if(this) this.emit('end');
    }
}

// Watch for changes.
gulp.task('watch', ['lint', 'script', 'sass', 'html', 'image', 'font'], () => {
    livereload.listen();
    gulp.watch([`${global.paths.source.html}/**/*.html`], ['html']).on('change', logChanges);

    gulp.watch([`${global.paths.source.js}/${global.version.name}.**.js`, `${global.paths.source.js}/${global.version.name}/**/*.js`], ['script:featurePack']).on('change', logChanges);
    gulp.watch([`${global.paths.source.js}/**/*.js`, `!${global.paths.source.js}/${global.version.name}.**.js`, `!${global.paths.source.js}/${global.version.name}/**/*.js`], ['script:custom']).on('change', logChanges);

    gulp.watch([`${global.paths.source.sass}/**/*.scss`], ['sass']).on('change', logChanges);
    gulp.watch([`${global.paths.source.font}/**`], ['font']).on('change', logChanges);
});
