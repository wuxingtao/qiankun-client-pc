//路径别名
const alias = {
  '@views': '@/views/',
  '@api': '@/services/api/',
  '@comps': '@/components/',
  '@common': '@/common/',
  '@router': '@/router/',
  '@assets': '@/assets',
  '@utils': '@/utils',
  '@export': '@/export',
  '@client': '@/views/client',
  '@waybill': '@/views/waybill',
  '@enum': '@/enum/'
}
const externals = {
  jquery: 'window.jQuery',
  BMap: 'BMap',
  echarts: 'echarts',
  vue: 'Vue',
  'vue-router': 'VueRouter',
  'element-ui': 'ELEMENT',
  xlsx: 'XLSX',
  lodash: '_'
}
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  devServer: {
    port: 8088,
    before: require('./mock'),
    proxy: {
      '/json/collector': {
        target: 'https://api-uat.kyeapi.com',
        changeOrigin: true,
        secure: false
      },
      '/router/rest': {
        target: 'https://api-uat.kyeapi.com/router/rest',
        // target: 'http://api-stg.kyeapi.com/router/rest',
        changeOrigin: true
      }
    }
  },
  assetsDir: './',
  outputDir: 'dist',
  // baseUrl 已经在vue-cli 3.1中废弃，这里使用publicPath, 生产环境使用二级目录，开发环境使用根目录
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  // publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  configureWebpack: {
    // entry: entry,
    resolve: {
      extensions: ['.scss'],
      alias
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    output: {
      devtoolModuleFilenameTemplate: (info) => {
        const resPath = info.resourcePath;
        if ((/\.vue$/.test(resPath) && info.allLoaders !== '') || /node_modules/.test(resPath)) {
          return `webpack:///${resPath}?${info.hash}`;
        }
        return `webpack:///${resPath.replace('./src', 'SouceCode')}`;
      },
    },
    //不需要打包的库
    // externals: process.env.NODE_ENV === 'production' ? externals:  {
    //     jquery: 'window.jQuery',
    //     BMap: 'BMap',
    //     '/echarts.js': 'window.echarts'
    // },
    // plugins: [],
  },
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        data: `
        @import "@/assets/scss/mixin.scss";
        @import "@/assets/scss/ky-variables.scss";`
      }
    },
    sourceMap: true
  },
  chainWebpack(config) {
    config.plugins.delete('prefetch-index')
    //set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })

    // config.plugin('html-index').tap((args) => {
    //     args[0].isProduction = process.env.NODE_ENV === 'production'
    //     return args
    // })
  },
  transpileDependencies: [/[/\\]node_modules[/\\](.+?)?vue-baidu-map(.*)/]
}
