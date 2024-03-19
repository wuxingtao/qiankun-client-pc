<template>
  <ky-page-container class="page-list-container" title="SKU库">
    <ky-search-container>
      <div>
        <span>商品信息</span>
        <el-input size="medium" v-model="formData.itemKey" clearable placeholder="商品条码/商品名称"></el-input>
      </div>
      <div>
        <span>供应商</span>
        <el-input size="medium" v-model="formData.supplierName" clearable placeholder="请输入供应商名称"></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="handleQueryClick(true)">查询</el-button>
      <el-button round size="medium" @click="handleExportData">导出全部商品</el-button>
    </ky-search-container>
    <div class="tabs-container">
      <div class="tabs-container-wrap">
        <div class="tab-item-wrap">
          <div class="tab-item tab-noticepickup" :class="tabClass(0)" @click="handleTabClick(0)">
            我的库
          </div>
        </div>
        <div class="tab-item-wrap">
          <div class="tab-item tab-pickup" :class="tabClass(1)" @click="handleTabClick(1)">
            供应商库
          </div>
        </div>
      </div>
      <div class="btn-wrapper">
        <el-button type="text" class="right-border" @click="$router.push('/supplier/sku-detail')" v-show="mode==0">
          <svg-icon icon-class="supplier-add" /> 新增
        </el-button>

        <!-- <el-button type="text" class="right-border" v-show="mode==0">
          <el-dropdown v-show="mode==0">
           <svg-icon icon-class="sku-batchimport" /> 批量导入
        </el-button> -->
        <span class="batch-import right-border" v-show="mode==0">
          <el-dropdown split-button @command="handleCommand">
            <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleReadExcel" action="" accept=".xls,.xlsx">
              <svg-icon icon-class="sku-batchimport" />&nbsp;&nbsp;批量导入
            </el-upload>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>下载模板</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
        <el-button type="text" @click="visbileOfCustomColum=true">
          <svg-icon icon-class="waybill-setting" /> 自定义排序
        </el-button>

      </div>
    </div>
    <ky-table ref="kyTable" :key="Math.random()" :data="tableData" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 327px)'" v-loading="loading">
      <template slot="empty" v-if="mode===1">
        <none-data>
          <template slot="header">
            <svg-icon icon-class="none-data3" style="margin-bottom:5px" />
          </template>
          <div>该供应商没有维护SKU哦~</div>
        </none-data>
      </template>
      <el-table-column fixed label="操作" v-if="mode==0">
        <template slot-scope="{row}">
          <el-button @click="modifySupplier(row.id)" type="text" class="btn-text-border">修改</el-button>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" v-if="mode==0">
        <template v-slot="{row}">
          <div class="switch-wrapper">
            <div class="switch-wrapper__text" :class="{active:row.itemStatus===1}"> {{row.itemStatus===1?'开':'关'}}</div>
            <el-switch v-model="row.itemStatus" active-color="#9378FA" :active-value="1" :inactive-value="0" inactive-color="#BFC5D1" @change="itemInfoStatusChange(row,$event)">
            </el-switch>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-for="(col,index) in tableColumns.filter(m=>m.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
        <template v-slot="{row}">
          <span v-if="col.text==='商品名称'">
            <el-link :underline="false" @click="handleViewSku(row.id)">
              <div class="item-main">
                <div class="item-img">
                  <el-image :src="row['itemPicture']||defaultImg" style="width:100%;height:100%">
                    <div slot="placeholder" class="image-slot">
                      加载中<span class="dot">...</span>
                    </div>
                  </el-image>
                </div>
                <div class="item-name">
                  <div>{{ row[col.prop] }}</div>
                  <div>{{row["barCode"]}}</div>
                </div>
              </div>
            </el-link>
          </span>
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>
    </ky-table>
    <ky-custom-column :visible.sync="visbileOfCustomColum" :tableConfigName="tableConfigName" :tableColumns.sync="tableColumns" @change="handleColumnChange" />
  </ky-page-container>

