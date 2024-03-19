<template>
  <ky-dialog
    class='common-contact--container page-style1'
    width='360px'
    v-bind='$attrs'
    ref='kyDialog'
    :destroyOnClose='true'
    :title='title'
    :visible-footer='false'
    @update:visible='toggleVisible'>
    <template v-if='!real'>
      <div>输入您需要拨打的手机号码，帮您获取{{ descText }}的号码</div>
      <div class='mobile--wrapper'>
        <el-input v-model='mobile' maxlength='11' size='small' />
        <el-button type='primary' size='small' @click='getVirtualMobile'>
          获取{{ descText }}号码
        </el-button>
      </div>
    </template>
    <div class='virtal-mobile--wrapper' v-if='virtualMobile || real'>
      <div>
        <span class='text'>{{ descText }}电话：</span>
        <span class='mobile'>{{ mobileNumber }}</span>
        <el-button type='text' class='button' v-clipboard='virtualMobile || mobileNumber'>
          <svg-icon icon-class='copy' class='icon-copy' />
        </el-button>
      </div>
      <slot></slot>
      <div v-if='!real'>用您输入的手机号码，拨打该号码联系{{ descText }}</div>
    </div>
  </ky-dialog>
</template>

<script>
import { getPhone } from '@/utils/storage'
import REGULAR from '@/utils/regular'
import TemplateAdd from '@/views/setting/batchTemplate/template-add'

export default {
  name: 'commonContact',
  components: { TemplateAdd },
  props: {
    waybillNumber: {
      type: String
    },
    title: {
      type: String,
      default: ''
    },
    real: {
      type: Boolean,
      default: false
    },
    realMobile: {
      type: String
    },
    virtualMobile: {
      type: String
    },
    descText: {
      type: String
    }
  },
  data() {
    return {
      mobile: ''
    }
  },
  created() {
    this.mobile = getPhone()
  },
  computed: {
    mobileNumber() {
      if (this.real) {
        return this.realMobile
      } else {
        return this.virtualMobile.replace(/^(\d{3})(\d{4})(\d+)/, '$1 $2 $3')
      }
    }
  },
  methods: {
    async getVirtualMobile() {
      const reg = REGULAR.mobileNumber
      if (!reg.test(this.mobile)) {
        this.$message('请输入正确的手机号')
      } else {
        this.$emit('getVirtualMobile', this.mobile)
      }
    },
    toggleVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
.common-contact--container {
  .mobile--wrapper {
    padding-top: 23px;
    display: flex;
    
    button {
      margin-left: 12px;
    }
  }
  
  .virtal-mobile--wrapper {
    width: 320px;
    height: 100px;
    box-sizing: border-box;
    margin-top: 26px;
    padding: 16px 12px;
    border-radius: 4px;
    color: #999999;
    background-color: #f8f8f8;
    background-image: url("~@assets/image/waybill/waybill-tel.png");
    background-position: right bottom;
    background-size: 55px;
    background-repeat: no-repeat;
    
    & > div {
      &:first-of-type {
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        
        .text,
        .mobile {
          font-size: 18px;
          font-weight: bold;
          color: #666666;
        }
        
        .mobile {
          color: #03050D;
          margin-right: 6px;
        }
        
        .button {
          padding: 0;
        }
      }
      
      &:last-of-type {
        font-size: 12px;
      }
    }
  }
}
</style>
