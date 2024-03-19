<!-- 消费明细 -->
<template>
    <div class="list-consumption" ref="listConsumption">
        <!-- 条件查询 -->
        <list-consumption-find :on-find="onFind" @onExportExcel="onExportExcel" :exportLoading="exportLoading" />
        <!-- 数据列表 -->
        <div  v-loading="loading">
            <ky-table :data="tableData.rows"
                      height="calc(100vh - 575px)"
                      :paginationVisible="true"
                      @pagination-change="refreshList"
                      :pagination="pagination"
                     :tableColumns="tableHead">
            </ky-table>
        </div>
    </div>
</template>
<script>
/*import Export from '@/utils/export'*/
import { depositBillDetail } from '@/services/api/customer'
import * as time from '@/utils/formatDate'
let FormatDate = time.default
import { consumptionTableHead } from './config'
import ListConsumptionFind from './list-consumption-find'
import KyTable from '@/components/ky-table/index.vue'
import { exportExcel } from "@utils/clientUtil"
import dayjs from "dayjs"
export default {
  components: {
    KyTable,
    ListConsumptionFind,
  },
  data() {
    return {
      tableData: {
        rows: [],
        rowTotal: 0
      },
      tableHead: consumptionTableHead,
      pagination:{
        totalCount: 0,
        pageSize: 10,
        pageIndex: 1,
      },
      form: {
        page: 1, // 当前页码
        pageSize: 10
      },
      loading: false,
      exportLoading: false
    }
  },
  methods: {
    async depositBillDetail() {
      this.loading = true
      this.tableData = {
        rows: [],
        rowTotal: 0
      }
      this.rowTotal=0
      let res=await depositBillDetail(this.form)
      if (res&&res.code === 0) {
        let data = res.data.rows&&res.data.rows[0]? res.data.rows[0]: {}
        data.rows = this.resetData(data.rows)
        this.tableData = data
        this.pagination.totalCount= res.data.rowTotal
      }
      this.loading = false
    },
    /** 自定义数据格式 */
    resetData(rows) {
      return rows.map(item => {
        item.shippingDate = FormatDate.dateTimeHM(item.shippingDate)
        return item
      })
    },
    /** 搜索查询 */
    onFind(newForm) {
      this.form.page=1
      this.form.pageSize= 10
      this.form = { ...this.form, ...newForm }
      this.depositBillDetail()
    },
    /** 到处消费明细(最多99999条数据) */
    async onExportExcel() {
      this.exportLoading = true
      let res=await depositBillDetail({
        page: 1,
        pageSize: 99999
      })
      if (res&&res.code === 0) {
        let data = res.data.rows&&res.data.rows[0]? res.data.rows[0]: {}
        data.rows = this.resetData(data.rows)
        exportExcel({
          theadColumns:consumptionTableHead,
          jsonData: data.rows,
          filename: `预存消费明细${dayjs().format("YYYYMMDD")}`,
        })
        // Export.excel(consumptionTableHead, this.resetData(data.rows), '预存消费明细')
      }
      this.exportLoading = false
    },
    refreshList(value){
      this.form.page = value.pageIndex
      this.form.pageSize= value.pageSize
      this.depositBillDetail()
    }
  },
  created() {
    this.depositBillDetail()
  },
}
</script>
<style lang="scss" scoped>
    .list-consumption{
        height: 100%;
    }
</style>
