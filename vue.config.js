const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
  publicPath: "./",
  assetsDir: "static",
  outputDir: 'dist',
  lintOnSave: false,
  devServer: {
    disableHostCheck: true,
    host: 'localhost'
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  chainWebpack: config => {

    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',

      });

    })

    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
    })
  }
}

