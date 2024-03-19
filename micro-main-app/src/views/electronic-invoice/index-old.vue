<template>
  <div class="main-card">
    <h3>电子发票</h3>
    <el-row class="form-area">
      <el-form :inline="true"
               :model="form">
        <el-form-item label="开票状态"
                      style="width:144px;"
                      class="form-item-margin">
          <el-select v-model="form.status"
                     placeholder="请选择">
            <el-option v-for="item in statusList"
                       :key="item.value"
                       :label="item.name"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="寄件日期"
                      style="width:296px;"
                      class="form-item-margin">
          <el-date-picker v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          :picker-options="startPickerOptions"
                          placeholder="选择日期时间">
          </el-date-picker>
          <span>-</span>
          <el-date-picker v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          :picker-options="endPickerOptions"
                          placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     style="margin-top: 37px;"
                     @click="searchData">查询</el-button>

        </el-form-item>
      </el-form>
    </el-row>
    <div class="table-area">
      <el-table ref="multipleTable"
                class="common-table"
                stripe
                :data="tableData"
                v-if="tableData.length>0"
                style="width: 100%"
                @selection-change="handleSelectionChange">

      </el-table>
      <div class="table-img"
           v-if="tableData.length === 0">
        <img src="@/assets/image/none.png" />
      </div>
      <el-pagination background
                     v-if="tableData.length > 0"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page.sync="paganation.currentPage"
                     :page-size="paganation.rows"
                     layout="prev, pager, next,sizes,jumper"
                     :total="paganation.total">
      </el-pagination>
    </div>

    <invoiceDetail ref="invoiceDetail"></invoiceDetail>
  </div>
</template>

<script>
import request from '@/services/api/request.js'
import * as time from '@/utils/formatDate'
let {formatDate} = time.default
import Dialog from './components/dialog'
import invoiceDetail from './components/invoiceDetail'
import {getCustomerCode, getPhone} from "@/utils/storage"
import dayjs from "dayjs"
export default {
  components: {
    Dialog,
    invoiceDetail
  },
  data () {
    return {
      token: null,
      phone: getPhone(),  // 手机号
      custNo: getCustomerCode(), // 客户编码
      loading: true,

      disableFlag: null, // 判断开票下载禁用


      paganation: {
        currentPage: 1,
        rows: 10,
        total: 0
      },

      invoiceSerialNumber: '',
      downList: [], // 已开票下选中的打印地址集合
      resourcesID: '',

    }
  },
  created () { },
  mounted () {
    this.resourcesID = this.$store.getters.authorityIds
    this.getDataList()
  },
  methods: {


    // 分页点击事件
    handleCurrentChange (val) {
      this.paganation.currentPage = val
      this.getDataList()
    },
    handleSizeChange (val) {
      this.paganation.rows = val
      this.getDataList()
    },

    // 表格选中
    handleSelectionChange (val) {
      if (this.form.status === 0) {
        let sourceCodeList = []
        // 当运单号相同时把流水号push,流水号相同时，也要push
        val.forEach(el => {
          this.tableData.forEach(item => {
            if (el.sourceCode === item.sourceCode) {
              sourceCodeList.push(item.sourceCode)
            } else if (el.ydCode === item.ydCode) {
              sourceCodeList.push(item.sourceCode)
            }
          })
        })
        this.codeList = sourceCodeList.join(',')
      } else {
        let sourceCodeList = []
        this.downList = []
        val.forEach(el => {
          this.downList.push(el.printAddress)
          sourceCodeList.push(el.sourceCode)
        })
        this.codeList = sourceCodeList.join(',')
      }
    },


  }
}
</script>

