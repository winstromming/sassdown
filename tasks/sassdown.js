/*
 * sassdown
 * github.com/nopr/sassdown
 *
 * Copyright (c) 2013 Jesper Hills, contributors
 * Some rights reserved
 */
'use strict';

module.exports = function (grunt) {

    // Required libs
    var sassdown = require('./libs/sassdown').init(grunt);
    var helpers = require('./libs/helpers').init();

    // Main task
    grunt.registerMultiTask('sassdown', function() {

        // Task objects
        var plugin = {}, config = {};

        // Wrap anything from 'this' as 'config'
        // so we can access it later. It's our
        // storage object.
        config.cwd    = this.data.cwd;
        config.dest   = this.data.dest;
        config.opts   = this.options();
        config.files  = this.files;
        config.groups = {};
        config.module = module.filename;

        // Subtask: Template
        grunt.verbose.subhead('Compile the Handlebars template:');
        plugin.template = sassdown.template(config);
        plugin.includes = sassdown.includes(config);

        // Subtask: Files
        grunt.verbose.subhead('Read contents of source files:');
        plugin.files = sassdown.files(config);

        // Subtask: Scaffold, Groups, Assets
        grunt.verbose.subhead('Build styleguide structure:');
        plugin.scaffold = sassdown.scaffold(config);
        plugin.groups = sassdown.groups(config);
        plugin.assets = sassdown.assets(config);

        // Subtask: Indexing
        grunt.verbose.subhead('Generate index from Readme.md:');
        plugin.readme = sassdown.readme(config);

        // Subtask: Output
        grunt.verbose.subhead('Write styleguide copies of source files:');
        plugin.files.forEach(function(file){
            sassdown.output(config, file);
        });

    });

};
