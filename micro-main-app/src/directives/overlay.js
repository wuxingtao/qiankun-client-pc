/*
 * 遮罩层
 * */
const creteOverlay = () => {
  const overlay = document.createElement('div')
  overlay.setAttribute('id', 'overlay')
  overlay.setAttribute(
    'style',
    'position: absolute;\n' +
      'top: 0;\n' +
      'left: 0;\n' +
      'width: 100%;\n' +
      'height: 100%;\n' +
      'background-color: #000;\n' +
      'opacity: 0.5;\n' +
      'z-index: 1000;\n'
  )
  return overlay
}

export const overlay = {
  bind(el, binding, vnode) {
    const overlay = creteOverlay()
    if (binding.value == true) {
      document.querySelector('body').appendChild(overlay)
    } else {
      const overlay = document.querySelector('#overlay')
      if (overlay) document.querySelector('body').removeChild(overlay)
    }
  },
  update(el, binding, vnode) {
    if (binding.value == false) {
      const overlay = document.querySelector('#overlay')
      if (overlay) document.querySelector('body').removeChild(overlay)
    } else {
      if (document.querySelector('#overlay')) return
      const overlay = creteOverlay()
      document.querySelector('body').appendChild(overlay)
    }
  },
}