<style lang="scss" scoped>
  .main-card {
    width: 100%;
    min-height: calc(100vh - 128px);
    background: #ffffff;
    h3 {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
      font-family: PingFangSC-Medium;
      font-weight: bold;
      color: rgba(51, 51, 51, 0.93);
      padding: 0 24px;
      border-bottom: #f1f1f5 1px solid;
    }
    .form-area {
      height: 88px;
      padding: 0 24px;
      .form-item-margin {
        margin-right: 8px;
      }
    }
    /deep/ .el-date-editor.el-input {
      width: 140px;
    }
    /deep/ .el-form-item__label {
      color: #333333;
      font-size: 12px;
    }
    /deep/ .el-table__body-wrapper {
      height: calc(100vh - 388px);
      overflow-y: auto;
    }
    .table-area {
      padding: 0 24px;
    }
    .table-img {
      height: 500px;
    }
  }
  /deep/ .el-date-editor.el-input {
    width: 140px;
  }
  /deep/ .el-form-item__label {
    color: #333333;
    font-size: 12px;
  }
  .table-area {
    padding: 0 24px;
  }
  .table-img {
    height: 500px;
  }
</style>


<!--
<template>
  <div class="main-card">
    <h3>电子发票</h3>
    <el-row class="form-area">
      <el-form :inline="true"
               :model="form">
        <el-form-item label="开票状态"
                      style="width:144px;"
                      class="form-item-margin">
          <el-select v-model="form.status"
                     placeholder="请选择">
            <el-option v-for="item in statusList"
                       :key="item.value"
                       :label="item.name"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="寄件日期"
                      style="width:296px;"
                      class="form-item-margin">
          <el-date-picker v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          :picker-options="startPickerOptions"
                          placeholder="选择日期时间">
          </el-date-picker>
          <span>-</span>
          <el-date-picker v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          :picker-options="endPickerOptions"
                          placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     style="margin-top: 37px;"
                     @click="searchData">查询</el-button>

        </el-form-item>
      </el-form>
    </el-row>
    <div class="table-area">
      <el-table ref="multipleTable"
                class="common-table"
                stripe
                :data="tableData"
                v-if="tableData.length>0"
                style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column v-for="item in lableList.filter(m=>m.isShow===true)"
                         :key="item.label"
                         :label="item.label"
                         :prop="item.prop">
        </el-table-column>
        <el-table-column prop="invoicestate"
                         label="开票状态">
        </el-table-column>
        <el-table-column label="操作"
                         width="180">
          <template v-slot:default="scope">
            <el-button @click="handleBill(scope.row)"
                       type="text"
                       size="small">{{
                scope.row.invoicestate == "已开票" ? "下载" : scope.row.invoicestate == "开票中" ?"详情":"开票"
              }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-img"
           v-if="tableData.length === 0">
        <img src="@/assets/image/none.png" />
      </div>
      <el-pagination background
                     v-if="tableData.length > 0"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page.sync="paganation.currentPage"
                     :page-size="paganation.rows"
                     layout="prev, pager, next,sizes,jumper"
                     :total="paganation.total">
      </el-pagination>
    </div>
    <Dialog ref="dialogForm"
            :codeList="codeList"
            :phone="phone"></Dialog>
    <invoiceDetail ref="invoiceDetail"></invoiceDetail>
  </div>
</template>

<script>
import request from '@/services/api/request.js'
import {getStayList} from '@/services/api/electronic-invoice.js'
import * as time from '@/utils/formatDate'
let {formatDate} = time.default
import Dialog from './components/dialog'
import invoiceDetail from './components/invoiceDetail'
import {getCustomerCode, getPhone} from "@/utils/storage"
import dayjs from "dayjs"
export default {
  components: {
    Dialog,
    invoiceDetail
  },
  data () {
    return {
      token: null,
      phone: getPhone(),  // 手机号
      custNo: getCustomerCode(), // 客户编码
      loading: true,
      form: {
        startTime: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        endTime: formatDate(new Date(), 'yyyy-MM-dd'),
        status: 0,
        ydcode: ""
      },
      disableFlag: null, // 判断开票下载禁用
      statusList: [{ name: '待开票', value: 0 }, { name: '开票中', value: 1 }, { name: '已开票', value: 2 }],
      tableData: [], //表格data
      lableList: [
        { label: '运单号', prop: 'waybillNumber', isShow: false },
        { label: '管理编码', prop: 'invoiceSerialNumber', isShow: false },
        { label: '开票金额', prop: 'invoiceAmount', isShow: false },
        { label: '开票金额', prop: 'expressAmount', isShow: false },
        { label: '发票内容', prop: 'invoiceContent', isShow: false },
        { label: '开票类型', prop: 'invoiceTypeName', isShow: false },
        { label: '开票日期', prop: 'invoiceDate', isShow: false },], //动态表头项
      paganation: {
        currentPage: 1,
        rows: 10,
        total: 0
      },
      codeList: [],
      invoiceSerialNumber: '',
      downList: [], // 已开票下选中的打印地址集合
      resourcesID: '',
      startPickerOptions: {
        // 设定时间范围 今天之前
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      },
      endPickerOptions: {
        // 设定时间范围 开始时间后,不能超过7天
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created () { },
  mounted () {
    this.resourcesID = this.$store.getters.authorityIds
    this.getDataList()
  },
  methods: {
    //获取列表
    async getDataList () {

      if (this.form.startTime && this.form.endTime) {
        if (dayjs(this.form.startTime).add(6, 'month') < dayjs(this.form.endTime)) {
          this.$message({
            message: "查询日期不能超过6个月",
            type: 'warning'
          })
          return
        }
        const loading = this.$loading({
          lock: true,
          text: '加载中',
          spinner: 'el-icon-loading',
          background: 'rgba(255,255, 255, 0.7)'
        })
        setTimeout(() => {
          loading.close()
        }, 1000)
        console.log(loading)
        let startTime = this.form.startTime
        let endTime = this.form.endTime
        let ydcode = this.form.ydcode
        if (this.form.status === 0) {
          let res= await getStayList({
            deliveryStartDate: startTime,
            deliveryEndDate: endTime,
            waybillNumber: ydcode,
            customerCode: this.custNo,
            page: this.paganation.currentPage,
            pageSize: this.paganation.rows
          })
          console.log(885,res)

          /*  request('web.financeInvoice.getStayList', {
              deliveryStartDate: startTime,
              deliveryEndDate: endTime,
              waybillNumber: ydcode,
              customerCode: this.custNo,
              page: this.paganation.currentPage,
              pageSize: this.paganation.rows
            }).then(res => {
              if (res.data.code === 0 && res.data.data.rows) {
                this.tableData = res.data.data.rows
                this.tableData.forEach(el => {
                  el.invoicestate = '待开票'
                  el.invoiceTypeName = '电子发票'
                })
                this.lableList.forEach(el => {
                  if (el.label === '运单号') {
                    el.isShow = true
                  }
                  else if (el.label === '开票金额' && el.prop === 'expressAmount') {
                    el.isShow = true
                  }
                  else {
                    el.isShow = false
                  }
                }
                )
                this.paganation.total = Number(res.data.data.rowTotal)
              } else {
                this.tableData = []
                this.paganation.total = 0
              }
            })*/
        }
        else {
          request('web.financeInvoice.getRecordList', {
            invoiceStartDate: startTime,
            invoiceType: 1,
            invoiceEndDate: endTime,
            waybillNumber: ydcode,
            invoiceStatus: this.form.status === 1 ? "10" : "30",
            customerCode: this.custNo,
            page: this.paganation.currentPage,
            pageSize: this.paganation.rows
          }).then(res => {
            if (res.data.code === 0 && res.data.data.rows) {
              this.tableData = res.data.data.rows
              this.tableData.forEach(el => {
                el.invoicestate = this.form.status === 1 ? '开票中' : '已开票'
                el.expressAmount = el.invoiceAmount
                el.invoiceTypeName = '电子发票'
              })
              this.lableList.forEach(el => {
                if (el.label === '运单号') {
                  el.isShow = false
                }
                else if (el.label === '开票金额' && el.prop === 'expressAmount') {
                  el.isShow = false
                }
                else {
                  el.isShow = true
                }
              }
              )
              this.paganation.total = Number(res.data.data.rowTotal)
            } else {
              this.tableData = []
              this.paganation.total = 0
            }
          })
        }
      } else {
        this.$message({
          message: '请选择开票日期',
          type: 'warning'
        })
      }

    },
    //查询表单
    searchData () {
      this.tableData = []
      this.paganation.currentPage = 1
      this.loading = true
      this.getDataList()
    },
    // 分页点击事件
    handleCurrentChange (val) {
      this.paganation.currentPage = val
      this.getDataList()
    },
    handleSizeChange (val) {
      this.paganation.rows = val
      this.getDataList()
    },
    // 打开开票弹框
    openInvoice (val) {
      this.codeList = [{ waybillNumber: val.waybillNumber, expressAmount: val.expressAmount }]
      this.$refs.dialogForm.openDialog()

    },
    // 表格选中
    handleSelectionChange (val) {
      if (this.form.status === 0) {
        let sourceCodeList = []
        // 当运单号相同时把流水号push,流水号相同时，也要push
        val.forEach(el => {
          this.tableData.forEach(item => {
            if (el.sourceCode === item.sourceCode) {
              sourceCodeList.push(item.sourceCode)
            } else if (el.ydCode === item.ydCode) {
              sourceCodeList.push(item.sourceCode)
            }
          })
        })
        this.codeList = sourceCodeList.join(',')
      } else {
        let sourceCodeList = []
        this.downList = []
        val.forEach(el => {
          this.downList.push(el.printAddress)
          sourceCodeList.push(el.sourceCode)
        })
        this.codeList = sourceCodeList.join(',')
      }
    },
    // 下载已开票
    downLoad (val) {
      request("web.financeInvoice.getFileUrls", {
        invoiceSerialNumber: val.invoiceSerialNumber,
        customerCode: this.custNo
      }).then(res => {
        if (res.data.code === 0) {
          if (res.data.data) {
            downLoadFile(res.data.data[0].downloadUrl, "pdf", "") //调用客户端方法
          }
          //window.open(this.downList[0])
        } else {
          this.$message({
            message: res.data.msg,
            type: 'warning'
          })
        }
      })
    },
    handleBill (val) {

      if (val.invoicestate === "已开票") {
        this.downLoad(val)
      } else if (val.invoicestate === "开票中") {
        //查看详情
        this.$refs.invoiceDetail.openDialog(val.invoiceSerialNumber)
      } else {
        this.openInvoice(val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-card {
    width: 100%;
    min-height: calc(100vh - 128px);
    background: #ffffff;
    h3 {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
      font-family: PingFangSC-Medium;
      font-weight: bold;
      color: rgba(51, 51, 51, 0.93);
      padding: 0 24px;
      border-bottom: #f1f1f5 1px solid;
    }
    .form-area {
      height: 88px;
      padding: 0 24px;
      .form-item-margin {
        margin-right: 8px;
      }
    }
    /deep/ .el-date-editor.el-input {
      width: 140px;
    }
    /deep/ .el-form-item__label {
      color: #333333;
      font-size: 12px;
    }
    /deep/ .el-table__body-wrapper {
      height: calc(100vh - 388px);
      overflow-y: auto;
    }
    .table-area {
      padding: 0 24px;
    }
    .table-img {
      height: 500px;
    }
  }
  /deep/ .el-date-editor.el-input {
    width: 140px;
  }
  /deep/ .el-form-item__label {
    color: #333333;
    font-size: 12px;
  }
  .table-area {
    padding: 0 24px;
  }
  .table-img {
    height: 500px;
  }
</style>
-->
