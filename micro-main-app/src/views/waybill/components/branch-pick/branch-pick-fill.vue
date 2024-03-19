<template>
  <div>
    <ky-dialog
      title='网点自提'
      width='700px'
      :visible.sync='dialogVisible'
      :close-on-click-modal='false'
      :before-close='beforeClose'
      @close='handlerClose'
    >
      <div class='receipt'>
        <span>收件地址：</span>
        <span>{{ pickupAddress }}</span>
      </div>
      <div class='select-wrapper'>
        <div class='select' v-for='(item, index) in branchInfo' :key='index'
             :class="selectIndex === index ? 'selected' : ''"
             @click='toggleSelect(index)'>
          <div class='top'>
            <div class='info'>
              <span>{{ item.name }}</span>
              <span v-if='item.distance'>{{ item.distance }}km</span>
            </div>
            <div v-if='selectIndex !== index' class='icon'></div>
            <i v-else class='iconfont iconcoupon-active'></i>
          </div>
          <div class='bottom'>
            <span>自提地址：</span>
            <p>{{ item.address }}
              <i class='iconfont icon-copy' v-clipboard='item.address'></i>
            </p>
          </div>
        </div>
      </div>
      <div class='phone'>
        <p class='title'>请填写自提人手机号</p>
        <el-input class='input' v-model='pickupMobile' maxlength='11' placeholder='请您填写自提人手机号'
        ></el-input>
        <p class='tips'>货物到达提货地址后，跨越速运会向您指定的自提手机号发送提货信息</p>
        <p class='tips'>提货信息包括提货地址、提货联系人、提货二维码、短信转发或截图发二维码均有效，具体提货地址以短信通知为准</p>
        <el-checkbox v-model='agreement'>我已阅读并同意</el-checkbox>
        <span class='link' @click='showAgreement'>《增值服务指南》</span>
      </div>
      <div slot='footer' class='dialog-footer'>
        <el-button @click='handlerClose'>取消</el-button>
        <el-button type='primary' @click='submit'>保存</el-button>
      </div>
    </ky-dialog>
    <agreement :waybillNumber='waybillNumber' :visible.sync='agreementVisible'></agreement>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  provide,
  onActivated
} from "@vue/composition-api"
import REGULAR from "@utils/regular"
import agreement from "./agreement"
import waybillApi from "@api/waybill"

export default defineComponent({
  name: "BranchPickFill",
  components: {
    agreement
  },
  props: {
    pickupAddress: {
      type: String,
      default: ""
      // default: "广东省深圳市宝安区航站四路深航航空公司"
    },
    branchInfo: {
      type: Array,
      default: () => [
        // {
        //   name: "天城物流",
        //   distance: "29.25km",
        //   address: "西藏日科则市桑珠孜区曲美乡多十字路口往左300米天诚物流"
        // },
        // {
        //   name: "京京物流",
        //   distance: "29.25km",
        //   address: "西藏日科则市桑珠孜区曲美乡多十字路口往左300米天诚物流多十字路口往左3000米天诚物流多十字路口往左300米天诚物流"
        // }
      ]
    },
    waybillNumber: String
  },
  setup(props, { root, emit }) {
    const dialogVisible = ref(false)
    const selectIndex = ref(0)
    const pickupMobile = ref("")
    const agreement = ref(false)
    
    const showDialog = () => {
      dialogVisible.value = true
    }
    
    const beforeClose = done => {
      agreement.value = false
      selectIndex.value = 0
      pickupMobile.value = ""
      agreement.value = false
      done()
    }
    
    const handlerClose = () => {
      agreement.value = false
      selectIndex.value = 0
      pickupMobile.value = ""
      agreement.value = false
      dialogVisible.value = false
    }
    
    const toggleSelect = index => {
      selectIndex.value = index
    }
    
    const submit = async () => {
      if (!agreement.value) {
        root.$message.warning("请阅读并勾选协议")
        return
      }
      if (!pickupMobile.value || !REGULAR.mobileNumber.test(pickupMobile.value)) {
        root.$message.warning("请输入正确的手机号")
        return
      }
      
      const { id, name } = props.branchInfo[selectIndex.value]
      const res = await waybillApi.setSelfPickupInfo({
        waybillNumber: props.waybillNumber,
        selfSufficiencyBranchId: id,
        selfSufficiencyBranch: name,
        selfSufficiencyMobile: pickupMobile.value
      })
      if (res.code === 0) {
        root.$message.success("设置成功")
        emit("refresh")
      }
      
      dialogVisible.value = false
    }
    
    const agreementVisible = ref(false)
    
    const showAgreement = () => {
      agreementVisible.value = true
    }
    
    return {
      dialogVisible,
      showDialog,
      handlerClose,
      selectIndex,
      toggleSelect,
      pickupMobile,
      agreement,
      submit,
      beforeClose,
      agreementVisible,
      showAgreement
    }
  }
})

