<template>
  <div class='print-waybill'>
    <div class='row-info'>
      <span class='c_666'>已选运单：</span><span class='c_333'>{{ waybills && waybills.length }}票</span>
    </div>
    <div class='waybill-wrapper'>
      <div class='waybill-left' v-if='isClientMode'>
        <ky-ui-label :title='viewTitle()' />
        <el-image :src='images && images[index]' class='waybill-img'></el-image>
        <div class='change'>
          <el-image :src='iconlastnormalprev' class='img' @click='page(0)'></el-image>
          <span class='first'>{{ index + 1 }}</span>
          <span> / </span>
          <span class='second'>{{ images && images.length || 1 }}</span>
          <el-image :src='iconlastnormalnext' class='img' @click='page(1)'></el-image>
        </div>
      </div>
      <div class='waybill-left' v-else>
        <ky-ui-label :title='viewTitle()' />
        <el-image :src='getImageUrl()' class='waybill-img'></el-image>
      </div>
      <div class='waybill-right'>
        <ky-ui-label title='选择面单类型' required />
        <div class='online-status'>
          <div :class="{'online-wrap': true}" v-for='(item, index) in waybillTypeList' :key='`0-${index}`' @click='choosePaperMode(index)'>
            <div :class="{wrap: true, 'first-wrap': item.select}">
              <el-image :src='defaultImg' v-if='item.select' class='default'></el-image>
              <el-image :src='printPaperImg' class='imgPaper'></el-image>
            </div>
            <el-tooltip placement='top'>
              <div slot='content'>{{ item.label }}</div>
              <div class='wrap-word'>{{ item.label }}</div>
            </el-tooltip>
          </div>
        </div>
        <ky-ui-label title='选择打印机' required />
        <div class='online-status'>
          <div :class="{'online-wrap': true}" v-for='(item, index) in printers' :key='`0-${index}`' @click='choosePrint(0, index)'>
            <div :class="{wrap: true, 'first-wrap': item.select}">
              <el-image :src='defaultImg' v-if='item.select' class='default'></el-image>
              <el-image :src='printImage' class='img'></el-image>
              <div v-if='!item.local' :class="[item.printerStatus?'online':'offline']">
                {{ item.printerStatus ? '在线' : '离线' }}
              </div>
            </div>
            <el-tooltip placement='top'>
              <div slot='content'>{{ item.printerName }}</div>
              <div class='wrap-word'>{{ item.printerName }}</div>
            </el-tooltip>
          </div>
          <div class='printer--add' @click='handleAddPrinter'>
            <div class='printer__cont'>
              <i class='add-btn el-icon-plus fs_26'></i>
            </div>
            <div class='printer__name'>
              添加打印机
            </div>
          </div>
        </div>

        <div v-if='showAlsoPrint()'>
          <ky-ui-label title='同时打印' />
          <div class='select'>
            <div v-if="Number(checkedSheetType) === 2||checkedSheetType==='oneCopy'">
              <el-checkbox v-model='sendStubChecked'></el-checkbox>
              <span class='detail'>打印寄件存根</span>
            </div>
            <div class="split-line"></div>
            <div v-if='viewWord()'>
              <el-checkbox v-model='childMotherChecked'></el-checkbox>
              <span class='detail'>{{ viewWord() }}</span>
            </div>
            <div class="print-tag" v-if="showPrintTag()">
              <el-radio-group size="small" v-model="tagFlag" class="radio-group">
                <li v-for="(item,index) in tagItemList" :key="index">
                  <el-radio :label="item.label">{{item.text}}</el-radio>
                </li>
              </el-radio-group>
              <div class="specifyPageNumber-input">
                <el-form :rules="rules" :model="ruleForm" ref="ruleForm">
                  <el-form-item prop="specifyPageNumber">
                    <el-input size="medium" clearable placeholder="例如1,3,5-12" v-model="ruleForm.specifyPageNumber" class="specifyPageNumber-inner" v-kyerestrict.tagNumber></el-input>
                  </el-form-item>

                </el-form>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <bind-printer :visible='dialogList.add' @close='dialogList.add=false' @refresh='refreshPrinters'></bind-printer>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import printerUtil from '@utils/printerUtil'
