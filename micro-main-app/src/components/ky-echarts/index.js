import KyEcharts from './src/main'
KyEcharts.install = function(Vue) {
  Vue.component(KyEcharts.name, KyEcharts)
}
export default KyEcharts
