<template>
  <div class="customer-code-apply-result__container">
    <div class="result__wrapper">
      <div :class="['result-flag',isSuccess?'sucess':'fail']">
        <i :class="['iconfont', `icon-${isSuccess?'success':'error'}`]"/>
        {{isSuccess?'匹配成功':'匹配失败'}}
      </div>
      <div class="result-tip">
        {{isSuccess?'专属商务已分配，可主动致电或静侯来电！':'哎呀！附近暂无合适人选'}}
      </div>
      <div class="result-contact">
        <div class="result-contact--header">
          <span>{{isSuccess?'联系商务':'联系客服'}}</span>
        </div>
        <div v-if="isSuccess" class="result-contact--sucess">
         <div class="name"> {{contactInfo.person}}</div>
         <el-button type="primary" @click="dialogVisible=true">联系她</el-button>
        <template v-if="contactInfo.wechatQRCodeUrl">
           <div class="qr-code">
             <img :src="contactInfo.wechatQRCodeUrl"/>
         </div>
         <div class="tip">
           或加入专属商务企业微信联系
         </div>
        </template>
        </div>
        <div v-else class="result-contact--fail">
          <div>请拨打95324专人对接</div>
          <el-button type="primary" @click="dialogVisible=true">联系客服95324</el-button>
        </div>
      </div>
    </div>
    <contact-phone-dialog :visible.sync="dialogVisible" :phone="contactInfo.marketingPhone"/>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from '@vue/composition-api'
import ContactPhoneDialog from './contact-phone-dialog'

export default {
  components:{
    ContactPhoneDialog
  },
  props:{
    contactInfo:{type:Object,default:()=>({})}
  },
  setup(props){
    const isSuccess = computed(()=>!!props.contactInfo?.person)
    const state = reactive({
      dialogVisible:false
    })

    return{
      ...toRefs(state),
      isSuccess
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-code-apply-result__container{
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 48px);
  .result__wrapper{
    width: 580px;
    height: 588px;
    padding-top: 18px;
    background: url('~@/assets/image/setting/user/apply-result-bg.png') no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    .result-flag{
      font-weight: bold;
      font-size: 26px;
      color: #41c381;
      &>.iconfont{
        font-size: 26px;
        margin-right: 4px;
      }
      &.fail{
        color: #ff7374;
      }
    }
    .result-tip{
      padding-top: 12px;
      font-size: $--font-size-small;
      color: #73738b;
      line-height: 18px;
    }
    .result-contact{
      padding-top: 118px;
      text-align: center;
      &--header{
        width: 86px;
        height: 94px;
        position: relative;
        display: inline-block;
        background: url('~@/assets/image/setting/user/apply-result-header.png') no-repeat;
        &>span{
          position: absolute;
          bottom: 3px;
          left: 19px;
          font-size: 12px;
          color: #ffffff;
        }
      }
      &--fail{
        padding-top: 16px;
        color: $--color-text-secondary;
        font-size: $--font-size-small;
        &>.el-button{
          margin-top: 46px;
          padding: 8px 14px;
        }
      }
      &--sucess{
        padding-top: 12px;
        .name{
          margin-bottom: 20px;
          font-size: $--font-size-large;
          font-weight: bold;
          color: $--color-text-primary;
        }
        .qr-code{
          margin: 20px auto 8px;
          width: 104px;
          height: 104px;
          &>img{
            width: 100%;
            height: 100%;
          }
        }
        .tip{
          font-size: $--font-size-small;
          color: #73738b;
          line-height: 18px;
        }
      }
    }
  }
}
</style>