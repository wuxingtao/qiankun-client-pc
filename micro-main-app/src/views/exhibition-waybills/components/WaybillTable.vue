<template>
  <ky-table :data="tableData" class="element-table" :paginationVisible="true" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 366px)'" ref="kyTable" v-loading="loading">
    <el-table-column v-for="(col,index) in tableColumns.filter(c=>c.text&&c.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
    </el-table-column>
  </ky-table>
</template>

<script>
import { exportExcel } from '@utils/clientUtil'
import { getWaybillListByProjectName } from '@/services/api/exhibition'
import dayjs from 'dayjs'


const tableColumns = [
  { prop: 'waybillNumber', text: '运单号', width: '160', visible: true, prohibitSetPosition: true },
  { prop: 'deliveryCustomerName', text: '寄件公司', width: '180', visible: true },
  { prop: 'fairCode', text: '会展编码	', width: '120', visible: true },
  { prop: 'deliveryAddress', text: '寄件地址	', width: '300', visible: true },
  { prop: 'pickupAreaCode', text: '收件区号	', width: '100', visible: true },
  { prop: 'actualWeight', text: '重量', width: '100', visible: true },
  { prop: 'pickupTime', text: '寄件时间	', width: '150', visible: true },
  // { prop: "isCheckOrder", text: "有无审单	", width: "100", visible: true },
  { prop: 'waybillAmount', text: '运费', width: '120', visible: true },
  { prop: 'sendAreaCode', text: '寄件区号	', width: '120', visible: true },
]

export default {
  props: {
    formData: {
      type: Object,
      require: true
    },
  },
  data () {
    return {
      loading: false,
      tableColumns: tableColumns.map(a => Object.assign({ visible: false }, a)),
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  methods: {
    getParams (pageIndex, pageSize) {
      const params = {
        waybillNumber: this.formData.waybillNumber,
        projectName: '20',//会展撤展项目
        beginTime: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
        endTime: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        page: pageIndex,
        pageSize: pageSize,
      }
      return params
    },
    async queryData () {
      const params = this.getParams(this.pagination.pageIndex, this.pagination.pageSize)
      this.loading = true
      try {
        const res = await getWaybillListByProjectName(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
        }
      } finally {
        this.loading = false
      }
    },
    async exportWaybillData () {
      const res = await this.getExportWaybillData(1)
      if (res.code === 0) {
        let data = []
        if (res.data.pageTotal < 1) {
          this.$message('未查询到数据')
          return
        } else if (res.data.pageTotal === 1) {
          data = res.data.rows
        } else {
          data = res.data.rows
          const promiseList = []
          for (let i = 2; i <= res.data.pageTotal; i++) {
            promiseList.push(this.getExportWaybillData(i))
          }
          const resList = await Promise.all(promiseList)
          if (resList.every(r => r.code === 0)) {
            resList.forEach(r => data.push(...r.data.rows))
          }
        }
        let theadColumns = this.tableColumns.filter(c => c.visible).map((c) => c)
        try {
          exportExcel({
            theadColumns,
            jsonData: data,
            filename: `国际会展运单${dayjs().format('YYYY-MM-DD HHmmss')}`,
          })
        } catch (ex) {
          console.log('exportWaybillData :>> ', ex)
        }
      }
    },
    async getExportWaybillData (pageIndex) {
      const params = this.getParams(pageIndex, 500)
      const res = await getWaybillListByProjectName(params)
      return res
    }
  }
}
</script>

<style lang="scss" scoped>
</style>