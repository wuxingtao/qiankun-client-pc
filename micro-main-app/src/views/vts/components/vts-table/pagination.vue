<template>
  <el-pagination background
                 :current-page.sync="pagination.pageIndex"
                 :page-size.sync="pagination.pageSize || 10"
                 :page-sizes="pagination.pageSizes || [10, 15, 20,30, 50]"
                 layout="total, ->,prev, pager, next,jumper,slot,sizes"
                 :total="Number(pagination.totalCount)"
                 @size-change="$emit('size-change',$event)"
                 @current-change="$emit('current-change',$event)">
    <el-button type="primary"
               size="mini"
               style="height: 28px;line-height: 28px;padding: 0 10px;margin-right: 5px; background: #9c84f8; border-color: #9c84f8;"
               round>确定</el-button>
  </el-pagination>
</template>

<script>
  export default {
    props: {
      pagination: {
        type: Object,
        default: () => ({
          totalCount: 0,
          pageSize: 10,
          pageIndex: 1,
        }),
        require: true,
      }
    },
    data () {
      return {
      }
    }
  }
</script>

<style lang="scss">
  .el-pagination.is-background {
    input,
    input:focus {
      border-bottom: unset !important;
    }
    .btn-prev,
    .btn-next {
      margin: 0;
      border: 1px solid #d6dde5;
      background: none;
      color: #666666;
    }

    .btn-prev {
      border-top-left-radius: 50%;
      border-bottom-left-radius: 50%;
    }

    .btn-next {
      border-top-right-radius: 50%;
      border-bottom-right-radius: 50%;
      margin-left: -1px;
    }
    .el-pager > li {
      margin: 0;
      border-radius: 0;
      background: none;
      border: 1px solid #d6dde5;
      border-right: none;
      &:first-of-type {
        border-left: none;
      }
      &.active {
        border-color: #8365f6;
      }
    }
    .el-pagination__jump {
      .el-input__inner {
        background: #f2f6fd !important;
        border-radius: 14px !important;
      }
    }
    .el-pagination__sizes {
      .el-input--suffix {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .el-input__inner {
        background: #ffffff !important;
        border: 1px solid #d6dde5 !important;
        border-radius: 15px !important;
      }
    }
    .el-pagination__total {
      color: #333333;
      font-size: 14px;
    }
  }
</style>
