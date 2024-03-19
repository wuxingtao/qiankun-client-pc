<template>
  <el-pagination background :current-page.sync='pagination.pageIndex' :page-size.sync='pagination.pageSize' :page-sizes='pagination.pageSizes || [10, 15, 20, 30, 50]' layout='total, ->,prev, pager, next,jumper,slot,sizes' :total='Number(pagination.totalCount)' @size-change="$emit('size-change', $event)" @current-change="$emit('current-change', $event)">
  </el-pagination>
</template>

<script>
export default {
  props: {
    pagination: {
      type: Object,
      require: true
    }
  },
  data () {
    return {}
  },
  mounted () {
    const pageLists = document.getElementsByClassName('el-pagination__jump')
    for (let i = 0; i < pageLists.length; i++) {
      pageLists[i].childNodes[0].nodeValue = '跳至'
    }
  }
}
</script>

<style lang='scss'>
  $border_color: #d9d9d9;
  $height: 24px;

  .el-pagination.is-background {
    
    input {
      font-weight: normal !important;
      border: 1px solid $border_color !important;
      border-radius: 4px !important;
      color: #666666 !important;
      font-size: 12px;
    }

    .el-pagination__rightwrapper {
      display: flex;
      align-items: center;
      .btn-prev,
      .btn-next {
        box-sizing: border-box;
        border: 1px solid $border_color;
        background: none;
        color: #666666;
        margin: 0 4px;
        min-width: $height;
        height: $height;
        i {
          line-height: $height;
        }
      }

      .el-pager > li {
        background-color: #ffffff;
        box-sizing: border-box;
        border: 1px solid $border_color;
        border-radius: 2px;
        color: #666666;
        min-width: $height;
        margin: 0 4px;
        line-height: $height;
        height: $height;
        font-size: 12px;
        &.active {
          border-color: #dcdae2;
        }

        &:not(.disabled) {
          &.active {
            background-color: #f0edff;
            border-color: #dcdae2;
            color: #8365f6;
          }
        }
        &.el-icon-more::before{
              line-height: 24px;
        }
      }

      .el-pagination__jump {
        font-size: 12px;
        .el-input{
          width: 40px;
        }
        .el-input__inner {
          padding: 0 3px !important;
          height: 24px;
        }
        .el-pagination__editor{
          line-height: 1;
        }
      }

      .el-pagination__sizes {
        .el-input--suffix {
          display: flex;
          justify-content: center;
          align-items: center;
          line-height: 24px;
          .el-input__icon{
            line-height: 24px;
          }
        }
        .el-input{
          width: 90px;
          
        .el-input__inner {
          background: #ffffff !important;
          border: 1px solid $border_color !important;
          height: 24px;
          font-size: 12px;
        }
        }
      }

      .el-pagination__total {
        color: #333333;
        font-size: 12px;
      }

      .el-select {
        input {
          height: $height;
        }
      }
    }
  }
</style>
