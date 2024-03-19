import Vue from 'vue'
import Vtip from 'vtip'
import App from './App.vue'
import router from '@router'
import store from '@/store'
import VueCompositionAPI from '@vue/composition-api'

import ElementUI from 'element-ui'
import '@/assets/scss/element-variables.scss'
import '@/assets/scss/element-override.scss'
import '@/assets/scss/global.scss'
import '@/assets/scss/common.scss'
import 'vtip/lib/index.min.css'
import '@utils/entry/index'

import directives from '@/directives'
import components from '@/components/global'
import clipboard from 'clipboard'
import VueDND from 'awe-dnd'
import VueJsonp from 'vue-jsonp'
import './icons'
import { hasPermission, trim, formatNumber } from '@utils/commonUtil'
import native from '@utils/native'
import '@/utils/routerGuard'
import '@/utils/rem'
import '@/utils/report'
import ky_notify from '@/components/ky-notification'

import 'xe-utils'
import kye_message from '@utils/message'
import VXETable from 'vxe-table'
import '@/assets/scss/vxe-table-variable.scss'
import reportUtils from '@utils/reportUtils'

Vue.use(VXETable)

Object.keys(directives).forEach(v => Vue.directive(v, directives[v]))
Object.keys(components).forEach(c => Vue.component(components[c].name || c, components[c]))
Vue.prototype.clipboard = clipboard
Vue.prototype.$hasPermission = hasPermission
Vue.prototype.$trim = trim
Vue.prototype.$formatNumber = formatNumber
Vue.prototype.$native = native
Vue.prototype.$kye_message = kye_message
Vue.prototype.$reportUtils = reportUtils
Vue.prototype.$ky_notify = ky_notify

Vue.use(ElementUI)
Vue.use(VueDND)
Vue.use(VueJsonp)
Vue.use(Vtip.directive)
const isDevEnv = process.env.NODE_ENV !== 'production'
Vue.config.productionTip = isDevEnv
Vue.config.devtools = isDevEnv

Vue.config.errorHandler = error => {
  console.error(error)
  window.__KYE_ERROR_LOG && window.__KYE_ERROR_LOG.REPORT(error && error.stack)
}

Vue.mixin({
  data() {
    return {
      isClientMode: native.isClientMode()
    }
  }
  // async created(){
  //   this.isClientMode = await this.$native.isClientMode()
  // }
})

Vue.use(VueCompositionAPI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#xt-main-app')

router.afterEach(to => {
  try {
    window.report.sendPVForRouter(to)
  } catch (error) {
    console.log(error)
  }
})
