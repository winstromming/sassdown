/*
    sassdown
    github.com/nopr/sassdown
    ------------------------
    Copyright (c) 2013 Jesper Hills, contributors
    Some rights reserved
*/
'use strict';

// Exposed global objects
// ======================
var Sassdown, grunt;

// Required Node modules
// =====================
var fs = require('fs');
var junk = require('junk');
var path = require('path');
var prism = require('./prism');
var cssmin = require('cssmin');
var markdown = require('marked');
var Handlebars = require('handlebars');

// Quick utility functions
// =======================
function warning   (message) { return grunt.verbose.warn(message); }
function normalize (comment) {
    comment = comment.replace(Sassdown.config.option.commentStart, '');
    comment = comment.replace(Sassdown.config.option.commentEnd, '');
    comment = comment.trim().replace(/^\*/, '').replace(/\n \* |\n \*|\n /g, '\n').replace(/\n   /g, '\n    ');
    if (comment.match('    ')) {
        comment = comment.replace(/    |```\n    /, '```\n    ');
        comment = comment.replace(/\n    /g, '\n').replace(/\n /g, '\n');
        comment += '\n```';
    }
    return comment;
}

// Exported Sassdown methods
// =========================
module.exports.init = function (_grunt) {
    grunt = _grunt;
    Sassdown = this;
};

module.exports.template = function () {
    // If option was left blank, use
    // the plugin default version
    if (!Sassdown.config.option.template) {
        warning('User template not specified. Using default.');
        Sassdown.config.option.template = path.resolve(path.dirname(), 'tasks', 'data', 'template.hbs');
    }
    // Return Sassdown.config.template object
    Sassdown.config.template = {
        html: Handlebars.compile(grunt.file.read(Sassdown.config.option.template)),
        assets: null
    };
};

module.exports.theme = function () {
    // If option is blank, use plugin default
    if (!Sassdown.config.option.theme) {
        warning('User stylesheet not specified. Using default.');
        Sassdown.config.option.theme = path.resolve(path.dirname(), 'tasks', 'data', 'theme.css');
    }
    // Assign theme and prism to respective Handlebars partials
    Handlebars.registerPartial('theme', '<style>'+cssmin(grunt.file.read(Sassdown.config.option.theme))+'</style>');
    //Handlebars.registerPartial('prism', '<script>'+grunt.file.read('prism.js')+'</script>');
};

module.exports.assets = function () {
    // Check if we added includes option
    if (!Sassdown.config.option.assets) {
        warning('User assets not specified. Styleguide will be unstyled!');
    } else {
        // Create empty array
        var file_list = [];
        // Expand through matches in options and include both
        // internal and external files into the array
        Sassdown.config.option.assets.forEach( function (asset) {
            grunt.file.expand(asset).forEach( function (file) {
                file_list.push(file);
                grunt.verbose.write(file+'...').ok();
            });
            if (asset.match('http://')) {
                file_list.push(asset);
                grunt.verbose.write(asset+'...').ok();
            }
        });
        // Insert as list of files as new assets object
        Sassdown.config.assets = file_list;
    }
};

module.exports.include = function (file, dest) {
    // Output
    var output;
    // If this file is not external, build a local relative path
    if (!file.match('http://')) { file = path.relative(dest, file) }
    // Write <link> or <script> tag to include it
    if (file.split('.').pop() === 'css') { output = '<link rel="stylesheet" href="'+file+'" />'; }
    if (file.split('.').pop() === 'js') { output = '<script src="'+file+'"><\\/script>'; }
    // Return
    return output;
};

module.exports.scaffold = function () {
    // Define a path to destination root
    Sassdown.config.root = Sassdown.config.files[0].orig.dest;
    // Create the destination directory
    grunt.file.mkdir(path.resolve(Sassdown.config.root));
};

module.exports.files = function () {
    // Pages object exposed
    Sassdown.pages = [];
    Sassdown.excluded = [];
    // Map files matched by Grunt task to Sassdown.pages
    Sassdown.config.files.forEach( function (file) {
        // Store file source within file
        file.data = grunt.file.read(file.src[0]);
        file.body = file.data.match(Sassdown.matching());
        //console.log(psrc[0]);
        // Store file data within a page
        var page = Sassdown.getData(file);
        // No matching data
        if (!file.body) {
            grunt.verbose.warn('Comment missing');
            grunt.verbose.or.warn('Comment missing: ' + file.src[0]);
            page.sections = null;
            // Check if we should be exluding this page now
            if (Sassdown.config.option.excludeMissing) {
                Sassdown.excluded.push(page.src);
                return false;
            }
        } else {
            // Found sections
            grunt.verbose.ok('Comment found');
            page.sections = Sassdown.getSections(file);
        }
        // No matching title
        if (!file.title) {
            grunt.verbose.warn('Heading missing');
            grunt.verbose.or.warn('Heading missing: ' + file.src[0]);
            page.title = page.slug;
        } else {
            grunt.verbose.ok('Heading found');
            page.title = file.title;
        }
        // Add to pages
        Sassdown.pages.push(page);
    });
};

module.exports.getData = function (file) {
    return {
        title: null,
        slug: path.basename(file.src, path.extname(file.src[0])),
        href: path.relative(Sassdown.config.root, file.dest.replace(path.extname(file.src[0]), '.html')),
        dest: file.dest.replace(path.extname(file.src[0]), '.html'),
        src: file.src[0]
    }
};

module.exports.getSections = function (file) {
    // Create sections
    return file.body.map( function (section) {
        // Output object
        var output  = {};
        // Remove comment tags, indentation and group
        // encapsulate blocks of HTML with ``` fences
        var content = normalize(section);
        // Unique ID
        output.id = Math.random().toString(36).substr(2,5);
        // If we find code blocks
        if (content.match(/```/)) {
            output.comment = markdown(content.split(/```/)[0]);
            output.markup  = markdown('```'+content.split(/```/)[1].split(/```/)[0]+'```');
            output.markup  = prism.highlight(output.markup, prism.languages.markup);
            output.result  = content.split(/```/)[1].replace(/(\r\n|\n|\r)/gm,'');
        } else {
            output.comment = markdown(content);
        }
        // Apply heading
        if (output.comment.match('</h1>')) {
            file.title = output.comment.split('</h1>')[0].split('>')[1];
        }
        // Output
        return output;
    });
};

module.exports.matching = function () {
    // Create a regular expression from our
    // comment start and comment end options
    var begin = Sassdown.config.option.commentStart.source;
    var end = Sassdown.config.option.commentEnd.source;
    // Return out a new RegExp object
    return new RegExp(begin+'([\\\s\\\S]*?)'+end, 'g');
};

module.exports.readme = function () {
    // Resolve the relative path to readme
    var readme = Sassdown.config.option.readme;

    if (typeof readme === 'string') {
        readme = grunt.config.process(readme);
    }
    if (readme === true) {
        // Readme.md not found, create it:
        readme = fromroot(path.resolve(Sassdown.config.root, 'readme.md'));
        if (!grunt.file.exists(readme)) {
            warning('Readme file not found. Create it.');
            grunt.file.write(readme, 'Styleguide\n==========\n\nFill me with your delicious readme content\n');
            grunt.verbose.or.ok('Readme file created: '+Sassdown.config.root+'/readme.md');
        }
    }

    // Create a file object
    var file = {};
    // Fill it with data for an index
    file.slug     = 'index';
    file.heading  = 'Home';
    file.group    = '';
    file.path     = fromroot(path.resolve(Sassdown.config.files[0].orig.dest, 'index.html'));
    file.site     = {};

    if (readme && grunt.file.isFile(readme)) {
        file.original = readme;
        file.sections = [{
            comment: markdown(grunt.file.read(readme))
        }];
        // Output the file
    } else {
        file.original = null;
        file.sections = [{
            comment: '<h1>Styleguide Index</h1>'
        }];
    }
    Sassdown.output(file);
};

module.exports.recurse = function (filepath) {
    // Match a directory or file name
    var match = fs.lstatSync(filepath);
    var filename = path.basename(filepath);
    // Let's make sure this match isn't a junk
    // file, such as .svn or .gitignore or .DS_Store
    if (junk.isnt(filename)) {
        // Tree node
        var tree = {};
        // If the filepath matches to a directory,
        // set the type and create a 'children' node
        // where we run the function again in order
        // to map any child pages
        if ( match.isDirectory() ) {
            // Tree node
            tree.name = filename;
            tree.is_directory = true;
            tree.pages = [];
            // Loop through directory and map child pages to tree node
            fs.readdirSync(filepath).map( function (child) {
                // Check this child isn't a junk file
                if (junk.isnt(child)) {
                    // Check whether this file should be included
                    if (Sassdown.excluded.indexOf(filepath+'/'+child) === -1) {
                        // Run the recurse function again for this child
                        // to determine whether it's a directory or file
                        // while pushing to pages array of parent
                        tree.pages.push(
                            Sassdown.recurse(filepath + '/' + child)
                        );
                    }
                }
            });
            // Don't display as a directory if
            // this tree node has no pages
            if (tree.pages.length === 0) {
                tree.is_directory = false;
            }
        }
        // If the filepath isn't a directory, try and grab
        // file data from the Sassdown.pages stack and
        // associate it. Ignore files that are not classed
        // as junk files (.gitignore, .svn, .DS_Store, thumbs.db, etc)
        if ( match.isFile() ) {
            // Loop through the Sassdown.pages
            Sassdown.pages.map( function (page) {
                // Check for a match to filepath
                if (filepath === page.src) { tree = page }
            });
        }
        // Return this tree node
        return tree;
    }
};

module.exports.tree = function () {
    // Set the Sassdown.config.tree to be the returned object
    // literal from the file directory recursion
    Sassdown.config.tree = Sassdown.recurse(Sassdown.config.files[0].orig.cwd);
    // We need to trim out any sections that have
    // no pages, such as folders with only excluded files
    //Sassdown.config.tree.map( function (iter) {
    //    console.log(iter);
    //});
    // Return the complete tree (without root)
    return Sassdown.config.tree.pages;
};

module.exports.output = function (file) {
    // Run through each page from before
    return Sassdown.pages.map( function (page) {
        // Generate an indivdual path to root for this file
        var local_root = path.relative(path.dirname(page.dest), Sassdown.config.root);
        // Generate asset string
        var local_assets = '';
        // Generate path to assets for this file
        Sassdown.config.assets.forEach( function (asset) {
            local_assets += Sassdown.include(asset, path.dirname(page.dest));
        });
        // Register two unique (local) partials
        Handlebars.registerPartial('root', local_root);
        Handlebars.registerPartial('assets', local_assets);
        // Write file with Grunt
        grunt.file.write(page.dest, Sassdown.config.template.html({
            'page': page,
            'pages': Sassdown.config.tree.pages
        }));
    });
};