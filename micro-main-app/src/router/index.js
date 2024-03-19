import Vue from 'vue'
import Router from 'vue-router'
import adminRoute from './admin'
import loginRoute from './login'
import guideRoute from './guide'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '',
      redirect: '/admin',
    },
    {
      path: '/',
      redirect: '/admin',
    },
    loginRoute,
    guideRoute,
    adminRoute
  ],
})

// 解决Vue-Router升级导致的Uncaught(in promise) navigation guard问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

export default router
