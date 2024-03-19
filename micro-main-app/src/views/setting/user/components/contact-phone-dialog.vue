<template>
  <ky-dialog :title="`联系${serviceType}`" custom-class="contact-phone-dialog__container" :visible.sync="dialogVisible" :append-to-body="appendBody" width="400px" confirm-text="我知道了" cancelText="" @confirm="handleConfirm">
    <div class="tip">
      <i class="iconfont icon-info4" />
      {{phone?'为了保护您的隐私，将会以虚拟号码联系商务':'您可拨打95324联系专属客服获取客户编码哦'}}
    </div>
    <div class="contact__wrapper">
      <div class="contact--header">
        <span>{{ `跨越${serviceType}` }}</span>
      </div>
      <div class="contact--phone">
        <div>{{ `专属${serviceType}联系电话：`}}</div>
        <div>{{ formatPhone(phone) || '95324'}}
          <i class="iconfont icon-copy cursor"  v-clipboard="phone || '95324'"/>
        </div>
        <div v-if="phone" class="msg">用您当前登录的手机号码，拨打联系商务</div>
      </div>
    </div>
  </ky-dialog>
</template>

<script>
import { computed, reactive, toRefs } from '@vue/composition-api'
import useDialogVisibleSync from '@/hooks/useDialogVisibleSync'
import formatUtil from '@utils/format'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String
    },
    appendBody:{
      type: Boolean,
      default: false,
    }
  },
  setup (props, { emit }) {
    const { dialogVisible } = useDialogVisibleSync({ props, emit })

    const state = reactive({
      company: ''
    })

    const serviceType = computed(()=>props.phone ? '商务' : '客服')

    const handleConfirm = () => {
      dialogVisible.value = false
    }
    const formatPhone = phone =>{
      return formatUtil.formatMobliePhone(phone)
    }
    return {
      dialogVisible,
      ...toRefs(state),
      handleConfirm,
      serviceType,
      formatPhone
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-phone-dialog__container {
    .tip {
      padding-left: 12px;
      height: 30px;
      display: flex;
      align-items: center;
      background: #faf9ff;
      border-radius: 1px;
      color: #333333;
      font-size: $--font-size-small;
      & > i {
        margin-right: 8px;
        font-size: 14px;
        color: $--color-primary;
      }
    }
    .contact__wrapper {
      padding: 22px 14px;
      margin-top: 12px;
      background: url('~@/assets/image/setting/user/contact-bg.png') no-repeat;
      background-position: right top;
      background-color: #f8f8f8;
      display: flex;
      .contact--header {
        width: 56px;
        height: 65px;
        margin-right: 16px;
        position: relative;
        display: inline-block;
        background: url('~@/assets/image/setting/user/apply-result-header2.png') no-repeat;
        background-size: contain;
        & > span {
          position: absolute;
          bottom: 2px;
          left: 4px;
          font-size: 12px;
          color: #ffffff;
          white-space: nowrap;
          // transform: scale(0.5);
        }
      }
      .contact--phone{
        padding-top: 10px;
        &>div{
          &:first-of-type{
            font-size: $--font-size-medium;
            color: $--color-text-regular;
            line-height: 18px;
            margin-bottom: 8px;
          }
          &:nth-of-type(2){
          font-size: 20px;
          font-weight: bold;
          color: $--color-text-primary;
          &>i{
            color: $--color-primary;
          }
        }
        }
        .msg{
          margin-top: 17px;
          padding: 4px 8px;
          color: $--color-warning;
          background-color: #ffedd0;
          border-radius: 2px;
        }
      }
    }
  }
</style>
