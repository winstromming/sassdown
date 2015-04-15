module.exports = function(grunt) {
  
  grunt.loadTasks('./')
  
  grunt.initConfig({
    sassdown: {
      options: {
        template: './lib/data/template.hbs',
        assets: ['./tests/data/assets/foo.css', './tests/data/assets/foo.js']
      },
      files: {
        src: './tests/data/scss/*',
        dest: './tests/output'
      }
    }
  })
  
  grunt.registerTask('default', ['sassdown'])
  
}
