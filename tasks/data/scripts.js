(function (d) {
    // Helper functions

    function query (str) { return d.querySelector(str); }
    function queryAll (str) { return Array.prototype.slice.call(d.querySelectorAll(str)); }

    // Insert the results

    var resultTemplate = query('.result-template').innerHTML.replace('\\/script', '/script');

    queryAll('.result-placeholder').forEach(function (placeholder) {
        var parent = placeholder.parentNode;
        var content = resultTemplate.replace('[[body]]', placeholder.innerHTML);
        var iframe = d.createElement('iframe');
        parent.appendChild(iframe);
        parent.removeChild(placeholder);
        iframe.setAttribute('height', 0);
        var doc = iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
    });
}(document));