import { KyUiLabel } from '@comps/ky-ui'
import waybillApi from '@/services/api/waybill'
import waybillUtil from '@/utils/waybillUtil'
import {
  printByPrintApp, getPrintData, externalBatchSave
} from '@/services/api/waybillOld'
import printUtil from './printUtil'
import BindPrinter from '@views/setting/print/components/bind-printer.vue'
import { isPrintAppOnline } from '@api/setting'
import { getUserPreference, setUserPreference } from '@/utils/storage'
import dayjs from 'dayjs'
import cacheOfWaybill from '@utils/cacheOfWaybill'
import { getWaybillEncryptConfig } from '@/services/api/common'
const childMother_KEY = 'childMotherChecked'
const sendStub_KEY = 'sendStubChecked'


export default {
  name: 'print-waybill',
  components: {
    KyUiLabel,
    BindPrinter
  },
  props: {
    waybills: {
      type: Array,
      default: () => []
    },
    waybillNumber: {
      type: String
    },
    noticeResult: {
      type: Array,
      default: () => []
    },
    isNoticePickup: {
      type: Boolean,
      default: false
    },
    // childMotherChecked: {
    //   type: Boolean
    // },
    // sendStubChecked: {
    //   type: Boolean
    // },
  },
  data () {
    let checkTagNumber = async (rule, value, callback) => {
      if (this.tagFlag === 2) {
        if (value) {
          let arr = []
          let newNumber = value.replace('，', ',').replace('——', '-').split(',')
          console.log(newNumber, 'newNumber')
          newNumber.forEach(el => {
            if (el.includes('-')) {
              let data = el.split('-')
              for (var i = Number(data[0]); i <= Number(data[1]); i++) {
                arr.push(i)
              }
            } else {
              arr.push(el)
            }
          })
          console.log(arr, 'arr')
          console.log(this.waybills[0].count, 'count')
          if (!arr.some(a => { return Number(a) <= Number(this.waybills[0].count) })) {
            callback('您输入的页码不存在，请输入1-' + this.waybills[0].count + '之间的页码')
          }
        } else {
          callback('请输入运单页码范围，如指定页码用“,”分隔，指定范围页码用“-”连接(例如1,3,5-12)')
        }

      } else {
        callback()
      }
    }

    return {
      defaultImg: require('@/assets/image/default.png'),
      visibleOfTerms: false,
      waybillImgArr: [require('@/assets/image/zanwei.jpg')],
      iconlastnormalnext: require('@/assets/image/icon-last-normal-next.png'),
      iconlastnormalprev: require('@/assets/image/icon-last-normal-prev.png'),
      printImage: require('@/assets/image/setting/print-image.png'),
      // 打印机列表
      printers: [],
      // 本地打印机[本地打印机{printerName,printerStatus,local}]
      printer_local: [],
      isLoading: false,
      title: '打单',
      tableData: [],
      dialogVisible: false,
      isPrintSucess: false,
      isNotice: false,
      callback: null,
      index: 0,
      images: [],
      extendObject: {},//扩展对象
      dialogList: {
        add: false
      },
      waybillTmsPrintList: [],
      printPaper: '',
      printPaperImg: require('@/assets/image/waybill/example-diagram.png'),
      waybillTypeList: [
        {
          label: '三联电子运单',
          sheetType: '1',
        },
        {
          label: '二联电子运单',
          sheetType: '2',
        },
        {
          label: '一联电子运单',
          sheetType: 'oneCopy',
        },
        {
          label: '存根运单',
          sheetType: '136Stub'
        },
        {
          label: 'A4打印(存根×4)',
          sheetType: 'A4Stub',
        },
        {
          label: '一联存根',
          sheetType: 'oneCopySub',
        },
        {
          label: 'A4打印(存根×6)',
          sheetType: 'A6Stub',
        }
      ],
      checkedSheetType: '',
      childMotherChecked: false,
      sendStubChecked: false,
      tagItemList: [
        {
          label: 1,
          text: '全部运单'
        }, {
          label: 2,
          text: '运单页码范围：'
        }
      ],
      tagFlag: 1,

      rules: {
        specifyPageNumber: [
          { validator: checkTagNumber, trigger: 'change' }
        ],
      },
      ruleForm: {
        specifyPageNumber: ''
      },
      printDataList: [],
      childParentAuthority: false,
      images_web: [
        {
          url: require('@assets/image/print/210.png'),
          sheetType: '1',
        },
        {
          url: require('@assets/image/print/136.png'),
          sheetType: '2',
        },
        {
          url: require('@assets/image/print/oneCopy.png'),
          sheetType: 'oneCopy',
        },
        {
          url: require('@assets/image/print/136Stub.png'),
          sheetType: '136Stub'
        },
        {
          url: require('@assets/image/print/A4Stub.png'),
          sheetType: 'A4Stub',
        },
        {
          url: require('@assets/image/print/oneCopySub.png'),
          sheetType: 'oneCopySub',
        },
        {
          url: require('@assets/image/print/A6Stub.png'),
          sheetType: 'A6Stub',
        }
      ],
      encryptionText: ''
    }
  },
  methods: {
    viewTitle () {
      const printInfo = this.waybillTypeList.find(item => item.select) || {}
      switch (printInfo.sheetType) {
        case '1':
          return '三联电子运单'
        case '2':
          return '二联电子运单'
        case '136Stub':
          return '存根运单'
        case 'A4Stub':
          return 'A4打印(存根X4)'
        case 'oneCopy':
          return '一联电子运单'
        case 'oneCopySub':
          return '一联存根'
        case 'A6Stub':
          return 'A4打印(存根X6)'
      }
    },
    viewWord () {
      const printInfo = this.waybillTypeList.find(item => item.select) || {}
      let name = ''
      if (Number(printInfo.sheetType) === 1 || Number(printInfo.sheetType) === 2 || printInfo.sheetType === 'oneCopy') {
        if (this.childParentAuthority) {
          name = '打印子母单'
        } else {
          name = '取货标签'
        }
      }
      return name
    },
    page (type) {
      if (type === 0) {
        this.index = this.index - 1 >= 0 ? this.index - 1 : 0
      } else {
        this.index = this.index + 1 <= this.images.length - 1 ? this.index + 1 : this.images.length - 1
      }
    },
    // 选择打印机
    choosePrint (type, index) {
      let arr
      arr = this.printers
      this.printers = arr.map((item, i) => {
        if (i === index) {
          item.select = true
        } else {
          item.select = false
        }
        return item
      })
    },
    //获取打印机列表
    async getPrinters () {
      this.setPaperSize()//设置默认面单
      this.init()
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
    async checkData () {
      if (this.waybillNumber && this.waybills.length === 1) {
        const ydNo = this.waybills[0].waybillNumber || this.waybills[0].ydNo
        if (this.waybillNumber !== ydNo) {
          this.$message.error('打印运单号有误,请关闭弹窗重试')
          return
        }
        if (this.printDataList && this.printDataList.length === 1) {
          const ydNo = this.waybills[0].waybillNumber || this.waybills[0].ydNo
          if (this.waybillNumber !== ydNo) {
            this.$message.error('打印运单号有误,请关闭弹窗重试')
            return
          }
        }
      }
      let printerInfo = this.printers.find(item => item.select) || {}
      if (!printerInfo.select) {
        this.$message('请先勾选打印机')
        return
      }
      let paperInfo = this.waybillTypeList.find(item => item.select) || {}
      if (!paperInfo.select) {
        this.$message('请选择面单类型')
        return
      }
      if (printerInfo.isCloudPrinter) {
        let msg = ''
        if (printerInfo.printerStatus === 0) {
          msg = '云打印机状态异常(离线)'
        }
        if (paperInfo.sheetType === 'A4Stub') {
          msg = '云打印机不支持A4打印(存根x4)模板'
        }
        if (paperInfo.sheetType === 'A6Stub') {
          msg = '云打印机不支持A4打印(存根x6)模板'
        }
        if (msg) {
          this.$message(msg)
          return
        }

      }
      if (printerInfo.isPrintApp) {
        const res = await isPrintAppOnline(printerInfo.printerName)
        if (res.code !== 0 || res.data.status === 20) {
          this.$message('打印组件不在线，请确认是否已开启该打印组件')
          return
        }
      }
      return true
    },
    async confirm () {
      try {
        window.report.sendClickEvent('clk_search_order_print',{button_name:'确定'})
        this.isLoading = true
        let validSuccess = true
        if (this.showPrintTag() && this.tagFlag === 2) {
          this.$refs['ruleForm'].validate(valid => {
            if (!valid) {
              validSuccess = false
            }
          })
        }
        if (!validSuccess) {
          return
        }
        if (!await this.checkData()) {
          return
        }
        return await this.printData()
      } finally {
        this.isLoading = false
      }

    },
    initialization () {
      this.printDataList = []
      this.getPrintViewImages(true)
      this.getParentChildFlag()
      this.getWaybillEncryptConfig()
      this.getPrinters()
      window.report.sendExpEvent('exp_search_order_print')
    },
    //取得打印预览图片
    async getPrintViewImages (firstLoad = false) {
      if (firstLoad) {
        let waybillNumbers = this.waybills.map(el => {
          return el.waybillNumber || el.ydNo
        })
        // let waybillNumbers=['KY1000000010918']
        //查询数据
        let data = await waybillApi.getWaybillPrint(waybillNumbers)
        if (!data || data.length === 0) {
          this.lazyExecution(1000)
          data = await waybillApi.getWaybillPrint(waybillNumbers)
        }
        this.printDataList = data

      }
      if (this.printDataList === null || (this.printDataList && this.printDataList.length === 0)) {
        this.$message.error('打印数据获取失败')
        return

      }
      if (!this.isClientMode) {
        return
      }
      const localPrintDataList = await this.getLocalPrintDataList({
        arrWaybill: this.printDataList,
        sendStubChecked: this.isSendStubTemplate(),
        childMotherChecked: false
      })
      if (localPrintDataList) {
        const promiseList = localPrintDataList.map(async m => {
          const img = await this.$native.getPrintViewImage(m.templateText, m.templateData, m.templateType)
          return img
        })
        const imageList = await Promise.all(promiseList)
        this.images = imageList.filter(f => f)
      }
    },
    getTemplateSizeType () {
      const paperInfo = this.waybillTypeList.find(item => item.select) || {}
      let templateSizeType = paperInfo.sheetType === '1' ? '1' : '0'
      console.log(paperInfo, 'paperInfo')
      if (paperInfo.sheetType === '1') {
        templateSizeType = '1'
      }
      else if (paperInfo.sheetType === '2') {
        templateSizeType = '0'
      }
      else if (paperInfo.sheetType === 'A4Stub') {
        templateSizeType = '2'
      } else if (paperInfo.sheetType === 'oneCopy') {
        templateSizeType = '4'
      } else if (paperInfo.sheetType === 'oneCopySub') {
        templateSizeType = '5'
      } else if (paperInfo.sheetType === 'A6Stub') {
        templateSizeType = '7'
      } else if (this.isSendStubTemplate()) {
        templateSizeType = '3'
      }
      return templateSizeType
    },
    async waybillPrint (childMotherChecked, sendStubChecked) {
      //打印模式  本地，云打印
      const printerInfo = this.printers.find(item => item.select)
      if (childMotherChecked) {
        try {
          this.waybillTmsPrintList.forEach(el => {
            const model = this.printDataList.find(m => m.ydNo === el.waybillNumber)
            model && el.childNumbers && (model.childYdCodes = el.childNumbers)
          })
        } finally {
          //异常处理
        }

      }
      if (printerInfo.isPrintApp) {
        const params = {
          batchModels: waybillUtil.convertPrintModelsForLocalPrint(this.printDataList),
          customerMsgEncryt: this.encryptionText,
          templateSizeType: this.getTemplateSizeType(),
          isPrintSon: childMotherChecked,
          isPrintJJcg: this.isSendStubTemplate() || sendStubChecked,
          printClientId: printerInfo.printerName,
          userConfiguration:{
            specifyPageNumber: (this.showPrintTag() && this.tagFlag === 2) ? this.ruleForm.specifyPageNumber : '',
            remarkFontSize:this.printInfo.remarkFontSize
          }
        }
        const res = await printByPrintApp(params)
        if (res.code !== 0) {
          return res.msg || '打印失败，请检查打印组件是否在线'
        }
        return
      }
      const localPrintDataList = await this.getLocalPrintDataList({
        arrWaybill: this.printDataList,
        printerName: printerInfo.printerName,
        sendStubChecked,
        childMotherChecked,
      })
      if (localPrintDataList) {
        if (this.isClientMode && this.$native.existsNativeFunc('net_batchPrintNew')) {
          this.$native.batchPrintNew(JSON.stringify(localPrintDataList), printerInfo.printerName, this.getPaperSizeType())
        } else {
          localPrintDataList.forEach(m => {
            this.$native.batchPrint(m.templateText, m.templateData, m.templateType, printerInfo.printerName)
          })
        }

      }
    },
    /**取得本地打印的打印数据
                                                             * @param {String} printerName 打印机名称，打印预览时不要传
                                                             */
    async getLocalPrintDataList ({ arrWaybill, printerName, sendStubChecked, childMotherChecked }) {
      // arrWaybill.forEach(el => {
      //   if (el.agentCode === '10') {
      //     el.JDCode = el.viewBarCode = el.ydNo.split('|')[0]
      //   }
      // })
      await printUtil.addPrintFlag(arrWaybill)
      const paperInfo = this.waybillTypeList.find(item => item.select) || {}
      if (printerName && printerName.indexOf('跨越云打印机') > -1) {
        await waybillUtil.printByCloudPrinter(arrWaybill, printerName.match(/\(([^)]*)\)/)[1], this.isSendStubTemplate() || sendStubChecked, childMotherChecked, paperInfo.sheetType,this.encryptionText, false)
        return
      }
      let params = {
        batchModels: waybillUtil.convertPrintModelsForLocalPrint(arrWaybill),
        customerMsgEncryt: this.encryptionText,
        templateSizeType: this.getTemplateSizeType(),
        isPrintSon: childMotherChecked,
        isPrintJJcg: this.isSendStubTemplate() || sendStubChecked,
        userConfiguration:{
          specifyPageNumber: (this.showPrintTag() && this.tagFlag === 2) ? this.ruleForm.specifyPageNumber : '',
          remarkFontSize:this.printInfo.remarkFontSize
        }
      }
      let res = await getPrintData(params)
      if (res.code === 0 && res.data.printData) {
        let printDataList = res.data.printData
        const getTemplateFunc = f => this.printTemplateList.find(item => Number(item.id || 0) === Number(f.templateId || 0))
        if (!printDataList.find(f => getTemplateFunc(f))) {
          this.$message.error('本地打印模板不存在，请重新登录再尝试')
          return
        }
        printUtil.addPrintCompanyFlagByWaybill(arrWaybill, printDataList)
        let localPrintDataList = []
        printDataList.forEach(el => {
          const template = getTemplateFunc(el)
          const list = el.data.map(m => ({
            templateId: template.id,
            templateText: template.text,
            templateData: JSON.stringify(m),
            templateType: this.getPaperSizeType()
          }))
          localPrintDataList.push(...list)
        })
        const printInfo = this.waybillTypeList.find(item => item.select) || {}
        if (printInfo.sheetType === 'A4Stub') {
          localPrintDataList = printUtil.convertLocalPrintDataListForA4Stub(localPrintDataList)
        }
        if (printInfo.sheetType === 'A6Stub') {
          localPrintDataList = printUtil.convertLocalPrintDataListForA4Stub(localPrintDataList, 6)
        }
        return localPrintDataList
      }
    },
    async printData () {
      let params = {
        printSubListState: this.childMotherChecked && this.viewWord(true) === '打印子母单' ? 10 : 20,
        parentNumbers: this.waybills.map(m => ({ parentNumber: m.waybillNumber || m.ydNo, count: m.count || 1 })),
        onlyPrintFlag: this.isNoticePickup ? '' : 10
      }
      let res = await waybillApi.batchPrint(params)
      if (res.code === 0) {
        this.waybillTmsPrintList = res.data || []
        const msg = await this.printCommon()
        if (msg) {
          this.$message.error(msg)
        } else {
          this.isPrintSucess = true
          this.$message.success('打印任务已发送到您的打印机请检查')
          //保存用户选项 子母单/取货标签 和 寄方存根
          await setUserPreference(childMother_KEY, this.childMotherChecked)
          await setUserPreference(sendStub_KEY, this.sendStubChecked)
          return true
        }
        this.dialogVisible = false
      } else {
        this.$message.error('打印失败')
      }
      this.isLoading = false
    },
    async printCommon () {
      const msg = await this.waybillPrint(this.childMotherChecked && !!this.viewWord(true), this.sendStubChecked && this.showSendSub())
      //埋点
      this.handleConfirm(msg)

      //更改打印状态
      this.updatePrintStatus()
      waybillApi.addPrintCount(this.waybills.map(el => el.waybillNumber || el.ydNo))
      //保存数据到巴枪
      if(this.childMotherChecked && this.viewWord(true) === '取货标签'){
        this.handlePdaData(this.printDataList.filter(m=>Number(m.count>1)))
      }
      externalBatchSave(this.waybills.filter(m => m.type != '是' && (m.JDCode || m.jdCode)).map(el => ({
        kyeWaybillNumber: el.waybillNumber.split('|')[0],
        kyeScanNumber: el.waybillNumber.split('|')[0],
        externalWaybillNumber: el.JDCode || el.jdCode,
        externalScanNumber: (el.JDCode || el.jdCode) + '-1-1-',
        externalType: '10'
      })))
      return msg
    },
    // 显示添加打印机
    handleAddPrinter () {
      this.getPrinters()
      this.dialogList.add = true
    },
    async refreshPrinters (param) {
      await this.getPrinters()
      if (param && param.printerName) {
        this.printModel = param.printerName
      }
    },
    updatePrintStatus () {
      let waybillNumbers = this.waybills.map(el => ({ waybillNumber: el.waybillNumber || el.ydNo, childNumber: [] }))
      waybillNumbers.forEach(el => {
        const model = this.waybillTmsPrintList.find(m => m.waybillNumber === el.waybillNumber)
        model && model.childNumbers && (el.childNumber = model.childNumbers)
      })
      let params = {
        waybillObjectList: waybillNumbers
      }
      waybillApi.updatePrintStatus(params)
    },
    getPaperSizeType () {
      let templateSizeType = this.checkedSheetType
      if (this.checkedSheetType === '1') {
        templateSizeType = '210'
      } else if (this.checkedSheetType === '2' || this.checkedSheetType === '136Stub') {
        templateSizeType = '136'
      }else if(this.checkedSheetType === 'A6Stub'){
        templateSizeType = 'A4'
      }
      return templateSizeType
    },
    // 选择面单模板
    choosePaperMode (index) {
      let arr
      arr = this.waybillTypeList
      this.waybillTypeList = arr.map((item, i) => {
        if (i === index) {
          item.select = true
          this.checkedSheetType = item.sheetType
        }
        else {
          item.select = false
        }
        return item
      })
      try {
        this.getPrintViewImages()
      } catch {

      }
    },
    //设置默认模板
    async setPaperSize () {
      try {
        let array = []
        array = this.waybillTypeList
        array.map(item => {
          if (item.sheetType === this.printInfo.sheetType) {
            item.select = true
            this.checkedSheetType = item.sheetType
            //this.printInfo.sheetType=item.sheetType
          }
          else {
            item.select = false
          }
          return item
        })
        this.waybillTypeList = array
      } catch (err) {
        console.log(err)
      } finally {
        //console.log(this.waybillTypeList, 'waybillTypeList')
      }
    },
    showSendSub () {
      let paperInfo = this.waybillTypeList.find(item => item.select) || {}
      let val = Number(paperInfo.sheetType) === 2 || paperInfo.sheetType === 'oneCopy'
      return val

    },
    lazyExecution (time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    isSendStubTemplate () {//寄方存根
      let paperInfo = this.waybillTypeList.find(item => item.select) || {}
      let flag = ['3', '136Stub', 'A4Stub'].includes(paperInfo.sheetType)
      if (this.extendObject && this.extendObject.isSendStubTemplate) {
        console.log(this.extendObject, 'this.extendObject')
        flag = true
      }
      return flag
    },
    showAlsoPrint () {
      return this.viewWord() || Number(this.checkedSheetType) === 2 || this.checkedSheetType === 'oneCopy'
    },
    async init () {
      this.childMotherChecked = await getUserPreference(childMother_KEY)
      this.sendStubChecked = await getUserPreference(sendStub_KEY)
      this.tagFlag = 1,
      this.ruleForm.specifyPageNumber = ''
    },
    showPrintTag () {
      return this.childMotherChecked && this.waybills.length === 1 && this.waybills[0].count && this.waybills[0].count > 1 && (this.viewWord() === '取货标签' && this.checkedSheetType !== '1')
    },
    async handlePdaData(data){
      try{
        if(data){
          data.map(async el=>(
            await waybillApi.savePdaLabelData(
              {
                count:el.count,
                waybillNumber:el.waybillNumber||el.ydNo,
                endPage:el.count,
                printTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
                pdaNumber:'客户端',
                pdaMac:'system',
                startPage:1,
                securityCode:el.securityCode,
                printNumberFormatType:'10'
              })))
        }
      }catch{
        
      }
      
    },
    async getParentChildFlag () {
      try {
        this.childParentAuthority = await cacheOfWaybill.getChildParentAuthority()
      } catch {
        this.childParentAuthority = false
      }
    },
    getImageUrl () {
      let model = this.images_web.find(m => m.sheetType === this.checkedSheetType)
      return model && model.url
    },
    async getWaybillEncryptConfig () {
      try {
        let res = await getWaybillEncryptConfig()
        if (res.code === 0 && res.data) {
          this.encryptionText = res.data
        }
      } catch{
        this.encryptionText='3333333001-1111111001-1111111001'
      }

    },
    handleConfirm(msg){
      const printInfo = this.printers.find(item => item.select) || {}
      const waybillInfo=this.waybillTypeList.find(m=>m.sheetType===this.checkedSheetType)||{}
      let print_with=[]
      if(this.sendStubChecked){
        print_with.push('打印寄件存根')
      }
      if(this.childMotherChecked){
        print_with.push(this.viewWord())
      }
      let printParams={
        request_result:!msg?'成功':'失败',
        failure_reason:msg,
        sheet_type:waybillInfo.label,
        printer_type:printInfo.printerName,
        print_number:this.waybills && this.waybills.length,
        print_with:print_with.length>0?print_with.join(','):''
      }
      window.report.sendOtherEvent('other_search_order_print',printParams)
    }
  },
  computed: {
    ...mapGetters([
      'printTemplateList',
      'isB2BUser', // true B2B
      'authorityIds', // '054' B2B 字母单权限
      'printConfig'
    ]),
    ...mapState('setModule', ['printInfo']),  // printInfo.sheetType 1 3联  2 2联
    // ...mapState('client', ['printConfig']),
    //...mapState('waybill', ['childParentAuthority']) 0311更改为打印实时获取
  },
  watch: {
    isLoading (flag) {
      this.$emit('update:loading', flag)
    }
  }
}
</script>
<style lang='scss' scoped>
  .print-waybill {
    .row-info {
      height: 36px;
      line-height: 36px;
      border: 1px solid #f5f5f5;
      border-radius: 4px;
      font-size: 12px;
      color: #424242;
      font-weight: bold;
      padding-left: 16px;
      margin-bottom: 12px;
      background: #fdfcff url('../../../../assets/image/waybill/notice-pickup-title.png') no-repeat
        top right/cover;
      background-size: auto 100%;
    }

    .waybill-wrapper {
      display: flex;

      .waybill-left {
        flex: 1;
        width: 250px;
        margin-right: 40px;

        .title {
          font-weight: 500;
          color: #333333;
          text-align: center;
        }

        .waybill-img {
          width: 250px;
          height: 526px;
          margin-top: 12px;
          margin-bottom: 12px;
          border: 1px solid #dcdae2;
        }

        .change {
          padding-left: 47px;

          .first {
            color: #666;
            margin-left: 56px;
          }

          .second {
            color: #666;
            margin-right: 61px;
          }

          .img {
            width: 16px;
            height: 16px;
          }
        }
      }

      .waybill-right {
        flex: 1.7;

        .waybill-right-wrapper {
          margin-bottom: 26px;
        }

        .title {
          font-weight: 500;
          color: #333;
        }

        .select {
          // display: flex;
          border: 1px solid #d6d6d6;
          border-radius: 4px;
          margin-top: 16px;
          padding: 20px 16px;

          .detail {
            color: #333333;
            margin-left: 8px;
          }
          .split-line {
            height: 1px;
            background: #eaeaeb;
            margin: 16px 16px 16px 25px;
          }
          .print-tag {
            display: flex;
            height: 100px;
            background: #f8f8f8;
            border-radius: 4px;
            margin-left: 24px;
            margin-top: 12px;
            .radio-group {
              padding: 16px;
            }
            li {
              height: 30px;
            }
            .specifyPageNumber-input {
              padding-top: 36px;
              flex-grow: 1;
              padding-right: 16px;
              .specifyPageNumber-inner {
                /deep/ .el-input__inner {
                  background-color: #f8f8f8;
                }
              }
            }
          }
        }

        .online-status {
          display: flex;
          flex-wrap: wrap;
          margin-top: 16px;

          .online-wrap {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            // margin-right: 15px;
            margin-bottom: 20px;

            .wrap {
              position: relative;
              width: 70px;
              height: 70px;
              border: 1px solid #dcdae2;
              border-radius: 3px;
              box-sizing: border-box;
              margin-bottom: 10px;

              .default {
                position: absolute;
                top: 0;
                left: 0;
                width: 34px;
                height: 34px;
                z-index: 1;
              }

              .online {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 15px;
                line-height: 15px;
                background: #8365f6;
                font-weight: 300;
                font-size: 10px;
                text-align: center;
                color: #fff;
              }

              .offline {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 15px;
                line-height: 15px;
                background: #e25555;
                font-weight: 300;
                font-size: 10px;
                text-align: center;
                color: #fff;
              }

              .img {
                position: absolute;
                bottom: 15px;
                left: 50%;
                margin-left: -28px;
                width: 56px;
                height: 52px;
              }

              .imgPaper {
                width: 33px;
                height: 68px;
                position: absolute;
                left: 50%;
                margin-left: -17px;
              }
            }

            .wrap-word {
              width: 99px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              text-align: center;
            }

            .first-wrap {
              border: 1px solid #8365f6;
            }

            .paper-wrap {
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid #dcdae2;
              border-radius: 3px;
              box-sizing: border-box;
              width: 84px;
              height: 84px;
              margin-bottom: 10px;

              .default {
                position: absolute;
                top: 0;
                left: 0;
                width: 34px;
                height: 34px;
                z-index: 1;
              }
              .imgPaper {
                width: 33px;
                height: 68px;
              }
            }
          }

          .online-wrap-mar {
            margin-right: 0;
          }
        }

        .printer {
          &__item {
            border-radius: 3px;
            display: inline-block;
            overflow: hidden;
            max-width: 116px;
            text-align: center;
            font-size: 12px;

            &.is_default {
              .printer__cont {
                border-color: #8365f6;

                &::before {
                  content: '默认';
                  position: absolute;
                  top: 5px;
                  left: -18px;
                  background-color: #8365f6;
                  color: #ffffff;
                  transform: rotate(-45deg);
                  width: 65px;
                  height: 16px;
                  line-height: 17px;
                }
              }
            }

            .printer__cont {
              img {
                width: 56px;
                height: 56px;
                padding-top: 11px;
              }
            }
          }

          &--add {
            display: inline-block;
            overflow: hidden;
            text-align: center;
            margin-right: 36px;
            cursor: pointer;

            .add-btn {
              color: #d8d8d8;
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              width: 26px;
              height: 26px;
              margin: auto;
              font-weight: bold;
            }

            .printer__cont {
              // background: #f6f6fa;
              border: 1px solid #dcdae2;
            }
          }

          &__cont {
            width: 70px;
            height: 70px;
            background: #ffffff;
            border: 1px solid #dcdae2;
            border-radius: 3px;
            margin: 0 auto 10px;
            position: relative;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;

            &:hover {
              border-color: #8365f6;
            }
          }

          &__name {
            font-size: 12px;
            color: #999999;
            height: 28px;
            line-height: 1.2;
            -webkit-line-clamp: 2;
            display: -webkit-box;
            white-space: initial;
            -webkit-box-orient: vertical;
          }

          &--close {
            position: absolute;
            color: #a5a5a5;
            right: 4px;
            top: 4px;
          }

          &--status {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 16px;
            line-height: 16px;
            color: #ffffff;
            font-size: 12px;
          }

          &--0 {
            background-color: #e25555;
          }

          &--1 {
            background-color: #8365f6;
          }
        }
      }
    }
  }
</style>