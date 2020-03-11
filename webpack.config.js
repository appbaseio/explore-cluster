const SentryPlugin = require('@sentry/webpack-plugin');

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [];

const path = require('path');

if (isProduction && !!process.env.SENTRY_TOKEN) {
	plugins.push(
		new SentryPlugin({
			include: './dist',
			ignore: ['node_modules', 'webpack.config.js'],
			configFile: './.sentryclirc',
			debug: true,
		}),
	);
}

module.exports = {
	entry: path.join(__dirname, 'src/index.js'),
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/dist/',
		filename: 'build.js',
		chunkFilename: '[name].[contenthash].build.js',
	},
	plugins,
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.less$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							insertAt: 'top',
						},
					},
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
				use: ['style-loader', 'css-loader'],
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
