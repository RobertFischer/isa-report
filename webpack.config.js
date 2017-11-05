const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const os = require("os");
const path = require("path");
const _ = require("lodash");
const keysToConstCase = (map) => _.mapKeys(map, (val,key) => _.toUpper(_.snakeCase(key)));
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeJsPlugin = require("optimize-js-plugin");
const packageJson = keysToConstCase(require("./package.json"));
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const ENV = process.env['NODE_ENV'] || 'development';
const IS_DEV = ENV == 'development';
const notDev = (it) => IS_DEV ? null : it;
const onlyDev = (it) => IS_DEV ? it : null;
const node_modules = /\/(?:node_modules|elm_stuff)\//;

const babel = {
loader: 'babel-loader',
options: {
  presets: _.compact(['env', 'bluebird', notDev('minify') ]),
  plugins: _.compact([
    "transform-strict-mode",
    "transform-undefined-to-void",
    "transform-node-env-inline",
    notDev('transform-remove-console'),
    notDev('transform-remove-debugger'),
  ]),
  cacheDirectory: IS_DEV,
}
}
const urlLoader = {
loader: 'url-loader',
options: {
  limit: IS_DEV ? 1024 * 1024 : 32 * 1024 - 1, // 32k is the maximum safe size for data uris on old browsers
  hash: 'sha256',
  digest: 'hex',
  name: '[path][name].' + (IS_DEV ? "dev" : '[sha256:hash:base62]') + '.[ext]',
  useRelativePath: false,
},
}
const imageMinLoader = {
loader: 'image-webpack-loader',
options: {
  mozjpeg: {
    quality: 65,
    interlaced: true,
  },
  pngquant:{
    quality: "65-90",
    speed: 1
  },
  svgo:{
  },
  gifsicle: {
    optimizationLevel: 7,
    interlaced: true,
  },
  optipng: {
    optimizationLevel: 7,
  },
},
}
const scssLoaders = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        minimize: !IS_DEV,
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
      }
    },
    'resolve-url-loader',
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        sourceMapContents: true,
        sourceMapEmbed: true,
        precision: 2,
        sourceComments: IS_DEV,
        outputStyle: IS_DEV ? 'nested' : 'compressed',
        includePaths: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname),
        ],
      },
    },
  ]
})

module.exports = {
  devtool: 'inline-source-map',
  context: path.resolve(__dirname),
  watchOptions: {
    ignored: [
      /node_modules\//,
      /elm-stuff\//,
      /\.git\//,
      /scripts\//,
      /docs\//
    ]
  },
  entry: {
    bootstrap : [
      "bootstrap",
    ],
    compatibility: [
      'babel-polyfill',
    ],
    app: [
      path.resolve(__dirname, "year-selector.js"),
      path.resolve(__dirname, "range-display.js"),
      path.resolve(__dirname, "contribution-chart.js"),
      path.resolve(__dirname, "retirement-chart.js"),
      path.resolve(__dirname, "behindhand-son-chart.js"),
    ],
    style: [
      path.resolve(__dirname, "index.scss"),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    chunkFilename: 'chunk.[id].' + (IS_DEV ? "dev" : '[chunkhash]') + '.js',
    filename: '[name].' + (IS_DEV ? "dev" : '[chunkhash]') + '.js',
    crossOriginLoading: 'anonymous',
    hashFunction: 'sha256',
    pathinfo: IS_DEV,
    strictModuleExceptionHandling: true
  },
  module: {
    rules: [
      {
        test: /\.(c|t)sv$/i,
        use: [ 'csv-loader' ],
      },
      {
        test: /\.json5?$/i,
        use: [ 'json5-loader' ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: _.compact([
          urlLoader,
          notDev(imageMinLoader),
        ]),
      },
      {
        test: /\.elm$/i,
        use: [
          babel,
          {
            loader: 'elm-webpack-loader',
            options: {
              cwd: path.resolve(__dirname, "elm"),
              warn: IS_DEV,
              debug: IS_DEV,
              verbose: true,
              pathToMake: path.resolve(__dirname, "script", "unbuffer-elm-make"),
            }
          },
        ],
      },
      {
        test: /\.jsx?$/i,
        exclude: node_modules,
        use: [
          babel,
        ]
      },
      {
        test: /\.(eot|ttf|woff2?)(\?.*)?$/i,
        loader: [
          urlLoader,
        ],
      },
      {
        test: /\.s?css$/i,
        use: scssLoaders,
      },
    ],
  },
  plugins: _.compact([
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ProvidePlugin ({
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      'window._': 'lodash',
      'window.Popper': 'popper.js',
      'Popper': 'popper.js',
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
      Promise: 'bluebird',
    }),
    new ExtractTextPlugin({
      filename: "style." + (IS_DEV ? "dev" : "[sha256:contenthash:base62]") + ".css",
      allChunks: true,
    }),
    new webpack.DefinePlugin(_.mapValues(_.merge({
      // Add in any "constants" that you want. Note that NODE_ENV is already handled by Babel
      // Also, you have all of package.json (but the keys are constant-cased).
      IS_DEV: IS_DEV, // Note for a development environment
    }, packageJson), it => JSON.stringify(it))),
    new UglifyJSPlugin({
      parallel: true,
      sourceMap: true,
      uglifyOptions: {
        compress: !IS_DEV,
        mangle: !IS_DEV,
        output: {
          comments: IS_DEV,
          beautify: IS_DEV,
        },
        ecma: 8,
      }
    }),
    notDev(new OptimizeJsPlugin({
      sourceMap: true,
    })),
    new HtmlWebpackPlugin({
      inject: 'head',
      minify: notDev({}),
      filename: "index.html",
      template: path.resolve(__dirname, "index.html"),
      chunkSortMode: "dependency"
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: 2,
      children: true,
      minSize: 0,
    }),
  ]),
};
