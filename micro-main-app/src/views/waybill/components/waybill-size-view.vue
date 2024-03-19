<template>
  <ky-dialog :visible.sync='visible' class='waybill-size__dialog' width='820px' title='尺寸详情'>
    <div class='waybill-size-header'>
      <div>总共：{{ sizeList && sizeList.length }}个</div>
      <div>单位：cm</div>
    </div>
    <div class='waybill-size-content'>
      <div class='waybill-size-content-item' v-for='(item, index) in  sizeList' :key='index'>
        <div>{{ (index + 1+'').padStart(2,'0') }}</div>
        <div>{{ item.length }} X {{ item.width }} X {{ item.height }} X {{ item.count || 1 }}</div>
      </div>
    </div>
    <span slot='footer'>
      <el-button type='primary' @click='visible = false'>确 定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
export default {
  setup (props, { root }) {
    const state = reactive({
      visible: false,
      sizeList: null,
    })

    const showDialog = sizeList => {
      if (!sizeList || sizeList.length < 1) {
        root.$message.warning('无尺寸数据')
        return
      }
      state.sizeList = sizeList
      state.visible = true
    }

    return {
      ...toRefs(state),
      showDialog
    }
  }
}
</script>

<style lang="scss" scoped>
  .waybill-size__dialog {
    /deep/.el-dialog__body {
      .waybill-size-header {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }

      .waybill-size-content {
        display: flex;
        flex-wrap: wrap;
        margin-top: 20px;

        &-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          width: 25%;

          div {
            &:first-child {
              width: 26px;
              height: 22px;
              line-height: 22px;
              white-space: nowrap;
              background: linear-gradient(to right, #d9dee7, #ebeef5);
              text-align: center;
              font-size: 12px;
              color: #999;
              border-radius: 2px 6px 2px 2px;
            }

            &:last-child {
              margin-left: 12px;
              font-size: 12px;
              font-weight: 400;
              color: #03050d;
            }
          }
        }
      }
    }
  }
</style>