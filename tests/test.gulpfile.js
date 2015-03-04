// Requirements
var fs = require('fs-extra')
var exec = require('child_process').exec
var expect = require('expect.js')

// Tests
describe('gulpfile.js', function () {
  
  // Directory
  var src = fs.readdirSync('./tests/data/scss')
  var dest = './tests/output'
  
  before(function (done) {
    var cmd = './node_modules/.bin/gulp --gulpfile ./tests/gulpfile.js'
    exec(cmd, done)
  })
  
  after(function (done) {
    fs.removeSync(dest)
    done()
  })
  
  it('should output '+src.length+' files successfully', function (done) {
    fs.readdir(dest, function (error, files) {
      expect(files).to.have.length(src.length)
      done()
    })
  })
  
})
