/**
 * v-restrict
 * @desc 输入框只允许输入指定字符
 * @example
 * ```vue
 * <input v-kyerestrict.float maxlength=10 placeholder="只允许输入浮点类型数据"/>
 * <input v-kyerestrict.regular="/^[0-9a-f]*$/i" placeholder="只允许输入符合正则表达式的数据"/>
 * ```
 */
export const kyerestrict = {
  bind(elinput, binding, vnode) {
    if (Object.keys(binding.modifiers).length == 0) {
      return
    }
    // console.log(vnode.data.attrs,vnode)
    let el = elinput.querySelector('input') || elinput
    const regExpes = {
      integer: /^-?\d*$/,
      integerNonZero: /^[1-9]\d*$/,
      positive: /^\d*$/,
      positiveNotZero: /^[1-9]\d*$/,
      positiveOrZero:/^[0-9]\d*$/,
      float: /^\d*[.,]?\d*$/,
      currency: /^\d*[.]?\d{0,2}$/,
      alphabet: /^[a-z]*$/i,
      text: /^[\u4e00-\u9fa5a-zA-Z0-9-()（）*,，\u0020\u3000－]+$/, //字母、中文、数字、括号、-和\u3000 全角空格，\u0020 半角空格
      chinese: /^[\u4E00-\u9FA5]+$/,
      letterOrNumber: /^[0-9a-z]*$/i,
      tagNumber:/^[1-9][-,，]?\d*/,
      regular: binding.value,
    
    }
    const reg = regExpes[Object.keys(binding.modifiers)[0]]
    const max = parseFloat(el.max)

    if (vnode.componentInstance && vnode.componentInstance.clearable) {
      vnode.componentInstance.$on('clear', () => {
        el.oldValue = ''
      })
    }
    el.addEventListener('focus', function () {
      if (el.oldValue !== el.value) {
        el.oldValue = el.value
        el.oldSelectionStart = el.oldSelectionEnd = el.oldValue.length
      }
    })
    el.addEventListener('input', handleInput(el, vnode, reg, max))
  },
}

function handleInput(el, vnode, reg, max) {
  function handle() {
    if (el.value === '') {
      el.oldValue = el.value
    }
    // console.log(`new(${el.value}) , old(${el.oldValue})`,reg)
    else if (reg.test(el.value) && (!max || el.value === '' || parseFloat(el.value) <= max)) {
      // console.log(`match:new(${el.value}) , old(${el.oldValue})`)
      el.oldValue = el.value
      el.oldSelectionStart = el.selectionStart
      el.oldSelectionEnd = el.selectionEnd
    } else if (el.hasOwnProperty('oldValue')) {
      // console.log(`un:new(${el.value}) , old(${el.oldValue})`)
      el.value = el.oldValue
      el.setSelectionRange(el.oldSelectionStart, el.oldSelectionEnd)
    } else {
      el.value = ''
    }
    //处理model值与input的value不一致的问题
    if (vnode.componentInstance) {
      vnode.componentInstance.$emit('input', el.value)
    } else {
      vnode.elm.dispatchEvent(new CustomEvent('input', el.value))
    }
  }

  return handle
}
