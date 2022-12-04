const { resolve } = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const htmlwp = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');

const version = "_0.0.1";

module.exports = {
    mode: 'development',
    entry: {
        "Vin3Engine": "./src/index.ts",
        "Vin3GIS": "./src/gis/index.ts"
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name]' + version + '.js',
        library: '[name]'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new htmlwp({
            title: 'webgl',
            template: 'index.html',
            scriptLoading: 'blocking'
        }),
        new UglifyJSPlugin({
            uglifyOptions: {
                ie8: true,
                ecma: 5,
                warnings: false,
                output: {
                    beautify: false
                }
            }
        }),
        new CopyPlugin({
            patterns: [
                { from: "./public", to: "./" },
                { from: "./test", to: "./test" }
            ]
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/, // 正则表达式，表示.css后缀的文件
            use: ['style-loader', 'css-loader'] // 针对css文件使用的loader，注意有先后顺序，数组项越靠后越先执行
        }]
    },
    watch: false, // 监听修改自动打包
    devServer: {
        compress: true,
        historyApiFallback: true,
        hot: true,
        port: 8866,
    }
}