const path = require('path');

const output = process.env.TARGET === 'web' ?
      { filename: 'fetch-response-parser.min.js', libraryTarget: 'var',  library: 'FetchResponseParser' } :
      { filename: 'fetch-response-parser.js', libraryTarget: 'commonjs', globalObject: 'this' };

const config = {
    mode: process.env.PRODUCTION ? 'production' : 'development',
    entry: './index.js',
    output: Object.assign(output, {
        path: path.resolve(__dirname, 'dist'),
        libraryExport: 'default'
    }),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    }
};

module.exports = config;
