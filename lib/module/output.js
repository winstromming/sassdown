// Requirements
var fs = require('fs-extra')
var path = require('path')

// Exported method
module.exports = function () {
  return output.call(this)
}

// Function
function output() {

  var build = this.get('build')
  var destination = path.resolve(this.get('dest'))

  fs.deleteSync(destination)

  for (var file in build) {
    create(destination, build[file])
  }

}

function create(destination, file) {
  file.dest = path.resolve(destination, path.basename(file.path))
  fs.outputFileSync(file.dest, file.contents)
}
