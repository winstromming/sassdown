# sassdown

> Generates a documentation styleguide from Markdown comments in sass/scss directories using Handlebars

**Note: *This plugin is still in active development!* So expect it to be a little rough around the edges. If you have any questions, issues or suggestions please let me know.**

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

#### options.includes
Type: `String`
Default value: `null`

*Optional*. A relative path to a Handlebars (.hbs) partial file, containing includes to website assets such as the compiled CSS or javascript files.

### Usage Examples

#### Simple

```js
sassdown: {
    files: {
        expand: true,
        cwd: 'assets/sass',
        src: ['*.scss'],
        dest: 'public/styleguide/'
    }
}
```

#### Complicated (Gruntfile.js)

In this example we have explicitly specified a custom styleguide Handlebars `.hbs` template and includes file. Any assets required (for example, code highlighting for the styleguide) are placed in the folder specified by  `template_assets`.

```js
sassdown: {
    options: {
        template_assets: 'source/styleguide/',
        template_html: 'source/styleguide.hbs',
        includes: 'source/site_includes.hbs'
    },
    files: {
        expand: true,
        cwd: 'assets/sass/partials',
        src: ['**/*.scss'],
        dest: 'public/styleguide/'
    }
}
```

#### Complicated (site_includes.hbs)

If the  `includes` option is specified, the file would typically look like this. This gets inserted into the 'result' sections of the styleguide.

```html
<link rel="stylesheet" href="/public/assets/inuit.css" />
<link rel="stylesheet" href="/public/assets/screen.css" />
<script src="//use.typekit.net/example.js"></script>
<script>try{Typekit.load();}catch(e){}</script>
```

# Markdown

Sassdown uses [Markdown](https://github.com/evilstreak/markdown-js) to parse any block comments in your SASS files. From these, it generates the text content in the styleguide. Any indented code blocks will be rendered as HTML source-result pairs.

### Example (_alerts.scss)

Here is an example of what a .scss file may look like with a Markdown comment block. Notice the indented HTML example. You may use any Markdown-compatible [heading syntax](https://github.com/nopr/sassdown/issues/7) you like. You may use any common style of [block-comment syntax](https://github.com/nopr/sassdown/issues/12#issuecomment-28219982) you like. Use **four spaces** to indent code blocks.

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

# File Object

Sassdown parses through your files using Grunt and before compiling any Handlebars templates it generates a series of File objects. This object contains all data for the `.html` page that gets rendered.

Properties inside the File object can be accessed by the Handlebars template using `{{ helpers }}`. For example, the `heading` property is used in the default template like `<title>{{ heading }}</title>`.

```js
{
  slug: '_alerts',
  heading: 'Alerts',
  group: 'objects',
  path: 'public/styleguide/objects/_alerts.html',
  original: 'assets/sass/partials/objects/_alerts.scss',
  site: {
    root: 'styleguide/',
    groups: {
      modules: [Object],
      objects: [Object]
    },
    assets: '../../styleguide/assets/'
  },
  sections: [
    {
      id: 'cr3sor',
      comment: '<h1>Alerts</h1>\n<p>Creates an alert box notification using the <code>.alert-</code> prefix. The following options are available:</p>',
      source: '<pre><code>&lt;div class=&quot;alert-success&quot;&gt;Success&lt;/div&gt;\n&lt;div class=&quot;alert-warning&quot;&gt;Warning&lt;/div&gt;\n&lt;div class=&quot;alert-error&quot;&gt;Error&lt;/div&gt;</code></pre>',
      result: '<div class="alert-success">Success</div> <div class="alert-warning">Warning</div> <div class="alert-error">Error</div>'
    }
  ]
}
```

# Handlebars

[Handlebars](http://handlebarsjs.com/) is a semantic templating syntax. Put simply, it allows you to output dynamic properties in HTML using `{{  }}` from a variety of data sources such as JSON.

Sassdown uses Handlebars to output data from the File Objects it creates. Your `.hbs` file specified in the `template_html` option may contain code that looks like this for example:

```html
{{#each sections}}
    <div class="section">
        {{#if comment}}
            <div class="comment">{{{comment}}}</div>
        {{/if}}
        {{#if result}}
            <div class="result">{{{result}}}</div>
        {{/if}}
        {{#if source}}
            <div class="source">{{{source}}}</div>
        {{/if}}
    </div>
{{/each}}
```

## Compass? Sass?
Sassdown **does not** compile your .sass or .scss files. Since you're using Grunt, I would recommend the [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass) plugin for this task.

## TODO

- Confirm and adjust for .sass rather than .scss support?
- TEST TEST TEST
