/*

  sassdown | github.com/nopr/sassdown
  -----------------------------------
  http://www.opensource.org/licenses/mit-license.php/
  Author: Jesper Hills (jay@nopr.co)

*/
module.exports = function (caller) {
  if (caller === 'stream') {
    return module.exports.library('stream')
  }
  if (caller.package.name === 'grunt') {
    return task.call(this, caller)
  }
}

function task(grunt) {
  grunt.registerMultiTask('sassdown', function () {
    
    var self = module.exports
    var options = this.options()
    
    for (var property in options) {
      self.set(property, options[property])
    }
    
    self.set('src', this.data['src'])
    self.set('dest', this.data['dest'])
    
    self.library('directory')
    self.output()
    
  })
}

module.exports.value = {}
module.exports.get = function (property) {
  return this.value[property]
}
module.exports.set = function (property, value) {
  this.value[property] = value
}
