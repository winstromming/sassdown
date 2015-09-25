// Requirements
var path = require('path')
var through = require('through2')
var markdown = require('marked')
var hljs = require('highlight.js')
var sson = require('sson')

module.exports = function (file) {
  return (file) ? format.call(this, file) : stream.call(this)
}

function stream() {
  var self = this
  return through.obj(function (file, encoding, callback) {
    if (file.isBuffer()) {
      file = sson(file)
    }
    callback(null, file)
  })
}

function format(file) {
  var returns = sson(file.contents.toString())
  returns.path = file.path.replace(path.extname(file.path), '.html')
  returns.title = path.basename(file.path)
  returns.source = file.contents.toString().match(matching())
  return returns
}

function matching() {
  var start = /\/\*/.source
  var end = /\*\//.source
  return new RegExp(start + '([\\s\\S]*?)' + end, 'g')
}
