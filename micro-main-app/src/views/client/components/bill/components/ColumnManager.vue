<template>
  <div class="clientdialog">
    <el-dialog title="表格列设置"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               width="388px">
      <p>
        <el-checkbox :indeterminate="isIndeterminate"
                     v-model="checkAll"
                     @change="handleAllChange">列名</el-checkbox>
      </p>
      <div class="list">
        <el-checkbox-group v-model="checkedColumns"
                           @change="handleChange">
          <li class="drag-item"
              v-for="item in columnList"
              v-dragging="{ item: item, list: columnList, group: 'item' }"
              :key="item.text">
            <el-checkbox :label="item.text"
                         @change="(val)=>{item.visible=val}">
            </el-checkbox>
            <span><i class="iconfont iconicon-kehubianma2"></i></span>
          </li>
        </el-checkbox-group>

      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="saveData">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addGridConfigApi, modifyGridConfigApi } from  "@/services/api/bill"
import { getPhone } from "@/utils/storage"
/*import VueDND from 'awe-dnd'*/
import "../assets/common.scss"

export default {
  data () {
    return {
      dialogVisible: false,
      isIndeterminate: true,
      checkAll: false,
      checkedColumns: [],
      gridConfigId: '',
      gridName: '',
      columnList: [],
    }
  },
  mounted () {

  },
  methods: {
    handleAllChange (val) {
      this.isIndeterminate = false
      this.columnList.forEach(item => {
        item.visible = val
      })
      this.checkedColumns = val ? this.columnList.map(i => i.text) : []
    },
    handleChange (val) {
      this.checkedColumns = val
      this.checkAll = val.length == this.columnList.length
      this.isIndeterminate = val.length != 0 && val.length != this.columnList.length

    },
    showDialog (values) {
      this.gridConfigId = values.gridConfigId
      this.gridName = values.gridName
      this.columnList = JSON.parse(JSON.stringify(values.columns))
      this.checkedColumns = this.columnList.filter(i => i.visible).map(i => i.text)
      this.dialogVisible = true
    },
    saveData () {
      if (this.gridConfigId) {
        let params = {
          id: this.gridConfigId,
          gridAttribute: JSON.stringify(this.columnList)
        }
        modifyGridConfigApi(params).then(res => {
          if (res.code == 0) {
            this.$emit('onSaveSuccess', this.columnList, this.gridConfigId)
            this.dialogVisible = false
          }
        })
      } else {
        let params = {
          mobile: getPhone(),
          gridName: this.gridName,
          gridAttribute: JSON.stringify(this.columnList)
        }
        addGridConfigApi(params).then(res => {
          if (res.code == 0) {
            this.gridConfigId = res.data
            this.$emit('onSaveSuccess', this.columnList, this.gridConfigId)
            this.dialogVisible = false
          }
        })
      }

    },
  }
}
</script>

<style lang="scss" scoped>
  // @import url("../assets/common.scss");
  // /deep/ .el-dialog__body {
  //   padding: 0 24px;
  // }
  .clientdialog {
    p {
      margin-top: 8px;
      height: 46px;
      line-height: 46px;
      border-bottom: 1px solid #f1f1f5;
    }
    .list {
      height: 400px;
      overflow-y: auto;
      padding-right: 8px;
    }
    .list::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .list::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
    li {
      height: 46px;
      line-height: 46px;
      border-bottom: 1px solid #f1f1f5;
      display: flex;
      justify-content: space-between;
      i {
        margin-top: 20px;
      }
    }
  }
</style>
