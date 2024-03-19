import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/communication',
    name: 'Communication',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/communication/index.vue')
  },
  {
    path: '/slot',
    name: 'Slot',
    component: () => import('../views/slot/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router

export { routes }
