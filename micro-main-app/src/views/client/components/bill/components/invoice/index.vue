<template>
  <div class="client-container"
       style="background-color:#F1F1F5">
    <div class="invoiceContainer">
      <div class="title">开票资料</div>
      <div class="addInvoice">
        <el-button size="small"
                   type="primary"
                   icon="el-icon-plus"
                   style=" width: 112px;"
                   @click="addInvoice"
                   v-eventTracting="'E018'">新增开票资料</el-button>
      </div>

      <div class="invoice">
        <div v-if="invoiceInfos.length<1"
             class="noInvoice">
          <img src="@/assets/image/bill/noInvoiceInfo.png" />
          <div style="margin-top:4px;padding-left:15px;">暂无开票资料</div>
        </div>
        <div v-else-if="invoiceInfos.length==1"
             class="invoice-detail">
          <div class="row">
            <div class="label col1">发票类型</div>
            <div class="col2">{{ invoiceInfos[0].invoiceTypeName}}</div>
            <div class="label col3">发票抬头</div>
            <div class="col4">{{invoiceInfos[0].deductionCompany}}</div>
            <div class="label col5">注册地址</div>
            <div class="col6">{{invoiceInfos[0].address}}</div>
          </div>
          <div class="row">
            <div class="label col1">企业类型</div>
            <div class="col2">{{invoiceInfos[0].companyTypeName}}</div>
            <div class="label col3">纳税人识别号</div>
            <div class="col4">{{invoiceInfos[0].deductionTax}}</div>
            <div class="label col5">注册电话</div>
            <div class="col6">{{invoiceInfos[0].phone}}</div>
          </div>
          <div class="row"
               style="height:58px">
            <div class="label col1">开户银行</div>
            <div class="col2">{{invoiceInfos[0].invoiceOpenBank}}</div>
            <div class="label col3">银行帐户</div>
            <div class="col4"
                 style="">{{invoiceInfos[0].invoiceOpenAccount}}</div>
            <div class=" col5"> </div>
            <div class="col6"> </div>
          </div>
          <div class="row">
            <div class="label col1">发票人姓名</div>
            <div class="col2">{{invoiceInfos[0].invoiceReceiver}}</div>
            <div class="label col3">收票人电话</div>
            <div class="col4">{{invoiceInfos[0].invoiceReceiverPhone}}</div>
            <div class="label col5">收票人地址</div>
            <div class="col6">{{invoiceInfos[0].receiverAddress}}</div>
          </div>

        </div>
        <div v-else
             class="invoice-list">
          <InvoiceTable :tableHeight="200"
                        :invoiceInfos="invoiceInfos"></InvoiceTable>
        </div>
      </div>

      <div class="footer">说明：请确保收票人本人签收发票，避免发票丢失。</div>
    </div>

    <div class="invoiceRecords">
      <div class="title">发票记录</div>
      <div class="invoiceRecords-list">
        <el-table :data="invoiceRecordList"
                  class="clinet-common-table"
                  border
                  stripe
                  style="width:100%">
          <el-table-column :show-overflow-tooltip="true"
                           label="账期"
                           prop="inMonth"
                           width="150px">
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true"
                           prop="invoiceAmount"
                           label="开票金额"
                           min-width="100px">
            <template slot-scope="scope">
              ￥{{scope.row.invoiceAmount }}
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true"
                           prop="state"
                           label="状态"
                           min-width="100px">
            <template slot-scope="scope">
              {{scope.row.state | formatState}}
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true"
                           prop="inWaybillNumber"
                           label="发票寄出单号"
                           min-width="130px">
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true"
                           label="实际签收人"
                           prop="invoiceSendee"
                           min-width="100px">
          </el-table-column>
          <el-table-column fixed="right"
                           label="发票详情"
                           width="120px">
            <template slot-scope="scope">
              <el-button @click.native.prevent="viewInvoiceRecordDetail(scope.row)"
                         type="text"
                         size="small"
                         v-eventTracting="'E019'">
                查看详情
              </el-button>

            </template>
          </el-table-column>
          <el-table-column fixed="right"
                           label="操作"
                           width="150px">
            <template slot-scope="scope">
              <el-button v-if="scope.row.state!='0'"
                         @click.native.prevent="viewRoutes(scope.row.inWaybillNumber,scope.row.inMonth)"
                         type="text"
                         size="small"
                         v-eventTracting="'E020'">
                运单路由
              </el-button>
              <el-button v-if="scope.row.state=='1'"
                         @click.native.prevent="signInvoice(scope.row.inMonth)"
                         type="text"
                         size="small"
                         v-eventTracting="'E021'">
                本人已收到
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <InvoiceRecordDetail ref="invoiceRecordDetail"></InvoiceRecordDetail>
    <BillRoutes ref="billRoutes"></BillRoutes>
    <InvoiceDetail ref="invoiceDetail"
                   @onSaveSuccess="getInvoiceInfoList"></InvoiceDetail>
  </div>
