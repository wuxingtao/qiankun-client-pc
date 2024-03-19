<template>
  <div class='clientdialog page-style1'>
  <el-dialog :title='title' :visible.sync='dialogVisible' :close-on-click-modal='false' width='810px' append-to-body>
  <div class='dialog-body' v-loading='loading'>
  <div class='row-info'>
    已选运单：{{ waybills && waybills.length }}票
  </div>
  <div>
  <div class='waybill-wrapper'>
  <div class='waybill-left' v-if='isClientMode'>
    <div class='title'>{{ viewTitle() }}</div>
    <el-image :src='images && images[index]' class='waybill-img'></el-image>
    <div class='change'>
      <el-image :src='iconlastnormalprev' class='img' @click='page(0)'></el-image>
      <span class='first'>{{ index + 1 }}</span>
      <span> / </span>
      <span class='second'>{{ images && images.length || 1 }}</span>
      <el-image :src='iconlastnormalnext' class='img' @click='page(1)'></el-image>
    </div>
  </div>
  <div class='waybill-right'>
  <div class='waybill-right-wrapper' v-if='isNotice'>
    <el-form ref='form' :model='formData' :rules='formRules'>
      <div v-if='goodsBatchTimes.length>0'>
        <div class='goodsTime'>
          <el-form-item label='货好时间' prop='hhDate'>
            <el-date-picker prefix-icon='iconfont icon-purple_calendar' class='hhDate' v-model='formData.hhDate'
                            type='date' placeholder='选择日期' style='width:130px;'>
            </el-date-picker>
          </el-form-item>
          <el-select size='medium' v-model='formData.goodsTime' class='goodsBatchTimes'>
            <el-option v-for='(item,index) in goodsBatchTimes' :key='index' :label='item' :value='item'>
            </el-option>
          </el-select>
        </div>
      </div>
      <div v-else>
        <el-form-item label='货好时间' prop='hhDateTime'>
          <el-date-picker size='small' prefix-icon='iconfont icon-purple_calendar' v-model='formData.hhDateTime'
                          type='datetime' placeholder='选择日期时间' format='yyyy-MM-dd HH:mm'>
          </el-date-picker>
        </el-form-item>
      </div>
      <el-row :gutter='16'>
        <el-col :span='isVipshopUser?7:8'>
          <el-form-item label='预估总重量' prop='Weight' maxlength='10'>
            <el-input v-model='formData.Weight' size='medium' clearable placeholder='请输入' @blur='showBigCarInfo'
                      v-kyerestrict.float maxlength='7'>
              <template slot='append'>(kg)</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span='isVipshopUser?7:8'>
          <el-form-item label='预估总件数' prop='Number' maxlength='10'>
            <el-input v-model='formData.Number' size='medium' clearable placeholder='请输入' @blur='showBigCarInfo'
                      v-kyerestrict.positive maxlength='5'>
              <template slot='append'>(件)</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span='isVipshopUser?3:0'>
          <el-checkbox v-if='isVipshopUser' v-model='formData.isBulkGoods' class='bulk-goods'>大货入仓</el-checkbox>
        </el-col>
      </el-row>
      <div v-show='tableData.length>0&&overload' class='bigCar_content'>
        <div><i style='color:#F13E3E;'>*</i> 大票货</div>
        <div class='bigCar_tip'>由于您取货地址的运单货物较大，我司可能安排挂车取件，请确认货物所处位置<span style='color:#F13E3E;'>是否可以正常出入挂车</span>（长17.5m*宽2.65m*高2.9m）
        </div>
        <el-table :data='tableData' class='client-common-table' border style='width:100%' height='100%'>
          <el-table-column prop='qHAddress' label='取货地址' width='520'>
          </el-table-column>
          <el-table-column prop='name' label='出入挂车' width='176'>
            <template slot-scope='scope'>
              <el-radio v-model='scope.row.isSupport' label='true'>支持</el-radio>
              <el-radio v-model='scope.row.isSupport' label='false'>不支持</el-radio>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-form-item label='取货备注' prop='orderRemark'>
        <el-input type='textarea' :rows='3' v-model='formData.orderRemark' resize='none' clearable
                  placeholder='给司机小哥捎句话' maxlength='100' show-word-limit></el-input>
      </el-form-item>
    </el-form>
    <div class='historyRemark'>
      <div>历史备注</div>
      <div v-for='(item,index) in historyRemarkList' :key='index' class='remarkItem'>
        <el-button size='medium' round @click='setRemark(item)'>
          {{ item.length > 20 ? item.slice(0, 19) + "..." : item }}
        </el-button>
      </div>
    </div>
  </div>
  <div v-if='Number(printInfo.sheetType) !== 3'>
    <div class='title'>同时打印</div>
    <div class='select'>
      <div v-if='viewWord()'>
        <el-checkbox v-model='childMotherChecked'></el-checkbox>
        <span class='detail'>{{ viewWord() }}</span>
      </div>
      <div class='right' v-if='Number(printInfo.sheetType) === 2'>
        <el-checkbox v-model='sendStubChecked'></el-checkbox>
        <span class='detail'>打印寄件存根</span>
      </div>
    </div>
  </div>
  <div class='title'>选择打印机</div>
  <div class='online-status'>
    <div :class="{'online-wrap': true}" v-for='(item, index) in printers' :key='`0-${index}`'
         @click='choosePrint(0, index)'>
      <div :class="{wrap: true, 'first-wrap': item.select}">
        <el-image :src='defaultImg' v-if='item.select' class='default'></el-image>
        <el-image :src='printImage' class='img'></el-image>
        <div v-if='!item.local' :class="[item.printerStatus?'online':'offline']">{{ item.printerStatus ? "在线" : "离线"
          }}
        </div>
      </div>
      <el-tooltip placement='top'>
        <div slot='content'>{{ item.printerName }}</div>
        <div class='wrap-word'>{{ item.printerName }}</div>
      </el-tooltip>
    </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  <span slot='footer' class='dialog-footer'>
        <div class='footer-left'>
          <el-checkbox class='checkbox' v-model='agreementChecked'></el-checkbox>
          <div @click='view' style='cursor:pointer'>
            <span>我已阅读并同意</span>
            <span class='spec'>《电子运单服务使用协议》</span>
          </div>
        </div>
        <div class='footer-right'>
          <el-button @click='cancel'>取 消</el-button>
          <el-button type='primary' @click='confirm' :loading='loading'>确定</el-button>
        </div>
      </span>
  
  <!-- 电子运单协议 -->
  <ky-electronic :visible.sync='visibleOfTerms'></ky-electronic>
  
  </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import {
  printByPrintApp, getPrintData, getNightPickupFee, placeOrder, getSingleNos,
  incrementYDPrintTimes, getWatermarks, getSecurityCodeList, externalBatchSave, getListOutsideAgentLandingDelivery
} from '@/services/api/waybillOld'
import { getCustomerCode, getPhone } from '@utils/storage'
import { mapGetters, mapState } from 'vuex'
import { getOrderHistoryRemarkList, setOrderHistoryRemarkList } from '@/utils/localStorageUtil'
import { ElectronicService } from '@comps'
import { convertPrintModelsForLocalPrint, printByCloudPrinter } from '@/utils/clientUtil'
import { batchPrint, billPrint } from '@/services/api/common'
import { isPrintAppOnline } from '@api/setting'
import printUtil from './printUtil'
import printerUtil from '@utils/printerUtil'

