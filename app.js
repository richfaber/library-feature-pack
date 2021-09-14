'use strict';

const express = require('express');

let app = express();

if(process.env.NODE_ENV == 'development') {
    app.use( express.static(process.argv[3]) );
    app.use( express.static(process.argv[4]) );
    app.use( require('connect-livereload')() );

    app.listen(process.argv[2], () => {
        console.log(`Running CAFE24 Feature Package on localhost:${process.argv[2]}`);
    });
}

module.exports = app;
