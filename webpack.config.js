const { resolve } = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const htmlwp = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');

const version = ".0.0.1";

module.exports = {
    mode: 'development',
    entry: {
        "Vin3GIS": "./src/index.ts",
        "TestCase": './test/index.ts'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name]' + version + '.js',
        library: '[name]'
    },
    //不打包THREE
    externals: {
        three: 'THREE'
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
                { from: "./public", to: "./" }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /worker\.js?$/,
                use: {
                    loader: path.resolve(__dirname, "./loader/worker-loader/worker_loader.js"),
                    options: {
                        uglify: false
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.(glsl)$/,
                use: {
                    loader: path.resolve(__dirname, "./loader/glsl-loader/glsl_loader.js"),
                    options: {
                        base64Encode: true
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    watch: false,
    devServer: {
        compress: true,
        historyApiFallback: true,
        hot: true,
        port: 8866,
    }
}