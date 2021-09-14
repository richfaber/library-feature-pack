'use strict';

export const information = {
    version: {
        name: 'papaya.feature.pack',
        stable: 'v1.0',
        current: 'v1.0'
    },
    exportWord: 'papayafp',
    exportShort:'pfp'
};

export const config = {
    env: {
        server: 'app.js',
        port: '24500'
    },
    paths : {
        source: {
            dest: './_src',
            html: './_src/html',
            js: './_src/resource/js',
            sass: './_src/resource/sass',
            font: './_src/resource/font',
            image: './_src/resource/img'
        },
        runtime: {
            dest: './runtime',
            html: './runtime/html',
            css: './runtime/resource/css',
            js: './runtime/resource/js',
            font: './runtime/resource/font',
            image : './runtime/resource/img'
        },
        build: {
            dest : './product',
            html : './product/html',
            css: './product//resource/css',
            js: './product/resource/js',
            font: './product/resource/font',
            image : './product/resource/img'
        }
    }
};