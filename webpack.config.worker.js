const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        "transform_worker": "./src/gis/core/transform/worker_transform.ts",
    },
    output: {
        path: __dirname + '/src/gis/core/worker',
        filename: '[name].js',
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
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
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