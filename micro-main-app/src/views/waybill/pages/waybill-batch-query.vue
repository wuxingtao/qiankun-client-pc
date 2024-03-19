<template>
  <div class="page__container plr_20">
    <div class="page__header">
      <!-- <div class="main-title">运单查询</div> -->
      <div class="page__search">
        <el-form ref="ruleForm" :model="formData" label-width="70px" label-position="left">
          <el-row :gutter="24">
            <el-col>
              <el-form-item label-width="0" prop="dateRange" class="mb_0">
                <div class="k-date-range">
                  <span class="c_333 pl_16">填单时间</span>
                  <el-date-picker
                    class="el-input__inner"
                    v-model="formData.dateRange"
                    size="medium"
                    :editable="false"
                    :clearable="false"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions"
                  > 
                  </el-date-picker>
                </div>
                <el-dropdown
                  class="dropdown__group ml_12"
                  split-button
                  type="primary"
                  @click="handleSubmit"
                  @command="handleCommand"
                  trigger="click"
                >
                  批次查询
                  <!-- <el-dropdown-menu slot="dropdown" class="dropdown__wrapper">
                    <el-dropdown-item class="dropdown__item el-button el-button--primary" command="waybill">运单查询</el-dropdown-item>
                  </el-dropdown-menu> -->
                </el-dropdown>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="page__custom flex flex_ai_c flex_jc_b fs_14">
        <span>已选：{{ selectedRows.length }}条</span>
        <div class="operation-button">
          <el-button type="text" @click="copyWaybill">
            <svg-icon icon-class="icon-copy" />再来一单
          </el-button>
          <el-button type="text" @click="noticeDriverMultiple">
            <svg-icon icon-class="notice-pickup-button" />通知司机取货
          </el-button>
          <el-button type="text" @click="showColumnManager">
            <svg-icon icon-class="waybill-setting" class="icon-tabs" />
            自定义排序
          </el-button>
        </div>
      </div>
    </div>
    <div class="page__content">
      <k-table
        :data="tableData"
        :columns="tableColumns"
        :total="dataCount"
        height="calc(100vh - 238px)"
        @refreshList="handleList"
        @selection-change="selectionChange"
        v-loading="loading"
        ref="tableRef"
      >
        <el-table-column slot="operation" label="操作" width="160">
          <template slot-scope="scope">
            <el-button
              class="btn-text-border"
              type="text"
              @click="noticeDriver([scope.row])"
              :disabled="!scope.row.ToBeNotifiedPickUpGoods || scope.row.ToBeNotifiedPickUpGoods <= 0"
              >通知司机取货</el-button
            >
            <el-button class="btn-text-border" type="text" @click="handlePrint(scope.row)"
              >打单</el-button
            >
          </template>
        </el-table-column>
        <el-table-column slot="batchNo" label="批次号" min-width="130">
          <template slot-scope="scope">
            <el-button type="text" @click="handleBatchList(scope.row)">{{
              scope.row.batchNo
            }}</el-button>
          </template>
        </el-table-column>
      </k-table>
    </div>
  </div>
</template>

<script>
import { KTable } from '@comps'
import dayjs from 'dayjs'
import API from '@api/waybill'
import { exportBatchWaybillData, queryGridColumnConfig } from '@api/waybillOld'
import { mapState } from 'vuex'
import { getPhone, getCustomerCode } from '@utils/storage'

