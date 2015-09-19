'use strict';
var webpack = require('webpack');
var WebpackNotifierPlugin = require('webpack-notifier');
module.exports = {

  entry: [
      'webpack-dev-server/client?http://0.0.0.0:3001', // WebpackDevServer host and port
      'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors]
      './public/index.js',
  ],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js',
  },  
  module: {
    loaders: [
      {
        //tell webpack to use jsx-loader for all *.jsx files
        test: /\.jsx$/,
        loaders: ['react-hot', 'jsx-loader?insertPragma=React.DOM&harmony']
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
    plugins: [
      new WebpackNotifierPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ],
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  }
};
