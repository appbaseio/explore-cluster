const path = require('path');
const webpack = require('webpack');

const SentryPlugin = require('@sentry/webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		template: path.join(__dirname, 'index.html'),
		filename: 'index.html',
	}),
	new CopyWebpackPlugin([{ from: 'static', to: 'static' }, '_redirects']),
	new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	new MiniCssExtractPlugin({
		filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
		chunkFilename: isProduction ? '[name].[contenthash:8].css' : '[name].bundle.css',
		ignoreOrder: true,
	}),
];

if (!isProduction) {
	plugins.push(new BundleAnalyzerPlugin());
}

if (isProduction && !!process.env.SENTRY_TOKEN) {
	plugins.push(
		new SentryPlugin({
			include: './dist',
			ignore: ['node_modules', 'webpack.config.js'],
			configFile: './.sentryclirc',
			debug: true,
		}),
	);
	plugins.push(
		new CompressionPlugin({
			filename: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.css$|\.html$/,
			threshold: 10240,
			minRatio: 0.8,
		}),
	);
	plugins.push(
		new CompressionPlugin({
			filename: '[path].br[query]',
			algorithm: 'brotliCompress',
			test: /\.(js|css|html|svg)$/,
			compressionOptions: {
				level: 11,
			},
			threshold: 10240,
			minRatio: 0.8,
		}),
	);
	plugins.push(new HardSourceWebpackPlugin());
}

module.exports = {
	entry: path.join(__dirname, 'src/index.js'),
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/',
		filename: isProduction ? '[name].[contenthash].js' : '[name].js',
		chunkFilename: '[name].[contenthash].bundle.js',
	},
	plugins,
	devtool: 'source-map',
	optimization: {
		moduleIds: 'hashed',
		runtimeChunk: {
			name: 'manifest',
		},
		minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/](react|react-dom|antd)[\\/]/,
					name: 'vendor',
					chunks: 'all',
					reuseExistingChunk: true,
				},
			},
		},
	},
	plugins,
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					},
				},
			},
			{
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader,
					{ loader: 'css-loader' },
					{
						loader: 'less-loader',
						options: {
							javascriptEnabled: true,
							modifyVars: {
								'@font-family':
									"'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'Droid Sans', 'Helvetica Neue', sans-serif",
							},
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				use: {
					loader: 'file-loader',
				},
			},
		],
	},
};
