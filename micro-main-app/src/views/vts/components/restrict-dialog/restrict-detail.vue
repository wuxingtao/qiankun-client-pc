<template>
  <div class="vts-restrict-detail"
       :class="restrictType.class">
    <svg-icon :icon-class="restrictType.icon"></svg-icon> {{detail.noticeMessage||''}}
  </div>
</template>

<script>
  import { abnormalType } from './config'
  export default {
    props: {
      detail: {
        type: Object
      },
    },
    data () {
      return {
        abnormalType,
      }
    },
    computed: {
      restrictType () {
        let type = this.detail && this.detail.limitReason || '80'
        return this.abnormalType[type]
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vts-restrict-detail {
    height: 40px;
    line-height: 40px;
    background: #fff4e6;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    padding-right: 16px;
    font-size: 12px;
    margin-right: 16px;
    .svg-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      overflow: hidden;
      margin-right: 8px;
    }
  }
  .restrict-yq {
    background: #fff4e6;
    color: #ff8000;
  }
  .restrict-tf {
    background: #d5e0f7;
    color: #3d72de;
  }
  .restrict-xq {
    background: #c0edfb;
    color: #048db8;
  }
  .restrict-jq {
    background: #ffdbd1;
    color: #f34747;
  }
</style>