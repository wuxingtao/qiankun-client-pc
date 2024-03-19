<template>
  <div class="verify-code">
    <div :class="['input-content flex flex_jc_c', inputFocus && 'is-focus']" @click="handleFocus">
      <el-input
        class="input-hidden"
        maxlength="6"
        v-kyerestrict.positive
        v-model.trim="valueString"
        ref="inputRef"
        autofocus
        @blur="handleBlur"
      />
      <ul :class="['input-lists flex flex_ai_c', errorInfo.status && 'has-error']">
        <li
          :class="[
            'input-item',
            inputArr.length === index + 1 && 'is-selected',
            inputArr.length === 0 && index === 0 && 'no-select'
          ]"
          v-for="(item, index) in inputTotal"
          :key="index"
        >
          <span>{{ inputArr[index] }}</span>
        </li>
      </ul>
    </div>
    <div class="send-code-wrapper w_full">
      <div class="input-error" v-show="errorInfo.status">
        {{ errorInfo.message }}
      </div>
      <send-code @switchTip="switchTip" :callback="callback" class="send-code" ref="codeRef" />
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  watch,
  nextTick
} from '@vue/composition-api'

export default defineComponent({
  name: 'verify-code',
  props: {
    callback: {
      type: Function,
      default: () => {}
    }
  },
  components: {
    'send-code': () => import('./send-code')
  },
  setup(props, { root, emit }) {
    const initialData = {
      inputTotal: ['', '', '', '', '', ''],
      valueString: '', // 输入短信码
      inputFocus: true,
      // 验证错误信息
      errorInfo: {
        status: false,
        message: ''
      }
    }
    const state = reactive({ ...initialData })

    const inputArr = computed(() => {
      if (!state.valueString) {
        return []
      }
      return state.valueString.split('')
    })

    const auth_user_info = computed(() => {
      return root.$store.state.permission.auth_user_info || {}
    })

    watch(
      () => state.valueString,
      async val => {
        if (val?.length === 6) {
          handleInputEmit(val)
        }
        if (state.errorInfo.message) {
          handleResetError()
        }
      }
    )

    const inputRef = ref(null)
    const codeRef = ref(null)

    function handleFocus() {
      inputRef.value?.focus()
      state.inputFocus = true
      inputRef.value.$refs.input.selectionStart = state.valueString.length
      inputRef.value.$refs.input.selectionStart = state.valueString.length
    }

    function handleClear() {
      state.valueString = ''
    }

    function handleInputEmit(val) {
      emit('change', val)
    }

    function reset() {
      handleClear()
      Object.assign(state, initialData)
      handleResetError()
    }

    function compInit(needSend=true) {
      nextTick(() => {
        handleFocus()
        setTimeout(() => {
          countDownCode(needSend)
        }, 100)
      })
    }

    function switchTip() {}

    function handleResetError() {
      Object.assign(state.errorInfo, {
        status: false,
        message: ''
      })
    }

    function handleSetError(msg) {
      Object.assign(state.errorInfo, {
        status: true,
        message: msg
      })
    }

    function handleBlur() {
      state.inputFocus = false
    }

    function countDownCode(needSend) {
      codeRef.value?.countDownCode(needSend)
    }

    // 获取验证码
    function getSmsCode() {
      return state.valueString || ''
    }

    return {
      ...toRefs(state),
      inputRef,
      codeRef,
      inputArr,
      handleFocus,
      handleClear,
      switchTip,
      handleBlur,
      countDownCode,
      compInit,
      reset,
      handleSetError,
      handleResetError,
      getSmsCode
    }
  }
})
</script>

<style lang="scss" scoped>
.verify-code {
  text-align: center;
}

.input-content {
  .input-item {
    width: 42px;
    height: 42px;
    background: #ffffff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    &:last-child {
      margin-right: 0;
    }
    span {
      font-size: 20px;
      color: #333333;
      font-weight: bold;
    }
  }

  &.is-focus {
    .input-item {
      &.is-selected + .input-item,
      &.no-select {
        border-color: #8365f6;

        &::before {
          content: '';
          border: none;
          margin: 0;
          height: 22px;
          width: 1px;
          position: absolute;
          left: 5px;
          top: 11px;
          z-index: 1;
          animation: 1s blink infinite;
        }
      }
    }
  }
}

.input-hidden {
  overflow: hidden;
  width: 1px;
  height: 1px;
  opacity: 0;
  //width: 0;
  //height: 0;
}

.input-lists {
  &.has-error {
    .input-item {
      border-color: #ff7374;
    }
  }
}

.input-error {
  color: #ff7374;
  position: absolute;
  top: 9px;
  bottom: 0;
  margin: auto;
  width: calc(100% - 88px);
  text-align: left;
}

.send-code-wrapper {
  position: relative;
  text-align: right;
  width: calc(100% - 32px);
  margin: auto;

  .send-code {
  }
}

@keyframes blink {
  50% {
    color: #000;
    background: blueviolet;
    opacity: 0.5;
  }
}

@-webkit-keyframes blink {
  50% {
    color: #000;
    background: blueviolet;
  }
}

@-ms-keyframes blink {
  50% {
    color: #000;
    background: blueviolet;
  }
}

@-moz-keyframes blink {
  50% {
    color: #000;
    background: blueviolet;
  }
}
</style>