</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { exportExcel, readExcel } from '@utils/clientUtil'
import { getItemInfoList, updateItemInfoStatus, itemInfoBatchSave } from '@/services/api/supplier'
import { getPhone, getCustomerCode } from '@/utils/storage'
const tableColumns = [
  { prop: 'itemName', text: '商品名称', width: '180', visible: true },
  { prop: 'itemSpecs', text: '规格', width: '90', visible: true },
  { prop: 'itemUnit', text: '商品单位', width: '90', visible: true },
  { prop: 'supplierName', text: '供应商', width: '90', visible: true },
  { prop: 'totalNums', text: '累积发货', width: '90', visible: true },
  { prop: 'stocks', text: '现有库存', width: '90', visible: true },
  { prop: 'itemWeight', text: '重量', width: '90', visible: true },
  { prop: 'remarks', text: '备注', width: '120', visible: true },
  { prop: 'itemSize', text: '尺码', width: '90', visible: true },
  { prop: 'itemColor', text: '颜色', width: '90', visible: true },
  { prop: 'creationDate', text: '创建时间', width: '140', visible: true },
]
export default {
  data () {
    return {
      loading : false ,
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-3, 'month')),
      defaultImg: require('@/assets/image/item-default-img.png'),
      mode: 0,
      formData: {
        supplierName: '',
        itemKey: ''
      },
      visbileOfCustomColum: false,
      tableConfigName: 'iteminfo-main3',
      supplierTable: [...tableColumns],
      tempColumns: tableColumns.splice(3, 1),
      tableColumns: tableColumns,
      myTableColumns: tableColumns,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  mounted () {
    if (!this.$route.params.refresh && !this.$route.params.supplierName) {
      this.handleQueryClick()
    }
  },
  activated () {
    if (this.$route.params.supplierName) {
      if (this.$route.params.supplierPhone === getPhone()) {
        this.formData.supplierName = ''
      } else {
        this.formData.supplierName = this.$route.params.supplierName
      }
      this.handleQueryClick(true)
    } else if (this.$route.params.refresh) {
      this.handleQueryClick()
    }
  },
  methods: {
    handleColumnChange () {
      this.$refs.kyTable.doLayout()
    },
    modifySupplier (id) {
      this.$router.push({ path: '/supplier/sku-detail', query: { id } })
    },
    //获取查询入参
    getQueryParams (pageIndex, pageSize) {
      const params = {
        itemKey: this.formData.itemKey,
        supplierPhone: this.mode === 1 ? '' : getPhone(),
        customerCode: getCustomerCode(),
        mode: this.mode,
        supplierName: this.mode === 0 ? '' : this.formData.supplierName,
        page: pageIndex || this.pagination.pageIndex,
        pageSize: pageSize || this.pagination.pageSize,
      }
      return params
    },
    //查询数据
    async queryData () {
      try{
        this.loading = true
        const params = this.getQueryParams()
        const res = await getItemInfoList(params)
        if (res.code === 0) {
          if (params.mode != this.mode) {
            return
          }
          this.tableData = res.data.rows || []
          this.pagination.totalCount = res.data.rowTotal
        }
      }finally{
        this.loading = false
      }
    },
    //点击查询
    handleQueryClick (clickQuery = false) {
      this.pagination.pageIndex = 1
      if (!this.$route.params.refresh && this.formData.supplierName && clickQuery) {
        this.mode = 1
      }
      this.queryData()
    },
    //获取一页的导出数据
    async getExportDataInPage (pageIndex) {
      const params = this.getQueryParams(pageIndex, 500)
      const res = await getItemInfoList(params)
      return res
    },
    //点击导出全部数据
    async handleExportData () {
      const res = await this.getExportDataInPage(1)
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
            promiseList.push(this.getExportDataInPage(i))
          }
          const resList = await Promise.all(promiseList)
          if (resList.every(r => r.code === 0)) {
            resList.forEach(r => data.push(...r.data.rows))
          }
        }
        let theadColumns = this.tableColumns.filter(c => c.visible).map(c => c)
        try {
          exportExcel({
            theadColumns,
            jsonData: data,
            filename: `商品列表${dayjs().format('YYYY-MM-DD HHmmss')}`,
          })
        } catch (ex) {
          console.log('handleExportData :>> ', ex)
        }
      }
    },
    async itemInfoStatusChange (row, itemStatus) {
      try {
        this.loading = true
        row.itemStatus = itemStatus === 1 ? 0 : 1
        const res = await updateItemInfoStatus({ id: row.id, itemStatus })
        if (res.code === 0) {
          row.itemStatus = itemStatus
        }
      } finally {
        this.loading = false
      }
    },
    tabClass (status) {
      return { active: this.mode == status }
    },
    handleTabClick (status) {
      if (this.mode == status) {
        return
      }
      this.mode = status
      if (this.mode == 0) {
        this.formData.supplierName = ''
        this.tableColumns = this.myTableColumns
      } else {
        this.tableColumns = this.supplierTable
      }
      this.handleQueryClick()
    },
    // batchImport () {
    //   console.log("batchImport")
    // },
    async handleReadExcel (file) {
      this.loading = true
      let { jsonData: excelDatas ,msg} = await readExcel(file, 0)
      let errorMsg = msg || this.verifyExcelData(excelDatas)
      if (errorMsg) {
        this.$message.error(errorMsg)
        return
      }
      const modelList = await this.convertExcelColumnNameAndData(excelDatas)
      const res = await itemInfoBatchSave(modelList)
      if (res.code === 0) {
        this.handleQueryClick()
        this.$message.success('导入成功')
      }

    },
    async downloadTemplate () {
      let fileName = 'sku管理批量导入.xlsx'
      if (!this.isClientMode) {
        window.location.href = `/templates/${fileName}`
        return
      }
      const url = `${window.location.origin}/templates/${fileName}`
      // const url = `http://VER1.ky-express.com/data/Upgrade/Templates/${fileName}`
      const res = await this.$native.downLoadFile(url, 'excel', fileName)
      const result = res && JSON.parse(res)
      if (result) {
        if (result.code == 0 && result.msg) {
          this.$message.success(result.msg)
        } else if (result.code != 0 && result.msg) {
          this.$message.error(result.msg)
        }
      }
      console.log('res :>> ', res, result)
    },
    handleCommand () {
      this.downloadTemplate()
    },
    //检查数据是否符合要求
    verifyExcelData (excelDatas) {
      try {
        if (!excelDatas || excelDatas.length < 1) {
          return '导入的数据为空,请检查'
        }
        const lastRow = excelDatas[excelDatas.length - 1]
        if (lastRow['SKU号'] && (lastRow['SKU号']).toString().startsWith('红色标注')) {
          excelDatas.splice(excelDatas.length - 1, 1)
        }
        if (excelDatas.length < 1) {
          return '导入的数据为空,请检查'
        }
        const colNames = [
          'SKU号',
          '商品名称',
          '规格',
          '商品单位',
          '商品库存',
          '商品尺寸',
          '重量',
          '备注'
        ]
        const excelColNames = Object.keys(excelDatas[0])
        console.log(excelColNames, '导入表格2222')
        if (colNames.some(c => !excelColNames.includes(c))) {
          return '导入Excel格式不正确,请使用正确的模板'
        }
      } catch (ex) {
        console.log('ex :>> ', ex)
        return '数据校验出错'
      }
    },
    //excel列名及excel原始数据处理
    async convertExcelColumnNameAndData (excelDatas) {
      console.log(excelDatas, '表格数据')
      const columns = [{ text: '商品名称', prop: 'itemName' }, { text: '规格', prop: 'itemSpecs' }, { text: '商品单位', prop: 'itemUnit' }, { text: 'sku库', prop: 'stocks' }, { text: '商品尺寸', prop: 'size' }, { text: '重量', prop: 'itemWeight' }, { text: '备注', prop: 'remarks' }, { text: 'SKU号', prop: 'barCode' },{ text: '尺码', prop: 'itemSize' }, { text: '颜色', prop: 'itemColor' }]
      const promises = excelDatas.map(async d => {
        let row = {}
        columns.forEach(item => {
          row[item.prop] = d[item.text] === 0 ? 0 : (d[item.text] || '')
          row['itemStatus'] = 1
        })
        return row
      })
      const modelList = await Promise.all(promises)
      return modelList
    },
    handleViewSku (id) {
      this.$router.push({ path: '/supplier/sku-detail', query: { id:id,type:'view' } })
    }

  },

}
</script>