</template>


<script>
import { getInvoiceInfoListApi, getInvoiceRecordInfosApi, signInvoiceApi } from "@/services/api/bill"
import { getCustomerCode, getLoginData } from "@/utils/storage"
import { getContactNumbers } from '../../assets/common'
import dayjs from 'dayjs'
import InvoiceRecordDetail from './components/InvoiceRecordDetail'
import InvoiceTable from './components/InvoiceTable'
import BillRoutes from '../../components/BillRoutes'
import InvoiceDetail from "./components/InvoiceDetail"
import "../../assets/common.scss"
export default {
  components: {
    InvoiceRecordDetail,
    InvoiceTable,
    BillRoutes,
    InvoiceDetail
  },
  data () {
    return {
      invoiceInfos: [],
      invoiceRecordList: []
    }
  },
  mounted () {
    this.getInvoiceInfoList()
    this.getInvoiceRecordInfoList()
  },
  filters: {
    formatState (state) {
      if (state === '0') {
        return '审核中'
      } else if (state === '1') {
        return '已寄出'
      } else if (state === '2') {
        return '已签收'
      }
    }
  },
  methods: {
    getInvoiceInfoList () {
      getInvoiceInfoListApi({ 'customerCode': getCustomerCode() }).then(res => {
        if (res.data) {
          this.invoiceInfos = res.data
          this.initInvoiceData()
        }
      })
    },
    getInvoiceRecordInfoList () {
      let months = []
      for (let i = 0; i > -3; i--) {
        months.push(dayjs().add(i, 'M').format('YYYY-MM'))
      }
      getInvoiceRecordInfosApi({ 'customerCode': getCustomerCode(), inMonths: months })
        .then(res => {
          if (res.data) {
            this.invoiceRecordList = res.data
            this.invoiceRecordList.sort(
              (pre, next) => {
                if (pre.inMonth < next.inMonth) {
                  return 1
                } else if (pre.inMonth > next.inMonth) {
                  return -1
                }
                return 0
              }
            )
          }
        })
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
    },
    viewInvoiceRecordDetail (row) {
      this.$refs.invoiceRecordDetail.showDialog(row)
    },
    viewRoutes (ydNo,billMonth) {
      this.$refs.billRoutes.showDialog(ydNo,'',billMonth)
    },
    signInvoice (inMonth) {
      this.$confirm('是否确认发票已被本人签收?', '签收确认').then(() => {
        let loginInfo = getLoginData()
        let params = {
          customerCode: getCustomerCode(),
          inMonth,
          invoiceSigner: loginInfo.userName || loginInfo.phone,
          invoiceSignDate: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        signInvoiceApi(params).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '签收成功',
              type: 'success'
            })
            this.getInvoiceRecordInfoList()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  // @import url("../mybill/assets/common.scss");
  .title {
    // height: 51px;
    // line-height: 51px;
    padding: 16px 0;
    margin: 0px 24px 14px;
    font-size: 18px;
    font-weight: bold;
    color: rgba(51, 51, 51, 0.93);
    border-bottom: 1px solid #f1f1f5;
  }
  .invoiceContainer {
    position: relative;
    background-color: #fff;
    padding-bottom: 28px;

    .addInvoice {
      position: absolute;
      right: 24px;
      top: 12px;
    }
    .invoice {
      padding-top: 0px;
      height: 249px;
      .noInvoice {
        width: 120px;
        padding: 70px 45%;
        font-size: 12px;
        color: #999999;
      }
      .invoice-detail {
        display: flex;
        flex-direction: column;
        padding-top: 10px;
        padding-left: 36px;
        font-size: 14px;
        line-height: 38px;
        color: #333333;
        .label {
          color: #999999;
        }
        .row {
          display: flex;
          align-content: flex-start;
        }
        .col1 {
          width: 94px;
        }
        .col3 {
          width: 122px;
        }
        .col5 {
          width: 108px;
        }
        .col2,
        .col4,
        .col6 {
          flex: 1;
        }
      }
      .invoice-list {
        padding: 0 24px;
        height: 100%;
      }
    }
    .footer {
      position: absolute;
      bottom: 14px;
      padding-left: 24px;
      font-size: 14px;
      color: #999999;
    }

    /deep/.clinet-common-table {
      max-height: 210px !important;
    }
    /deep/.el-table__body-wrapper {
      max-height: 168px !important;
    }
  }

  .invoiceRecords {
    background-color: #fff;
    margin-top: 16px;
    // border: 1px solid;
    .invoiceRecords-list {
      padding: 0 24px;
    }
  }

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
