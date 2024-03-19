<template>
  <ky-dialog title="sku库" class="dialog-sku" :visible.sync="dialogVisible" @confirm="handleConfirm" width="820px" append-to-body>
    <ky-search-container>
      <div>
        <span>商品信息</span>
        <el-input v-model="formData.sku" size="medium" clearable placeholder="商品编码/商品名称"></el-input>
      </div>
      <div>
        <span>供应商</span>
        <el-select v-model="formData.supplierName" size="medium" filterable placeholder="请选择供应商" clearable >
          <el-option v-for="item in options" :key="item.supplierName" :label="item.supplierName" :value="item.supplierName">
          </el-option>
        </el-select>
        <!-- <el-input v-model="formData.supplierName" size="medium" filterable clearable placeholder="请输入供应商名称"></el-input> -->
      </div>
      <el-button type="primary" round size="medium" @click="handleQueryClick">查询</el-button>
    </ky-search-container>
    <ky-table ref="kyTable" :data="tableData" multi-select :tableColumns="tableColumns" :pagination="pagination" @pagination-change="querySkuData" :height="300">
      <template slot="empty">
        <none-data>
          <template slot="header">
            <svg-icon icon-class="none-data3" style="margin-bottom:5px" />
          </template>
          <div>暂无可选sku，可前往sku库添加哦~</div>
          <el-link v-if="showAddSkuLink" type="primary" :underline="false" @click="goAddSku">立即添加sku </el-link>
        </none-data>
      </template>
      <el-table-column label="商品名称" width="200px" show-overflow-tooltip>
        <template v-slot="{row}">
          <div class="item-main">
            <div class="item-img">
              <el-image :src="row['itemPicture']||defaultImg" :previewSrcList="[row['itemPicture']]" style="width:100%;height:100%">
                <div slot="placeholder" class="image-slot">
                  加载中<span class="dot">...</span>
                </div>
              </el-image>
            </div>
            <div class="item-name">
              <div>{{ row["itemName"] }}</div>
              <div style="color: #999999;">{{row["barCode"]}}</div>
            </div>
          </div>
        </template>
      </el-table-column>
    </ky-table>
  </ky-dialog>
</template>

<script>
import { getCustomerCode } from '@/utils/storage'
import { getItemInfoList,getSupplierList } from '@/services/api/supplier'

const tableColumns = [
  { prop: 'itemName', text: '商品名称', width: '90' },
  { prop: 'itemSpecs', text: '规格', width: '90', visible: true },
  { prop: 'itemUnit', text: '商品单位', width: '60', visible: true },
  { prop: 'stocks', text: '现有库存', width: '60', visible: true },
  // { prop: "supplierName", text: "供应商", width: "130", visible: true },
  // { prop: "remarks", text: "备注", width: "90", visible: true },
]

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    showAddSkuLink: {
      type: Boolean,
      default: false,
    },
    supplierName: {
      type: String,
    },
    goodsNameList: {
      type: Array,
    },
    skuIdList: {
      type: Array,
    }
  },
  data () {
    return {
      dialogVisible: false,
      defaultImg: require('@/assets/image/item-default-img.png'),
      formData: {
        sku: '',
        supplierName: ''
      },
      tableColumns: tableColumns,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 50,
        totalCount: 0,
      },
      options:[]
    }
  },
  created(){
    console.log(111)
    this.querySearchSupplier()
  },
  methods: {
    goAddSku () {
      this.dialogVisible = false
      this.$router.push('/supplier/sku-detail')
    },
    handleConfirm () {
      if (this.$refs.kyTable.selectedRows.length < 1) {
        this.$message.info('请选择商品')
        return
      }
      if (this.$refs.kyTable.selectedRows.length > 20) {
        this.$message.info('选择的商品不能超过20个')
        return
      }
      this.$emit('confirm', this.$refs.kyTable.selectedRows)
      this.dialogVisible = false
    },
    handleQueryClick () {
      this.pagination.pageIndex = 1
      this.querySkuData()
    },
    async querySkuData () {
      const params = {
        customerCode: getCustomerCode(),
        // supplierPhone: getPhone(),
        supplierName: this.formData.supplierName,
        itemKey: this.formData.sku,
        mode: 2,
        page: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
      }
      const res = await getItemInfoList(params)
      if (res.code === 0) {
        this.tableData = res.data.rows
        this.pagination.totalCount = res.data.rowTotal
        if (this.skuIdList && this.skuIdList.length > 0) {
          const rows = this.tableData.filter(f => this.skuIdList.includes(f.id))
          this.$nextTick(() => {
            rows.forEach(row => {
              this.$refs.kyTable.toggleRowSelection(row, true)
            })
          })
        } else if (this.goodsNameList && this.goodsNameList.length > 0) {
          const rows = this.tableData.filter(f => this.goodsNameList.includes(f.itemName))
          this.$nextTick(() => {
            rows.forEach(row => {
              this.$refs.kyTable.toggleRowSelection(row, true)
            })
          })
        }
        // if(this.goodsNameList&&this.goodsNameList.length>0){
        //   this.$refs.kyTable.selectedRows= this.tableData.filter(f=>this.goodsNameList.includes(f.itemName))
        // }
      }
    },
    async querySearchSupplier () {
      const params = {
        customerCode: getCustomerCode(),
        supplierStatus: 1,
        page: 1,
        pageSize: 20,
      }
      const res = await getSupplierList(params)
      if (res.code === 0 && res.data.rows) {
        this.options = res.data.rows
      }
    },
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.formData.sku = ''
        this.formData.supplierName = ''
        this.tableData = []
      } else {
        this.formData.supplierName = this.supplierName
        this.$nextTick(() => this.handleQueryClick())
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-sku {
    /deep/ .el-dialog__body {
      padding: 0 20px 0 !important;

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
    }
  }
</style>