var gulp = require('gulp')
var sassdown = require('../index')

sassdown.set('template', '../lib/data/template.hbs')

gulp.task('sassdown', function() {
  return gulp.src('./data/scss/*')
    .pipe(sassdown('stream'))
    .pipe(gulp.dest('./output'))
})

gulp.task('default', ['sassdown'])
