/*

  sassdown | github.com/nopr/sassdown
  -----------------------------------
  http://creativecommons.org/licenses/by-sa/3.0/deed.en_US
  Jesper Hills (jay@nopr.co)

*/
module.exports = function (caller) {
  if (caller === 'stream') {
    return module.exports.build('stream')
  }
  if (caller.package.name === 'grunt') {
    return task.call(this, caller)
  }
}

function task(grunt) {
  grunt.registerMultiTask('sassdown', function () {
    
    var self = module.exports
    
    self.set(this.options())
    self.set('src', this.data['src'])
    self.set('dest', this.data['dest'])
    
    self.build('directory')
    self.output()
    
  })
}

module.exports.value = {}
module.exports.get = function (property) {
  return this.value[property]
}
module.exports.set = function (property, value) {
  if (typeof property === 'object') {
    for (value in property) {
      this.value[value] = property[value]
    }
  } else {
    this.value[property] = value
  }
}
