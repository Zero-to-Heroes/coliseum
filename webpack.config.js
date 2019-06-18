const webpack = require("@artonge/webpack");
// const ngcWebpack = require("ngc-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AngularCompilerPlugin = webpack.AngularCompilerPlugin;

var path = require("path");

var _root = path.resolve(__dirname, ".");

function getRoot(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [_root].concat(args));
}

module.exports = function(env, argv) {

  return {
    mode: env.production ? 'production' : 'development',

    entry: {
      app: "./src/js/modules/app/main.ts"
    },

    target: "web",

    devtool: env.production ? false : "inline-source-map",

    watch: true,

    watchOptions: {
      ignored: ['node_modules']
    },

    output: {
      path: getRoot("dist"),
      publicPath: "/",
      filename: "[name].js"
    },

    resolve: {
      // Having ts before js is important for webpack watch to work
      // However, angular2-indexeddb creates an issue (ts files are packaged alongside js), so
      // you need to remove the .ts files from its node_modules folder
      // See https://github.com/gilf/angular2-indexeddb/issues/67
      extensions: [".ts", ".js", ".html"]
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "@artonge/webpack"
        },
        {
          test: /.js$/,
          parser: {
            system: true
          }
        },
        {
          test: /\.scss$/,
          include: getRoot("src", "css"),
          use: ["raw-loader", "sass-loader"]
        },
        {
          test: /\.scss$/,
          exclude: getRoot("src", "css"),
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
        }
      ]
    },

    plugins: [
      new AngularCompilerPlugin({
        tsConfigPath: "./tsconfig.json",
        entryModules: [
          "./src/js/modules/app/app.module#AppModule",
        ],
        sourceMap: true
      }),

      new MiniCssExtractPlugin({
        filename: "app.css"
      }),

      new CopyWebpackPlugin([
        { from: path.join(process.cwd(), "src/html/app.html"), to: "html" },
        { from: path.join(process.cwd(), "/../*") },
        { from: path.join(process.cwd(), "src/assets"), to: "assets" },
        { from: path.join(process.cwd(), "dependencies"), to: "dependencies" },
        { from: path.join(process.cwd(), "replay.xml"), to: "html" },
      ]),
    ]
  };
};
