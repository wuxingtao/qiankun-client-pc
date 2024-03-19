<template>
  <div v-show="tableData&&tableData.length>0" class="single-fill-record--container">
    <i class="el-icon-close" @click="tableData = []" />
    <div class="title">
      <svg-icon icon-class="icon-info"/> 温馨提示：系统检测到您上次填写内容，本次确认使用吗？
      <el-button size="small" type="primary" plain @click="handleContinue">继续使用</el-button>
    </div>
    <ky-table :data="tableData" :tableColumns="tableColumns" class="element-table" ref="kyTable">
    </ky-table>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { queryWaybillRecord } from '@/services/api/shipment'
import { getReceiptText } from '@/utils/clientUtil'

const tableColumns = [
  { prop: 'payWay', text: '付款方式', width: '120', },
  { prop: 'payAccount', text: '付款账号', width: '120' },
  { prop: 'serviceWay', text: '服务方式', width: '140' },
  { prop: 'goods', text: '托寄物', width: '120' },
  { prop: 'count', text: '件数(件)', width: '90' },
  { prop: 'weight', text: '重量(kg)', width: '90', },
  // { prop: 'sizeList', text: '尺寸', width: '100', },
  { prop: 'sizeText', text: '尺寸', width: '100', },
  { prop: 'declaredValue', text: '保价声明', width: '100' },
  { prop: 'dsMoney', text: '代收货款', width: '100' },
  // { prop: 'receiptFlag', text: '回单服务', width: '130' },
  { prop: 'receiptFlagText', text: '回单服务', width: '130' },
  { prop: 'hdCount', text: '回单份数', width: '100' },
  // { prop: 'mjWay', text: '包装服务', width: '150', },
  { prop: 'mjWayText', text: '包装服务', width: '150', },
  { prop: 'jjRemark', text: '寄件备注', width: '100' },
  { prop: 'vipshopCode', text: '入库号', width: '140' }
]

export default {
  data () {
    return {
      tableColumns: tableColumns,
      tableData: []
    }
  },
  methods: {
    queryWaybillRecord: debounce(async function (sjAddress, qhAddress) {
      if (!this.hasOrderRecordAuth) {
        return
      }
      this.tableData = []
      if (!sjAddress || !qhAddress || sjAddress.length < 11 || qhAddress < 11) {
        return
      }
      const res = await queryWaybillRecord(qhAddress, sjAddress)
      if (res.code === 0 && res.data) {
        res.data.receiptFlagText =  getReceiptText(res.data.receiptFlag)
        const sizeList = res.data.sizeList
        if (sizeList && sizeList.length > 0) {
          res.data.sizeText = sizeList.map(m => `${m.len}*${m.width}${m.height}*${m.number}`).join(';')
        }
        this.tableData = [res.data]
      }
    }, 500),
    fillFormData (data, formData) {
      if (!formData || !this.tableData || this.tableData.length < 1) {
        return
      }
      Object.keys(data).forEach(key => {
        formData[key] = data[key]
      })
    },
    handleContinue () {
      this.$emit('on-continue', this.tableData[0])
      this.tableData = []
    }
  },
  computed: {
    hasOrderRecordAuth () {
      return this.$store.getters.authorityIds.includes('132')
    },
  },
}
</script>

<style lang="scss" scoped>
  .single-fill-record--container {
    position: relative;
    padding: 16px 20px 24px 20px;
    border-radius: 4px;
    box-shadow: 0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12); 
    background: #f3f2ff;
    opacity: 0.95;
    z-index: 10;

    .el-icon-close {
      position: absolute;
      top: 12px;
      right: 20px;
      font-size: 16px;
      color: #9c9c9c;
      cursor: pointer;
    }
    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #333333;
      margin-bottom: 17px;
      .svg-icon{
        margin-right: 8px;
      }
      button {
        border-radius: 17px;
        margin-left: 6px;
      }
    }
    .element-table{
     /deep/ {
       th{
        background: #e7e6f8 !important;
      }
      .el-table__body-wrapper, tr{
        background: #f4f3fe;
      }
     }
    }
  }
</style>