// Requirements
var fs = require('fs-extra')
var path = require('path')
var through = require('through2')
var handlebars = require('handlebars')

// Exported method
module.exports = function (options) {
  return this.get('build') || build.call(this, options)
}

// Function
function build(options) {
  
  var output, self = this

  if (options !== 'stream') {
    output = self.files().map(function (file) {
      file = self.format(file)
      file.contents = html.call(self, file)
      return file
    })
  } else {
    output = through.obj(function (file, encoding, callback) {
      file = self.format(file)
      file.contents = html.call(self, file)
      callback(null, file)
    })
  }
  
  this.set('build', output)

  return output

}

// Function
function template(data) {
  var target = path.normalize(this.get('template'))
  var markup = fs.readFileSync(target, { encoding: 'utf8' })
  return handlebars.compile(markup)(data)
}

// Function
function html(data) {
  return new Buffer(template.call(this, data))
}
