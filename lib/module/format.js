// Requirements
var path = require('path')
var through = require('through2')

// Exported method
module.exports = function (file) {
  return (file) ? format.call(this, file) : stream.call(this)
}

// Function
function stream() {
  var self = this
  return through.obj(function (file, encoding, callback) {
    if (file.isBuffer()) {
      file = format.call(self, file)
    }
    callback(null, file)
  })
}

// Function
function format(file) {
  
  file.path = file.path.replace(path.extname(file.path), '.html')
  file.comment = ''
  file.example = ''
  file.markup = ''
  
  return file
  
}
