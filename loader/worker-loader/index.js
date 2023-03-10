"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = rawLoader;

var _loaderUtils = require("loader-utils");

var _schemaUtils = require("schema-utils");

var _uglify = require("uglify-js");

var _options = _interopRequireDefault(require("./options.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rawLoader(source) {
    const options = (0, _loaderUtils.getOptions)(this);
    (0, _schemaUtils.validate)(_options.default, options, {
        name: 'Worker Loader',
        baseDataPath: 'options'
    });
    //丑化代码
    if (options.uglify) {
        source = _uglify.minify(source, {
            mangle: {
                toplevel: true,
            },
            nameCache: {}
        }).code;
    }
    const json = JSON.stringify(source).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
    return `${esModule ? 'export default' : 'module.exports ='} ${json};`;
}