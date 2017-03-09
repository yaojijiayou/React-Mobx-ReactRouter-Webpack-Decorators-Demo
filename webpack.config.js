var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './spa/index.js'),
  output: {
    path: path.resolve(__dirname, './public/build'),
    chunkFilename: '[name].chunk.js',
    filename: 'bundle.js',
    publicPath: '/build/'
    // publicPath: 'http://192.168.191.1:3000/build/'
  },
  module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
                query: {
                    "presets": ['es2015','react',"stage-1"],
                    "plugins": ["transform-decorators-legacy"]
                }
            },
            {test: /\.scss$/, loaders: ["style-loader", "css-loader?sourceMap", "sass-loader?sourceMap"]},
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            {test: /\.(eot|woff|svg|ttf)$/, loader: "file-loader" }
        ]
    }
};