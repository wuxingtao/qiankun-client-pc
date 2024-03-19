<template>
  <div :class="['error-page',`error-page-${type}`]" v-bind="$attrs">
    <div class="error-page-content">
      <img src="@/assets/image/net_error.png">
      <p class="error-text fs_14">网络异常</p>
      <el-button type="primary" size="small" @click="handleClick">刷新</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'net-error',
  props: {
    btnClick: {
      type: Function,
      default: () => {}
    },
    type: {
      type: String,
      default: () => 'full'
    }
  },
  setup (props, { emit }) {
    const state = reactive({})

    function handleClick () {
      emit('btnClick')
    }

    return { ...toRefs(state), handleClick }
  }
})
</script>

<style lang="scss" scoped>
.error-page {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &.error-page-full {
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #ffffff;
    z-index: 10000;
  }

  img {
    width: 160px;
    height: 160px;
    display: block;
    margin: auto;
  }

  .error-text {
    margin: 20px 0;
    color: $--color-text-primary;
  }
}
</style>
