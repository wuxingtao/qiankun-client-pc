<template>
  <div class="clientdialog page-style1">
    <el-dialog :title="isModify?'修改预约':'上传预约单'" :visible.sync="dialogVisible" :close-on-click-modal="false" width="810px">
      <div class="dialog-body">
        <el-form ref='form' :model="formData" :rules="formRules" label-position="top" label-width="88px">
          <el-row :gutter="16" class="display-text">
            <el-col :span="8"><span class="label">运单号:</span> {{formData.ydNo}}</el-col>
            <el-col :span="8">
              <span class="label">寄件公司:</span> {{formData.senderCompanyName}}
            </el-col>
            <el-col :span="8">
              <span class="label">收件公司:</span> {{formData.receiverCompanyName}}
            </el-col>
          </el-row>

          <div class="content-area">
            <el-input type="textarea" :rows="12" v-model="formData.content" resize="none" clearable :placeholder="waterText" maxlength="1000"></el-input>
            <el-button class="btn-parse" size="mini" @click="parseAppointInfo">识别</el-button>
          </div>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="预约单号" prop="appointmentNo">
                <el-input v-model="formData.appointmentNo" size="medium" clearable placeholder="请输入" maxlength=100></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预约仓库" prop="appointWarehouse">
                <el-input v-model="formData.appointWarehouse" size="medium" clearable placeholder="请输入" maxlength=20></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="预约件数" prop="numberPackages">
                <el-input v-model="formData.numberPackages" size="medium" clearable placeholder="请输入预约件数" v-kyerestrict.positive maxlength=5>
                  <template slot="append">(件)</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="总件数" prop="totalNumberPackages">
                <el-input v-model="formData.totalNumberPackages" size="medium" clearable placeholder="请输入" v-kyerestrict.positive maxlength=5>
                  <template slot="append">(件)</template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="采购单号" prop="purchaseOrderNo">
                <el-input v-model="formData.purchaseOrderNo" size="medium" clearable placeholder="请输入" maxlength=100></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="商品码" prop="productCode">
                <el-input v-model="formData.productCode" size="medium" clearable placeholder="请输入商品码" maxlength=100></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="预约开始时间" prop="startTime">
                <el-date-picker prefix-icon="iconfont icon-purple_calendar" v-model="formData.startTime" type="datetime" placeholder="请选择">

                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预约截止时间" prop="endTime">
                <el-date-picker prefix-icon="iconfont icon-purple_calendar" v-model="formData.endTime" type="datetime" placeholder="请选择">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { appointOfJd } from '@/services/api/waybillOld'

