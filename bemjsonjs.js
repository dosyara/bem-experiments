// BEMJSON generator
var BEMJS = function() {
        function extend(dest, source) {
            var res = {}, name;
            if (dest) for (name in dest) if (dest.hasOwnProperty(name)) res[name] = dest[name];
            if (source) for (name in source) if (source.hasOwnProperty(name)) res[name] = source[name];
            return res;
        }

        function extendProp(obj, prop, values) {
            (values && prop) && (obj[prop] = (typeof values === 'object') ? extend(obj[prop], values) : values)

            return obj;
        }

        function createPropExtender(prop) {
            return function(vals) {
                extendProp(this.obj, prop, vals);
                return this;
            }
        }

        function createPropSetter(prop) {
            return function(val) {
                this.obj[prop] = val;
                return this;
            }
        }

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
    }();