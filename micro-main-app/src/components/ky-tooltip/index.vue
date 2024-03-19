<template>
  <div
    v-show="!isHide && msg"
    :class="['ky-tooltip__container', { 'hide-close': !canClose }, type ? `is--${type}` : '']"
  >
    <span v-if="showHtml" v-html="msg"></span>
    <template v-else>{{ msg }}</template>
    <i class="el-icon-close" @click="handleClose" v-if="canClose"></i>
  </div>
</template>

<script>
export default {
  props: {
    msg: { type: String },
    showHtml: { type: Boolean },
    value: { type: [String, Number, Object] }, //对应输入控件的值
    canClose: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default:'warning'
    }
  },
  data() {
    return {
      isHide: false
    }
  },
  methods: {
    handleClose() {
      this.isHide = true
      this.$emit('close', this.value)
    }
  },
  watch: {
    value: {
      handler() {
        this.isHide = false
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.ky-tooltip__container {
  // white-space: break-spaces;
  display: flex;
  align-items: center;
  word-break: break-all;
  z-index: 2;
  position: absolute;
  // padding: 3px 28px 3px 8px;
  padding: 3px 8px;
  line-height: 16px;
  border-radius: 4px;
  &.hide-close {
    padding-right: 3px;
  }
  &::after {
    content: '';
    background: url('~@assets/image/delivery/arrow-red.svg');
    width: 12px;
    height: 8px;
    position: absolute;
    top: -7px;
    left: 20px;
  }
  &.is--error {
    border: 1px solid #ffabaa;
    background: #ffe6e3;
    color: #fc7172;
    &::after {
      border-color: transparent transparent #fc7172;
    }
  }
  &.is--warning{
    background: #fff9e6;
    border: 1px solid #ffa877;
    color: #fb7d36;
    &::after {
      border-color: transparent transparent #ffa877;
    }
  }
  
  .el-icon-close{
    padding-left: 8px;
    cursor: pointer;
  }
  // .el-icon-circle-close {
  //   float: right;
  //   position: absolute;
  //   top: 3px;
  //   right: 0;
  //   cursor: pointer;
  //   color: #c0c4cc;
  //   padding: 4px;
  // }
}
</style>