<style lang="scss" scoped>
  .page-list-container {
    .tabs-container {
      display: flex;
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #f1f1f5;
      justify-content: space-between;
      margin-bottom: 12px;

      .tabs-container-wrap {
        display: flex;
      }

      .icon-tabs {
        padding-right: 3px;
      }

      .tab-item-wrap {
        display: flex;
        justify-content: center;
        padding-right: 64px;
        white-space: nowrap;
      }

      .tab-item {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: rgba(51, 51, 51, 0.93);
        height: 100%;
        user-select: none;
        cursor: pointer;

        &.disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        &.active {
          font-weight: bold;
          color: #8365f6;
          position: relative;

          &::after {
            content: "";
            display: block;
            position: absolute;
            bottom: 0;
            height: 4px;
            width: 60%;
            background: #8365f6;
            border-radius: 4px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }

      .tabs-buttons {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #8365f6;
        cursor: pointer;
        .look-receipt {
          width: 14px;
          height: 16px;
          margin-right: 9px;
        }

        .receipt {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          color: #8365f6;
          white-space: nowrap;
          .look-receipt {
            width: 14px;
            height: 16px;
            margin-right: 9px;
          }
        }

        .receipt-line {
          width: 1px;
          height: 14px;
          background: #d5d2de;
          margin-left: 12px;
          margin-right: 12px;
        }
      }
    }
    .btn-wrapper {
      float: right;
      padding-top: 8px;
      // .el-button + .el-button {
      //   margin-left: 25px;
      // }
      .batch-import {
        margin: 0 20px;
      }
    }
    .switch-wrapper {
      position: relative;
      color: white;
      font-size: 12px;
      &__text {
        pointer-events: none;
        position: absolute;
        z-index: 2;
        top: 1px;
        left: 20px;
        &.active {
          left: 7px;
        }
      }
    }
    .item-main {
      display: flex;
      justify-items: center;
      align-items: center;
      .item-img {
        width: 29px;
        height: 32px;
        margin-right: 12px;
      }
      .item-name {
        line-height: 16px;
      }
    }
    /deep/ {
      .el-button-group > .el-button:first-child {
        border: none;
        width: 78px;
        height: 32px;
        padding: 0;
        color: #8365f6;
      }
      .el-button-group > .el-button:last-child {
        width: 20px;
        height: 32px;
        border: none;
        padding: 0;
        color: #8365f6;
      }
      .el-dropdown .el-dropdown__caret-button::before {
        content: unset;
      }
    }
  }
</style>