/*
    sassdown
    github.com/nopr/sassdown
    ------------------------
    Copyright (c) 2013 Jesper Hills, contributors
    Some rights reserved
*/
'use strict';

exports.init = function () {

    var Handlebars = require('handlebars');

    Handlebars.registerHelper('if_name', function(arg, self) {
        if (this.name === arg) { return self.fn(); }
    });
    Handlebars.registerHelper('if_group', function(arg, self) {
        if (this.group === arg) { return self.fn(); }
    });
    Handlebars.registerHelper('if_path', function(arg, self) {
        if (this.path === arg) { return self.fn(); }
    });
    Handlebars.registerHelper('grouped_each', function(every, context, options) {
        var out = '', subcontext = [], i;
        if (context && context.length > 0) {
            for (i = 0; i < context.length; i++) {
                if (i > 0 && i % every === 0) {
                    out += options.fn(subcontext);
                    subcontext = [];
                }
                subcontext.push(context[i]);
            }
            out += options.fn(subcontext);
        }
        return out;
    });

};
