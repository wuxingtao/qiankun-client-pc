<template>
  <div>
  <affect-notice
    v-if='[statusEnum.INFORM, statusEnum.CANCEL].includes(String(convertModel.waybillStatus))'
    class='status-notice'
    :data='routeList' :isInMap='false' />
<!--  <div-->
<!--    v-if='affectInfo && affectInfo.limitCategory && affectInfo.message && convertModel.waybillStatus === Number(statusEnum.INFORM)'-->
<!--    class='affect-wrapper'-->
<!--    :class="'affect_'+getAffectStyle(affectInfo.limitCategory)">-->
<!--    <img :src='getAffectUrl(affectInfo.limitCategory)' />-->
<!--    <p>-->
<!--      <span>{{ affectInfo.message }}</span>-->
<!--    </p>-->
<!--  </div>-->
  <div class='waybill-state'>
  <template v-if='[statusEnum.INFORM, statusEnum.CANCEL].includes(String(convertModel.waybillStatus))'>
  <img v-if='routeList.limitCancelFlag === limitCancelFlagEnum.UNFREEZE'
       class='affect_mark'
       src='@/assets/image/waybill/affect_mark_unfreeze.png' />
  <img v-else-if='routeList.limitType === affectTypeEnum.LIMIT'
    class='affect_mark'
       :src="routeList.needClearanceControl ? '@/assets/image/waybill/affect_mark_custom.png' : getMark(routeList.limitReason, routeList.limitType)" />
  </template>
  <div class='ydNo'>
    <span class='main-ydno'><span>运单号：</span>{{ convertModel.waybillNumber }}</span>
    <el-button type='text' v-clipboard='convertModel.waybillNumber'>
      <svg-icon icon-class='copy' class='icon-copy' />
    </el-button>
    <template v-if='convertModel.parentNumber'>
      <span class='main-ydno'><span>母单：</span>{{ convertModel.parentNumber }}</span>
      <el-button type='text' class='button' v-clipboard='convertModel.parentNumber'>
        <svg-icon icon-class='copy' class='icon-copy' />
      </el-button>
      <span class='skew-fill'></span>
      <span class='warning'>
          <i class='iconfont icon-info3'></i>
          子单信息已汇总到母单，实际以母单为准
        </span>
    </template>
  </div>
  <div class='status'>
  <el-image class='status-img' :src='stateUrl' style='width:180px;height:60px'>图片</el-image>
  <div class='status-text'>
    <span>{{ convertModel.waybillStatusText }}</span>
    <span
      v-if='convertModel.waybillStatus === Number(statusEnum.UNSIGNED) &&  convertModel.statistics && (convertModel.statistics.unReportCount || convertModel.statistics.reportCount)'>
          <b v-if='convertModel.statistics.unReportCount'>未揽件:<em>{{ convertModel.statistics.unReportCount }}件</em></b>
          <b v-if='convertModel.statistics.unReportCount && convertModel.statistics.reportCount'>；</b>
          <b v-if='convertModel.statistics.reportCount'>已揽件:<em>{{ convertModel.statistics.reportCount }}件</em></b>
        </span>
    <span
      v-if='convertModel.waybillStatus === Number(statusEnum.SIGNED) &&  convertModel.statistics && (convertModel.statistics.unReceivedCount || convertModel.statistics.receivedCount)'>
          <b v-if='convertModel.statistics.unReportCount'>未揽件:<em>{{ convertModel.statistics.unReportCount }}件</em></b>
          <b
            v-if='convertModel.statistics.unReportCount && (convertModel.statistics.unReceivedCount || convertModel.statistics.receivedCount)'>；</b>
          <b v-if='convertModel.statistics.unReceivedCount'>未签收:<em>{{ convertModel.statistics.unReceivedCount }}件</em></b>
          <b v-if='convertModel.statistics.unReceivedCount && convertModel.statistics.receivedCount'>；</b>
          <b v-if='convertModel.statistics.receivedCount'>已签收:<em>{{ convertModel.statistics.receivedCount }}件</em></b>
        </span>
  </div>
  <div class='operation-buttons'>
    <el-button type='primary' size='small'
               @click='printViewOrNotice([convertModel], false, null)'>
      打印
    </el-button>
    <el-button v-if="isButtonVisible('notice')" size='small' class='el-button el-button-spec'
               :class="routeList.limitType === affectTypeEnum.LIMIT ? 'gray' : ''"
               @click='noticeForPickup([convertModel])'>
    {{convertModel.waybillStatusText==='已取消'?'重新下单':'通知取货'}}
    </el-button>
    <el-button v-if="isButtonVisible('urged')" size='small'
               @click='handleUrgeCollection' class='el-button'>催取
    </el-button>
    <template v-if="isButtonVisible('edit')">
      <guide-popover v-if='convertModel.waybillStatus === Number(statusEnum.PICKUP)'
                     placement='bottom-start' content='修改货好时间功能已与修改运单合并' storageKey='isShowDeliveryModifyPopover'
                     :popper-options=" {boundariesElement:'body',removeOnDestroy:true}">
        <el-button size='small' @click='modifyWaybill' class='el-button'>修改运单</el-button>
      </guide-popover>
      <el-button v-else size='small' @click='modifyWaybill' class='el-button'>修改运单</el-button>
    </template>
    <el-button v-if="isButtonVisible('entrust')" size='small'
               @click='handleUploadForwardingOrder' class='el-button'>
      {{ routeList.proxyFlag === 1 ? '上传取货资料' : '查看取货资料' }}
    </el-button>
    <el-button v-if="isButtonVisible('viewImage')" size='small'
               @click="handleViewImage(convertModel.waybillNumber, 'waybill_upload_image_report')" class='el-button'>
      查看运单联
    </el-button>
    <el-popover v-show="isButtonVisible('requestDelivery')"
                v-model='showExigencyDate' trigger='manual' placement='top' width='254' :visible-arrow='true'>
      <template>
        <div class='popover-content'>
          <span>您已修改派送时间：{{ routeList.preArriveTime }}</span>
          <i class='iconfont icon-close' @click='()=>this.showExigencyDate = false'></i>
        </div>
      </template>
      <template slot='reference'>
        <el-button size='small' class='el-button' @click='openDeliveryTimeDialog({})'>
          修改派送时间
        </el-button>
      </template>
    </el-popover>
    <el-button v-if="isButtonVisible('goodsInfo')" size='small'
               @click='handlePickupAppoint' class='el-button'>
      {{ pickupAppointButtonText }}
    </el-button>
    <!-- &&routeList.preferences&&routeList.preferences.includes('10') -->
    <!--      <el-button v-if="isButtonVisible('requestDelivery')" size='small' @click='showSelfSign' class='el-button'>-->
    <!--        本人签收-->
    <!--      </el-button>-->
    <el-button v-if="isButtonVisible('deliveryDeference')" size='small'
               @click='handlePreference' class='el-button'>
      偏好设置
    </el-button>
    <el-button v-if="isButtonVisible('branchPick')" size='small'
               @click='branchPick' class='el-button'>
      网点自提
    </el-button>
    <el-button size='small'
               @click='contactBusiness' class='el-button'>
      联系商务
    </el-button>
    <el-button v-if="isButtonVisible('selfSign')" size='small'
               @click='selfSign' class='el-button'>
      签收确认
    </el-button>
  </div>
  </div>
  <notice-pickup ref='noticePickupRef' />
  <print-view ref='printView' @printCallback='printCallback'></print-view>
  <dialog-waybill-modify ref='dialogWaybillModifyRef' @save-success='freshData' />
  <business-contact ref='businessContact' :waybill-number='convertModel.waybillNumber'
                    :business-info='businessInfo'></business-contact>
  <upload-order-file ref='uploadOrderFile'
                     :can-preview='true' :can-download='true'
                     @save-success='freshData' />
  <update-appointment-time :ydNo="convertModel.waybillNumber||''" :visible.sync='appointmentTimeDialogVisible'
                           :dataInfo='dataInfo' :preArriveTime='routeList.preArriveTime'
                           :timeDialogInfo='timeDialogInfo' @closeAppointmentTimeDialog='closeAppointmentTimeDialog'
                           @success='handleTimeSuccess' />
  <upload-pickup-file ref='UploadPickupFile' @save='handleSaveDeliveryData' />
  <self-sign-detail ref='selfSignDetail' />
  <!--  偏好设置列表入口：关闭  -->
  <!--  <preference-waybill :visible.sync='preferenceVisible' :waybillNumber='convertModel.waybillNumber'-->
  <!--                      ref='preferenceWaybillRef' />-->
  <branch-pick ref='branchPick' @refresh='freshData'
               @updateDeliveryTime='doOpenDeliveryTimeDialog'></branch-pick>
  </div>
  </div>