export default {
  name: 'PrintView',
  components: {
    'ky-electronic': ElectronicService
  },
  data() {
    var validateHhDateTime = (rule, value, callback) => {
      if (
        dayjs().isAfter(
          dayjs(this.formData.hhDateTime),
          'minute'
        )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
        dayjs(this.formData.hhDateTime).isAfter(
          dayjs().add(1, 'month'),
          'month'
        )
      ) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    var validateHhDate = (rule, value, callback) => {
      let hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      if (
        dayjs().isAfter(
          dayjs(hhDateTime),
          'minute'
        )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
        dayjs(this.formData.hhDate).isAfter(
          dayjs().add(1, 'month'),
          'month'
        )
      ) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
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
      childMotherChecked: false,
      sendStubChecked: false,
      agreementChecked: true,
      loading: false,
      title: '打单',
      waybills: [],
      tableData: [],
      dialogVisible: false,
      isPrintSucess: false,
      isNotice: false,
      callback: null,
      overload: false,
      historyRemarkList: [],
      index: 0,
      images: [],
      fromBillDetail: false,
      formData: {
        hhDateTime: dayjs().add(2, 'minute'),
        hhDate: dayjs().format('YYYY-MM-DD'),
        goodsTime: '',
        Number: '',
        Weight: '',
        orderRemark: '',
        isBulkGoods: ''
      },
      formRules: {
        hhDateTime: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDateTime, trigger: 'blur' }
        ],
        hhDate: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDate, trigger: 'blur' }
        ],
        Weight: [
          {
            required: true,
            type: 'number',
            message: '请输入大于零的数值',
            transform(value) {
              return Number(value)
            },
            min: 0.01,
            trigger: 'blur'
          }
        ],
        Number: [
          {
            required: true,
            type: 'integer',
            message: '请输入大于零的整数',
            transform(value) {
              return Number(value)
            },
            min: 1,
            trigger: 'blur'
          }
        ]
      },
      extendObject: {}//扩展对象
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.$emit('on-close', this.isPrintSucess)
        this.formData.hhDateTime = dayjs().add(2, 'minute')
        this.formData.hhDate = dayjs().format('YYYY-MM-DD')
        this.formData.goodsTime = ''
        this.formData.Number = ''
        this.formData.Weight = ''
        this.formData.orderRemark = ''
        this.formData.isBulkGoods = ''
        // Object.assign(this.$data, this.$options.data())
      }
    }
  },
  methods: {
    viewTitle() {
      switch (Number(this.printInfo.sheetType)) {
        case 1:
          return '三联电子运单'
        case 2:
          return '二联电子运单'
        case 3:
          return '存根运单'
      }
    },
    viewWord() {
      if (this.isB2BUser) {
        if (this.authorityIds.includes('054')) {
          if (Number(this.printInfo.sheetType) === 1) {
            return '打印子母单'
          } else {
            return '取货标签'
          }
        } else {
          return '取货标签'
        }
      } else {
        return '打印子母单'
      }
    },
    page(type) {
      if (type === 0) {
        this.index = this.index - 1 >= 0 ? this.index - 1 : 0
      } else {
        this.index = this.index + 1 <= this.images.length - 1 ? this.index + 1 : this.images.length - 1
      }
    },
    // 选择打印机
    choosePrint(type, index) {
      let arr
      arr = this.printers
      this.printers = arr.map((item, i) => {
        if (i === index) {
          if (item.select) {
            item.select = false
          } else {
            item.select = true
          }
        } else {
          item.select = false
        }
        return item
      })
    },
    //获取打印机列表
    async getPrinters() {
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
          if (item.printerId === this.printConfig.printModel) {
            item.select = true
          }
        } else if (item.printerName === this.printConfig.printModel) {
          item.select = true
        }
        return item
      })
      this.printers = array
    },
    async getCloudPrinters() {
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
    showDialog(waybills, isNotice, callback, extendObject, fromBillDetail = false) {
      this.extendObject = extendObject
      this.waybills = [...waybills]
      this.isPrintSucess = false
      this.dialogVisible = true
      this.callback = callback
      this.isNotice = isNotice
      this.title = isNotice ? '通知取货并打单' : '打单'
      this.images = []
      this.fromBillDetail = fromBillDetail
      if(fromBillDetail){
        //埋点
        window.report.sendExpEvent('exp_bill_total_detail_print')
      }

      if (isNotice) {
        const addressList = Array.from(new Set(waybills.map(item => item.qHAddress)))
        this.tableData = addressList.map(item => ({ qHAddress: item, isSupport: '' }))
        getOrderHistoryRemarkList().then(res => {
          this.historyRemarkList = res.filter(m => m.replace(/^\s+|\s+$/g, '').length > 0)
        })
      }
      
      this.$nextTick(() => {
        if (isNotice) {
          this.$refs.form.resetFields()
          this.formData.Weight = this.sum(waybills.map(w => Number(w.weight))) || ''
          this.formData.Number = this.sum(waybills.map(w => Number(w.count))) || ''
          this.formData.hhDateTime = dayjs().add(2, 'minute')
          this.showBigCarInfo()
        }
        
      })
      this.getPrintViewImages()
      this.getPrinters()
    },
    sum(array) {
      return array.reduce((total, cur) => {
        return total + cur
      }, 0)
    },
    async confirm() {
      if(this.fromBillDetail){
        window.report.sendClickEvent('clk_bill_total_detail_print',{button_name:'确定'})
      }
      if (!this.agreementChecked) {
        return this.$message('请先勾选电子运单服务协议')
      }
      let printerInfo = this.printers.find(item => item.select) || {}
      if (!printerInfo.select) {
        return this.$message('请先勾选打印机')
      }
      if (printerInfo.isCloudPrinter && printerInfo.printerStatus === 0) {
        if (this.printInfo.sheetType === 'A4Stub') {
          return this.$message('云打印机不支持打印A4存根模板')
        }
        return this.$message('云打印机状态异常(离线)')
      }
      if (printerInfo.isPrintApp) {
        // if(this.printInfo.sheetType === "A4Stub"){
        //   return this.$message('打印组件暂不支持打印A4存根模板')
        // }
        const res = await isPrintAppOnline(printerInfo.printerName)
        if (res.code !== 0 || res.data.status === 20) {
          const msg = '打印组件不在线，请确认是否已开启该打印组件'
          return this.$message(msg)
        }
      }
      
      const list = this.waybills.map(m => {
        return {
          ydCode: m.ydNo,
          number: Number(m.count),
          weight: parseFloat(m.weight),
          addressList: [m.qHAddress || '', m.sjAddress || ''],
          areacode: m.sendAreaNo,
          shieldInfo: this.$store.getters.encryptionText,
          bulkCargo: (this.tableData.filter(t => t.qHAddress === m.qHAddress)[0] || {}).isSupport
        }
      })
      this.loading = true
      if (this.$refs.form) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.nightPickupNotice(list)
          } else {
            this.loading = false
          }
        })
      } else {
        if (!this.fromBillDetail) {
          this.printData()
        } else {
          this.handleConfirm()
          const msg = await this.printCommon()
          if (msg) {
            this.$message.error(msg)
          } else {
            this.isPrintSucess = true
            this.$message.success('打印成功')
          }
          this.loading = false
          this.dialogVisible = false
        }
      }
    },
    async saveData(list) {
      if (this.goodsBatchTimes.length > 0) {
        this.formData.hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      }
      let params = {
        hhDateTime: dayjs(this.formData.hhDateTime).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
        Number: this.formData.Number,
        Weight: this.formData.Weight,
        flexInt1: this.formData.isBulkGoods ? '10' : '20',
        data: list,
        orderRemark: this.formData.orderRemark,
        isPrint: this.childMotherChecked ? 1 : 0,
      }
      let res = await placeOrder(params).catch(() => {
        this.loading = false
      })
      if (res.code === 0) {
        this.dialogVisible = false
        this.callback && this.callback()
        this.$nextTick(() => {
          this.$message.success('通知取货成功')
        })
        if (this.formData.orderRemark) {
          setOrderHistoryRemarkList(this.formData.orderRemark)
        }
        this.printCommon()
      } else {
        console.log('res.msg :>> ', res.msg)
        this.$message.error(res.msg)
      }
      this.loading = false
    },
    async nightPickupNotice(list) {
      try {
        const hour = dayjs(this.formData.hhDateTime).hour
        if (hour >= 8 && hour < 17) {
          await this.saveData(list)
          return
        }
        const areaCodes = Array.from(
          new Set(list.filter(f => f.areacode).map(f => f.areacode))
        )
        let msg = ''
        if (areaCodes.length === 1) {
          const time = dayjs(this.formData.hhDateTime).format('YYYY-MM-DD HH:mm:ss')
          let res = await getNightPickupFee(time, areaCodes[0])
          if (res.code === 0 && parseFloat(res.data.nightPickupFee) > 0) {
            msg = `温馨提示：当前寄件地址${res.data.chargeStartTime}-${res.data.endChargeTime}取货会加收取货费用，详情可咨询您的市场员`
          }
        } else if (areaCodes.length > 1) {
          msg = '温馨提示：部分地区17:00-08:00取货会加收取货费用，详情可咨询您的市场员'
        }
        if (msg) {
          this.$confirm(msg, '夜间收费提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info '
          }).then(async () => {
            await this.saveData(list)
          }).catch(() => {
            this.loading = false
          })
        } else {
          await this.saveData(list)
        }
      } catch (ex) {
        this.$message.error('通知取货失败')
        console.log('nightPickupNotice :>> ', ex)
        this.loading = false
      }
    },
    setRemark(value) {
      this.formData.orderRemark = value
    },
    showBigCarInfo() {
      if (this.tableData && this.tableData.length > 1) {
        if (this.formData.Weight && Number(this.formData.Number) > 0) {
          const avgWeight = Number(this.formData.Weight) / Number(this.formData.Number)
          if (avgWeight > 10000) {
            this.overload = true
          } else {
            this.overload = false
          }
        }
      } else if (this.formData.Weight > 10000) {
        this.overload = true
      } else {
        this.overload = this.false
      }
    },
    //取得打印预览图片
    async getPrintViewImages() {
      console.log(this.waybills)
      if (!this.isClientMode) {
        return
      }
      
      const arrWaybill = JSON.parse(JSON.stringify(this.waybills))
      const localPrintDataList = await this.getLocalPrintDataList({
        arrWaybill,
        sendStubChecked: this.isSendStubTemplate,
        childMotherChecked: false,
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
    getTemplateSizeType() {
      let templateSizeType = this.printInfo.sheetType === '1' ? '1' : '0'
      if (this.printInfo.sheetType === 'A4Stub') {
        templateSizeType = '2'
      } else if (this.isSendStubTemplate) {
        templateSizeType = '3'
      }
      return templateSizeType
    },
    async waybillPrint(childMotherChecked, sendStubChecked) {
      //打印模式  本地，云打印
      const printerInfo = this.printers.find(item => item.select)
      const arrWaybill = JSON.parse(JSON.stringify(this.waybills))
      if (childMotherChecked) {
        
        const getSingleWaybills = arrWaybill.filter(m => m.agentCode !== '10')
        if (getSingleWaybills.length > 0) {
          await new Promise(resolve => {
            setTimeout(resolve, 200)
          })
          let resSing = await getSingleNos(getSingleWaybills.map(el => ({ ydCode: el.ydNo })))
          if (resSing.code === 0 && resSing.data.dataList) {
            let singNoList = resSing.data.dataList
            singNoList.forEach(el => {
              const model = arrWaybill.find(m => m.ydNo === el.parentNo)
              model && (model.childYdCodes = el.singleNoInfo.map(m => m.singleNo))
            })
          }
        }
        
      }
      //获取水印码
      const watermarks = getWatermarks(arrWaybill.map(el => ({ waybillNumber: el.ydNo })))
      //获取防伪码
      const getSecurityWaybills = arrWaybill.filter(m => Number(m.count) > 1 && !m.childYdCodes && m.agentCode !== '10')
      
      const codeList = this.printInfo.sheetType === '2' && childMotherChecked && getSecurityWaybills.length > 0 && getSecurityCodeList(getSecurityWaybills.map(el => (
        {
          waybillNumber: el.ydNo,
          printTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          startPage: 1,
          endPage: Number(el.count),
          count: Number(el.count),
        })))
      //获取外部派送信息，三段码等
      const deliveryList = getListOutsideAgentLandingDelivery({ 'waybillNumbers': arrWaybill.map(el => el.ydNo) })
      const [result1, result2, result3] = await Promise.all([watermarks, codeList, deliveryList])
      if (result1.code === 0 && result1.data && result1.data.dataList) {
        const list = result1.data.dataList
        list.forEach(el => {
          const model = arrWaybill.find(m => m.ydNo === el.waybillNumber)
          model && (model.waterMark = el.waterMark)
        })
      }
      if (codeList && result2.code === 0 && result2.data && result2.data.waybillSecurityCodeList) {
        const list = result2.data.waybillSecurityCodeList
        list.forEach(el => {
          const model = arrWaybill.find(m => m.ydNo === el.split('|')[0])
          model && (model.ydNo = el)
        })
      }
      if (result3.code === 0 && result3.data) {
        const list = result3.data
        list.forEach(el => {
          const model = arrWaybill.find(m => m.ydNo === el.waybillNumber)
          model && Object.assign(model, el)
        })
      }
      
      if (printerInfo.isPrintApp) {
        const params = {
          batchModels: convertPrintModelsForLocalPrint(arrWaybill),
          customerMsgEncryt: this.$store.getters.encryptionText,
          templateSizeType: this.getTemplateSizeType(),
          isPrintSon: childMotherChecked,
          isPrintJJcg: this.isSendStubTemplate || sendStubChecked,
          printClientId: printerInfo.printerName
        }
        const res = await printByPrintApp(params)
        if (res.code !== 0) {
          return '打印失败，请检查打印组件是否在线'
        }
        return
      }
      const localPrintDataList = await this.getLocalPrintDataList({
        arrWaybill,
        printerName: printerInfo.printerName,
        sendStubChecked,
        childMotherChecked,
      })
      if (localPrintDataList) {
        localPrintDataList.forEach(m => {
          this.$native.batchPrint(m.templateText, m.templateData, m.templateType, printerInfo.printerName)
        })
      }
    },
    /**取得本地打印的打印数据
     * @param {String} printerName 打印机名称，打印预览时不要传
     */
    async getLocalPrintDataList({ arrWaybill, printerName, sendStubChecked, childMotherChecked }) {
      arrWaybill.forEach(el => {
        if (el.agentCode === '10') {
          el.JDCode = el.viewBarCode = el.ydNo.split('|')[0]
        }
      })
      await printUtil.addPrintFlag(arrWaybill)
      if (printerName && printerName.indexOf('跨越云打印机') > -1) {
        await printByCloudPrinter(arrWaybill, printerName.match(/\(([^)]*)\)/)[1], this.isSendStubTemplate || sendStubChecked, childMotherChecked, false)
        return
      }
      
      let params = {
        batchModels: convertPrintModelsForLocalPrint(arrWaybill),
        customerMsgEncryt: this.$store.getters.encryptionText,
        templateSizeType: this.getTemplateSizeType(),
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
        printUtil.addPrintCompanyFlagByWaybill(arrWaybill, printDataList)
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
        if (this.printInfo.sheetType === 'A4Stub') {
          localPrintDataList = printUtil.convertLocalPrintDataListForA4Stub(localPrintDataList)
        }
        return localPrintDataList
      }
    },
    
    async printData() {
      const customerMsgEncryt = this.$store.getters.encryptionText
      let params = {
        mobile: getPhone(),
        companyNo: getCustomerCode(),
        isPrint: this.childMotherChecked ? 1 : 0,
        dataList: this.waybills.map((m, index) => ({
          no: index,
          ydNo: m.ydNo,
          number: m.count,
          shieldInfo: customerMsgEncryt
        })),
        waybillSource: '140'
      }
      let res = await batchPrint(params)
      if (res.code === 0) {
        const msg = await this.printCommon()
        if (msg) {
          this.$message.error(msg)
        } else {
          this.isPrintSucess = true
          this.$message.success('打印任务已发送到您的打印机请检查')
        }
        this.dialogVisible = false
      } else if (res.code === 37999 && this.fromBillDetail) {
        this.$message.error(res.data)
      } else if (res.code === 37811 && this.fromBillDetail) {
        this.$message.error(`运单${res.data}已被删除无法打印，若存在异议请联系您的销售经理`)
      } else {
        this.$message.error('打印失败')
      }
      this.loading = false
    },
    async printCommon() {
      const msg = await this.waybillPrint(this.childMotherChecked, this.sendStubChecked)
      incrementYDPrintTimes(this.waybills.map(el => ({ YDCode: el.ydNo })))
      externalBatchSave(this.waybills.filter(m => m.type != '是' && (m.JDCode || m.jdCode)).map(el => ({
        kyeWaybillNumber: el.ydNo.split('|')[0],
        kyeScanNumber: el.ydNo.split('|')[0],
        externalWaybillNumber: el.JDCode || el.jdCode,
        externalScanNumber: (el.JDCode || el.jdCode) + '-1-1-',
        externalType: '10'
      })))
      return msg
    },
    cancel(){
      this.dialogVisible = false
      if(this.fromBillDetail){
        window.report.sendClickEvent('clk_bill_total_detail_print',{button_name:'取消'})
      }
    },
    view(){
      this.visibleOfTerms=true
      window.report.sendClickEvent('clk_bill_total_detail_print',{button_name:'电子运单服务使用协议'})
    },
    handleConfirm(){
      const printInfo = this.printers.find(item => item.select) || {}
      let print_with=[]
      if(this.sendStubChecked){
        print_with.push('打印寄件存根')
      }
      if(this.childMotherChecked){
        print_with.push(this.viewWord())
      }
      let printParams={
        printer_type:printInfo.printerName,
        print_number:this.waybills && this.waybills.length,
        print_with:print_with.length>0?print_with.join(','):''
      }
      window.report.sendOtherEvent('other_bill_total_detail_print',printParams)
    }
    
  },
  computed: {
    isVipshopUser() {
      return this.$store.getters.isVipshopUser
    },
    isSendStubTemplate() {//寄方存根
      let flag = ['3', '136Stub', 'A4Stub'].includes(this.printInfo.sheetType)
      if (this.extendObject && this.extendObject.isSendStubTemplate) {
        flag = true
      }
      return flag
    },
    ...mapGetters([
      'goodsBatchTimes', 'printTemplateList',
      'isB2BUser', // true B2B
      'authorityIds' // '054' B2B 字母单权限
    ]),
    ...mapState('setModule', ['printInfo']),  // printInfo.sheetType 1 3联  2 2联
    ...mapState('client', ['printConfig'])
  },
}
</script>

