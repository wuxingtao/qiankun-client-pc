/**
 * @Desc: parseSpace 用户复制粘贴去除空格
 * @Author: wu xingtao
 * @Date: 2022/2/24
 */

export const parseSpace = {
  bind(elinput, binding, vnode) {
    const el = elinput.querySelector('input') || elinput
    const regExps = {
      space: /\s+/g
    }

    const modifier = Object.keys(binding.modifiers)[0] || 'space'
    const callback = binding.expression ? binding.value : null
    const reg = regExps[modifier]

    if (vnode.componentInstance && vnode.componentInstance.clearable) {
      vnode.componentInstance.$on('clear', () => {
        el.oldValue = ''
      })
    }
    el.addEventListener('paste', handleParse(event, el, vnode, reg, callback))
  },
  unbind(elinput, binding, vnode) {
    const el = elinput.querySelector('input') || elinput
    el.removeEventListener('paste', handleParse(event, el, vnode))
  }
}
function handleParse(e, el, vnode, reg, callback) {
  return e => {
    e.preventDefault()
    const text = e.clipboardData?.getData('Text')
    const value = text.replace(reg, '')
    console.log(value)

    if (!text) {
      return
    }
    if (vnode.componentInstance) {
      vnode.componentInstance.$emit('input', value)
      callback && callback(value)
    }
  }
}