export default {
  name: 'waybill-batch',
  components: { KTable },
  data() {
    return {
      formData: {
        dateRange: [dayjs().add(-15, 'd'), dayjs()],
        dateType: '0'
      },
      // picker配置
      pickerOptions: {
        tempSelectedDate: '',
        onPick: ({ maxDate, minDate }) => {
          this.pickerOptions.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.pickerOptions.tempSelectedDate = ''
          }
        },
        disabledDate: time => {
          if (time < dayjs().add(-6, 'month')) {
            return true
          }
          if (this.pickerOptions.tempSelectedDate !== '') {
            const minDate = dayjs(this.pickerOptions.tempSelectedDate).add(-1, 'month')
            const maxDate = dayjs(this.pickerOptions.tempSelectedDate).add(1, 'month')
            return time.getTime() < minDate || time.getTime() > maxDate
          }
        }
      },
      // 条数总数
      dataCount: 0,
      // 自定义排序名称
      gridName: 'waybill-batch',
      gridConfigId: '',
      // 列配置版本号-修改列配置需更新
      gridVersion: '1.0.0',
      // 表格当前选中列
      selectedRows: [],
      tableData: [],
      // 不可变列表原始数据
      tableColumnsOriginal: [
        {
          type: 'selection',
          minWidth: '5.7%',
          align: 'center',
          unList: true
        },
        {
          slot: 'operation',
          prop: 'operation',
          label: '操作',
          unList: true
        },
        {
          slot: 'batchNo',
          prop: 'batchNo',
          label: '批次号',
          minWidth: '100',
          visible: true
        },
        {
          prop: 'createTime',
          label: '填单时间',
          minWidth: '160',
          visible: true
        },
        {
          prop: 'count',
          label: '总票数（票）',
          minWidth: '80',
          visible: true
        },
        {
          prop: 'ToBeNotifiedPickUpGoods',
          label: '待通知司机',
          minWidth: '80',
          visible: true
        },
        {
          prop: 'ToBePickUpGoods',
          label: '待取货',
          minWidth: '80',
          visible: true
        },
        {
          prop: 'ToBeSignIn',
          label: '待签收',
          minWidth: '80',
          visible: true
        },
        {
          prop: 'HasSignIn',
          label: '已签收',
          minWidth: '80',
          visible: true
        }
      ],
      // 表格列
      tableColumns: [],
      // 当前选中的列排序
      checkedColumns: [],
      loading: false
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  created() {
    this.handleList()
  },
  activated() {
    this.handleList()
  },
  methods: {
    async copyWaybill() {
      if (!this.selectedRows || this.selectedRows.length < 1) {
        this.$message.warning('请选择需要再下一单的批次')
        return
      }
      const ydNoList = this.selectedRows.reduce((init, cur) => {
        init.push(...cur.ydCodeList.map(m => m.ydCode))
        return init
      }, [])
      if (ydNoList.length > 1000) {
        this.$message.warning('最多只能选择1000个运单进行批次下单')
        return
      }
      const params = { isCopy: true }
      if (ydNoList.length === 1) {
        params.ydNo = ydNoList[0]
      } else {
        params.ydNoList = ydNoList
      }
      this.$router.push({ name: 'delivery', params })
    },
    // 页面搜索
    handleSubmit() {
      this.handleList()
    },
    // 列表查询
    async handleList(options = { pageIndex: 1, pageSize: 10 }) {
      try {
        // const params = {
        //   startTime: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
        //   endTime: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        //   pageIndex: options.pageIndex,
        //   pageSize: options.pageSize,
        //   customerNo: getCustomerCode(),
        //   phone: getPhone()
        // }
        const params = {
          generalQuery: {
            creationEndDate: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
            creationStartDate: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
          },
          pageIndex: options.pageIndex,
          pageSize: options.pageSize,
          customerNo: getCustomerCode(),
          phone: getPhone(),
          /** 客户端类型：10 客户端 20 移动端 */
          clientType: 10
        }
        this.loading = true
        // let res = await API.getBatchNoView(params) || {}
        const res = await API.queryBatchWaybillSearch(params)
        this.loading = false
        if (res.data && res.data.dataList) {
          this.tableData = res.data.dataList
          this.dataCount = res.data.dataCount
        }
      } catch (e) {
        this.loading = false
      }
    },
    /** 运单管理(新)——批次查询列表 */
    // async getBatchList(options = { pageIndex: 1, pageSize: 10 }) {
      
    // },
    // 表格列选中事件
    selectionChange(val) {
      this.selectedRows = val
    },
    checkEmpty(type) {
      let result = false
      const multipleRow = this.$refs.tableRef.multipleSelection
      if (multipleRow.length === 0) {
        this.$message.warning(`请选择要${type}的数据`)
        result = true
      }
      return result
    },
    // 批量批次号通知取货
    noticeDriverMultiple() {
      const multipleRow = this.$refs.tableRef.multipleSelection
      if (this.checkEmpty('通知司机')) {
        return
      }
      this.noticeDriver(multipleRow)
    },
    // 通知取货
    noticeDriver(rows = []) {
      let arr = []
      rows.forEach(item => {
        if (item.ToBeNotifiedPickUpGoods > 0) {
          arr = arr.concat(item.ydCodeList)
        }
      })
      let ydCodeLists = Array.from(new Set(arr))
      if (ydCodeLists.length === 0) {
        this.$message.warning('无待通知司机取货运单')
        return
      }
      const waybills = ydCodeLists.map(item => {
        return {
          ...item,
          qHAddress: item.deliveryAddress,
          count: item.number
        }
      })
      this.noticeForPickup(waybills, this.handleList)
    },
    // 打单 仅支持单个批次号打单
    async handlePrint(row) {
      let res = await exportBatchWaybillData({
        customerCode: getCustomerCode(),
        phone: getPhone(),
        batchNo: row.batchNo
      })
      if (res.code === 0) {
        const waybills = res.data
        this.printViewOrNotice(waybills)
      }
    },
    // 打单
    async printViewOrNotice(waybills, isNotice = false, callback = null) {
      this.$refs.printView.showDialog(waybills, isNotice, callback)
    },
    // 批次号查询运单列表 TODO: 待对接
    handleBatchList(row) {
      this.$router.push({ path: '/admin/waybill', query: { batchNo: row.batchNo } })
    },
    handleCommand(command) {
      if (command === 'waybill') {
        this.$router.push({ path: '/admin/waybill', params: { queryType: 0 } })
      }
    },
    // 打开自定义列
    showColumnManager() {
      const params = {
        version: '1.0.0',
        gridConfigId: this.gridConfigId,
        gridName: this.gridName,
        checkedColumns: this.checkedColumns,
        columns: this.tableColumnsOriginal.filter(
          f => this.isVipshopUser || f.prop !== 'vipshopCode'
        )
      }
      this.$refs.columnManager.showDialog(params)
    },
    // 修改表格列
    modifyColums(columns, gridConfigId, checkedColumns) {
      // this.tableColumnsOriginal = columns
      this.checkedColumns = checkedColumns
      this.tableColumns = this.$refs.columnManager.getColumns(columns)
      this.gridConfigId = gridConfigId
    },
   
  }
}
</script>

<style lang="scss" scoped>
$themeColor: #8365f6;
.main-title {
  font-size: 16px;
  font-weight: bold;
  font-family: PingFangSC, PingFangSC-Medium;
  color: rgba(51, 51, 51, 0.93);
  border-bottom: 1px solid #f1f1f5;
  height: 49px;
  line-height: 49px;
}

.page__search {
  padding: 10px 0;
  border-bottom: 1px solid #e8e8e8;
  /deep/ {
    .el-button {
      padding: 8px 10px !important;
    }
    .el-form-item__content {
      line-height: 32px;
    }
  }
}
.k-date-range {
  display: inline-block;
  background: #eef3fc;
  border-radius: 18px;
  .el-date-editor {
    width: 300px;
  }
  /deep/ .el-input__inner,
  /deep/ .el-range-input {
    border: 0 !important;
    background-color: transparent;
    height: 32px;
  }
  /deep/ .el-icon-date {
    position: absolute;
    right: 16px;
    color: $themeColor;
  }
  /deep/ .el-range-separator {
    font-size: 0;
    width: 12px;
    height: 13px;
    background: url('../../../assets/image/date-arrow.png') no-repeat top left;
    background-size: contain;
  }
  &::after {
    content: '';
    position: absolute;
    left: 86px;
    height: 32px;
    width: 1px;
    background-color: #dfe7f7;
  }
}
.operation-button {
  padding: 4px 0;
  .svg-icon {
    padding-right: 8px;
  }
  /deep/ .el-button {
    margin-left: 28px;
  }
}
</style>
