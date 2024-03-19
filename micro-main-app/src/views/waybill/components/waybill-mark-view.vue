<template>
  <ky-dialog :visible.sync='visible' class='waybill-mark__dialog' width='820px' :title='markName'>
    <div class='waybill-mark-content'>
      <div class='waybill-mark-content-item' v-for='(item, index) in markList' :key='index'>
        <div>{{ (index + 1 + "").padStart(2, "0") }}</div>
        <div>
          <el-tooltip placement='bottom' effect='light' :visible-arrow='false'
                      :content='item'>
            <span class='label'>{{ item }}</span>
          </el-tooltip>
        </div>
      </div>
    </div>
    <span slot='footer'>
      <el-button type='primary' @click='visible = false'>确 定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs } from "@vue/composition-api"

export default {
  name: "waybill-mark-view",
  setup(props, { root }) {
    const state = reactive({
      visible: false,
      markName: "详情",
      markList: [],
    })
    
    const showDialog = (markName, markList) => {
      state.markName = markName + "详情"
      if (!markList || markList.length < 1) {
        root.$message.warning("无备注数据")
        return
      }
      state.markList = markList
      state.visible = true
    }
    
    return {
      ...toRefs(state),
      showDialog
    }
  }
}
</script>

<style lang='scss' scoped>
.waybill-mark__dialog {
  /deep/ .el-dialog__body {
    .waybill-mark-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    
    .waybill-mark-content {
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