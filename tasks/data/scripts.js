(function (d) {
    // Helper functions

    function query (str, context) { return (context || d).querySelector(str); }
    function queryAll (str, context) { return Array.prototype.slice.call((context || d).querySelectorAll(str)); }
    function generateId () { return (Math.random()+1).toString(36).substring(2); }

    // Insert the results

    var resultTemplate = query('.result-template').innerHTML.replace('\\/script', '/script');

    queryAll('.result-placeholder').forEach(function (placeholder) {
        var parent = placeholder.parentNode;
        var content = resultTemplate
            .replace('[[body]]', placeholder.innerHTML)
            .replace('[[onload]]', 'parent.adjustIframeHeight(window.frameElement.id)');
        var iframe = d.createElement('iframe');
        parent.appendChild(iframe);
        parent.removeChild(placeholder);
        iframe.setAttribute('id', generateId());
        iframe.setAttribute('height', 0);
        var doc = iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
    });
    
    // Toggling navigation folders

    queryAll('#nav .heading').forEach(function (heading) {
        // Find the link to the current page and mark it and its parent folder as active/open
        var list = heading.nextElementSibling;
        queryAll('a', list).some(function (link) {
            var href = link.getAttribute('href').replace(/^[\.\/]*/, '');
            if (window.location.pathname.match(new RegExp(href + '$'))) {
                link.classList.add('is-active');
                link.parentNode.parentNode.classList.add('is-open');
                link.parentNode.parentNode.previousElementSibling.classList.add('is-open');
                return true;
            }
        });

        // Toggle a folder open/closed when its heading is clicked
        heading.addEventListener('click', function () {
            this.classList.toggle('is-open');
            this.nextElementSibling.classList.toggle('is-open');
        });
    });
}(document));

// Resizes the given iframe to the height of the content.
// Must be placed here, will be called from inside the iframe.
function adjustIframeHeight (id) {
    setTimeout(function () {
        var iframe = document.getElementById(id);
        iframe.height = iframe.contentWindow.document.body.scrollHeight;
    }, 100);
}