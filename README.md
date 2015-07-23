# sassdown

> Generate living, modular styleguides with Handlebars from Markdown comments in CSS, SASS and LESS files.

**Note: feature/1.0.0 is not production-ready**

## Getting started

This feature branch is not deployed to `npm` yet, so you will need to clone the repository:

```
$ git clone https://github.com/nopr/sassdown.git
$ cd sassdown/
$ git checkout feature/1.0.0
```

Then install the dependencies:

```
$ npm install
```

## Usage

*Sassdown* can be called through a native `node` method, as a [Grunt](http://gruntjs.com/) plugin, or as a [gulp](http://gulpjs.com/) plugin using [streams](https://nodejs.org/api/stream.html).

### Grunt

```
grunt.loadTasks('./path/to/sassdown')

grunt.initConfig({
  sassdown: {
    options: {
      template: './your-template.hbs',
      assets: ['./css/style.css', './js/script.js']
    },
    files: {
      src: './src/sass/*',
      dest: './styleguide/'
    }
  }
})

grunt.registerTask('default', ['sassdown'])
```

### Gulp

```
var sassdown = require('./path/to/sassdown')

sassdown.set('options', {
  template: './your-template.hbs',
  assets: ['./css/style.css', './js/script.js']
})

gulp.task('sassdown', function() {
  return gulp.src('./src/sass/*')
    .pipe(sassdown('stream'))
    .pipe(gulp.dest('./styleguide'))
})

gulp.task('default', ['sassdown'])
```

### Node

```
var sassdown = require('./path/to/sassdown')

sassdown.set('options', {
  template: './your-template.hbs',
  assets: ['./css/style.css', './js/script.js']
})
sassdown.set('dest', './styleguide/')
sassdown.set('src', './src/sass/*')

// Create an array of File Buffers
sassdown.build('directory')
// Write to destination
sassdown.output()
```

## Tests

*Run all tests:* `$ npm run test`
*Run gulp tests:* `$ npm run gulp`
*Run grunt tests:* `$ npm run grunt`

*Cleanup:* `$ npm run clean`
Removes the output destination directory from running the tests.