</template>
<script>
import PrintView from "@/views/waybill/components/print-view"
import UploadOrderFile from "@/views/waybill/components/detail/upload-order-file.vue"
import UploadPickupFile from "@/views/waybill/components/upload-pickup-file"
import NoticePickup from "@/views/waybill/components/notice-pickup"
import BusinessContact from "@/views/waybill/components/business-contant"
import BranchPick from "@/views/waybill/components/branch-pick"
import waybillApi from "@/services/api/waybill"
import dayjs from "dayjs"
import UpdateAppointmentTime from "./update-appointment-time.vue"
import DialogWaybillModify from "@views/delivery/components/dialog-waybill-modify"
import GuidePopover from "@comps/guide-popover"
import { statusEnum } from "../../enum/queryEnum"
import SelfSignDetail from "./self-sign-detail"
import { preferenceFromEnum } from "@views/preference/preference-waybill/preferenceUtil"
import * as storageUtil from "@/utils/storage"
import md5 from "md5"
import { getAffectStyle, getAffectUrl, getMark } from "../../utils/methods"
import AffectNotice from '@/views/waybill/components/affect-notice'
import { affectTextEnum, affectTypeEnum, limitCancelFlagEnum } from '@/views/waybill/enum/affectEnum'

export default {
  name: 'waybill-state',
  components: {
    AffectNotice,
    NoticePickup,
    PrintView,
    UploadOrderFile,
    UpdateAppointmentTime,
    DialogWaybillModify,
    GuidePopover,
    BusinessContact,
    // eslint-disable-next-line vue/no-unused-components
    UploadPickupFile,
    SelfSignDetail,
    BranchPick,
    'preference-waybill': () => import('@/views/preference/preference-waybill')
  },
  props: {
    convertModel: {
      type: Object,
      require: true
    },
    routeList: {
      type: Object
    }
  },
  data() {
    return {
      appointmentTimeDialogVisible: false,
      visibleOfModify: false,
      dataInfo: {},
      stateUrl: require('@assets/image/waybill/waybill-info-state.png'),
      isSHowUrge: false,
      showExigencyDate: false,
      statusEnum,
      drawer: false,
      isSelfSign: false,
      applicationRange: '10',
      preferenceVisible: false,
      timeDialogInfo: {
        finalAging: '', // 需派时效
        from: ''
      },
      closeDeliveryTimeDialogUpdate: false,
      businessInfo: {},
      affectTypeEnum,
      limitCancelFlagEnum
    }
  },
  created() {
    this.getBusinessPhone()
  },
  computed: {
    /**
     * 上传取货资料 or 查看取货资料 按钮文本
     */
    pickupAppointButtonText() {
      const { materialFlag } = this.routeList
      if (+materialFlag === 0) {
        return ''
      } else if (+materialFlag % 2 === 0) {
        return '查看派货资料'
      } else {
        return '上传派货资料'
      }
    },
  },
  methods: {
    getAffectStyle,
    getAffectUrl,
    getMark,
    isButtonVisible(flag) {
      const status = this.convertModel.waybillStatusText
      switch (flag) {
        case 'edit':
          return (['待揽件', '待通知取货', '已取消'].includes(status) && this.routeList.canModify === 1)
        case 'notice':
          return ('待通知取货' === status || '已取消' === status)
        case 'modifyNoticeTime':
          return '待揽件' === status && this.convertModel.ddStatus != '1'
        case 'urged':
          return '待揽件' === status && this.routeList.canRemindDelivery === 1
        case 'entrust':
          return '待揽件' === status && this.routeList.proxyFlag !== 0
        case 'collection':
          return '待揽件' === status
        case 'requestDelivery':
          return '待签收' === status && this.routeList.canModifyDeliveryTime === 1
        case 'goodsInfo':
          return '待签收' === status && this.routeList.materialFlag !== 0
        case 'viewImage':
          return '待签收' === status
        case 'signed':
          return '已签收' === status
        case 'print':
          return '已签收' !== status
        case 'cancel':
          return '待揽件' === status
        case 'deliveryDeference':
          return this.routeList?.preferences?.length > 0
        case 'branchPick':
          return '待签收' === status && !(!this.routeList.canSelfSufficiency && !this.routeList.hasSelfSufficiencyInfo)
        case 'selfSign':
          return '待签收' === status && this.routeList.canSelfSign
      }
    },
    //通知取货
    async noticeForPickup(waybills) {
      if(this.routeList.limitType === affectTypeEnum.LIMIT) {
        const text = affectTextEnum[this.routeList.limitReason]
        return this.$message.warning(`当前运单因${text}不可抗因素不可${this.convertModel.waybillStatusText==='已取消'?'重新下单':'通知取货'}`)
      }
      if (!waybills || waybills.length < 1) {
        this.$message.warning('请先选择操作的运单')
        return
      }
      await this.$refs.noticePickupRef.showDialog(waybills)
    },
    printViewOrNotice(waybills, isNotice = false, callback = null) {
      this.$refs.printView.showDialog(waybills, isNotice, callback)
    },
    modifyWaybill() {
      this.$refs.dialogWaybillModifyRef.showDialog(this.convertModel.waybillNumber)
    },
    handleUploadForwardingOrder() {
      this.$refs.uploadOrderFile.showDialog(this.routeList.orderNumber, this.freshRoute)
    },
    async getBusinessPhone() {
      const { data } = await waybillApi.getBusinessPhone()
      this.businessInfo = data
    },
    /**
     * 查询运单、签收、回单图片
     * @param {String} ydNo
     * @param {Number} type 1：运单联 2：签收联 3：回单联
     */
    handleViewImage(ydNo, type) {
      try {
        const data = {
          type,
          ydNoList: [ydNo]
        }
        window.sessionStorage.setItem('YDNO_LIST', JSON.stringify(data))
        this.$router.push('/admin/waybill-v3-detail-material')
      } catch (err) {
        console.warn(err.msg)
      }
    },
    freshData() {
      this.$emit('getDetailInfo')
      this.$emit('getWaybillRoute')
    },
    freshRoute() {
      this.$emit('getWaybillRoute')
    },
    //催取
    handleUrgeCollection() {
      const url = this.getOnlineServiceUrl()
      let iWidth = 1145
      let iHeight = 780
      let iTop = (window.screen.availHeight - 30 - iHeight) / 2
      //获得窗口的水平位置
      let iLeft = (window.screen.availWidth - 10 - iWidth) / 2
      
      let param = `height=${iHeight}, top=${iTop}, width=${iWidth}, left=${iLeft}, toolbar='no', menubar='no', scrollbars='no', resizable='no', location='no', status='no'`
      window.open(url, '_blank', param)
    },
    getOnlineServiceUrl() {
      //let url = 'https://kuasheng-h5.kye-erp.com/ccms-online-web/'
      let url = 'https://kuasheng-h5.kye-erp.com/ccms-online-web/'
      if (
        ['uc-uat.ky-express.com', 'uc-dev.ky-express.com', 'localhost'].includes(
          window.location.hostname
        )
      ) {
        url = 'http://erp-kuasheng-h5-uat.kye-erp.com/ccms-online-web/'
      }
      const params = {
        name: storageUtil.getLoginData().marketer,
        source: 'WEB',
        phone: storageUtil.getPhone()
      }
      const keys = Object.keys(params)
        .filter(k => params[k])
        .sort()
      let rawString = keys.reduce((str, cur) => {
        str += cur + params[cur]
        return str
      }, '')
      rawString += 'imcloudMethod'
      params.sign = md5(rawString).toUpperCase()
      params.type = 'reminder'
      params.paramsNum = this.convertModel.waybillNumber
      
      const paramsString = Object.keys(params)
        .filter(k => params[k])
        .map(k => `${k}=${params[k]}`)
        .join('&')
      return `${url}?${paramsString}`
    },
    //查询运单货物仓储信息
    async getCargoStorageInfo(ydNo, showPopover = false, showTooltip = false,
      { finalAgingByCalculate = '', from = '', updateRoute = false, callback = '' } = {}) {
      // showPopover控制修改时间弹窗，showTooltip控制修改成功后popover展示
      // if (this.convertModel.serviceModeText === '当天达' && !this.routeList.preArriveTime) {
      //   this.$message.warning('暂不能修改派送时间，请稍后重试')
      //   return
      // }
      let params = {
        waybillNumber: ydNo
      }
      let res = await waybillApi.getCargoStorageInfo(params)
      if (res.code === 0 && res.data) {
        const { data } = res
        this.dataInfo = data
        this.$emit('cargoStorageInfo', data)
        if (showTooltip) {
          //刷新路由信息
          this.freshRoute()
          setTimeout(() => {
            if (!this.preferenceVisible) {
              this.showExigencyDate = true
            }
          }, 800)
        }
        if (updateRoute) {
          //刷新路由信息
          this.freshRoute()
        }
        if (!showPopover) {
          return
        }
        if (data.showModifyDeliveryFlag === 20) {
          return
        }
        if (data.modifyTimes === 0) {
          this.$alert('本运单派送时间已修改2次，如需修改，请致电95324。', '温馨提示', {
            confirmButtonText: '确认',
            customClass: 'update-delivery-time'
          })
            .then(() => {
              if (this.closeDeliveryTimeDialogUpdate) {
                this.closeDeliveryTimeDialogUpdate = false
                this.freshData()
              }
            })
          return
        }
        // 提示迁移到后台
        // if (this.routeList && this.routeList.routeNodeVos) {
        //   let isDelivery = false
        //   this.routeList.routeNodeVos.forEach(item => {
        //     if (item.step == '准备派送') {
        //       isDelivery = true
        //     }
        //   })
        //   if (isDelivery) {
        //     this.$message.warning('司机派送中，不可修改')
        //     return
        //   }
        // }
        // if (data.lastModifyTime && dayjs(data.lastModifyTime).add(data.modifyTimeInterval, 'hour').isAfter(dayjs())) {
        //   let lastModifyTime = dayjs(data.lastModifyTime)
        //   this.$alert(`本运单已在${lastModifyTime.hour()}点${lastModifyTime.minute()}分修改派送时间，请在${Number(lastModifyTime.add(data.modifyTimeInterval, 'hour').hour())}点${lastModifyTime.minute()}分后再次修改。`, '温馨提示', {
        //     confirmButtonText: '确认',
        //     customClass: 'update-delivery-time'
        //   })
        //   return
        // }
        callback && callback({ finalAgingByCalculate, from })
      }
    },
    async handlePickupAppoint() {
      let params = [{
        address: this.convertModel.waybillPickup.address,
        addressType: 20,
        no: this.convertModel.waybillNumber
      }]
      let res = await waybillApi.getWarehouseType(params)
      let warehouseType = '40'
      let reserveInfo = ['4010']
      if (res.code === 0 && res.data && res.data[0].info) {
        warehouseType = res.data[0].info[0].warehouseType
        reserveInfo = res.data[0].info[0].reserveInfo
      }
      
      this.$refs.UploadPickupFile.showDialog({
        //type: res.data[0].info.reserveInfo, // 类型 '4010': 仅显示上传资料、'4020': 仅显示预约时间、'4030': 仅显示预约号、['4010', '4020', '4030']: 显示上传资料、预约号、预约时间
        reserveInfo: reserveInfo,
        warehouseType: warehouseType,
        waybillNo: this.convertModel.waybillNumber, // 运单号
        address: this.convertModel.waybillPickup.address, // 详细地址
        company: this.convertModel.waybillPickup.customerName, // 收件公司
        appointDate: this.convertModel.appointDate || '', //预约时间
        appointNumber: this.convertModel.appointNumber || '', //预约单号
        purchaseNumber: this.convertModel.purchaseNumber || '', //采购单号
        title: this.getTitle(),
        materialFlag: this.routeList.materialFlag,
        preArriveTime: this.routeList.preArriveTime //预计下单时间
      })
    },
    async handleSaveDeliveryData(formData, fn) {
      if (formData) {
        /*
        * 更新数据
        * 如果有预约号和预约时间才调接口保存
        * 否则直接刷新
        * */
        const { appointNumber, purchaseNumber, appointDate, preOrderFlag } = formData
        if (!appointNumber && !purchaseNumber && !appointDate) {
          setTimeout(() => {
            this.$message.success('成功')
            this.freshData()
          }, 1500)
          return
        }
        let params = {
          waybillNumber: this.convertModel.waybillNumber,
          appointNumber: appointNumber + '',
          purchaseNumber: purchaseNumber + '',
          appointDate: appointDate ? dayjs(appointDate + ':00').format('YYYY-MM-DD HH:mm:ss') : '',
          operateSource: '210', // 操作来源，移动端-260 客户端-210
          preOrderFlag
        }
        let res = await waybillApi.updatePickupAppoint(params)
        if (res.code === 0) {
          setTimeout(() => {
            this.$message.success('成功')
            this.freshData()
          }, 1500)
          if (fn && typeof (fn) === 'function') {
            fn()
          }
        }
      } else {
        setTimeout(() => {
          this.$message.success('成功')
          this.freshData()
        }, 1500)
      }
    },
    getTitle() {
      let title = '派货资料'
      switch (this.routeList.materialFlag) {
        case 1:
          title = '上传派货资料'
          break
        case 2:
          title = '查看派货资料'
          break
        case 3:
          title = '上传预约号'
          break
        case 4:
          title = '查看预约号'
          break
      }
      return title
    },
    printCallback() {
      this.$emit('printCallback')
    },
    showSelfSign() {
      this.$refs.selfSignDetail.showDrawer(this.convertModel.waybillNumber)
    },
    contactBusiness() {
      this.$refs.businessContact.toggleVisible(true)
    },
    handlePreference() {
      this.preferenceVisible = true
    },
    closeAppointmentTimeDialog() {
      if (this.closeDeliveryTimeDialogUpdate) {
        this.closeDeliveryTimeDialogUpdate = false
        this.freshData()
      }
    },
    doOpenDeliveryTimeDialog() {
      // 处理用户取消自提后，取消修改派送时间弹窗，需要刷新页面
      this.closeDeliveryTimeDialogUpdate = true
      this.openDeliveryTimeDialog()
    },
    /**
     * 打开修改派货时间修改
     * @param options <需派失效> from<来源>
     */
    openDeliveryTimeDialog(options = { finalAgingByCalculate: '', from: '' }) {
      this.getCargoStorageInfo(this.convertModel.waybillNumber, true, false, {
        ...options,
        callback: this.openDeliveryTimeDone
      })
    },
    async openDeliveryTimeDone({ finalAgingByCalculate, from }) {
      // 派货时效更新
      await this.handleFinalAging(finalAgingByCalculate, from)
      this.$nextTick(() => {
        this.appointmentTimeDialogVisible = true
      })
    },
    /**
     * 获取需派时效
     * @param finalAgingByCalculate
     * @param from 来源
     */
    async handleFinalAging(finalAgingByCalculate, from = '') {
      this.timeDialogInfo.finalAging = ''
      // let result = ''
      // if (!finalAgingByCalculate) {
      //   let res = await preferenceApi.delivery_preference_getFinalAging(this.convertModel.waybillNumber)
      //   if (res.code === 0 && res.data) {
      //     result = res.data.finalAging
      //   }
      // } else {
      //   result = finalAgingByCalculate
      // }
      this.timeDialogInfo.from = from
      this.timeDialogInfo.finalAging = finalAgingByCalculate
    },
    // 派货时间确认回调
    async handleTimeSuccess({ from, deliveryTime } = {}) {
      switch (from) {
        case preferenceFromEnum.DELIVERY:
          // 保存偏好设置
          this.$refs.preferenceWaybillRef?.savePreference(from, {
            deliveryTime,
            callback: async () => {
              await this.getCargoStorageInfo(this.convertModel.waybillNumber, false, false, { updateRoute: false })
            }
          })
          break
        default :
          await this.getCargoStorageInfo(this.convertModel.waybillNumber, false, true)
          break
      }
    },
    branchPick() {
      this.$refs.branchPick.showPoppoer(this.convertModel.waybillNumber, this.routeList.canSelfSufficiency, this.routeList.hasSelfSufficiencyInfo)
    },
    selfSign() {
      this.$confirm('为了保障您的权益，请收到商品确认无误后再确认收货', '温馨提示', {
        confirmButtonText: '确认收货',
        cancelButtonText: '未收到货',
        type: 'warning',
        closeOnClickModal: false,
        showClose: false
      })
        .then(async () => {
          const res = await waybillApi.setSelfSign({
            waybillNumber: this.convertModel.waybillNumber,
            confirmSign: 10
          })
          if (res.code === 0) {
            this.$message.success('确认签收，运输已完成')
            this.freshData()
          }
        })
        .catch(async () => {
          const res = await waybillApi.setSelfSign({
            waybillNumber: this.convertModel.waybillNumber,
            confirmSign: 20
          })
          if (res.code === 0) {
            this.$message.success('已收到您的反馈，请耐心等待')
          }
        })
    }
  },
  provide() {
    return {
      openTimeDialog: this.openDeliveryTimeDialog,
      
      freshRoute: this.freshRoute
    }
  }
}
</script>