</script>

<style lang='scss' scoped>
.receipt {
  width: 660px;
  height: 54px;
  display: flex;
  align-items: center;
  background-color: #fdfcff;
  background-image: url("~@assets/image/waybill/branch-info-bg.png");
  background-size: contain;
  background-position: bottom right;
  background-repeat: no-repeat;
  margin: 0 auto 20px;
  box-sizing: border-box;
  padding-left: 20px;
  color: #666666;
  font-size: 14px;
  padding-right: 75px;
  
  
  > span {
    max-width: 480px;
    color: #03050D;
  }
}

.select-wrapper {
  margin-bottom: 20px;
  
  .select {
    width: 660px;
    box-sizing: border-box;
    padding: 16px 20px 22px;
    border: 1px solid #e9e9e9;
    
    &:first-of-type {
      border-radius: 4px 4px 0px 0px;
    }
    
    &:last-of-type {
      border-radius: 0px 0px 4px 4px;
    }
    
    .top {
      display: flex;
      justify-content: space-between;
      height: 24px;
      margin-bottom: 8px;
      
      .info {
        line-height: 24px;
        
        span {
          font-size: 16px;
          
          &:first-of-type {
            color: #03050D;
            margin-right: 12px;
          }
          
          &:last-of-type {
            color: #8F8FA8;
          }
        }
      }
      
      .icon {
        width: 24px;
        height: 24px;
        border: 2px solid #666666;
        border-radius: 50%;
        box-sizing: border-box;
      }
      
      i {
        font-size: 24px;
        color: #8365F6;
      }
    }
    
    .bottom {
      display: flex;
      font-size: 13px;
      color: #666666;
      
      span {
        width: 65px;
      }
      
      p {
        color: #03050D;
        max-width: calc(100% - 70px);
        margin-left: 5px;
        line-height: 18px;
        
        .iconfont {
          color: #7556ED;
          font-size: 12px;
        }
      }
    }
  }
  
  .selected {
    border-color: #8365F6;
    background-color: #F8F6FF;
  }
}

.phone {
  width: 100%;
  background-color: #f8f8f8;
  background-image: url("~@assets/image/waybill/waybill-tel.png");
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 55px;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 16px;
  
  .title {
    font-size: 14px;
    font-weight: bold;
    color: #03050D;
    margin-bottom: 12px;
  }
  
  .input {
    margin-bottom: 8px;
    
    /deep/ {
      .el-input__inner {
        
        width: 375px;
        height: 38px;
        background: #ffffff;
        border-radius: 4px;
        font-size: 13px;
        line-height: 38px;
        padding: 8px;
        
        //input::foce {
        //  border-bottom: 0;
        //}
      }
    }
  }
  
  .tips {
    width: 100%;
    height: 17px;
    font-size: 12px;
    text-align: left;
    color: #8f8fa8;
    line-height: 17px;
    margin-bottom: 4px;
  }
  
  .link {
    color: #4f7cee;
  }
}
</style>