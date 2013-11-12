/*
    sassdown
    github.com/nopr/sassdown
    ------------------------
    Copyright (c) 2013 Jesper Hills, contributors
    Some rights reserved
*/
'use strict';

// Required Node modules
// =====================
var grunt;
var fs = require('fs');
var path = require('path');
var Markdown = require('markdown').markdown;
var Handlebars = require('handlebars');

// Quick utility functions
// =======================
function gruntWarn (message) { return grunt.verbose.warn(message); }
function uncomment (comment) { return comment.replace(/\/\* | \*\/|\/\*|\*\//g, ''); }
function unindent  (comment) { return comment.replace(/\n \* |\n \*|\n /g, '\n').replace(/\n   /g, '\n    '); }
function fromroot  (resolve) { return path.relative(path.dirname(), resolve); }
function fromdata  (resolve) { return fromroot(path.resolve(module.filename, '..', '..', 'data', resolve)); }

// Exported methods
// ===========================
// - init
// - config
// - template
// - includes
// - scaffold
// - assets
// - groups
// - files
// - errors
// - sections
// - readme
// - output

exports.init = function (_grunt) {
    grunt = _grunt;
    return exports;
};

exports.config = function (self, module) {
    return {
        cwd: self.data.cwd,
        dest: self.data.dest,
        opts: self.options(),
        files: self.files,
        groups: {},
        module: module.filename
    };
};

exports.template = function (config) {
    // If option was left blank, use
    // the plugin default version
    if (!config.opts.template_html) { 
        gruntWarn('Template file not specified');
        config.opts.template_html = fromdata('template.hbs');
    }
    // Return config.template object
    config.template = {
        html: Handlebars.compile(grunt.file.read(config.opts.template_html)),
        assets: null
    };
    return config.template;
};

exports.includes = function (config) {
    // Check if we added includes option
    if (!config.opts.includes) {
        gruntWarn('Includes file not specified');
        config.opts.includes = fromroot(path.resolve(config.module, '..', 'data', 'partials', 'includes.hbs'));
    }
    // Register as partial
    Handlebars.registerPartial('includes', grunt.file.read(config.opts.includes));
};

exports.scaffold = function (config) {
    // Create the destination directory
    grunt.file.mkdir(path.resolve(config.dest));
    grunt.log.write('Created '.green).writeln(config.dest);
    // Resolve the relative 'root' of the cwd
    // as we will need this later
    config.root = fromroot(path.resolve(config.cwd, '..'));
};

exports.assets = function (config) {
    grunt.verbose.subhead('Copy over styleguide assets:');
    // If option was left blank, use
    // the plugin default version
    if (!config.opts.template_assets) {
        gruntWarn('Assets folder not specified');
        config.opts.template_assets = fromdata('assets');
    }
    // Do we have an assets directory set?
    if (config.opts.template_assets) {
        // Create the assets directory
        grunt.file.mkdir(fromroot(path.resolve(config.dest, 'assets')));
        grunt.verbose.write('Created '.green).writeln(config.dest+'assets/');
        // Read the entire assets directory
        var assets = fs.readdirSync(fromroot(path.resolve(config.opts.template_assets)));
        assets.forEach(function(file){
            // Copy each file from assets/file to destination/assets/file
            grunt.file.copy(
                fromroot(path.resolve(config.opts.template_assets, file)),
                fromroot(path.resolve(config.dest, 'assets', file))
            );
        });
    }
};

exports.groups = function (config) {
    // Add file data into groups
    config.files.forEach(function(file){
        // Create if it does not exist
        if (!config.groups[file.group]) {
            config.groups[file.group] = {
                name: file.group,
                pages: []
            };
        }
        // Push file data
        config.groups[file.group].pages.push({
            heading: file.heading,
            group: file.group,
            path: file.path
        });
    });
    for (var i=0; i<config.groups.length; i++) {
        // Explain how this dir gets created automatically
        grunt.verbose.writeln('        '+config.dest+config.groups[i]+'/');
    }
    return config.groups;
};

exports.files = function (config) {
    // Modify attributes for each file
    config.files.forEach(function(file){
        // Temporary references
        var pagepath  = path.relative(config.cwd, file.src[0]);
        var pagesrc   = grunt.file.read(file.src);
        var pagename  = (Markdown.toHTML(unindent(uncomment(pagesrc))).match('<h1>')) ? Markdown.toHTML(unindent(uncomment(pagesrc))).split('<h1>')[1].split('</h1>')[0] : null;
        // Add properties to file and use node path
        // for consistent file system resolving
        file.slug     = path.basename(pagepath, path.extname(pagepath));
        file.heading  = (pagename) ? pagename : file.slug;
        file.group    = path.dirname(pagepath).split(path.sep)[0];
        file.path     = file.dest.replace(path.extname(pagepath), '.html');
        file.original = file.src[0];
        file.site     = {};
        file.sections = pagesrc.match(/\/\*([\s\S]*?)\*\//g);
        // Getting rid of some object literal clutter
        delete file.orig;
        delete file.dest;
        delete file.src;
        // Throw any errors
        if (!file.sections || !file.heading) {
            exports.errors(file);
        }
        // Format the content sections
        if (file.sections) {
            exports.sections(file);
        }
    });
    // Return back
    return config.files;
};

exports.errors = function (file) {
    if (!file.sections) {
        // Could not find any sections
        gruntWarn('Comment missing');
        grunt.verbose.or.warn('Comment missing: '+file.original);
    }
    if (file.sections) {
        // Found sections
        grunt.verbose.ok('Comment found');
        if (!file.heading) {
            // Could not find a heading
            gruntWarn('Heading missing');
            grunt.verbose.or.warn('Heading missing: '+file.original);
        }
        if (file.heading) {
            // Found a heading
            grunt.verbose.ok('Heading found');
        }
    }
};

exports.sections = function (file) {
    // Loop through any sections (comments) in file
    file.sections.forEach(function(section, index){
        // Remove CSS comment tags and
        // any SASS-style comment block
        // indentation
        section = uncomment(section);
        section = unindent(section);
        // If previously four-spaced indents (code blocks) exist
        if (section.match('    ')) {
            section = section.replace('    ','[html]\n    ');
            // Return our sections object
            file.sections[index] = {
                id: Math.random().toString(36).substr(2,5),
                comment: Markdown.toHTML(section.split('[html]')[0]),
                source: Markdown.toHTML(section.split('[html]')[1]),
                result: section.split('[html]')[1].replace(/    /g,'').replace(/(\r\n|\n|\r)/gm,'')
            };
        } else {
            // Without code, it is just a comment
            file.sections[index] = {
                comment: Markdown.toHTML(section)
            };
        }
    });
};

exports.readme = function (config) {
    // Resolve the relative path to readme
    var readme = fromroot(path.resolve(config.root, 'readme.md'));
    // Readme.md not found, create it:
    if (!grunt.file.exists(readme)) {
        gruntWarn('Readme file not found');
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
        file.path     = fromroot(path.resolve(config.dest, 'index.html'));
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
    file.site.assets = '/'+config.dest+'assets';
    // Write out to path with grunt
    return grunt.file.write(
        file.path,
        config.template.html(file)
    );
};