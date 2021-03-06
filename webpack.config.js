const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {config} = require('./package.json');

module.exports = (env, options) => {

    const isDev = options.mode === "development";

    let htmlWebpackPlugins = [];
    let copyWebpackPlugins = [];
    let cssUseList = [MiniCssExtractPlugin.loader, `css-loader?sourceMap=${ isDev }&url=false`];

    config.pages.forEach(page => {
        for(file in page) {
            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({
                    filename: page[file],
                    template: config.src.base + file,
                    title: `This is ${page[file]}`
                })
            )
        }
    });

    if(!isDev) {
        cssUseList.push(
            {
                loader: "postcss-loader",
                options: {
                    plugins: [
                        Autoprefixer({
                            browsers: ['ie >= 8', 'last 4 version']
                        })
                    ],
                    sourceMap: isDev
                }
            },
            {
                loader: "clean-css-loader",
                options: {
                    compatibility: "ie9",
                    level: 2,
                    inline: ["remote"]
                }
            },
            'group-css-media-queries-loader',
        )
    }

    cssUseList.push(`sass-loader?sourceMap=${ isDev }`);

    if(config.build.fonts !== undefined && config.src.fonts)  {
        copyWebpackPlugins.push({
            from: config.src.base + config.src.fonts,
            to: config.build.fonts,
        })
    }
    if(config.build.img !== undefined && config.src.img) {
        copyWebpackPlugins.push(        {
            from: config.src.base + config.src.img,
            to: config.build.img,
        })
    }

    return {
        entry: [
            config.src.base + config.src.js,
            config.src.base + config.src.styles
        ],
        output: {
            path: path.resolve(__dirname, config.build.base),
            filename: config.build.js,
            publicPath: config.publicPath
        },
        devServer: {
            overlay: true
        },
        devtool: isDev ? 'source-map' : '',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {test: /\.(sa|sc|c)ss$/, use: cssUseList},
                {test: /\.ejs$/, loader: "ejs-loader"},
                {test: /\.svg/, loader: "svg-inline-loader"},
            ]
        },
        plugins: [
            !isDev ? new OptimizeCSSAssetsPlugin({}) : () => {},
            !isDev ? new CleanWebpackPlugin('dist') : () => {},
            new CopyWebpackPlugin(copyWebpackPlugins),
            new MiniCssExtractPlugin({
                filename: config.build.styles
            })
        ].concat(htmlWebpackPlugins)
    }
};
