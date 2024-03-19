<template>
  <div class="clientdialog">
    <el-dialog :visible.sync="dialogVisible"
               title="选择开票资料"
               width="1100px">
      <!-- <div slot="title"
           class="title">
        <div class="el-icon-back"></div>
        <div>选择开票资料</div>
      </div> -->
      <div class="content">
        <div class="content-top">
          <!-- <h2>查询</h2> -->
          <div class="content-top-bottom">
            <!-- <el-input style="width:280px;"
                      placeholder="请输入内容"></el-input>
            <el-button type="primary"
                       style="width:72px;"
                       icon="el-icon-search"
                       @click="dialogVisible = false">搜索</el-button> -->
            <el-button type="plain"
                       icon="el-icon-plus"
                       style="width:135px;"
                       class="btnAddInvoice"
                       @click="addInvoice">新增开票资料</el-button>
          </div>
        </div>
        <div class="content-table">
          <InvoiceTable ref="table"
                        tableHeight="420"
                        :invoiceInfos="invoiceInfos"
                        :isShowSelectionColumn="true"></InvoiceTable>
        </div>

      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="confirmSelect">确 定</el-button>
      </span>
    </el-dialog>

    <InvoiceDetail ref="invoiceDetail"
                   @onDialogClose="dialogVisible=true;"></InvoiceDetail>
  </div>
</template>

<script>
import InvoiceTable from './InvoiceTable'
import InvoiceDetail from './InvoiceDetail'
import { getInvoiceInfoListApi } from "@/services/api/bill"
import { getCustomerCode } from "@/utils/storage"
import { getContactNumbers } from '../../../assets/common'
export default {
  components: {
    InvoiceTable,
    InvoiceDetail,
  },
  data () {
    return {
      dialogVisible: false,
      invoiceInfos: [],
    }
  },
  watch: {
    dialogVisible () {
      if (this.dialogVisible) {
        this.getInvoiceInfoList()
      }
    }
  },
  methods: {
    showDialog () {
      this.dialogVisible = true

    },
    //获取发票列表信息，在MakeInvoice里有调用此方法
    async  getInvoiceInfoList () {
      let res = await getInvoiceInfoListApi({ 'customerCode': getCustomerCode() })
      if (res.data) {
        this.invoiceInfos = res.data
        this.initInvoiceData()
      }
      return this.invoiceInfos
    },
    initInvoiceData () {
      if (this.invoiceInfos) {
        this.invoiceInfos.forEach(value => {
          let receiverAddress = value.province + value.city + value.district + value.street + value.village + value.doorNumber
          let invoiceTypeName = ''
          switch (value.invoiceType) {
            case '10':
              invoiceTypeName = '增值专用发票6%'; break
            case '20':
              invoiceTypeName = '增值运输发票11%'; break
            case '30':
              invoiceTypeName = '增值普通发票6%'; break
            case '40':
              invoiceTypeName = '收据'; break
            case '50':
              invoiceTypeName = '增值运输发票9%'; break
          }
          let companyTypeName = ''
          switch (value.companyType) {
            case '10':
              companyTypeName = '企业'; break
            case '20':
              companyTypeName = '个人'; break
            case '30':
              companyTypeName = '机关事业单位'; break
            case '40':
              companyTypeName = '其它'; break
          }

          let contacts = getContactNumbers(value.phoneAddress)
          let phone = contacts.telephones[0] || contacts.phones[0]
          value['phone'] = phone
          value['address'] = value.phoneAddress.replace(phone, '')
          value['companyTypeName'] = companyTypeName
          value['invoiceTypeName'] = invoiceTypeName
          value['receiverAddress'] = receiverAddress
        })
      }
    },
    addInvoice () {
      this.$refs.invoiceDetail.showDialog()
      this.dialogVisible = false
    },
    confirmSelect () {
      if (this.$refs.table.selectedRows.some(item => item.auditStatus === '10')) {
        this.$message({
          message: '您选择的开票资料中包含了【未审核】的资料',
          type: 'warning'
        })
        return
      }
      this.$emit('onConfirmSelect', this.$refs.table.selectedRows)
      this.dialogVisible = false

    }
  }
}
</script>

<style lang="scss" scoped>
  .title {
    margin-left: -6px;
    div {
      display: inline-block;
      font-weight: bold;
    }
    font-size: 14px;
    color: #333333;
    .el-icon-back {
      font-size: 17px;
      margin-right: 17px;
      position: relative;
      top: 1px;
    }
  }

  .content {
    .content-top {
      > h2 {
        font-size: 12px;
        color: #333333;
        margin-bottom: 8px;
      }
      .content-top-bottom {
        position: relative;
        height: 44px;
        .btnAddInvoice {
          position: absolute;
          right: 0px;
        }
      }
    }
    .content-table {
      min-height: 300px;
      max-height: 479px;
    }
    //滚动条的宽度
    .timeline::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    // 滚动条的滑块
    .timeline::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
  }
  /deep/ .el-dialog > .el-dialog__body {
    margin-top: 12px !important;
  }
</style>
