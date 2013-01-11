// BEMHTML-like js-based template engine
"use strict";
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

    function template(desc, tmpl) {
        desc = (typeof desc === 'object') ? desc : { block: desc, mode: 'content' };
        if (desc.block && !desc.elem) desc.elem = undefined;
        if (desc.elem && !desc.block) desc.block = undefined;

        templates.push({ desc: desc, tmpl: tmpl });
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

    function applyTemplates(ctx, mode, params) {
        var _this = this;
        if (Array.isArray(ctx)) {
            return ctx.map(function(item) { return _this.applyTemplates(item, mode, params) }).join('');
        }

        for (var i = templates.length, tmplItm; i--;) {
            tmplItm = templates[i];
            if (mtch(ctx, tmplItm.desc, mode)) {

                if (typeof tmplItm.tmpl === 'function')
                    return tmplItm.tmpl.call(this, ctx, params);
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

b_.template({}, function(ctx, params) {
    var res = {},
        selfClosing = [
            'hr',
            'img',
            'area',
            'base',
            'br',
            'col',
            'command',
            'embed',
            'hr',
            'img',
            'input',
            'keygen',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr'
        ];

    function isSimple(ctx) {
        return typeof ctx === 'string' || typeof ctx === 'number'
    }

    function isBoolean(ctx) {
        return typeof ctx === 'boolean'
    }

    function buildClass(node) {
        var cls = '',
            modSep = '_',
            modValSep = '_',
            elemSep = '__';

        if (node.block && !node.elem) {
            cls += node.block;
            var mods = node.mods;
            for (var modName in mods)
                if (mods.hasOwnProperty(modName) && mods[modName])
                    cls += (cls && ' ') + node.block + modSep + modName + modValSep + mods[modName];
        }

        if (node.elem) {
            cls += node.block + elemSep + node.elem;
            var elemMods = node.elemMods;
            for (var elemModName in elemMods)
                if (elemMods.hasOwnProperty(elemModName) && elemMods[elemModName])
                    cls += (cls && ' ') + node.block + elemSep + node.elem + modSep + elemModName + modValSep + elemMods[elemModName];
        }

        if (node.cls) {
            cls += (cls && ' ') + node.cls;
        }

        return cls ? ' class="' + cls + '"' : '';
    }

    function buildJSParams(node) {
        var onclick;

        if (node.block && !node.elem && node.js) {
            onclick = {};
            onclick[node.block] = (typeof node.js === 'boolean') ? {} : node.js;
        }

        return onclick ? ' onclick="return ' + JSON.stringify(onclick) + '"' : '';
    }

    function buildAttrs(node) {
        var attrs = '';

        if (node.attrs)
            for (var name in node.attrs)
                if (node.attrs.hasOwnProperty(name) && node.attrs[name])
                    attrs += ' ' + name + '="' + node.attrs[name] + '"';

        return attrs;
    }


    if (params && params.parentBlock && !ctx.block && ctx.elem) ctx.block = params.parentBlock;

    if (isSimple(ctx)) return ctx;
    if (isBoolean(ctx)) return '';

    res = this.extend(res, { tag: this.applyTemplates(ctx, 'tag') });
    if (res.tag) {
        res = this.extend(res, this.applyTemplates(ctx, 'block'));
        res = this.extend(res, this.applyTemplates(ctx, 'elem'));
        res = this.extend(res, { cls: this.applyTemplates(ctx, 'cls') });
        res = this.extend(res, { js: this.applyTemplates(ctx, 'jsattrs') });
        res = this.extend(res, { attrs: this.applyTemplates(ctx, 'attrs') });
        res = this.extend(res, { content: this.applyTemplates(ctx, 'content') });

        while (res.content && !isSimple(res.content))
            res.content = this.applyTemplates(res.content, undefined, { parentBlock: res.block });

        var isSelfClosing = selfClosing.indexOf(res.tag) != -1;
        return '<' + res.tag + buildClass(res) + buildJSParams(res) + buildAttrs(res) + (isSelfClosing ? '/>' : '>' + res.content + '</' + res.tag + '>');
    }
    return '';
});

b_.template({ mode: 'tag' }, function(ctx) {
    return ctx.tag === '' ? '' : (ctx.tag || 'div')
});

b_.template({ mode: 'block' }, function(ctx) {
    var res = {};
    if (ctx.block) res.block = ctx.block;
    if (ctx.mods) res.mods = ctx.mods;
    return res;
});

b_.template({ mode: 'elem' }, function(ctx) {
    var res = {};
    if (ctx.elem) res.elem = ctx.elem;
    if (ctx.elemMods) res.elemMods = ctx.elemMods;
    return res;
});

b_.template({ mode: 'cls' }, function(ctx) {
    return ctx.cls;
});

b_.template({ mode: 'jsattrs' }, function(ctx) {
    return ctx.js;
});

b_.template({ mode: 'attrs' }, function(ctx) {
    return ctx.attrs;
});

b_.template({ mode: 'content' }, function(ctx) {
    return ctx.content || ''
});


b_.template({ block: 'b-page', elem: 'title', mode: 'tag' }, 'title');

b_.template({ block: 'b-link', mode: 'tag' }, 'a');
b_.template({ block: 'b-link', mode: 'attrs' }, function(ctx) {
    return { href: ctx.url }
});


var bemjson = {
    block: 'b-page',
    content: [
        {
            elem: 'title',
            content: 'title'
        },
        {
            tag: 'a',
            attrs: { href: 'yandex.ru' },
            content: 'yandex'
        },
        {
            tag: 'br'
        },
        {
            block: 'b-link',
            url: 'ya.ru',
            content: 'ya'
        }
    ]
}

console.log(b_.applyTemplates(bemjson));