<template>
  <div :class="['ky-tip__container',`is-${type}`]" v-bind='$attrs' v-tip.bottom="msg">
    <i :class="['iconfont',iconClass,'fs_12--strict']" />
    <span>
      <slot>{{msg}}</slot>
    </span>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'ky-tip',
  props: {
    msg: { type: String },
    type: {
      type: String,
      default: () => 'warning'
    },
    iconClass: {
      type: String,
      default: 'icon-warning'
    }
  },
  setup () {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style lang='scss' scoped>
  .ky-tip__container {
    font-size: $--font-size-small;
    line-height: 1;
    padding-top: 3px;
    color: #ff8038;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: absolute;
    width: 100%;
    &>span{
      font-size: $--font-size-small;
    }
    .iconfont {
      padding: 0 4px 0 1px;
      font-size: $--font-size-small;
    }
    &.is-plain{
      color: #666666;
    }
    &.is-tip{
      color: #ffa40d;
    }
    // &.is-error {
    //   background: #fff6f6;
    //   color: #ff706d;
    // }

    // &.is-warning {
    //   color: #ff8038;
    //   background: #fff9e6;
    // }

    // &.is-info {
    //   font-size: 12px;
    //   background: url('~@assets/image/tip-bg.png') no-repeat top right, linear-gradient(270deg, #faf8ff, #f2effe);
    //   background-size: contain;
    //   .iconfont {
    //     color: #8365f6;
    //   }
    // }

    // &.is-plain {
    //   background: none;
    //   height: 22px;
    //   line-height: 22px;

    //   .iconfont {
    //     color: #8365f6;
    //     padding-left: 0;
    //   }
    // }

    // &.is-plain-warning {
    //   background: none;
    //   height: 22px;
    //   line-height: 22px;
    //   color: #FF8038;

    // }
  }
</style>
