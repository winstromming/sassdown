module.exports = function(grunt) {
  
  grunt.loadTasks('./')
  
  grunt.initConfig({
    sassdown: {
      options: {
        template: './lib/data/template.hbs'
      },
      files: {
        src: './tests/data/scss/*',
        dest: './tests/output'
      }
    }
  })
  
  grunt.registerTask('default', ['sassdown'])
  
}
