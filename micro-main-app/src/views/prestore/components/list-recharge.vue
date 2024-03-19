<!--
充值明细页面
-->
<template>
    <div ref="listRechargeTabel" class="list-recharge">
        <div style="padding: 16px 0 20px;text-align: right">
            <el-button type="primary"  size="medium"
                       @click="onExportExcel"
                       :loading="exportLoading">
                <i class="iconfont icon-export ui mg-r4"></i>导出充值明细
            </el-button>
        </div>
        <div   v-loading="loading">
            <ky-table :data="tableData.rows"
                     height="calc(100vh - 530px)"
                     @pagination-change="refreshList"
                     :pagination="pagination"
                     :paginationVisible="true"
                     :tableColumns="tableHead">
            </ky-table>
        </div>
    </div>
</template>
<script>
// import Export from '@/utils/export'
import * as time from '@/utils/formatDate'
let FormatDate =time.default
import { rechargeByCustomerName} from '@/services/api/customer'
import {rechargeTableHead} from './config'
import KyTable from '@/components/ky-table/index.vue'
import { exportExcel } from "@utils/clientUtil"
import dayjs from "dayjs"
export default {
  components: {
    KyTable
  },
  data() {
    return {
      tableData: {
        rows: [],
        rowTotal: 0
      },
      tableHead: rechargeTableHead,
      loading: false,
      exportLoading: false,
      pagination:{
        totalCount: 0,
        pageSize: 10,
        pageIndex: 1,
      },
      form: {
        page: 1,
      }
    }
  },
  created() {
    this.rechargeByCustomerName()
  },
  methods: {
    async rechargeByCustomerName() {
      this.loading = true
      this.tableData = {
        rows: [],
        rowTotal: 0
      }
      let res= await rechargeByCustomerName(this.form)
      if (res&&res.code === 0) {
        let data = res.data || {}
        data.rows = this.resetData(data.rows)
        this.tableData = data
        this.pagination.totalCount=parseInt(this.tableData.rowTotal) || 0
      }
      this.loading = false
    },
    refreshList(value){
      this.form.page = value.pageIndex
      this.rechargeByCustomerName()
    },
    resetData(rows) {
      return rows.map((item, index) => {
        item.index = ++index
        item.depositType = this.resetState(item.depositType)
        item.discountRate = item.discountRate + '%'
        item.tradeDate = FormatDate.date(item.tradeDate)
        return item
      })
    },
    /** 处理充值类型 */
    resetState(state) {
      switch (state) {
        case '0':
          state = '充值'
          break
        case '10':
          state = '退款'
          break
        default:
          state = '状态异常'
          break
      }
      return state
    },
    /** 导出充值明细(最多99999条) */
    onExportExcel() {
      this.exportLoading = true

      rechargeByCustomerName({
        page: 1,
        pageSize: 99999
      }).then(({ code, data }) => {
        if (code === 0) {
          let row=this.resetData(data.rows)
          exportExcel({
            theadColumns:rechargeTableHead,
            jsonData: row,
            filename: `预存充值明细${dayjs().format("YYYYMMDD")}`,
          })
          // Export.excel(rechargeTableHead, this.resetData(data.rows), '预存充值明细')
        }
        this.exportLoading = false
      })
    },
  },
}
</script>
<style lang="scss" scoped>
    .list-recharge{
        height: 100%;
    }
   /deep/ .el-button{
      border-radius: 18px;
    }
</style>
