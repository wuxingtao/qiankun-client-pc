<template>
  <div class="ky-search-container" v-bind="$attrs">
    <slot />
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
  .ky-search-container {
    display: flex;
    padding: 20px 0;
    border-bottom: 1px solid #f1f1f5;
    font-size: 14px;
    color: #333333;
    &>div{
      white-space: nowrap;
    }
    & > div,
    button {
      display: inline-block;
      padding-right: 12px;
      & > :first-child {
        padding-right: 8px;
      }
    }
    /deep/ {
      .date-picker {
        &.el-input__inner {
          width: 270px;
          border-radius: 18px;
          background: #eef3fc;
          border: 0 !important;
          .el-range-separator {
            font-size: 0;
            width: 12px;
            height: 13px;
            background: url("~@/assets/image/date-arrow.png") no-repeat top left;
            background-size: contain;
          }
          .el-range-input {
            border: 0 !important;
            background-color: transparent;
          }
          .el-icon-date {
            position: absolute;
            right: 16px;
            color: #7556ed;
          }
        }
      }
      .el-input {
        display: inline-block;
        width: 166px;
        & > input {
          border: none;
          border-radius: 19px !important;
          padding: 0 26px 0 12px !important;
          background: #eef3fc;
           &:focus {
      border-bottom: unset  !important;
    }
        }
      }
      .el-select {
        .el-input__inner {
          border: none;
          border-radius: 19px;
          padding: 0 12px;
          background: #eef3fc;
        }
        .el-input__suffix {
          right: 12px;
          .el-select__caret {
            width: 12px;
          }
        }
      }
    }
  }
</style>