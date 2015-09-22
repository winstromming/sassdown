// Requirements
var path = require('path')

// Exported method
module.exports = function (options) {
  return this.get('assets') || assets.call(this, options)
}

// Function
function assets(options) {

  options = options || this.get('options')

  var output = options.assets.map(function (file) {
    return include(file)
  })

  this.set('assets', output)

  return output

}

function include(file) {
  // Output
  var string;
  // If this file is not external, build a local relative path
  if (!file.match(/^((https?|file):)?\/\//)) { file = path.resolve(file); }
  // Preserve correct path escaping for <iframe> embedded url paths
  if (file.match(/\\/)) { file = file.replace(/\\/g, '/'); }
  // Write <link> or <script> tag to include it
  if (file.split('.').pop() === 'css') { string = '<link rel="stylesheet" href="'+file+'" />'; }
  if (file.split('.').pop() === 'js') { string = '<script src="'+file+'"><\/script>'; }
  // Return
  return string;
}
