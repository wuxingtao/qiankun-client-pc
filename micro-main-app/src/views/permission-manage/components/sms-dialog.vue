<template>
  <ky-dialog
    title="短信验证"
    :visible.sync="dialogVisible"
    width="380px"
    :close-on-press-escape="false"
  >
    <div class="verify-message c_03050d">
      <p>确认是您本人操作</p>
      <p>验证码已发送到您尾号{{ telFilter }}的手机。</p>
    </div>
    <verify-code :callback="uam_sendCode" ref="codeRef" />
    <div slot="footer" class="dialog-footer">
      <el-button size="medium" type="primary" @click="handleSubmit" :disabled="submitDisabled">
        确定
      </el-button>
    </div>
  </ky-dialog>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  computed,
  watch,
  nextTick
} from '@vue/composition-api'
import VerifyCode from '@/views/permission-manage/components/verify-code'
import { uam_smsSend } from '@api/permission'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'sms-dialog',
  props: {
    // 发送验证码方法
    sendCodeFn: {
      type: Function,
      default: () => {}
    },
    // 验证码提交
    submitFn: {
      type: Function,
      default: () => {}
    }
  },
  components: {
    VerifyCode
  },
  setup(props, { emit }) {
    const codeRef = ref(null)

    const state = reactive({
      dialogVisible: false,
      submitDisabled: computed(() => {
        return codeRef.value?.getSmsCode().length !== 6
      })
    })

    watch(
      () => state.dialogVisible,
      val => {
        if (!val) {
          resetDialog()
        }
      }
    )

    const { auth_user_info } = usePermissionStore()

    const telFilter = computed(() => {
      const userTel = auth_user_info.value?.userTel
      return userTel ? userTel.slice(userTel.length - 4) : ''
    })

    function openDialog() {
      state.dialogVisible = true
      nextTick(() => {
        codeRef.value?.compInit(false)
      })
    }

    function closeDialog() {
      state.dialogVisible = false
    }

    // 发送验证码请求
    async function uam_sendCode() {
      props.sendCodeFn && props.sendCodeFn()
    }

    // 验证码提交
    function handleSubmit() {
      emit('submitFn', { smsCode: codeRef.value.getSmsCode(), callback: handleSubmitCallback })
    }

    // 验证码提交后接口回调
    function handleSubmitCallback(res) {
      if (res.code === 0) {
        codeRef.value.handleResetError()
      } else {
        codeRef.value.handleSetError(res.msg)
      }
    }

    function resetDialog() {
      codeRef.value?.reset()
    }

    return {
      ...toRefs(state),
      codeRef,
      telFilter,
      openDialog,
      closeDialog,
      handleSubmit,
      uam_sendCode
    }
  }
})
</script>

<style lang="scss" scoped>
.verify-message {
  text-align: center;
  line-height: 1.4;
  margin: 8px 0 25px;
}
</style>
