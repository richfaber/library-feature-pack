'use strict';

import { information, config } from './information';
import gulp from 'gulp';
import requireDir from 'require-dir';
import runSeq from "run-sequence";

global.version = information.version;
global.paths = config.paths;
global.env = config.env;

requireDir('./_gulp', { recurse: false });

gulp.task('default', done => {
    runSeq('watch', 'serve', done);
});
