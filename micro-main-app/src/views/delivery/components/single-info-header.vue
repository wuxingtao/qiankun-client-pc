<template>
  <div class='category-caption' v-if='!isShowInDialog'>
    <span>
      <i class='iconfont' :class='icon' v-if='icon' />
      <slot name='title'>
        {{ title }}
      </slot>
      <slot name='default' />
    </span>
    <slot name='common' />
  </div>
  <div class='category-caption-dialog' v-else>
    <span class='caption'>{{ title }}</span>
    <slot name='default-dialog' />
    <slot name='common' />
  </div>
</template>

<script>
export default {
  props: {
    isShowInDialog: { type: Boolean },
    title: { type: String },
    icon: { type: String, required: true }
  }
}
</script>

<style lang='scss' scoped>
@mixin title-tip{
  margin-left: 8px;
  font-size: $--font-size-small;
  color: #717187;
  text-overflow: ellipsis;
  overflow: hidden;
}
.category-caption {
  & > span {
    // margin-bottom: 6px;
    height: 38px;
    line-height: 38px;
    font-size: 14px;
    font-weight: bold;
    color: $--color-text-primary;
    display: flex;
    align-items: center;

    .title {
      white-space: nowrap;
      font-size: 14px;
      font-weight: bold;
      width: 0;
      flex: 1;
      display: flex;
      &-tip{
         @include title-tip;
      }
    }

    & > .iconfont {
      margin-right: 8px;
      font-size: 18px;

      &.icon-sender,
      &.icon-receiver {
        font-size: 18px;
      }

      &.icon-category-goods,
      &.icon-category-addtional,
      &.icon-category-remarks,
      &.icon-iconfaq {
        font-size: 16px;
      }
    }
  }

  .icon-btn {
    margin-right: 8px;
    font-size: 16px;
  }

  .address-book {
    margin-left: auto;
    white-space: nowrap;

    /deep/ button {
      box-sizing: border-box;
      background: rgba(242, 239, 254, 0.7);
      border: 1px solid #8365f6;
      border-radius: 4px;
      padding: 5px 8px;

      & > span {
        display: inline-flex;
        align-items: center;

        & > .iconfont {
          margin-right: 8px;
        }
      }
    }

    .el-button + .el-button {
      margin-left: 16px;
    }
  }
}

.category-caption-dialog {
  height: 28px;
  background: linear-gradient(270deg, #fafafa, #f1f1f1);
  border-radius: 4px;
  color: #999999;
  margin-top: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 20px;
  //单票修改时需要使用
  display: flex;
  align-items: center;

  .coupon-info-desc {
    padding-left: 0px !important;
  }

  .caption {
    width: 105px;
    height: 100%;
    line-height: 28px;
    box-sizing: border-box;
    padding-left: 16px;
    margin-right: 16px;
    background: url('~@/assets/image/delivery/category-bg.png') no-repeat;
    color: #ffffff;
  }
  .title-tip{
    @include title-tip;
    margin-left: 0;
  }

  .category-arrow {
    display: inline-flex;
    cursor: pointer;
    position: absolute;
    right: 20px;
    align-items: center;
    justify-content: center;

    .ky-iconfont {
      font-size: 10px;
      margin-left: 2px;
    }
  }

  .coupon-info {
    &-desc {
      left: 120px !important;
    }

    &-change {
      padding: 2px !important;
    }

    &-active {
      & > span {
        margin-top: 0 !important;
      }
    }
  }
}
</style>