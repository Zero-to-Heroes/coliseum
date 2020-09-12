/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('@artonge/webpack');
// const ngcWebpack = require("ngc-webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const AngularCompilerPlugin = webpack.AngularCompilerPlugin;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');

const _root = path.resolve(__dirname, '.');

function getRoot(args) {
	args = Array.prototype.slice.call(arguments, 0);
	return path.join.apply(path, [_root].concat(args));
}

module.exports = function(env, argv) {
	return {
		mode: env.production ? 'production' : 'development',

		entry: {
			coliseum: './src/js/modules/app/main.ts',
			loader: './src/js/modules/loader/main.ts',
		},

		target: 'web',

		devtool: env.production ? false : 'inline-source-map',

		optimization: env.production
			? {
					minimize: true,
					minimizer: [
						new TerserPlugin({
							cache: true,
							parallel: true,
							sourceMap: true, // Must be set to true if using source-maps in production
							terserOptions: {
								mangle: false,
								keep_classnames: true,
								keep_fnames: true,
							},
						}),
					],
					namedModules: true,
					namedChunks: true,
			  }
			: {},

		// watch: false,

		// watchOptions: {
		// 	ignored: ['node_modules'],
		// },

		output: {
			path: getRoot('dist'),
			publicPath: '/',
			filename: '[name].js',
		},

		resolve: {
			// Having ts before js is important for webpack watch to work
			// However, angular2-indexeddb creates an issue (ts files are packaged alongside js), so
			// you need to remove the .ts files from its node_modules folder
			// See https://github.com/gilf/angular2-indexeddb/issues/67
			extensions: ['.ts', '.js', '.html'],
		},

		module: {
			rules: [
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: ['@artonge/webpack', 'eslint-loader'],
				},
				{
					test: /.js$/,
					parser: {
						system: true,
					},
				},
				{
					test: /\.scss$/,
					include: getRoot('src', 'css'),
					use: ['raw-loader', 'sass-loader'],
				},
				{
					test: /\.scss$/,
					exclude: getRoot('src', 'css'),
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
			],
		},

		plugins: [
			new DefinePlugin({
				'process.env.APP_VERSION': JSON.stringify(env.appversion),
			}),

			new AngularCompilerPlugin({
				tsConfigPath: './tsconfig.json',
				entryModules: [
					'./src/js/modules/app/app.module#AppModule',
					'./src/js/modules/loader/loader.module#LoaderModule',
				],
				sourceMap: true,
			}),

			new MiniCssExtractPlugin({
				filename: 'coliseum.css',
			}),

			new CopyWebpackPlugin([
				{ from: path.join(process.cwd(), 'src/html/app.html') },
				{ from: path.join(process.cwd(), 'src/html/index.html') },
				{ from: path.join(process.cwd(), 'dependencies/cards.json') },
				{ from: path.join(process.cwd(), 'replay.xml') },
			]),

			// new BundleAnalyzerPlugin(),
		],
	};
};