<style lang='scss' scoped>
@import "../../style/common";

.waybill-state {
  border: 2px solid #f1f1f5;
  position: relative;
  
  .affect_mark {
    display: block;
    width: 90px;
    height: 90px;
    position: absolute;
    top: 5px;
    right: 20px;
  }
  
  .ydNo {
    background: #faf8ff url('~@/assets/image/global/module-bg.png') no-repeat;
    background-position-x: right;
    background-color: linear-gradient(270deg, #faf8ff, #f2effe);
    height: 36px;
    padding-left: 16px;
    display: flex;
    align-items: center;
    
    .main-ydno {
      font-weight: bold;
      line-height: 30px;
      height: 30px;
      flex-shrink: 0;
      color: $--color-text-primary;
      
      & > span {
        font-weight: bold;
        color: #333333;
      }
      
      // padding-left: 8px;
    }
    
    /deep/ .el-button--text {
      margin: 0 20px 0 8px;
    }
    
    .cut-off {
      display: inline-block;
      width: 1px;
      height: 14px;
      background: #dcdae2;
      margin: 0 16px;
    }
    
    .skew-fill {
      display: inline-block;
      width: 10px;
      height: 100%;
      flex: 0 0 auto;
      background-color: #fff1da;
      transform: skewX(15deg);
      margin-right: -5px;
    }
    
    .warning {
      height: 100%;
      line-height: 36px;
      padding-left: 22px;
      background-color: #fff1da;
      font-size: 12px;
      text-align: left;
      color: #ff8038;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
      
      i {
        color: #ff7d48;
        font-size: 14px;
      }
    }
  }
  
  .status {
    //height: 62px;
    display: flex;
    align-items: center;
    
    .status-img {
      flex-shrink: 0;
    }
    
    .status-text {
      margin-left: -100px;
      padding: 0 30px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      
      span:first-child {
        font-size: 16px;
        font-weight: bold;
        color: #333333;
      }
      
      span:nth-child(2) {
        padding-top: 6px;
        font-size: 14px;
        text-align: left;
      }
      
      b {
        font-size: 12px;
        color: #8F8FA8;
      }
      
      em {
        font-size: 12px;
        color: #ff706d;
        font-style: normal;
      }
    }
    
    .operation-buttons {
      z-index: 2;
      display: flex;
      flex-flow: wrap;
      
      /deep/ .el-button {
        color: #03050d;
        margin-right: 6px;
        margin-left: 6px;
        margin-top: 6px;
        margin-bottom: 6px;
      }
      
      /deep/ .el-button--primary {
        color: #8365f6;
        background: #f2effe;
        border: 1px solid #8365f6;
      }
      
      .gray {
        border-color: #C1C7CF;
        color: #B0B5BB;
      }
    }
  }
  
  .slefSign {
    .slefSign-header {
      height: 54px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      box-shadow: 0px 1px 0px 0px #ffffff inset;
      font-size: 18px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: bold;
      text-align: left;
      color: #03050d;
      line-height: 54px;
      border-bottom: 1px solid #f1f1f5;
      
      .icon-delete-selfSign {
        padding: 0 16px;
      }
      
      .save-self-sign {
        position: absolute;
        right: 20px;
        top: 11px;
      }
    }
    
    .slef-warning {
      padding: 20px 0 0 20px;
    }
    
    .slefSign-content {
      padding: 24px 20px 24px 20px;
      
      &-set {
        margin-top: 20px;
        margin-bottom: 24px;
        height: 88px;
        background: #ffffff;
        border: 1px solid #d6d6d6;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 20px;
        
        .icon-setting-selfSign {
          width: 20px;
          height: 20px;
          padding: 0 18px 0 20px;
        }
        
        &-disabled {
          background-color: #F3F3F3;
        }
        
        /deep/ .el-switch.kye-switch--small {
          &.is-checked {
            .el-switch__core:after {
              margin-left: -20px;
            }
          }
          
          .el-switch__core {
            width: 50px;
            height: 22px;
            
            &:after {
              top: 1;
              width: 20px;
              height: 20px;
            }
          }
        }
      }
      
      .item {
        height: 32px;
        line-height: 32px;
      }
      
      .slef-warning {
        padding: 20px 0 0 20px;
      }
      
      .slefSign-content {
        padding: 24px 20px 24px 20px;
        
        &-set {
          margin-top: 20px;
          margin-bottom: 24px;
          height: 88px;
          background: #ffffff;
          border: 1px solid #d6d6d6;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 20px;
          
          .icon-setting-selfSign {
            width: 20px;
            height: 20px;
            padding: 0 18px 0 20px;
          }
          
          &-disabled {
            background-color: #f3f3f3;
          }
          
          /deep/ .el-switch.kye-switch--small {
            &.is-checked {
              .el-switch__core:after {
                margin-left: -20px;
              }
            }
            
            .el-switch__core {
              width: 50px;
              height: 22px;
              
              &:after {
                top: 1;
                width: 20px;
                height: 20px;
              }
            }
          }
        }
        
        .item {
          height: 32px;
          line-height: 32px;
        }
        
        &-left {
          display: flex;
          align-items: center;
        }
        
        &-text {
          &-16 {
            font-size: 16px;
            font-family: PingFang, PingFang-Heavy;
            font-weight: 800;
            text-align: left;
            color: rgba(51, 51, 51, 0.93);
            line-height: 30px;
          }
          
          &-12 {
            font-size: 12px;
            font-family: PingFangSC, PingFangSC-Regular;
            font-weight: 400;
            text-align: justify;
            color: #666666;
            line-height: 12px;
          }
        }
        
        &-12 {
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: justify;
          color: #666666;
          line-height: 12px;
        }
      }
      
      &-swicth {
        padding-right: 20px;
      }
    }
  }
}

.status-notice{
  margin-bottom: 8px;
}
</style>
<style lang='scss'>
.popover-content {
  display: flex;
  justify-content: space-between;
  
  span {
    font-size: 12px;
    text-align: left;
    color: #ff6262;
    line-height: 17px;
    padding-right: 10px;
  }
  
  i {
    font-size: 10px;
    
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
