const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: "./main.js",
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: "babel-loader",
    }, ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./main.html",
    }),
  ],
  optimization: {
    minimize: false,
  },
};