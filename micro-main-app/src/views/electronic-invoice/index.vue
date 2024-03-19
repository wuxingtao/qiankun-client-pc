<template>
  <el-container style="height: 100%;" class="electronic-invoice_r">
    <el-header height="null">
      <h3 class="header-title">电子发票</h3>
      <el-row style="padding-top: 20px; white-space: nowrap;">
        <el-form :inline="true"
                 :model="form">
          <el-form-item label="开票状态"
                        style="width:300px;">
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
                        style="width:530px;">
            <el-date-picker v-model="form.startTime"
                            type="date"
                            value-format="yyyy-MM-dd"
                            :picker-options="startPickerOptions"
                            placeholder="选择日期时间">
            </el-date-picker>
            <span style="padding:8px">-</span>
            <el-date-picker v-model="form.endTime"
                            type="date"
                            value-format="yyyy-MM-dd"
                            :picker-options="endPickerOptions"
                            placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       @click="searchData">查询</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-header>
    <el-main style="padding: 0; background:#fff">
      <el-container style="height: 100%; background: #fff;">
        <el-header height="65px" style="padding: 14px 0 1px 0;background: #f4f4f4;">
         <div class="table-title_wrap">
           <h3 class="table-title">
             发票详情
           </h3>
         </div>
        </el-header>
        <el-main style="padding: 20px 20px 5px 20px;background: #fff;overflow: hidden;" ref="invoice">
            <ky-table ref="multipleTable"
                      class="common-table"
                      height="calc(100vh - 358px)"
                      :paginationVisible="true"
                      :data="tableData"
                      :pagination="paganation"
                      style="width: 100%"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      @selection-change="handleSelectionChange">
              <el-table-column v-for="item in column"
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
            </ky-table>
        </el-main>
      </el-container>
    </el-main>
    <Dialog ref="dialogForm"
            @getDataList="getDataList"
            :codeList="codeList"
            :phone="phone"></Dialog>
    <invoiceDetail ref="invoiceDetail"></invoiceDetail>
  </el-container>
</template>
<script>
import {getFileUrls} from '@/services/api/bill.js'
import {getStayList, getRecordList} from '@/services/api/electronic-invoice.js'
import * as time from '@/utils/formatDate'
let {formatDate,date} = time.default
import Dialog from './components/dialog'
import invoiceDetail from './components/invoiceDetail'
import {getCustomerCode, getPhone} from "@/utils/storage"
import dayjs from "dayjs"
export default {
  components: {
    Dialog,
    invoiceDetail
  },
  computed:{
    column(){
      return this.lableList.filter(m=>m.isShow===true)
    }
  },
  data () {
    return {
      token: null,
      phone: getPhone(),  // 手机号
      custNo: getCustomerCode(), // 客户编码
      loading: true,
      form: {
        startTime: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        endTime: date(new Date()),
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
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
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
  mounted () {
    this.resourcesID = this.$store.getters.authorityIds
    this.getDataList()
  },
  methods: {
    async getDataList0(parms){
      this.tableData = []
      let res= await getStayList(parms)
      this.loading.close()
      if (res.code === 0 && res.data.rows) {
        this.tableData =res.data.rows || []
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
        this.paganation.totalCount = Number(res.data.rowTotal) || 0
      } else {
        this.tableData = []
        this.paganation.totalCount = 0
      }
    },
    async getRecordList(parms){
      let res=await getRecordList(parms)
      this.loading.close()
      if (res.code === 0 && res.data.rows) {
        this.tableData = res.data.rows || []
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
        this.paganation.totalCount = Number(res.data.rowTotal)
      } else {
        this.tableData = []
        this.paganation.totalCount = 0
      }
    },
    //获取列表
    getDataList () {
      if (this.form.startTime && this.form.endTime) {
        if (dayjs(this.form.startTime).add(6, 'month') < dayjs(this.form.endTime)) {
          this.$message({
            message: "查询日期不能超过6个月",
            type: 'warning'
          })
          return
        }
        this.loading = this.$loading({
          lock: true,
          text: '加载中',
          spinner: 'el-icon-loading',
          background: 'rgba(255,255, 255, 0.7)'
        })
        let startTime = this.form.startTime
        let endTime = this.form.endTime
        let ydcode = this.form.ydcode
        if (this.form.status === 0) {
          let parms={
            deliveryStartDate: startTime,
            deliveryEndDate: endTime,
            waybillNumber: ydcode,
            customerCode: this.custNo,
            page: this.paganation.pageIndex,
            pageSize: this.paganation.pageSize
          }
          this.getDataList0(parms)
        }
        else {
          let parms={
            invoiceStartDate: startTime,
            invoiceType: 1,
            invoiceEndDate: endTime,
            waybillNumber: ydcode,
            invoiceStatus: this.form.status === 1 ? "10" : "30",
            customerCode: this.custNo,
            page: this.paganation.pageIndex,
            pageSize: this.paganation.pageSize
          }
          this.getRecordList(parms)
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
      this.paganation.pageIndex = 1
      this.getDataList()
    },
    // 分页点击事件
    handleCurrentChange (val) {
      this.paganation.pageIndex = val
      this.getDataList()
    },
    handleSizeChange (val) {
      this.paganation.pageSize = val
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
      let param={
        invoiceSerialNumber: val.invoiceSerialNumber,
        customerCode: this.custNo
      }
      getFileUrls(param).then(async res => {
        if (res.code === 0) {
          let data=res.data[0] || res.data||{}
          let url=data.downloadUrl || data.downloadUrl
          if (this.isClientMode) {
            await this.$native.downLoadFile(url, "pdf", `${dayjs().format("YYYYMMDD")}电子发票`)
            return
          }
          window.open(url)
          /* if (res.data) {
            // const res= native.downLoadFile(res.data.data[0].downloadUrl, 'excel', fileName)
            downLoadFile(res.data[0].downloadUrl, "pdf", "") //调用客户端方法
          }*/
          //window.open(this.downList[0])
        } else {
          this.$message({
            message: res.msg,
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
    },
  }
}
</script>
<style lang="scss">
  .electronic-invoice_r{
    height: 100%;
    background: #fff;
    .header-title{
      font-size: 16px;
      font-weight: bold;
      height: 49px;
      line-height: 49px;
      font-style: normal;
      border-bottom: 1px solid #f1f1f5;
    }
    .table-title_wrap{
      height: 50px;
      line-height: 50px;
      background: #fff;
      .table-title {
        height: 50px;
        line-height: 50px;
        color: #303133;
        font-weight: 500;
        background: #fff;
        margin: auto 20px;
        border-bottom: 1px solid #f1f1f5;
      }
    }
    .el-input__inner {
      background: #eef3fc;
      border-radius: 18px;
      border: 0 !important;
    }
    .el-button{
      border-radius: 17px;
    }
  }
</style>
