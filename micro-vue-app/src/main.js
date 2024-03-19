import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
// import router from './router'
import { routes } from './router'
import store from './store'
import ElementUI from 'element-ui'
import actions from '@/shared/actions'
import 'element-ui/lib/theme-chalk/index.css'

import './public-path'
// shared 通信
import SharedModule from '@/shared'

Vue.use(ElementUI)

Vue.config.productionTip = false
//
// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

let instance = null
let router = null

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render(props = {}) {
  // 当传入的 shared 为空时，使用子应用自身的 shared
  // 当传入的 shared 不为空时，主应用传入的 shared 将会重载子应用的 shared
  const { shared = SharedModule.getShared() } = props
  SharedModule.overloadShared(shared)

  if (props) {
    // 注入actions 实例
    actions.setActions(props)
  }

  // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
  router = new VueRouter({
    // 运行在主应用中时，添加路由命名空间 /vue
    base: window.__POWERED_BY_QIANKUN__ ? '/admin/vue' : '/',
    mode: 'history',
    routes
  })

  // 挂载应用
  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

// 独立运行时，直接挂载应用
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('VueMicroApp bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log('VueMicroApp mount', props)
  render(props)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
  console.log('VueMicroApp unmount')
  instance.$destroy()
  instance = null
  router = null
}
