// Requirements
var path = require('path')
var through = require('through2')
var markdown = require('marked')
var hljs = require('highlight.js')

module.exports = function (file) {
  return (file) ? format.call(this, file) : stream.call(this)
}

function stream() {
  var self = this
  return through.obj(function (file, encoding, callback) {
    if (file.isBuffer()) {
      file = format.call(self, file)
    }
    callback(null, file)
  })
}

function format(file) {

  file.path = file.path.replace(path.extname(file.path), '.html')
  file.source = file.contents.toString().match(matching())
  file.sections = (file.source) ? sections(file) : null;

  return file
  
}

function matching() {
  var start = /\/\*/.source
  var end = /\*\//.source
  return new RegExp(start + '([\\s\\S]*?)' + end, 'g')
}

function sourcify(section, file) {
  return file.contents.toString().split(section)[1].split(/\/\*/)[0]
}

function unspace(string) {
  return string.replace(/\r\n|\n| /g, '')
}

function normalize(comment) {
  comment = comment.replace(/\/\*/, '')
  comment = comment.replace(/\*\//, '')
  comment = comment.trim().replace(/^\*/, '').replace(/\n \* |\n \*|\n /g, '\n').replace(/\n   /g, '\n    ')
  if (!comment.match('```') && comment.match('    ')) {
    comment = comment.replace(/    |```\n    /, '```\n    ')
    comment = comment.replace(/\n    /g, '\n').replace(/\n /g, '\n')
    comment += '\n```'
  }
  return comment
}

function formatting(content, styles) {
  var output = {}
  if (content.match(/```/)) {
    output.comment = markdown(content.split(/```/)[0])
    output.result  = content.split(/```/)[1]
    output.markup  = '<pre class="hljs"><code>'+hljs.highlight('html', content.split(/```/)[1].split(/```/)[0].trim()).value+'</code></pre>'
    if (unspace(styles).length > 0) {
      output.styles  = '<pre class="hljs"><code>'+hljs.highlight('scss', styles.trim()).value+'</code></pre>'
    }
  }
  else {
    output.comment = markdown(content)
  }
  return output
}

function sections(file) {
  return file.source.map(function (section) {
    var content = normalize(section)
    var styles = sourcify(section, file)
    var output = formatting(content, styles)
    if (!file.title && output.comment.match('</h1>')) {
        file.title = output.comment.split('</h1>')[0].split('>')[1]
    }
    return output
  })
}
