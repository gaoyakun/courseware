let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.ts',
    curve: './src/lib/curve.ts',
    demo: './src/lib/demo.ts',
    graph: './src/lib/graph.ts',
    presentation: './src/lib/presentation.ts',
    transform: './src/lib/transform.ts'
  },
  output: {
    //The output directory as an absolute path.
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
      // Add '.ts' and '.tsx' as a resolvable extension.
      extensions: ['.ts', '.tsx', '.js', '.css', '.jpg', '.png']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /(node_modules)/, },
      { test: /\.css$/, use:['style-loader','css-loader']},
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=25000&name=images/[hash:8].[name].[ext]' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: path.resolve(path.resolve(__dirname), 'index.html'),
        inject: 'body'
    }),
    new ExtractTextWebpackPlugin('./dist/css'),
    new CopyWebpackPlugin([
        {
            from: './src/assets'
        }
    ])
  ]
}
