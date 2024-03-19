<!--客户报价-->
<template>
  <ky-page-container class="quotation-container" title="我的报价">
    <el-header height="null" class="search-condition">
      <index-find @find="onFind" style="padding: 20px 60px 0 20px;" />
    </el-header>

    <el-main style="padding: 15px 0 0 0;border-radius: 4px;">
      <el-container style="height: 100%;background: #fff;border-radius: 4px;">
        <el-header height="null" style="padding: 0 0 1px 0;">
          <h3 class="table-title">
            报价信息
          </h3>
        </el-header>
        <el-main style="padding: 20px 20px 5px 20px;" v-loading="loading">
            <ky-table :data="tableData.rows" height="calc(100vh - 560px)" :paginationVisible="true" ref="tableR" @pagination-change="refreshList" :tableColumns="tableHead" :pagination="pagination">
            </ky-table>
        </el-main>
      </el-container>
    </el-main>
  </ky-page-container>
</template>
<script>
import { IndexFind } from './components'
import { customerOfferSearch } from '@/services/api/customer'
import { indexTableHead } from './config'
import KyTable from '@/components/ky-table/index.vue'
export default {
  components: {
    KyTable,
    IndexFind,
  },
  data () {
    return {
      tableData: {
        rows: [],
        rowTotal: 0
      },
      tableHead: [],
      loading: false,
      pagination:{
        totalCount: 0,
        pageSize: 10,
        pageIndex: 1,
      },
      form: {
        page: 1,
        pageSize: 10
      }
    }
  },
  methods: {
    async customerOfferSearch () {
      this.loading = true
      this.tableData = {
        rows: [],
        rowTotal: 0
      }
      let res = await customerOfferSearch(this.form)
      const { data, code } = res
      if (code === 0) {
        if (data.rows.length == 0) {
          this.tableHead = [{
            prop: 'beginEndAddress',
            text: '区间说明',
            fixed: 'left',
          }, {
            prop: 'beginAreaCode',
            text: '寄件区号',
          }, {
            prop: 'endAreaCode',
            text: '收件区号',
          }]
          this.tableData = {
            rows: [],
            rowTotal: 0
          }
        } else {
          this.tableHead = this.resetHead(data.rows[0])
          this.tableData = {
            ...res.data,
            rows: this.resetData(data.rows)
          }
          this.pagination.totalCount=parseInt(this.tableData.rowTotal) || 0
          this.$refs.tableR&&this.$refs.tableR.$refs.table.doLayout()
        }
      }
      this.loading = false
    },
    /** 查询 */
    onFind (form) {
      this.form.page = 1
      this.form.pageSize = 10
      this.form = { ...this.form, ...form }
      this.customerOfferSearch()
    },
    /** 组装表格标题栏(价格区间动态展示) */
    resetHead (item) {
      const startItem = indexTableHead.slice(0, 3)
      const endItem = indexTableHead.slice(3, indexTableHead.length)
      // 自定义表头数据
      for (let i = 0; i < item.sectionValueList.length; i++) {
        let beginKey = item.sectionValueList[i].beginKey
        let endKey = item.sectionValueList[i].endKey
        endKey ? endKey = `~${endKey}` : `以上`
        startItem.push({
          width: 150,
          prop: `sectionValue${i}`,
          text: `${beginKey}${endKey}kg`,
        })
      }
      return [...startItem, ...endItem]
    },
    /** 组装表格数据 */
    resetData (rows = []) {
      for (let i = 0; i < rows.length; i++) {
        for (let k = 0; k < rows[i].sectionValueList.length; k++) {
          rows[i][`sectionValue${k}`] = rows[i].sectionValueList[k].sectionValue
        }
      }
      return rows
    },
    refreshList (value) {
      this.form.page = value.pageIndex
      this.form.pageSize = value.pageSize
      this.customerOfferSearch()
    }
  },
}
</script>

<style lang="scss" scoped>
  .quotation-container {
    background: #f5f6fb;
    &.ky-page-container {
      padding: 0;
      /deep/.page-header-wrapper {
        background: white;
        .ky-page-header {
          margin: 0 20px;
          background: white;
        }
      }
    }
    .search-condition {
      border-radius: 4px;
      background: white;
    }

    .table-title {
      height: 50px;
      line-height: 50px;
      color: #303133;
      font-weight: 600;
      padding: 0 20px;
      border-bottom: 1px solid #f1f1f5;
    }
    .pbr__table--header {
      th {
        background: #f7f8fe;
        color: #333333;
      }

      th[colspan="1"] {
        &::after {
          content: "";
          display: block;
          border-right: 1px solid #dcdae2;
          height: 12px;
          float: right;
          top: 0;
          position: absolute;
          right: 0;
          bottom: 0;
          margin: auto;
        }

        &:last-child {
          &:after {
            content: none;
          }
        }
      }
    }
  }
</style>
