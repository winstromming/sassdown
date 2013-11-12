/*
* sassdown
* github.com/nopr/sassdown
*
* Copyright (c) 2013 Jesper Hills, contributors
* Some rights reserved
*/

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            example: ['test/example/styleguide/', 'test/example/assets/sass/readme.md'],
        },

        // Configuration to be run (and then tested).
        sassdown: {
            options: {
            //     template_assets: 'source/styleguide/',
            //     template_html: 'source/styleguide.hbs',
            //     includes: 'source/site_includes.hbs'
            },
            files: {
                expand: true,
                cwd: 'test/example/assets/sass/partials',
                src: ['**/*.{scss,sass}'],
                dest: 'test/example/styleguide/'
            }
        },

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'jshint', 'sassdown']);

};
