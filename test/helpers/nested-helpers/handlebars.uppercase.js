module.exports = function(Handlebars) {
    Handlebars.registerHelper('uppercase', function(input) {
        return typeof input === 'string' ? input.toUpperCase() : input;
    });
};
