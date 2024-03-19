<template>
  <ky-dialog class="flag-list-container" :title="`公司标记(${subtitle})`" :visible.sync="dialogVisible"  min-width=" 300px" confirm-text="" cancelText="关闭">
    <div class="top">
      <span>最多支持添加{{maxCount}}个{{tipMessage}}</span>
      <el-button v-if="this.pagination.totalCount<maxCount" @click="addRow" class="btn-add" type="text" size="medium"><i class="iconfont icon-tool-add mr_8" />新增</el-button>
    </div>
    <ky-table index-column :data="tableData" :pagination="pagination" :paginationVisible="true" @pagination-change="queryData" v-loading="loading">
      <el-table-column fixed label="操作" :width="90">
        <template slot-scope="{row}">
          <el-button @click.stop="deleteRow(row.id)" type="text">删除 </el-button>
           <el-button v-if="!row.edit" @click.stop="$set(row,'edit',true)" type="text" >编辑 </el-button>
           <el-button v-else @click.stop="saveRow(row)" type="text">保存 </el-button>
        </template>
      </el-table-column>
       <el-table-column v-for="(col,index) in tableColumns.filter(f=>f.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
          <template slot-scope="{row}">
           <el-input v-if="row.edit" v-model="row[col.prop]"  size="small" maxlength="200"/>
          <template v-else>
            {{row[col.prop]}}
          </template>
        </template>
      </el-table-column>
    </ky-table>
  </ky-dialog>
</template>

<script>
import { splitAddress } from '@/services/api/address'
import { queryPrintAddressFlag,deletePrintAddressFlag,addPrintAddressFlag,modifyPrintAddressFlag,
  queryPrintCompanyFlag,deletePrintCompanyFlag,addPrintCompanyFlag,modifyPrintCompanyFlag,
  queryPrintCompanyGoodsFlag,deletePrintCompanyGoodsFlag,addPrintCompanyGoodsFlag ,modifyPrintCompanyGoodsFlag} from '@/services/api/setting'
export default {
  // components: { kyTable },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    printFlagType: {
      type: String,
      require: true,
    }
  },
  data () {
    return {
      dialogVisible: false,
      subtitle: '货品编码',
      maxCount: 100,
      tipMessage: '',
      loading: false,
      tableColumns: [],
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  methods: {
    addRow () {
      this.tableData.push({edit:true})
    },
    async saveRow(row){
      const isModify=row.id
      let saveFunc = isModify ? modifyPrintCompanyGoodsFlag : addPrintCompanyGoodsFlag
      let params={ companyName:row.companyName,commodityCode:row.commodityCode}
      if(this.printFlagType === 'address'){
        if(!row.addressName || row.addressName.length<13){
          return this.$message.error('地址不能小于13位')
        }
        const tempRes = await  splitAddress(row.addressName)
        if(tempRes.code != 0){
          return this.$message.error(tempRes.data.errorMsg || '地址解析失败')
        }
        saveFunc = isModify ? modifyPrintAddressFlag : addPrintAddressFlag
        params = { addressName:row.addressName }
      }else if(this.printFlagType === 'company'){
        saveFunc =isModify ? modifyPrintCompanyFlag : addPrintCompanyFlag
        params = { sendCustomerName:row.sendCustomerName,receiverCustomerName:row.receiverCustomerName }
      }     
      if(isModify){
        params.id = row.id
      }
      const res = await saveFunc(params)
      if(res.code === 0){
        row.edit=false
        this.$message.success('保存成功')
        this.queryData ()
      }
    },
    async deleteRow (id) {
      let deleteFunc = deletePrintCompanyGoodsFlag
      switch (this.printFlagType) {
        case 'address':
          deleteFunc = deletePrintAddressFlag
          break
        case 'company':
          deleteFunc = deletePrintCompanyFlag
          break 
      }
      const res = await deleteFunc({id})
      if(res.code === 0){
        this.$message.success('删除成功')
        if(this.tableData.length === 1 &&  this.pagination.pageIndex > 1){
          this.pagination.pageIndex-=1
        }
        this.queryData ()
      }
    },
    async queryData () {
      this.loading = true
      try {
        let queryFunc = queryPrintCompanyGoodsFlag
        switch (this.printFlagType) {
          case 'address':
            queryFunc = queryPrintAddressFlag
            break
          case 'company':
            queryFunc = queryPrintCompanyFlag
            break 
        }
        const params = {
          page: this.pagination.pageIndex,
          pageSize: this.pagination.pageSize,
        }
        const res = await queryFunc(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
          this.resetVuexFlags(this.tableData)
        }
      } finally {
        this.loading = false
      }
    },
    resetVuexFlags(){
      switch (this.printFlagType) {
        case 'company':
          this.$store.commit('print/setCompanyFlags',[])
          break
        case 'companyGoods':
          this.$store.commit('print/setCompanyGoodsFlags',[])
          break
      }
    }
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
      if(val){
        this.pagination.pageIndex = 1
        this.queryData ()
      }
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    },
    printFlagType: {
      handler (val) {
        switch (val) {
          case 'address':
            this.subtitle = this.tipMessage = '收件地址'
            this.maxCount = 100
            this.tableColumns = [
              { prop: 'addressName', text: '收件地址', width: '90', visible: true },
            ]
            break
          case 'company':
            this.subtitle = '公司名称'
            this.tipMessage = '公司'
            this.maxCount = 500
            this.tableColumns = [
              { prop: 'sendCustomerName', text: '寄件公司', width: '90', visible: true },
              { prop: 'receiverCustomerName', text: '收件公司', width: '90', visible: true },
            ]
            break
          default:
            this.subtitle = '货品编码'
            this.tipMessage = '公司'
            this.maxCount = 500
            this.tableColumns = [
              { prop: 'companyName', text: '收件公司', width: '90', visible: true },
              { prop: 'commodityCode', text: '货品编码', width: '90', visible: true },
            ]
            break
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .flag-list-container {
    /deep/.el-dialog{
      min-width: 350px;
    }
    .top {
      display: flex;
      .btn-add {
        margin-left: auto;
      }
    }
  }
</style>