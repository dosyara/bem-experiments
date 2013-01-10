// BEMHTML-like js-based template engine
var b_ = (function() {

    var templates = [];

    function extend() {
        var res = {}, args = Array.prototype.slice.call(arguments);

        for (var i = 0, n = args.length; i < n; i++)
            for (var prop in args[i])
                if (args[i].hasOwnProperty(prop))
                    res[prop] = args[i][prop];

        return res;
    }

    function mtch(node, desc, mode) {
        node = node || {};

        if (desc.mode !== mode) return false;

        for (var p in desc) {
            if (p !== 'mode' && p !== 'guard' && desc.hasOwnProperty(p)) {
                if (desc[p] !== node[p])
                    return false;
            }
        }

        if (desc.guard) return !!desc.guard(node);

        return true;
    }

    function template(desc, tmpl) {
        desc = (typeof desc === 'object') ? desc : { block: desc, mode: 'content' };
        if (desc.block && !desc.elem) desc.elem = undefined;

        templates.push({ desc: desc, tmpl: tmpl });
    }

    function applyTemplates(ctx, mode) {
        var _this = this;
        if (Array.isArray(ctx)) {
            return ctx.map(function(item) { return _this.applyTemplates(item, mode) }).join(''); // TODO: debug
        }

        for (var i = templates.length, tmplItm; i--;) {
            tmplItm = templates[i];
            if (mtch(ctx, tmplItm.desc, mode)) {

                if (typeof tmplItm.tmpl === 'function')
                    return tmplItm.tmpl.call(this, ctx);
                else
                    return tmplItm.tmpl;
            }
        }

    }

    return {
        template: template,
        applyTemplates: applyTemplates,
        extend: extend
    }
})();