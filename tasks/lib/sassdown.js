/*
 * sassdown
 * github.com/nopr/sassdown
 *
 * Copyright (c) 2013 Jesper Hills, contributors
 * Some rights reserved
 */
'use strict';

exports.init = function (grunt) {

    var fs = require('fs');
    var path = require('path');
    var Markdown = require('markdown').markdown;
    var Handlebars = require('handlebars');

    var exports = {};

    exports.template = function (config) {
        // Throw fails if checks return false
        if (!config.opts.template_html){ grunt.fail.warn('Could not find a Handlebars template file!') }
        if (!config.opts.template_assets) { grunt.fail.warn('Could not find a Handlebars assets folder!') }
        // Return config.template object
        config.template = {
            html: Handlebars.compile(grunt.file.read(config.opts.template_html)),
            assets: config.opts.template_assets
        };
        return config.template;
    };

    exports.scaffold = function (config) {
        // Create the destination directory
        grunt.file.mkdir(path.resolve(config.dest));
        grunt.log.write('Created '.green).writeln(config.dest);
        // Resolve the relative 'root' of the cwd
        // as we'll need this later
        config.root = path.relative(path.dirname(), path.resolve(config.cwd, '..'));
    };

    exports.assets = function (config) {
        // Do we have an assets directory set?
        if (config.opts.template_assets) {
            grunt.verbose.subhead('Copy over styleguide assets:');
            // Create the assets directory
            grunt.file.mkdir(path.relative(path.dirname(), path.resolve(config.dest, 'assets')));
            grunt.verbose.write('Created '.green).writeln(config.dest+'assets/');
            // Read the entire assets directory
            var assets = fs.readdirSync(path.relative(path.dirname(), path.resolve(config.opts.template_assets)));
            assets.forEach(function(file){
                // Copy each file from assets/file to destination/assets/file
                grunt.file.copy(
                    path.relative(path.dirname(), path.resolve(config.opts.template_assets, file)),
                    path.relative(path.dirname(), path.resolve(config.dest, 'assets', file))
                );
            });
        }
    };

    exports.groups = function (config) {
        // Add file data into groups
        config.files.forEach(function(file){
            // Create if it doesn't exist
            if (!config.groups[file.group]) {
                config.groups[file.group] = {
                    name: file.group, pages: []
                };
            }
            // Push file data
            config.groups[file.group].pages.push({
                heading: file.heading,
                group: file.group,
                path: file.path
            });
        });
        for (var group in config.groups) {
            // Explain how this dir gets created automatically
            grunt.verbose.writeln('        '+config.dest+group+'/');
        }
        return config.groups;
    };

    exports.files = function (config) {
        // Modify attributes for each file
        config.files.forEach(function(file){       
            // Temporary references
            var pagepath  = path.relative(config.cwd, file.src[0]);
            var pagesrc   = grunt.file.read(file.src);
            var pagename  = pagesrc.match(/(.*)(?=\n==+)/g)
            // Add these ones to file
            // use node 'path' for consistent
            // file system resolving
            file.slug     = path.basename(pagepath, path.extname(pagepath));
            file.heading  = (pagename) ? pagename[0] : file.slug;
            file.group    = path.dirname(pagepath).split(path.sep)[0];
            file.path     = file.dest.replace(path.extname(pagepath), '.html');
            file.original = file.src[0];
            file.site     = {}; // gets filled later
            file.sections = pagesrc.match(/\/\*([\s\S]*?)\*\//g);
            // Getting rid of some object literal clutter
            delete file.orig;
            delete file.dest;
            delete file.src;
            // Throw any errors
            if (!file.sections || !file.heading) {
                exports.errors(file)
            }
            // Format the content sections
            if (file.sections) {
                exports.sections(file)
            };
        });
        // Return back
        return config.files;
    };

    exports.errors = function (file) {
        if (!file.sections) {
            // Couldn't find any sections
            grunt.verbose.warn("Comment missing");
            grunt.verbose.or.warn("Comment missing: "+file.original);
        }
        if (file.sections) {
            // Found sections
            grunt.verbose.ok("Comment found");
            if (!file.heading) {
                // Couldn't find a heading
                grunt.verbose.warn("Heading missing");
                grunt.verbose.or.warn("Heading missing: "+file.original);
            }
            if (file.heading) {
                // Found a heading
                grunt.verbose.ok("Heading found")
            }
        }
    };

    exports.sections = function (file) {
        // Loop through any sections (comments) in file
        file.sections.forEach(function(section, index){
            var output = {};
            // Remove CSS comment tags
            section = section.replace(/\/\*/, '');
            section = section.replace(/\*\//, '');
            // If four-spaced indents (code blocks) exist
            if (section.match('    ')) {
                section = section.replace('    ','[html]\n    ');
                output = {
                    id: Math.random().toString(36).substring(5),
                    comment: Markdown.toHTML(section.split('[html]')[0]),
                    source: Markdown.toHTML(section.split('[html]')[1]),
                    result: section.split('[html]')[1].replace(/    /g,'').replace(/(\r\n|\n|\r)/gm,'')
                };
            } else {
                // Without code, it's just a comment
                output.comment = Markdown.toHTML(section)
            }
            // Return to the file sections by index
            file.sections[index] = output;
        });
    };

    exports.readme = function (config) {
        // Resolve the relative path to readme
        var readme = path.relative(path.dirname(), path.resolve(config.root, 'readme.md'));
        // Readme.md not found, create it:
        if (!grunt.file.exists(readme)) {
            grunt.verbose.warn('Readme file not found');
            grunt.file.write(readme, 'Styleguide\n==========\n\nFill me with your delicious readme content\n');
            grunt.verbose.ok('Readme file created');
            grunt.verbose.or.ok('Readme created at: '+config.root+'/readme.md');
        }
        // Now that a Readme.md exists
        if (grunt.file.exists(readme)) {
            // Create a file object
            var file = {};
            // Fill it with data for an index
            file.slug     = 'index';
            file.heading  = 'Home';
            file.group    = '';
            file.path     = path.relative(path.dirname(), path.resolve(config.dest, 'index.html'));
            file.original = readme;
            file.site     = {};
            file.sections = [{
                comment: Markdown.toHTML(grunt.file.read(readme))
            }];
            // Output the file
            exports.output(config, file);
        }
    };

    exports.output = function (config, file) {
        // Site rather than page-specific data
        file.site.root   = config.dest;
        file.site.groups = config.groups;
        file.site.output = config.opts.css_output;
        file.site.assets = config.opts.template_assets;
        // Write out to path with grunt
        return grunt.file.write(
            file.path,
            config.template.html(file)
        );
    };

    return exports;

};