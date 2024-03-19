const hasTouch = 'ontouchstart' in window
const startEvent = hasTouch ? 'touchstart' : 'mousedown'
const moveEvent = hasTouch ? 'touchmove' : 'mousemove'
const endEvent = hasTouch ? 'touchend' : 'mouseup'
const cancelEvent = hasTouch ? 'touchcancel' : 'mouseup'

export const deviceEvent = {
  hasTouch,
  startEvent,
  moveEvent,
  endEvent,
  cancelEvent,
}

export const getClient = e => {
  let clientX = hasTouch ? e.touches[0].clientX : e.clientX
  let clientY = hasTouch ? e.touches[0].clientY : e.clientY
  return {
    x: clientX,
    y: clientY,
  }
}

export default {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cssText += ';cursor:move;'
    dragDom.style.cssText += ';margin-bottom:0px;top:0px;'

    // 获取原有属性
    // ie: dom.currentStyle
    // firefox、chrome: window.getComputedStyle(dom, null)
    const getStyle = (function () {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => window.getComputedStyle(dom, false)[attr]
      }
    })()

    const reg_rate = /%/g
    const reg_px = /px/g

    dialogHeaderEl[`on${deviceEvent.startEvent}`] = function (e) {
      // 隐藏 el-popper
      let elArr = document.querySelectorAll('.el-popper:not([style*="display: none"])')
      elArr && elArr.forEach(v => (v.style.display = 'none'))

      // 鼠标按下，计算当前元素距离可视区的距离
      const dis = getClient(e)
      const disX = dis.x - dialogHeaderEl.offsetLeft
      const disY = dis.y - dialogHeaderEl.offsetTop

      const dragDomWidth = dragDom.offsetWidth
      // const dragDomHeight = dragDom.offsetHeight

      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight

      const minDragDomLeft = dragDom.offsetLeft + dragDomWidth - 45
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - 45

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - 45

      // 获取到的值带px 正则匹配替换
      let styL = getStyle(dragDom, 'left')
      let styT = getStyle(dragDom, 'top')

      if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(reg_rate, '') / 100)
        styT = +document.body.clientHeight * (+styT.replace(reg_rate, '') / 100)
      } else {
        styL = +styL.replace(reg_px, '')
        styT = +styT.replace(reg_px, '')
      }

      document[`on${deviceEvent.moveEvent}`] = function (e) {
        // 通过事件委托，计算移动的距离
        const dis = getClient(e)
        let left = dis.x - disX
        let top = dis.y - disY

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (-top > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
      }

      document[`on${deviceEvent.endEvent}`] = function () {
        document[`on${deviceEvent.moveEvent}`] = null
        document[`on${deviceEvent.endEvent}`] = null
      }
    }
  },
}
