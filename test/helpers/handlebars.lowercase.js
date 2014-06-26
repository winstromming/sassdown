module.exports.register = function(Handlebars) {
    Handlebars.registerHelper('lowercase', function(input) {
        return typeof input === 'string' ? input.toLowerCase() : input;
    });
};
