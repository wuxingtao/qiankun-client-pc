<template>
  <div class="send-code">
    <el-button type="text" class="smsText fs_12" @click="()=>countDownCode(true)" :disabled="smsText !== '重新获取'">{{
        smsText
      }}
    </el-button>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, onMounted } from '@vue/composition-api'

export default defineComponent({
  name: 'send-code',
  props: {
    callback: {
      type: Function,
      default: () => {}
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      smsText: '获取验证码',
      countdown: 60,
      sending: false
    })

    /**
     * 倒计时
     * @param needSend 是否需要发送验证码
     * @returns {Promise<void>}
     */
    async function countDownCode (needSend=true) {
      if (state.sending) {
        return
      }
      try {
        if (props.callback && needSend) {
          await props.callback()
        }
        switchTip(true)
        state.smsText = `${state.countdown}s后重新获取`
        let timeCountDown = setInterval(() => {
          if (state.countdown > 0) {
            state.countdown--
            state.smsText = `${state.countdown}s后重新获取`
          } else {
            clearInterval(timeCountDown)
            state.smsText = '重新获取'
            state.countdown = 60
            switchTip(false)
          }
        }, 1000)
      } finally {
        state.loading = false
      }
    }

    function switchTip (val) {
      state.sending = val
      emit('switchTip', val)
    }

    return { ...toRefs(state), countDownCode }
  }
})
</script>

<style scoped>
.send-code {
  width: 100px;
  display: inline-block;
}
</style>