export default {
  name: 'jdAppointment',
  data () {
    var validateDateTime = (rule, value, callback) => {
      if (this.formData.startTime && dayjs().add(6, 'h').isAfter(dayjs(this.formData.startTime), 'm')) {
        return callback(new Error('预约开始时间必须在当前时间6小时以后,请重新选择'))
      }
      if (this.formData.startTime && this.formData.startTime) {
        if (this.formData.endTime && dayjs(dayjs(this.formData.startTime)).isAfter(
          dayjs(this.formData.endTime), 'm')
        ) {
          return callback(new Error('预约截止时间不得小于开始时间,请重新选择'))
        }
        if (dayjs(this.formData.startTime).add(2, 'h').isBefore(dayjs(this.formData.endTime), 'm')) {
          return callback(new Error('预约开始时间与截止时间相隔不能超过2小时,请重新选择'))
        }
      }
      callback()
    }
    var validateNumberPackages = (rule, value, callback) => {
      console.log('rule,value :>> ', rule, value)
      if (
        Number(this.formData.numberPackages) >
          Number(this.formData.totalNumberPackages)
      ) {
        return callback(new Error('预约件数不能大于总件数,请重新输入'))
      }
      callback()
    }

    return {
      loading: false,
      dialogVisible: false,
      isModify: false, //新增或修改标识

      formData: {
        ydNo: '',
        id: '',
        senderCompanyName: '',
        receiverCompanyName: '',
        content: '',

        appointmentNo: '',
        appointWarehouse: '',
        numberPackages: '',
        totalNumberPackages: '',
        purchaseOrderNo: '',
        productCode: '',
        startTime: dayjs().add(1, 'd'),
        endTime: dayjs().add(1, 'd'),
      },
      formRules: {
        appointmentNo: [
          { required: true, message: '预约单号不能为空', trigger: 'blur' },
          { min: 1, max: 100, message: '预约单号不得大于100个字', trigger: 'blur' },
          { pattern: /[\d\\-]{1,100}/, message: '请输入正确预约单号',trigger: 'blur'}
        ],
        appointWarehouse: [
          { required: true, message: '预约仓库不能为空', trigger: 'blur' }
        ],
        numberPackages: [
          {
            type: 'integer',
            message: '请输入大于零的整数',
            transform (value) {
              return Number(value)
            },
            min: 0,
            trigger: 'blur'
          },
          { validator: validateNumberPackages, trigger: 'blur' }
        ],
        productCode:[  { pattern: /^[^\u4e00-\u9fa5]+$/, message: '内容不可包含汉字',trigger: 'blur'}],
        totalNumberPackages: [
          {
            type: 'integer',
            message: '请输入大于零的整数',
            transform (value) {
              return Number(value)
            },
            min: 0,
            trigger: 'blur'
          },
          { validator: validateNumberPackages, trigger: 'blur' }
        ],
        purchaseOrderNo: [{ required: true, message: '采购单号不能为空', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '内容不可包含汉字',trigger: 'blur'},],
        startTime: [
          { required: true, message: '请选择预约开始时间', trigger: 'blur' },
          { validator: validateDateTime, trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请选择预约截止时间', trigger: 'blur' },
          { validator: validateDateTime, trigger: 'blur' }
        ]
      },
      waterText: `   粘贴预约信息，自动识别填充。 
    例如： 
    预约成功！请牢记预约单号： 
    18103030077 
    收货时间：2020-10-20 8:00-12:00 
    请在预约收货开始时间前20分钟内到库房 
    机构库房：上海-服装仓1号库 
    库房地址：上海市重固填天瑞路88号门进门右转东平台234号门 
    库房电话：40062256868转02127`
    }
  },
  methods: {
    showDialog (waybill) {
      this.dialogVisible = true
      this.isModify = false
      this.$nextTick(async () => {
        this.$refs.form.resetFields()
        this.formData.ydNo = waybill.ydNo
        this.formData.senderCompanyName = waybill.jjCompany
        this.formData.receiverCompanyName = waybill.sjCompany
        this.formData.totalNumberPackages = waybill.count
        await this.loadJdAppointmentData()
      })
    },
    async loadJdAppointmentData () {
      let params = {
        operationType: '2',
        orderno: this.formData.ydNo,
        pageIndex: '1',
        pageSize: '1'
      }
      let res = await appointOfJd(params)
      const data = res.data && res.data.dataList && res.data.dataList[0]
      if (res.code === 0 && data) {
        this.formData.id = data.id
        this.formData.appointmentNo = data.appointNo
        this.formData.appointWarehouse = data.reservationWarehouse
        this.formData.numberPackages = data.appointCount || ''
        this.formData.purchaseOrderNo = data.purchaseCode
        this.formData.productCode = data.goodsCode
        this.formData.startTime = data.apppointSTime
        this.formData.endTime = data.apppointETime
        this.isModify = true
      }
    },
    saveData () {
      try {
        this.loading = true
        this.$refs.form.validate(async valid => {
          if (valid) {
            let params = {
              orderno: this.formData.ydNo,
              billId: this.formData.id,
              id: this.formData.id,
              operationType: this.isModify ? '3' : '1',
              appointCode: this.formData.appointmentNo,
              reservationWarehouse: this.formData.appointWarehouse,
              appointCount: this.formData.numberPackages,
              totalCount: this.formData.totalNumberPackages,
              purchaseCode: this.formData.purchaseOrderNo,
              goodsCode: this.formData.productCode,
              apppointSTime: this.formData.startTime,
              apppointETime: this.formData.endTime
            }
            let res = await appointOfJd(params)
            if (res.code == 0) {
              const msg = this.isModify
                ? '已成功为您修改预约派送'
                : '已成功为您预约派送'
              this.$message.success(msg)
              this.dialogVisible = false
            }
          }
        })
      } finally {
        this.loading = false
      }
    },
    parseAppointInfo () {
      const content = this.formData.content.replace(/[\s]/g, '')
      if (!content || content.length < 10) {
        return
      }
      const appointmentNoExec = /预约单号[：,:](.+)扫一扫/.exec(content) || /预约单号[：,:](.+)收货时间/.exec(content)
      const appointWarehouseExec = /库房名称[：,:](.+)库房地址[：,:]/.exec(content) || /机构库房[：,:](.+)库房地址[：,:]/.exec(content)
      const timeRangeExec = /收货时间[：,:](.+)库房名称[：,:]/.exec(content) || /收货时间[：,:](.+)请在预约收货/.exec(content)
      this.formData.appointmentNo = appointmentNoExec && appointmentNoExec[1]
      this.formData.appointWarehouse = appointWarehouseExec && appointWarehouseExec[1]
      console.log('appointmentNoExec :>> ', appointmentNoExec)
      if (timeRangeExec) {
        const date = timeRangeExec[1].substr(0, 10)
        const times = timeRangeExec[1].substr(10).split('-')
        this.formData.startTime = dayjs(date + times[0])
        this.formData.endTime = dayjs(date + times[1])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-body {
    .display-text {
      border-bottom: 1px solid #f1f1f5;
      padding: 4px 0 20px 0;
      margin: 0;
      color: #333333;
      font-weight: bold;
      font-size: 14px;
      .label {
        display: inline-block;
        color: #999999;
      }
    }
    .content-area {
      position: relative;
      margin-bottom: 14px;
      margin-top: 50px;
      .btn-parse {
        position: absolute;
        right: 15px;
        bottom: 15px;
        width: 72px;
        height: 32px;
        background-color: #8365f6;
        border-radius: 15px;
        font-size: 14px;
        color: white;
      }
      /deep/ {
        .el-textarea__inner {
          font-size: 12px;
        }
      }
    }
    /deep/ {
      .el-form-item {
        .el-form-item__label,
        .el-form-item__content {
          line-height: 20px;
          padding-bottom: 4px;
        }
        .icon-purple_calendar {
          color: #8365f6;
          right: -355px;
          position: relative;
        }
        .el-icon-circle-close {
          right: 20px;
          position: relative;
        }
      }
      .el-date-editor.el-input,
      .el-date-editor.el-input__inner {
        width: 100%;
      }
    }
  }
</style>
