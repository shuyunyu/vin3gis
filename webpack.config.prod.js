const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const htmlwp = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const packageJson = require('./package.json');
const fs = require('fs');

const entryFile = "./src/index.ts";
const exportVersionStr = "export const version = '" + packageJson.version + "';";
const regex = /export const version = '\d+.\d+.\d+';/g;
let indexContent = fs.readFileSync(entryFile, "utf-8");
if (regex.test(indexContent)) {
    indexContent = indexContent.replace(regex, exportVersionStr)
    fs.writeFileSync(entryFile, indexContent);
} else {
    fs.appendFileSync(entryFile, exportVersionStr);
}

module.exports = {
    mode: 'production',
    entry: {
        "Vin3GIS": entryFile
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].min.js',
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
            template: 'index-prod.html',
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
                { from: './node_modules/three/build/three.min.js', to: "./" },
                { from: "./test/prod.test.js", to: "./" },
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
                        uglify: true
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