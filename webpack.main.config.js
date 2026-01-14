const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: './src/main/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
    'koffi': 'commonjs koffi'
  }
};
