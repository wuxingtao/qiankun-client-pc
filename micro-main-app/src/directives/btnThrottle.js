/**
 * @Desc: btnThrottle
 * @Author: wu xingtao
 * @Date: 2021/3/8
 */
export default {
  inserted(el,binding){
    el.addEventListener('click',e=>{
      if(!e.disabled){
        el.disabled = true
        el.style.cursor = 'not-allowed'
        setTimeout(()=>{
          el.style.cursor = 'pointer'
          el.disabled = false
        },1500)
      }
    })
  }
}
