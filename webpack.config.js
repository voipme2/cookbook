'use strict';

// Modules
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
let isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {

    let config = {};
    config.entry = {
        app: './src/app/app.js'
    };

    config.output = {
        path: __dirname + '/dist',
        publicPath: isProd ? '/' : 'http://localhost:8080/',
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    };

    config.devtool = 'eval-source-map';

    // Initialize module
    config.module = {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                fallbackLoader: 'style-loader',
                loader: [
                    {loader: 'css-loader', query: {sourceMap: true}},
                    {loader: 'postcss-loader'}
                ],
            })
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file-loader'
        }, {
            test: /\.html$/,
            loader: 'raw-loader'
        }]
    };

    config.plugins = [
        new webpack.LoaderOptionsPlugin({
            test: /\.scss$/i,
            options: {
                postcss: {
                    plugins: [autoprefixer]
                }
            }
        }),

       config.plugins.push(
            new HtmlWebpackPlugin({
                template: './src/public/index.html',
                inject: 'body'
            }),

            new ExtractTextPlugin({filename: 'css/[name].css', disable: !isProd, allChunks: true})
        )
    ];

    config.devServer = {
        proxy: {
            "/api/" : "http://localhost:8000"
        }
    };
    return config;
}();