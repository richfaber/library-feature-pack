'use strict';

import gulp from 'gulp';
import gutil from 'gutil';
import glob from 'glob';
import es from 'event-stream';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import errorify from 'errorify';

const crumbs = {
    browserify : {
        option: {
            debug:true,
            transform: [babelify.configure({
                presets: ['es2015']
            })]
            
        },
        handleError: error => {
            gutil.log(error.toString());
            this.emit('end');
        }
    }
};

gulp.task('script:featurePack', () => {

    return browserify( Object.assign({
            entries: `${global.paths.source.js}/${global.version.name}.js`
        }, crumbs.browserify.option) ).plugin(errorify)
        .bundle()
        .pipe( source(`${global.paths.source.js}/${global.version.name}.js`) )
        .pipe( buffer() )
        .pipe( sourcemaps.init({ loadMaps: true }) )
        .pipe( concat(`${global.version.name}.js`) )
        .pipe( sourcemaps.write('./') )
        .pipe( gulp.dest(global.paths.runtime.js) );

});

gulp.task('script:custom', (done) => {

    glob(`${global.paths.source.js}/*.js`, { ignore: [`${global.paths.source.js}/${global.version.name}.**.js`] }, function(err, files) {
        if(err) done(err);

        let tasks = files.map( entry => {
            let concatFilename = entry.split('/');
            concatFilename = concatFilename[concatFilename.length-1];

            return browserify( Object.assign({
                    entries: [entry]
                }, crumbs.browserify.option) ).plugin(errorify)
                .bundle()
                .pipe( source(entry) )
                .pipe( buffer() )
                .pipe( sourcemaps.init({ loadMaps: true }) )
                .pipe( concat(concatFilename) )
                .pipe( sourcemaps.write('./') )
                .pipe( gulp.dest(global.paths.runtime.js) );
        });
        es.merge(tasks).on('end', done);
    });

});

gulp.task('script', ['script:featurePack', 'script:custom']);

gulp.task('script:dist', (done) => {

    glob(`${global.paths.source.js}/**.js`, function(err, files) {
        if(err) done(err);

        var tasks = files.map(entry => {
            let concatFilename = entry.split('/');
            concatFilename = concatFilename[concatFilename.length-1];

            return browserify( Object.assign({
                    entries: [entry]
                }, crumbs.browserify.option) ).plugin(errorify)
                .bundle()
                .pipe( source(entry) )
                .pipe( buffer() )
                .pipe( concat(concatFilename) )
                .pipe( uglify() )
                .pipe( rename({
                    suffix: '.min'
                }) )
                .pipe( gulp.dest(global.paths.build.js) );
        });
        es.merge(tasks).on('end', done);
    });

});