<style lang='scss' scoped>
.dialog-body {
  .row-info {
    height: 30px;
    line-height: 30px;
    background: #f6f3ff;
    font-size: 14px;
    color: #424242;
    font-weight: bold;
    border-radius: 4px;
    padding-left: 16px;
    padding-top: 4px;
    margin-bottom: 24px;
  }
  
  .bulk-goods {
    padding-top: 32px;
  }
  
  .img-wrap {
    text-align: center;
    margin: 24px 0 0;
    
    .el-image {
      margin-bottom: 16px;
    }
  }
  
  /deep/ {
    .el-form-item {
      .el-form-item__label {
        line-height: 14px;
        padding-bottom: 8px;
      }
      
      .el-date-editor.el-input,
      .el-date-editor.el-input__inner {
        width: 100%;
      }
      
      .el-input__prefix {
        position: unset;
      }
    }
    
    .icon-purple_calendar {
      color: #8365f6;
      right: 0;
      position: absolute;
    }
    
    .el-icon-circle-close {
      right: 20px;
      position: relative;
    }
    
    .bigCar_tip {
      line-height: 20px;
      padding: 12px 0 16px 0;
      color: #333333;
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
    }
    
    .bigCar_content {
      padding-bottom: 12px;
    }
    
    .historyRemark {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      
      /deep/ .el-input--medium .el-input__inner {
        height: 40px;
        width: 100px;
      }
      
      .el-button.is-round {
        opacity: 1;
        background: #f7f7f7;
        border: 1px solid #e9e9e9;
        border-radius: 17px;
        margin: 0 6px 6px 6px;
      }
    }
    
    .goodsTime {
      display: flex;
      
      .goodsBatchTimes {
        top: 22px;
        left: 5px;
        position: relative;
      }
      
      .hhDate {
        bottom: 4px;
        position: relative;
        width: 140px;
        padding: 0;
      }
    }
    
    .el-checkbox__label {
      padding-left: 6px !important;
    }
    
    .el-col-3 {
      padding-left: 6px !important;
    }
  }
}

