<template>
  <ky-dialog title="" class="page-style1" :visible.sync="dialogVisible" :close-on-click-modal="false" width="500px">
    <span slot="title" class="dialog-title">
      补打取货标签<span class="tips">(本次打印的标签将会覆盖之前的标签，之前标签将作废)</span>
    </span>
    <div class="dialog-body" v-loading="loading">
      <div class="row-info">
        运单号：<span class="yd-no">{{waybills&& waybills.waybillNumber}}</span>
      </div>
      <div class="tag-info">
        <el-form ref='form' :model="formData" :rules="formRules">
          <div class="print-count-info">
            <el-form-item prop="count">
              <div class="print-count">打印件数<span class="count-tips">(打印数为最终发货件数)</span></div>
              <el-input size="medium" clearable placeholder="请填写件数" style="width:210px;background:#F6F8FF" v-model="formData.count" maxlength=3 v-kyerestrict.positive>
                <template slot="append">(件)
                </template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
        <div class="print-image">
          <el-image :src="imgSrc"></el-image>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button class="btn-ok" type="primary" @click="confirm" :loading="loading"> 确定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import { getSecurityCodeList } from '@/services/api/waybillOld'
import dayjs from 'dayjs'
import { mapGetters, mapState } from 'vuex'
import waybillApi from '@/services/api/waybill'
import waybillUtil from '@/utils/waybillUtil'
import { isPrintAppOnline } from '@api/setting'
import printUtil from '../print-view/printUtil'
import printerUtil from '@utils/printerUtil'
import {
  printByPrintApp, getPrintData
} from '@/services/api/waybillOld'

