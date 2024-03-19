// 设置 rem 函数
function setRem () {
  let vW = window.innerWidth // 当前窗口的宽度
  let vH = window.innerHeight // 当前窗口的高度

  // 基准大小
  let baseSize = 10
  let basePc = baseSize / 1920 // 表示1920的设计图,使用100PX的默认值
  
  // 非正常屏幕下的尺寸换算
  let dueH = vW * 940 / 1920
  if (vH < dueH) { // 当前屏幕高度小于应有的屏幕高度，就需要根据当前屏幕高度重新计算屏幕宽度
    vW = vH * 1920 / 940
  }
  let rem = vW * basePc // 以默认比例值乘以当前窗口宽度,得到该宽度下的相应font-size值
  document.documentElement.style.fontSize =  rem + "px"
}
// 初始化
setRem()

// 改变窗口大小时重新设置 rem
window.addEventListener('resize', ()=>{
  if (window.innerWidth < 1280 || window.innerHeight < 705) return
  setRem()
})