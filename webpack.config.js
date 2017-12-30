const path = require('path')

module.exports = {
	entry: './src/js/app.ts',
	output: {
		filename: 'app.js',
		path: __dirname + "/dist/js"
	},

	// Enable sourcemaps for debugging webpack's output.
	devtool: "source-map",

	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['.ts', '.tsx', '.js']
	},

	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					errorFormatter: function customErrorFormatter(error, colors) {
						const messageColor = error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
						return messageColor(`${error.file}(${error.line}, ${error.character}): ${error.severity}: TS${error.code}: ${error.content}`);
					}
				}
			}
		]
	}
};