<template>
  <div class='online-service--container' v-drag @mousedown='handleMouseDown'>
    <ul>
      <li @click='getService'>
        <i class='iconfont icon-online-service' />
        在线客服
      </li>
    </ul>
  </div>
</template>

<script>
import md5 from "md5"
import { ref } from "@vue/composition-api"
import * as storageUtil from "@/utils/storage"

export default {
  props: {
    waybillNumber: {
      type: String,
      // require:true
      default: "" // 首页不需要传入运单号
    }
  },
  
  directives: {
    drag: {
      bind(el) {
        el.onmousedown = e => {
          //算出鼠标相对元素的位置
          let disX = e.clientX - el.offsetLeft
          let disY = e.clientY - el.offsetTop
          
          document.onmousemove = e => {
            //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = e.clientX - disX
            let top = e.clientY - disY
            
            //绑定元素位置到positionX和positionY上面
            el.positionX = top
            el.positionY = left
            
            //移动当前元素
            el.style.left = left + "px"
            el.style.top = top + "px"
          }
          document.onmouseup = e => {
            el.style.left = "unset"
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  setup(props) {
    const mouseDownE = ref(null)
    const getOnlineServiceUrl = () => {
      let url = "https://kuasheng-h5.kye-erp.com/ccms-online-web/"
      if (
        ["uc-uat.ky-express.com", "uc-dev.ky-express.com", "localhost"].includes(
          window.location.hostname
        )
      ) {
        url = "http://erp-kuasheng-h5-uat.kye-erp.com/ccms-online-web/"
      }
      const params = { name: storageUtil.getLoginData().marketer, source: "WEB", phone: storageUtil.getPhone() }
      const keys = Object.keys(params).filter(k => params[k]).sort()
      let rawString = keys.reduce((str, cur) => {
        str += cur + params[cur]
        return str
      }, "")
      rawString += "imcloudMethod"
      params.sign = md5(rawString).toUpperCase()
      params.type = "query"
      params.paramsNum = props.waybillNumber
      const paramsString = Object.keys(params).filter(k => params[k]).map(k => `${k}=${params[k]}`).join("&")
      return `${url}?${paramsString}`
    }
    
    const getService = e => {
      const { clientX, clientY } = mouseDownE.value
      if (clientX !== e.clientX && clientY !== e.clientY) {
        return
      }
      var iWidth = 1145
      var iHeight = 780
      var iTop = (window.screen.availHeight - 30 - iHeight) / 2
      //获得窗口的水平位置
      var iLeft = (window.screen.availWidth - 10 - iWidth) / 2
      
      let param = `height=${iHeight}, top=${iTop}, width=${iWidth}, left=${iLeft}, toolbar='no', menubar='no', scrollbars='no', resizable='no', location='no', status='no'`
      const url = getOnlineServiceUrl()
      window.open(url, "_blank", param)
    }
    const handleMouseDown = e => {
      mouseDownE.value = e
    }
    return {
      getService,
      handleMouseDown
    }
  }
}
</script>

<style lang='scss' scoped>
.online-service--container {
  user-select: none;
  position: fixed;
  right: 0;
  top: 50%;
  z-index: 999;
  
  ul {
    width: 63px;
    opacity: 1;
    background: #ffffff;
    border-radius: 5px 0px 0px 5px;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.11);
    
    li {
      box-sizing: border-box;
      height: 64px;
      padding-top: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      i {
        padding-bottom: 8px;
        font-size: 28px;
      }
    }
  }
}
</style>