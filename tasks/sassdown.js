/*
    sassdown
    github.com/nopr/sassdown
    ------------------------
    Copyright (c) 2013 Jesper Hills, contributors
    Some rights reserved
*/
'use strict';

module.exports = function (grunt) {

    // Handlebars helpers
    require('./libs/helpers').init();

    // Require the Sassdown module
    var Sassdown = require('./libs/sassdown');

    // Grunt-registered Task
    // =====================
    grunt.registerMultiTask('sassdown', function() {

        // Store configuration options
        Sassdown.config = {
            option: this.options({
                theme: null,
                assets: null,
                readme: null,
                template: null,
                excludeMissing: false,
                commentStart: /\/\*/,
                commentEnd: /\*\//
            }),
            files: this.files
        };

        // Subtask: Init (expose module and grunt)
        Sassdown.init(grunt);

        // Subtask: Scaffold, Template, Theme
        grunt.verbose.subhead('Generate the Handlebars template and theme:');
        Sassdown.scaffold();
        Sassdown.template();
        Sassdown.theme();

        // Subtask: Assets
        grunt.verbose.subhead('Read and create paths for included assets:');
        Sassdown.assets();

        // Subtask: Files
        grunt.verbose.subhead('Read and parse contents of source files:');
        Sassdown.files();

        // Subtask: Trees
        Sassdown.tree();

        // Subtask: Indexing
        grunt.verbose.subhead('Write styleguide index file:');
        Sassdown.readme();

        // Subtask: Output
        grunt.verbose.subhead('Write styleguide copies of source files:');
        Sassdown.output();

        // Finish: Notify user of completion
        grunt.verbose.or.ok('Styleguide created: ' + this.files[0].orig.dest);

    });

};
