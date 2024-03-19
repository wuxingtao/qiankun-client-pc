<template>
  <div :class="['ky-ui-tip mb_12', `is--${type}`]" v-bind="$attrs">
    <i class="iconfont icon-warning pl_14 pr_8 fs_12--strict" :style="iconStyleComputed"></i><span><slot></slot></span>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'ky-ui-tip',
  props: {
    tip: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => 'warning'
    },
    iconColor: {
      type: String,
      default: () => ''
    }
  },
  setup(props) {
    const state = reactive({})

    const iconStyleComputed = computed(() => {
      let result = ''
      if(props.iconColor){
        result += `color:${props.iconColor}`
      }
      return result
    })
    return { ...toRefs(state), iconStyleComputed }
  }
})
</script>

<style lang="scss" scoped>
.ky-ui-tip {
  line-height: 1.32;
  opacity: 0.9;
  border-radius: 4px;
  padding: 10px 0;
  display: flex;

  &.is--error {
    background: #fff6f6;
    color: #ff706d;
  }

  &.is--warning {
    color: #ff8038;
    background: #fff9e6;
    font-size: 12px;
  }

  &.is--info {
    font-size: 12px;
    background: url('~@assets/image/tip-bg.png') no-repeat top right,
      linear-gradient(270deg, #faf8ff, #f2effe);
    background-size: contain;

    .iconfont {
      color: #8365f6;
    }
  }

  &.is--plain {
    background: none;
    padding: 4px 0;
    display: flex;
    align-items: baseline;

    .iconfont {
      color: #8365f6;
      padding-left: 0;
    }
  }

  &.is--plain-warning {
    background: none;
    height: 22px;
    line-height: 22px;
    color: #ff8038;

    .iconfont {
      padding-left: 0;
      padding-right: 4px;
    }
  }
}
</style>
