/*@param
*
*   根据key 判断，是否是10  有权限 否没有
*
* */

export const total ={
  // 权限指令 v-total="'delivey'"  delivey权限的 key
  inserted: function (el, bind, vnode) {
    if(vnode.context.$store.state&&vnode.context.$store.state.tatol&&vnode.context.$store.state.tatol.auth&& vnode.context.$store.state.tatol.auth.dataBoard){
      let auth = vnode.context.$store.state.tatol.auth.dataBoard
      if(bind.value){
        if(auth[bind.value]&&+auth[bind.value]!==10){
          el.parentNode && el.parentNode.removeChild(el)
        }
      }else{
        el.parentNode && el.parentNode.removeChild(el)
      }
    }else{
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
