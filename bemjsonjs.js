// BEMJSON generator
var BEMJS = function() {

        /**
         * Extend helper
         *
         * @param dest
         * @param source
         * @return {Object}
         */
        function extend(dest, source) {
            var res = {}, name;
            if (dest) for (name in dest) if (dest.hasOwnProperty(name)) res[name] = dest[name];
            if (source) for (name in source) if (source.hasOwnProperty(name)) res[name] = source[name];
            return res;
        }

        /**
         * Extends property of BEMJSON-node
         *
         * @param obj
         * @param prop
         * @param values
         * @return {*}
         */
        function extendProp(obj, prop, values) {
            (values && prop) && (obj[prop] = (typeof values === 'object') ? extend(obj[prop], values) : values)

            return obj;
        }

        /**
         * Creates property extender
         *
         * @param prop
         * @return {Function}
         */
        function createPropExtender(prop) {
            return function(vals) {
                extendProp(this.obj, prop, vals);
                return this;
            }
        }

        /**
         * Creates property setter
         *
         * @param prop
         * @return {Function}
         */
        function createPropSetter(prop) {
            return function(val) {
                this.obj[prop] = val;
                return this;
            }
        }

        /**
         * Main object
         *
         * @param params
         * @return {*}
         */
        var bemjs = function(params) {
            var bemjsInst = function(cont) {
                return bemjsInst.build(arguments.length > 1 ? Array.prototype.slice.call(arguments) : cont);
            }

            if (bemjsInst.__proto__)
                bemjsInst.__proto__ = bemjs.fn;
            else
                for (var prop in bemjs.fn) if (bemjs.fn.hasOwnProperty(prop)) bemjsInst[prop] = bemjs.fn[prop];

            return bemjsInst.init(params);
        }

        /**
         *   Base methods for create and augment BEMJSON-node
         */
        bemjs.fn = {

            init: function(params) {
                this.obj = extend({}, params);

                return this;
            },

            _createPropExtender: createPropExtender,
            _createPropSetter: createPropSetter,

            tag: createPropSetter('tag'),
            js: createPropSetter('js'),
            mix: createPropSetter('mix'),
            attrs: createPropSetter('attrs'),

            content: createPropSetter('content'),

            build: function(cont) {
                return this.content(cont).obj;
            }
        };

        return bemjs;
    }(),

    // Creates block node
    block = function(name, params) {
        var block = BEMJS(params);
        block.obj.block = name;
        block.mods = block._createPropExtender('mods');

        return block;
    },

    // Creates elem node, blockName is optional
    elem = function(blockName, name, params) {
        if (typeof name === 'object') {
            params = name;
            name = blockName;
            blockName = undefined;
        } else if (typeof name === 'undefined') {
            name = blockName;
            blockName = undefined;
        }
        var elem = blockName ? block(blockName, params) : BEMJS(params);
        elem.obj.elem = name;
        elem.elemMods = elem._createPropExtender('elemMods');

        return elem;
    };

var BEMJSON = [

    //b-link
    { block: 'b-link', url: 'yandex.ru', content: 'yandex' },
    block('b-link', { url: 'yandex.ru' })('yandex'),

    //b-form-button
    {
        block: 'b-form-button',
        mods: { theme: 'grey-s', size: 's' },
        type: 'submit',
        name: 'my-submit',
        value: 'my-value',
        content: 'Я.Submit'
    },
    block('b-form-button', {
            type: 'submit',
            name: 'my-submit',
            value: 'my-value'
        })
        .mods({
            theme: 'grey-s',
            size: 's'
        })('Я.Submit'),

    //b-menu-vert
    {
        block: 'b-menu-vert',
        content: [
            { elem: 'item', content: 'Item 1' },
            { elem: 'item', content: 'Item 2' },
            { elem: 'item', content: 'Item 3' },
            { elem: 'separator' },
            { elem: 'item', content: 'all' }
        ]
    },
    block('b-menu-vert')(
        elem('item')('Item 1'),
        elem('item')('Item 2'),
        elem('item')('Item 3'),
        elem('separator')(),
        elem('item')('all')
    )

];

console.log(JSON.stringify(BEMJSON));
