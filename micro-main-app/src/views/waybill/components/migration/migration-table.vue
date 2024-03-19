<template>
  <div class="migration-table">
    <migration-title :count="pagination.totalCount" />
    <section class="migration-table-tools">
      <el-button type="text" icon="el-icon-edit" @click="onBatchEditRow">批量修改</el-button>
      <el-button type="text" icon="el-icon-delete" @click="onBatchDeleteRow"  style="margin-left:20px;">批量删除</el-button>
    </section>
    <ky-table
      ref="multipleTable"
      height="668"
      class="migration-multiple-table"
      :lazy="true"
      v-loading="loading"
      :data="tableData"
      :tableColumns="tableColumns"
      :pagination="pagination"
      :selectedRowsCount="selectedRows.length" 
      @size-change="sizeChange"
      @pagination-change="pageChange"
      @selection-change="handleSelectionChange">
      <el-table-column fixed type="selection" width="32" class-name="col-selection">
      </el-table-column>
      <el-table-column label="操作" width="120" class-name="col-selection">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="onDeleteRow(scope.row)">删除</el-button>
          <el-button type="text" size="small" @click="onEditRow(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </ky-table>

    <dialog-waybill-gray-modify ref="dialogWaybillGrayModify" @save-success="getUpgradeFaildWaybillInfo" @delete="deleteWaybillInfo"/>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import API from '@api/waybill'
import { mapState } from 'vuex'
import DialogWaybillGrayModify from '@views/delivery/components/dialog-waybill-gray-modify'
import MigrationTitle from './migration-title'
import { convertQueryModels, migrationTableColumns } from '../../utils/table-config.js'
export default {
  components: { MigrationTitle, DialogWaybillGrayModify },
  data() {
    return {
      loading: false,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 15,
        totalCount: 0,
        pageSizes: [15, 30, 50, 100, 300],
      },
      selectedRows: [],
      tableColumns: migrationTableColumns,
    }
  },
  computed: {
    ...mapState(['userInfo']),
  },
  mounted() {
    this.getUpgradeFaildWaybillInfo()
  },
  methods: {
    goBack() {
      this.$kye_message.confirm('您有一些运单资料未完善，是否需要帮您继续保存？',
        { cancelButtonText:'不要了，直接删除', confirmButtonText:'继续保存' }
      ).then(() => {
        this.$router.push('admin/waybill-v3') 
      }).catch(() => {
        console.log('直接删除')
      })
    },
    sizeChange() {
      this.pagination.pageIndex = 1
    },
    pageChange() {
      this.getUpgradeFaildWaybillInfo()
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    /** 单行删除 */
    onDeleteRow(row) {
      this.$kye_message.confirm('确定删除该运单吗？').then(() => {
        this.deleteWaybillInfo([row])
      })
    },
    /** 批量删除 */
    onBatchDeleteRow() {
      const count = this.selectedRows.length 
      if (count <= 0) {
        this.$message.warning('请选择需要删除的数据') 
      } else {
        this.$kye_message.confirm(`确定删除已勾选的${count}条数据吗？`).then(() => {
          this.deleteWaybillInfo(this.selectedRows)
        })
      }
    },
    onDialogDeleteRows() {

    },
    /** 批量编辑 */
    onBatchEditRow() {
      let editRows = []
      if(this.selectedRows.length > 0) {
        editRows = this.selectedRows
      } else {
        editRows = this.tableData
      }
      let isBatch = editRows && editRows.length > 1 || false
      this.$refs.dialogWaybillGrayModify.showDialog(editRows, isBatch)
    },
    /** 编辑当前行 */
    onEditRow(row) {
      this.$refs.dialogWaybillGrayModify.showDialog(row, false)
    },
    /** 迁移失败数据运单分页查询 */
    async getUpgradeFaildWaybillInfo(mode) {
      /** 最后一条数据修改成功后 */
      if (mode === 'edit' && this.tableData.length === 1) {
        this.pagination.pageIndex = 1
      }
      this.loading = true
      const user = JSON.parse(sessionStorage.getItem('USER_DATA'))
      const { pageSize, pageIndex } = this.pagination
      const endTime = dayjs().format('YYYY/MM/DD 23:59:59')
      const startTime = dayjs().add(-6, 'M').format('YYYY/MM/DD 23:59:59')

      const params = {
        phone: user.phone,
        dateType: 0,
        startTime: startTime,
        endTime: endTime,
        pageSize: pageSize,
        pageIndex: pageIndex,
        customerCode: user.customCode,
        waybillStatus: 1,
        printStatus: 0,
        cargoStorageStatus: 10,
        waybillCustomerSource: 10,
      }
      const { data } = await API.getUpgradeFaildWaybillInfo(params)
      if (!data || data.dataCount <= 0) {
        this.tableData = []
        this.pagination.totalCount = 0
      } else {
        this.tableData = convertQueryModels(data.dataList)
        this.pagination.totalCount = data.dataCount || 0
      }
      this.loading = false
    },
    /** 数据删除 */
    async deleteWaybillInfo(rows) {
      this.loading = true
      const user = JSON.parse(sessionStorage.getItem('USER_DATA'))
      const params = {
        mobile: user.phone,
        companyNo: user.customCode,
        data: rows.map(item => {
          if (item.waybillNumber) {
            return { ydCode: item.waybillNumber } 
          }
        })
      }
      const res = await API.deleteWaybillInfo(params)
      if (res.code !== 0) {
        this.$message.warning('数据删除异常，请重新操作') 
      }
      this.$message.success('删除成功')
      /** 删除当前页最后一条数据 */
      if (rows.length === this.tableData.length) {
        this.pagination.pageIndex = 1
      }
      await this.getUpgradeFaildWaybillInfo() 
      this.loading = false    
    }
  },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
