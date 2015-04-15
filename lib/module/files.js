// Requirements
var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')
var vinyl = require('vinyl')

// Exported method
module.exports = function (options) {
  return this.get('files') || files.call(this)
}

// Function
function files() {
  
  var target = path.resolve(this.get('src'))
  var search = glob.sync(target, { nodir: true })

  var output = search.map(function (result) {
    return new vinyl({
      contents: fs.readFileSync(result),
      base: target,
      path: result
    })
  })
  
  this.set('files', output)

  return output
  
}
