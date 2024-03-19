// Inspired by https://github.com/Inndy/vue-clipboard2
import Vue from 'vue'
const Clipboard = require('clipboard')


if (!Clipboard) {
  throw new Error('you should npm install `clipboard` --save at first ')
}

export default {
  bind(el, binding) { 
    const clipboard = new Clipboard(el, {
      text() { return binding.value },
      action() { return binding.arg === 'cut' ? 'cut' : 'copy' }
    })
    clipboard.on('success', () => {
      clipboardSuccess()
    })
    clipboard.on('error', () => {
      clipboardError()
    })
    el._v_clipboard = clipboard
        
  },
  update(el, binding) { 
    el._v_clipboard.text = function() { return binding.value }
    el._v_clipboard.action = function() { return binding.arg === 'cut' ? 'cut' : 'copy' } 
  },
  unbind(el) {
    el._v_clipboard.destroy()
    delete el._v_clipboard
  }
}


function clipboardSuccess() {
  Vue.prototype.$message({
    message: '复制成功',
    type: 'success',
    duration: 1500
  })
}

function clipboardError() {
  Vue.prototype.$message({
    message: '复制失败',
    type: 'error'
  })
}