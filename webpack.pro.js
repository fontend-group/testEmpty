const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob');
const setMap = function() {
  let entry = {},
  htmlWebpackPlugins = [],
  entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
  entryFiles.forEach(item => {
    ///Users/aaa/doumi/webpack-demo/src/index/index.js
    ///Users/aaa/doumi/webpack-demo/src/search/index.js
    let match = item.match(/src\/(.*)\/index.js/);
    let pageName = match[1];
    entry[pageName] = item;
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, `src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName],
        inject: true,
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
        }
      })
    );
  });

  return {
    entry,
    htmlWebpackPlugins
  }
}
const { entry, htmlWebpackPlugins } = setMap();


module.exports = {
  entry,
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name]_[chunkhash:8].js'
  },
  mode: 'production',
  module: {
    rules: [{ 
        test: /\.css$/, 
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader') 
        use: [MiniCssExtractPlugin.loader, 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: () => [
              require('autoprefixer')
            ]
          }
        }, {
          loader: 'px2rem-loader',
          options: {
            remUni: 75,
            remPrecision: 8
          }
        }]
      }, {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader'
        }]
      }, {
        test: /\.js$/,
        use: 'babel-loader'
      }, {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }, {
        test: /\.(jpg|png|gif|jpeg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: "[name]_[hash:8].[ext]"
          }
        }
      }, {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: "[name]_[hash:8].[ext]"
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true
    }),
    new CleanWebpackPlugin()
  ].concat(htmlWebpackPlugins)
}