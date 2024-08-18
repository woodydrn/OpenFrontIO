import path from 'path';
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		entry: './src/client/Client.ts',
		output: {
			filename: 'bundle.js',
			path: path.resolve(__dirname, 'out'),
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.(png|jpe?g|gif)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'images/[hash][ext][query]'
					}
				},
				{
					test: /\.svg$/,
					type: 'asset/inline',
				}
			],
		},
		resolve: {
			extensions: ['.ts', '.js'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: './src/client/index.html',
				filename: 'index.html'
			}),
			new webpack.DefinePlugin({
				'process.env.WEBSOCKET_URL': JSON.stringify(isProduction ? '' : 'localhost:3000')
			}),
			new webpack.DefinePlugin({
				'process.env.GAME_ENV': JSON.stringify(isProduction ? 'prod' : 'dev')
			}),
		],
		devServer: isProduction ? {} : {
			static: {
				directory: path.join(__dirname, 'out'),
			},
			compress: true,
			port: 9000,
			proxy: [
				{
					context: ['/socket'],
					target: 'ws://localhost:3000',
					ws: true,
				},
				{
					context: ['/lobbies', '/join_game', '/join_lobby'],
					target: 'http://localhost:3000',
					secure: false,
					changeOrigin: true,
				}
			],
		},
	};
};