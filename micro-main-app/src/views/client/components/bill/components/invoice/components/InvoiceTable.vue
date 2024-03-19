<template>
  <div class="table">
    <el-table ref="table"
              :data="invoiceInfos"
              class="clinet-common-table"
              border
              stripe
              :max-height="tableHeight"
              style="width:100%"
              @row-click="rowClick"
              @selection-change="handleSelectionChange">
      <el-table-column v-if="isShowSelectionColumn"
                       type="selection"
                       width="55">
      </el-table-column>
      <el-table-column label="购货方名称"
                       show-overflow-tooltip
                       width="150px">
        <template slot-scope="scope">
          <p style="height: 12px; font-size: 12px;overflow:hidden;">{{scope.row.deductionCompany}}</p>
          <p style="height: 17px;font-size: 12px;color:#999999">{{scope.row.deductionTax}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="status"
                       label="状态"
                       min-width="60px">
        <template slot-scope="scope">
          {{scope.row.auditStatus=="20"?"已审核":"未审核"}}
        </template>
      </el-table-column>
      <el-table-column prop="invoiceTypeName"
                       label="发票类型"
                       min-width="100px"></el-table-column>
      <el-table-column label="开户行"
                       show-overflow-tooltip
                       min-width="100px">
        <template slot-scope="scope">
          <p style="height: 12px;font-size: 12px;overflow:hidden;">{{scope.row.invoiceOpenBank}}</p>
          <p style="height: 17px;font-size: 12px;color:#999999">{{scope.row.invoiceOpenAccount}}</p>
        </template>
      </el-table-column>
      <el-table-column label="收票人"
                       min-width="80px">
        <template slot-scope="scope">
          <p style="height: 12px; font-size: 12px;">{{scope.row.invoiceReceiver}}</p>
          <p style="height: 17px;font-size: 12px;color:#999999">{{scope.row.invoiceReceiverPhone}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="receiverAddress"
                       label="收票地址"
                       show-overflow-tooltip
                       min-width="150px"></el-table-column>
    </el-table>
    <!-- <el-pagination background
                   class="pagination"
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange"
                   :current-page.sync="pagination.currentPage"
                   :page-size="pagination.rows"
                   layout="prev, pager, next,sizes,jumper"
                   :total="pagination.total">
    </el-pagination> -->
  </div>
</template>

<script>
export default {
  props: ['tableHeight', 'isShowSelectionColumn', 'invoiceInfos'],
  data () {
    return {
      selectedRows: [],
      // pagination: {
      //   currentPage: 1,
      //   rows: 10,
      //   total: 0,
      // },
    }
  },
  methods: {
    handleSelectionChange (val) {
      this.selectedRows = val
      // console.log(val)
    },
    rowClick (row, column, event) {
      this.$refs.table.toggleRowSelection(row) // 调用选中行方法
    },
    // handleSizeChange () {
    // },
    // handleCurrentChange () {
    // },
    editInvoiceInfo (index, rows) {

    },
    deleteInvoiceInfo (index, rows) {
      rows.splice(index, 1)
    },
  },
  mounted: function () {
    // this.isShowSelectionColumn = false;
  }
}
</script>

<style lang="scss" scoped>
  .table {
    position: relative;
    height: 100%;

    .pagination {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }

  //表格样式
  /deep/ .el-table--border td {
    border-right: none;
  }
  /deep/ .el-table {
    th:last-child {
      .cell {
        border-right: none;
      }
    }
  }

  /deep/ .el-table th > .cell {
    font-weight: bold;
  }
  /deep/ .el-table .cell {
    font-size: 12px;
    & > p:first-child {
      padding-bottom: 4px;
    }
  }
</style>