export default {
  name: 'PrintLabel',
  data () {
    return {
      loading: false,
      waybills: {},
      dialogVisible: false,
      callback: null,
      printerInfo: [],
      formData: {
        count: ''
      },
      formRules: {
        count: [
          {
            required: true,
            type: 'integer',
            message: '请输入件数',
            transform (value) {
              return Number(value)
            },
            min: 1,
            trigger: 'blur'
          }
        ]
      },
      imgSrc: require('@assets/image/waybill/print-tag.png'),
      printDataList: []
    }
  },
  methods: {
    showDialog (waybills, callback) {
      this.waybills = waybills[0]
      this.dialogVisible = true
      this.callback = callback
      this.formData.count = ''
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.getPrintData()
        this.getPrinters()
      })
    },
    async confirm () {
      const params = {
        waybillNumber: this.waybills.waybillNumber,
        count: Number(this.formData.count)
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          let checkSuccess= await this.checkData()
          if(!checkSuccess){
            return
          }

          let res = await waybillApi.UpdateYDNumber([params])
          if (res.code === 0) {
            this.dialogVisible = false
            this.callback && this.callback()
            this.$message.success('打印任务已发送到您的打印机请检查')
            this.printTag()
          } else {
            console.log('res.msg :>> ', res.msg)
          }
          this.loading = false
        } else {
          this.loading = false
        }
      })

    },
    async printTag () {
      let waybill = this.printDataList[0]
      waybill.count = Number(this.formData.count)
      waybill.childYdCodes = []
      //获取防伪码
      const result2 =await getSecurityCodeList([
        {
          waybillNumber: waybill.ydNo,
          printTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          startPage: 1,
          endPage: Number(waybill.count),
          count: Number(waybill.count),
        }])

      if (result2.code === 0 && result2.data && result2.data.waybillSecurityCodeList) {
        const list = result2.data.waybillSecurityCodeList
        list.forEach(el => {
          if(waybill.ydNo===el.split('|')[0]){
            waybill.ydNo=el
          }
        })
      }

      this.waybillPrint(true, false)
    },
    async getPrintData () {
      //查询数据
      let data = await waybillApi.getWaybillPrint([this.waybills.waybillNumber])
      this.printDataList = data
      console.log(this.printDataList,'printDataList')
    },
    async waybillPrint (childMotherChecked, sendStubChecked) {
      //打印模式  本地，云打印
      const printerInfo = this.printers.find(item => item.printerName === this.printInfo.printModel)
      if (printerInfo && printerInfo.isPrintApp) {
        const params = {
          batchModels: waybillUtil.convertPrintModelsForLocalPrint(this.printDataList),
          customerMsgEncryt: this.$store.getters.encryptionText,
          templateSizeType: 6,//小标签
          isPrintSon: childMotherChecked,
          isPrintJJcg: sendStubChecked,
          printClientId: printerInfo.printerName
        }
        const res = await printByPrintApp(params)
        if (res.code !== 0) {
          return '打印失败，请检查打印组件是否在线'
        }
        return
      }
      const localPrintDataList = await this.getLocalPrintDataList({
        arrWaybill: this.printDataList,
        printerName: printerInfo.printerName,
        sendStubChecked,
        childMotherChecked
      })


      if (localPrintDataList) {
        localPrintDataList.forEach(m => {
          this.$native.batchPrint(m.templateText, m.templateData, m.templateType, printerInfo.printerName)
        })
      }
    },
    async checkData () {
      let printerInfo = this.printers.find(item => item.select) || {}
      if (!printerInfo.select) {
        this.$message('请先设置打印机')
        return false
      }
      if (printerInfo.isCloudPrinter ) {
        let msg = '补打小标签暂不支持云打印机，请选择其他打印机'
        this.$message(msg)
        return false
      }
      console.log(printerInfo,'printerInfo')
      if (printerInfo.isPrintApp) {
        const res = await isPrintAppOnline(printerInfo.printerName)
        if (res.code !== 0 || res.data.status === 20) {
          this.$message('打印组件不在线，请确认是否已开启该打印组件')
          return
        }
      }
      return true
    },
    /**取得本地打印的打印数据
             * @param {String} printerName 打印机名称，打印预览时不要传
             */
    async getLocalPrintDataList ({ arrWaybill, printerName, sendStubChecked, childMotherChecked }) {
      await printUtil.addPrintFlag(arrWaybill)
      let params = {
        batchModels: waybillUtil.convertPrintModelsForLocalPrint(arrWaybill),
        customerMsgEncryt: this.$store.getters.encryptionText,
        templateSizeType: 6,
        isPrintSon: childMotherChecked,
        isPrintJJcg: this.isSendStubTemplate || sendStubChecked
      }
      let res = await getPrintData(params)
      if (res.code === 0 && res.data.printData) {
        let printDataList = res.data.printData
        const getTemplateFunc = f => this.printTemplateList.find(item => Number(item.id || 0) === Number(f.templateId || 0))
        if (!printDataList.find(f => getTemplateFunc(f))) {
          this.$message.error('本地打印模板不存在，请重新登录再尝试')
          return
        }
        let localPrintDataList = []
        printDataList.forEach(el => {
          const template = getTemplateFunc(el)
          const list = el.data.map(m => ({
            templateId: template.id,
            templateText: template.text,
            templateData: JSON.stringify(m),
            templateType: template.noType === '20' ? '210' : '136'
          }))
          localPrintDataList.push(...list)
        })

        localPrintDataList = printUtil.convertLocalPrintDataListForA4Stub(localPrintDataList, 3,'oneCopy')
        return localPrintDataList
      }
    },
    //获取打印机列表
    async getPrinters () {
      let array = []
      const cloudPrinters = await this.getCloudPrinters()
      if (cloudPrinters && cloudPrinters.length > 0) {
        array = cloudPrinters
      }
      try {
        if (this.isClientMode) {
          const localPrinters = await printerUtil.getLocalPrinters()
          array.push(...localPrinters)
        } else {
          const printApps = await printerUtil.getPrintApps()
          array.push(...printApps)
        }
      } catch (error) {
        console.log(error)
      }
      array.map(item => {
        if (!item.local) {
          if (item.printerId === this.printInfo.printModel) {
            item.select = true
          }
        } else if (item.printerName === this.printInfo.printModel) {
          item.select = true
        }
        return item
      })
      this.printers = array
    },
    async getCloudPrinters () {
      const printers = await printerUtil.getCloudPrinters()
      if (printers && printers.length > 0) {
        // 设置默认打印机
        printers.forEach((item, index) => {
          if (item.isDefault) {
            this.printIndex = index
            this.printModel = item.printerId
          }
        })
        return printers
      }
    },
  },
  computed: {
    ...mapGetters([
      'printTemplateList',
      'isB2BUser', // true B2B
      'authorityIds', // '054' B2B 字母单权限
      'printConfig'
    ]),
    ...mapState('client', ['printConfig']),
    ...mapState('setModule', ['printInfo']),
  }

}
</script>

<style lang="scss" scoped>
  .dialog-body {
    .row-info {
      height: 34px;
      line-height: 34px;
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Semibold;
      font-weight: 600;
      text-align: left;
      color: #666666;
      line-height: 34px;
      padding-left: 12px;
      background: #fdfcff url('../../../../assets/image/waybill/notice-pickup-title.png') no-repeat
        top right/cover;
      background-size: auto 100%;
      border: 1px solid #f5f5f5;
      .yd-no {
        color: #333333;
      }
    }
    .tag-info {
      width: 460px;
      height: 354px;
      background: #f6f8ff;
      border-radius: 2px;
      margin-top: 16px;
      padding-top: 20px;
      .print-count-info {
        padding: 0 20px;
        .print-count {
          font-size: 13px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: left;
          color: #03050d;
          line-height: 13px;
          padding-bottom: 12px;
          .count-tips {
            font-size: 12px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            text-align: left;
            color: #8f8fa8;
            line-height: 12px;
          }
        }
      }
      .print-image {
        padding: 0 10px;
      }
      /deep/.el-input__inner {
        background: #f6f8ff;
        height: 36px;
      }
    }
  }
  .dialog-title {
    font-size: 15px;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: bold;
    text-align: left;
    color: #03050d;
    line-height: 15px;
    .tips {
      font-size: 12px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #8f8fa8;
      line-height: 12px;
      padding: 0 5px;
    }
  }

  .dialog-footer {
        .btn-ok {
          &:hover {
            background: #9c84f8;
            border-color: #9c84f8;
            color: #ffffff;
          }
        }
  }
</style>