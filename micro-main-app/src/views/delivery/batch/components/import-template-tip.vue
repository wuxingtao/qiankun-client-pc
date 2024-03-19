<template>
  <div class="import-template-tip__container" v-show="visible">
    <div class="tip-content">
      <img src="~@/assets/image/delivery/batch/template-tip.png"/>
      <i class="el-icon-close" @click="handleClose"/>
      <ul>
        <li class="ellipsis" v-for="(item,index) in templateModifyList.slice(0,2)" :key="index">{{item}}</li>
      </ul>
      <div class="more">
        <el-popover
          popper-class="import-template-tip__popper"
          placement="right-start"
          trigger="click">
          <div>
            <div class="title">更新详情</div>
            <ul>
              <li v-for="(item,index) in templateModifyList" :key="index">{{item}}</li>
            </ul>
          </div>
          <el-button slot="reference" class="ky-button-icon" icon="el-icon-search">详情</el-button>
        </el-popover>
      </div>
      <footer>
        <span>为确保下单信息正确，建议下载最新导入模板</span>
        <el-button type="primary" icon="iconfont icon-download" @click="downloadTemplate">下载模版</el-button>
      </footer>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import * as clientUtil from '@utils/clientUtil'
export default {
  props:{
    templateModifyList:{type:Array},
    newTemplateFlag:{type:Number}
  },
  setup(props,{root,emit}){
    const state = reactive({
      visible:true
    }) 
    const handleClose = () => {
      state.visible = false
      emit('update:newTemplateFlag',2)
    }

    const downloadTemplate = ()=>{
      clientUtil.downloadImportExcelTemplate()
      emit('update:newTemplateFlag',0)
      state.visible = false
    }
    return{
      ...toRefs(state), 
      handleClose,
      downloadTemplate
    }
  }
}
</script>

<style lang="scss">
 .import-template-tip__container,
 .import-template-tip__popper{
   ul{
      line-height: 22px;
      &>li{
        // display: flex;
        // align-items: center;
        position: relative;
        max-width: 302px;
        padding-left: 13px;
        &::before{
          position: absolute;
          top: 8px;
          left: 0;
          content: '';
          width: 4px;
          height: 4px;
          background-color: $--color-text-primary;
          border-radius: 50%;
        }
      }
    }
 } 
 .import-template-tip__popper{
   color: $--color-text-primary;
   padding: 20px;
   .title{
     font-weight: bold;
     padding-bottom: 10px;
   }
 }
</style>
<style lang="scss" scoped>
.import-template-tip__container{
  position: absolute;
  z-index: 2;
  height: 254px;
  width: 100%;
  background-color: rgba(0,0,0,0.5);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $--color-text-primary;
  .tip-content{
    width: 438px;
    box-sizing: border-box;
    padding: 32px 0px 18px 28px;
    max-height: 272px;
    background: url('~@/assets/image/delivery/batch/template-bg.png') no-repeat;
    background-size: contain;
    background-color: #ffffff;
    border-radius: 8px;
    position: relative;
    &>img{
      width: 172px;
      height: 31px;
      margin-bottom: 20px;
    }
    .el-icon-close{
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 16px;
      cursor: pointer;
    }
    .more{
      width: 382px;
      padding: 10px 0 16px;
      margin-bottom: 12px;
      border-bottom: 1px dashed #eeeeee;;
      .ky-button-icon{
        width: 68px;
        height: 24px;
        background: #f4f6f7;
        border-radius: 12px;
      }
    }
    footer{
      &>span{
        font-weight: bold;
      }
      &>.el-button{
        margin-left: 20px;
        padding: 8px 12px;
       /deep/ i{
          margin-right: 4px;
        }
      }
    }
  }
}

</style>