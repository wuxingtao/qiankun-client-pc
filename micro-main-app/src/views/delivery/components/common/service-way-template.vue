<template>
  <div>
    <div class="serviceWay__warn" v-show="warningInfo">
      <i class="iconfont icon-warn" /> {{ warningInfo }}
    </div>
    <el-option
      v-for="item in options"
      :class="[item.description ? 'has-desc' : 'none-desc']"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    >
      <div class="option__wrapper">
        <div>
          <i class="dot" />
          {{ item.label }}
        </div>
        <div
          :class="['desc ellipsis-2', item.longDecFlag === '10' ? 'desc__warn' : '']"
          v-show="item.description"
          v-html="item.descriptionHtml"
        ></div>
        <div class="option__sign" v-show="item.restrictTypeName">{{item.restrictTypeName}}</div>
      </div>
    </el-option>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
export default {
  props: {
    options: {
      type: Array
    }
  },
  setup(props){
    const warningInfo = computed(()=>{
      let item = props.options?.find(s => s.noticeContent)
      if(item){
        return item.noticeContent
      }
      item = props.options?.find(s => s.addDayFlag === '10')
      const msg = '因收件地址为偏远地区需加时效，请注意查看预计到达时间'
      return item ? msg : ''
    })

    return{
      warningInfo
    }
  }
}
</script>

<style lang="scss">
.serviceWay__table-editable-select-popper,
.single-serviceWay--popper {
  &.el-select-dropdown {
    .serviceWay__warn {
      color: #fe985c;
      line-height: 17px;
      padding: 11px 20px;
      position: relative;
      &::after {
        content: '';
        height: 10px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        background: linear-gradient(180deg, rgba(248, 248, 248, 0), #f8f8f8);
      }
    }

    .el-select-dropdown__list{
      padding: 8px;
      max-width: 380px;
    }

    .el-select-dropdown__item {
      min-height: 34px;
      height: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 10px 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      overflow: hidden;
      color: #333333;
      background-color: #f4f3ff;
      border: 1px solid transparent;
      &:last-child{
        margin-bottom: 0;
      }
      *{
        font-size: 12px;
      }
      &.has-desc {
        min-height: 54px;
        .dot {
          display: inline-block;
        }
      }
      &.none-desc {
        margin-bottom: 6px;
        .dot {
          display: none;
        }
      }
      &.selected{
        position: relative;
        &::after{
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          width: 18px;
          height: 14px;
          background: url('~@/assets/image/waybill/service-selected.png') top right;
          background-size: contain;
        }
        .dot{
          background: $--color-primary !important;
        }
      }
      &.selected .option__wrapper > div {
        &:first-of-type {
          color: $--color-primary;
        }
        &.desc .high-light {
          color: #fe985c;
        }
      }
      &.hover{
        border: 1px solid $--color-primary;
        //color: #ffffff;
        //background-color: #c3b3ff;
        //*{
        //  color: #ffffff !important;
        //}
        //.dot{
        //  background: #ffffff !important;
        //}
      }
      &.is-disabled{
        background-color: #f2f3f8;
        *,.desc,.desc > *,.dot{
          color: #afb5cb !important;
        }
        .dot{
          background-color: #aaaebf !important;
        }
      }
      .option__wrapper > div {
        line-height: 1;
        &:first-of-type {
          font-size: $--font-size-small;
          font-weight: bold;
          display: flex;
          align-items: center;
          .dot {
            width: 4px;
            height: 4px;
            background: #999999;
            border-radius: 50%;
            margin-right: 9px;
          }
        }
        &.desc {
          padding-left: 15px;
          margin-top: 8px;
          color: #999999;
          line-height: 16px;
          overflow: hidden;
          .high-light {
            color: $--color-text-primary;
          }
        }
        &.desc__warn {
          color: #fe985c;
        }
      }
      .option__sign{
        position: absolute;
        right: 0;
        top: 0;
        font-size: 12px;
        padding: 2px 4px;
        color: #ffffff !important;
        background: #afb5cb;
        border: 1px solid #ffffff;
        border-radius: 0 4px 0 6px;
        font-family: PingFangSC, PingFangSC-Regular,serif;
      }
    }
  }
}
</style>
