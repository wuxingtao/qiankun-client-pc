<template>
  <div>
    <el-table :data="tableData"
              class="clinet-common-table"
              border
              stripe
              style="width:100%">
      <el-table-column :show-overflow-tooltip="true"
                       prop="date"
                       label="申诉单号"></el-table-column>
      <el-table-column :show-overflow-tooltip="true"
                       prop="name"
                       label="申诉状态"></el-table-column>
      <el-table-column :show-overflow-tooltip="true"
                       prop="address"
                       label="申诉内容"></el-table-column>
      <el-table-column fixed="right"
                       label="操作"
                       width="120">
        <template slot-scope="scope">
          <el-button @click.native.prevent="viweAbnormalDetail(scope.$index, tableData)"
                     type="text"
                     size="small">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange"
                   :current-page.sync="pagination.currentPage"
                   :page-size="pagination.rows"
                   :layout="pagination.layout"
                   :total="pagination.total"></el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pagination: {
        currentPage: 1,
        rows: 10,
        total: 0,
        layout: "prev, pager, next,sizes,jumper"
      },
      tableData: [{
        date: '2016-05-02',
        name: '处理中',
        address: '上海市普陀区金沙江路 1518 弄',
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }]
    }
  },
  methods: {
    viweAbnormalDetail () {

    },
    handleSizeChange () {
    },
    handleCurrentChange () {

    },
  }
}
</script>


<style lang="scss" scoped>
  //表格样式
  /deep/ .el-table--border td {
    border-right: none;
  }
  /deep/ .el-table th > .cell {
    font-weight: bold;
  }
  /deep/ .el-table .cell {
    font-size: 12px;
  }
</style>
