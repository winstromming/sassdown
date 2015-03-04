module.exports = function(grunt) {
  
  grunt.loadTasks('./')
  
  grunt.initConfig({
    sassdown: {
      files: {
        src: './tests/data/scss/*',
        dest: './tests/output'
      }
    }
  })
  
  grunt.registerTask('default', ['sassdown'])
  
}