.waybill-wrapper {
  display: flex;
  
  .waybill-left {
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
    .waybill-right-wrapper {
      margin-bottom: 26px;
    }
    
    .title {
      font-weight: 500;
      color: #333;
    }
    
    .select {
      display: flex;
      margin-top: 16px;
      margin-bottom: 26px;
      
      .right {
        margin-left: 20px;
      }
      
      .detail {
        color: #333333;
        margin-left: 4px;
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
        margin-right: 15px;
        margin-bottom: 20px;
        
        .wrap {
          position: relative;
          width: 84px;
          height: 84px;
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
            height: 56px;
          }
        }
        
        .wrap-word {
          width: 84px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .first-wrap {
          border: 1px solid #8365f6;
        }
      }
      
      .online-wrap-mar {
        margin-right: 0;
      }
    }
  }
}

/deep/ .el-dialog__footer .dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-left {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    color: #666;
    
    .checkbox {
      margin-right: 3px;
    }
    
    .spec {
      color: #8365f6;
    }
  }
  
  .cancel {
    padding: 10px 22px;
    border: 1px solid #dfdfdf;
    border-radius: 17px;
    color: #333333;
    font-size: 14px;
  }
  
  .confirm {
    padding: 10px 22px;
    background: #8365f6;
    border-radius: 16px;
    font-size: 14px;
    color: #fff;
  }
}
</style>
