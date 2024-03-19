//参考:https://juejin.im/post/59bb864b5188257e7a427c09
import Vue from 'vue'
import SvgIcon from '@comps/SvgIcon'

Vue.component('svg-icon', SvgIcon)

//https://webpack.js.org/guides/dependency-management/#requirecontext
const req = require.context('./svg', false, /\.svg$/) 
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)