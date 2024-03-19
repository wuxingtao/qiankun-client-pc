<!-- 气泡提示 -->
<template>
  <div v-show="showBubble" class="ky-ui-bubble">
    <span v-if="showHtml" v-html="msg"></span>
    <template v-else><span>{{ msg }}</span></template>
    <i class="iconfont icon-btn-icon" @click="handleClose"></i>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'ky-ui-bubble',
  props: {
    msg: { type: String },
    showHtml: { type: Boolean },
  },
  setup (props, ctx) {
    const state = reactive({
      isHide: false
    })

    const showBubble = computed(() => {
      return !state.isHide && props.msg
    })

    watch(() => props.msg, () => {
      state.isHide = false
    }, { immediate: true })

    function updateHide (val) {
      state.isHide = val
    }

    function handleClose () {
      state.isHide = true
      this.$emit('close')
    }

    return { ...toRefs(state), showBubble, handleClose, updateHide }
  }
})
</script>

<style lang="scss" scoped>
.ky-ui-bubble {
  display: flex;
  position: absolute;
  background: #ffffff;
  color: #F8782D;
  border-radius: 4px;
  padding: 8px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 400;
  word-break: break-all;
  line-height: 1.4;
  z-index: 2;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
  0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);

  .iconfont {
    font-size: 12px !important;
    padding-left: 10px;
    cursor: pointer;
  }

  &::after {
    content: "";
    border-color: transparent transparent #ffffff;
    border-width: 0 6px 6px;
    border-radius: 3px;
    border-style: solid;
    position: absolute;
    top: -5px;
    left: 20px;
  }
}
</style>
