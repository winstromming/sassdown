var gulp = require('gulp')
var sassdown = require('../index')

var options = {}

sassdown.set('options', {
  template: '../lib/data/template.hbs',
  assets: ['./data/assets/foo.css', './data/assets/foo.js']
});

gulp.task('sassdown', function() {
  return gulp.src('./data/scss/*')
    .pipe(sassdown('stream'))
    .pipe(gulp.dest('./output'))
})

gulp.task('default', ['sassdown'])
