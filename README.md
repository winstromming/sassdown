# sassdown

> Generates a documentation styleguide from Markdown comments in sass/scss directories using Handlebars

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install sassdown --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('sassdown');
```

## The "sassdown" task

I have created an [example boilerplate](https://github.com/nopr/grunt-sass-boilerplate) using sassdown, if the below isn't particularly clear.

### Overview
In your project's Gruntfile, add a section named `sassdown` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  sassdown: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.template_html
Type: `String`
Default value: `null`

*Optional*. A relative path to a Handlebars (.hbs) file. Styleguide is generated from this. If unspecified, Sassdown will use its own.

#### options.template_assets
Type: `String`
Default value: `null`

*Optional*. A relative path to a directory containing any asset files used by the styleguide template. If unspecified, Sassdown will use its own.

#### options.css_output
Type: `String`
Default value: `null`

*Optional*. A relative path to a CSS file. Used to style the code block results. This would normally be the compiled sass you are documenting.

### Usage Examples

#### Simple
```js
sassdown: {
    options: {
        css_output: 'build/assets/style.css'
    },
    files: {
        expand: true,
        cwd: 'src/sass',
        src: ['*.scss'],
        dest: 'build/guide/'
    }
}
```

#### Default Options
In this example we have placed our styleguide template files (template.hbs and /assets/) in the *src/* directory. Our SASS compiles from *src/sass/* into *build/assets/*.

Our files object will search for anything matching `'**/*.scss'` in the `cwd` folder. This would normally *not* include the file with all your `@import` statements.

Our styleguide will be written into the *build/guide/* directory.

```js
sassdown: {
    options: {
        template_assets: 'src/assets',
        template_html: 'src/template.hbs',
        css_output: 'build/assets/css/style.css'
    },
    files: {
        expand: true,
        cwd: 'src/sass/partials',
        src: ['**/*.scss'],
        dest: 'build/guide/'
    }
}
```

## Markdown

Sassdown uses [Markdown](https://github.com/evilstreak/markdown-js) to parse any block comments in your SASS files. From these, it generates the text content in the styleguide. Any indented code blocks will be rendered as HTML source-result pairs.

### Example (_alerts.scss)

Here is an example of what a .scss file may look like with a Markdown comment block. Notice the indented HTML example.

```scss
/*

Alerts
======

Creates an alert box notification using the `.alert-` prefix. The following options are available:

    <div class="alert-success">Success</div> 
    <div class="alert-warning">Warning</div> 
    <div class="alert-error">Error</div>

*/
@mixin alert($colour){
    color: darken($colour, 50%);
    background: $colour;
    border-radius: 5px;
    margin-bottom: 1em;
    padding: 1em;
}

.alert-success { @include alert(#e2f3c1) }
.alert-warning { @include alert(#fceabe) }
.alert-error   { @include alert(#ffdcdc) }
```

## Compass? Sass?
Sassdown **does not** compile your .sass or .scss files. Since you're using Grunt, I would recommend the [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass) plugin for this task.

## TODO

- Confirm and adjust for .sass rather than .scss support?
- TEST TEST TEST
