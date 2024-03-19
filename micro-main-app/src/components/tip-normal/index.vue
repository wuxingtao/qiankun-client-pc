<template>
  <div v-show="!isHide&&msg" :class="['tip-normal--container',{'hide-close':!canClose},tipType?`is--${tipType}`:'']">
    <span v-if="showHtml" v-html="msg"></span>
    <template v-else>{{msg}}</template>
    <i class="el-icon-circle-close" @click="handleClose" v-if="canClose"></i>
  </div>
</template>

<script>
export default {
  props: {
    msg: { type: String },
    showHtml:{type:Boolean},
    value:{type:[String,Number,Object]},//对应输入控件的值
    canClose:{
      type:Boolean,
      default:true
    },
    tipType:{type:String}
  },
  data () {
    return {
      isHide: false,
    }
  },
  methods: {
    handleClose () {
      this.isHide = true
      this.$emit('close',this.value)
    }
  },
  watch: {
    value: {
      handler () {
        this.isHide = false
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .tip-normal--container {
    // white-space: pre-line; 
    // white-space: nowrap;
    word-break: break-all;
    z-index: 2;
    position: absolute;
    background: #ffffff;
    border-radius: 4px;
    padding: 3px 20px 3px 8px;
    margin-top: 6px;
    font-size: $--font-size-small;
    color: #ffa40d;
    font-weight: 400;
    // cursor: pointer;
    line-height: 18px;
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
      0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
    &.hide-close{
      padding-right: 3px;
    }
    .el-icon-circle-close {
      float: right;
      position: absolute;
      top: 3px;
      right: 0;
      cursor: pointer;
      color: #C0C4CC;
      padding: 4px;
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
    &.is--error{
      background-color: #ffe6e3;
      color: #fc7172;
      &::after{
        border-color: transparent transparent #fc7172;
      }
    }
  }
</style>