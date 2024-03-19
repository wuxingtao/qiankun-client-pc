<template>
  <div class='table-buttons'>
  <el-button type='text' class='el-dropdown-link' :disabled='!customerCode' @click='handleCopy'>
    <svg-icon icon-class='copy' class='icon-copy' />
    <span>复制运单号</span>
  </el-button>
  <el-upload
    v-if='$store.getters.isVipshopUser && [statusEnum.INFORM, statusEnum.PICKUP, statusEnum.ALL].includes(waybillStatus)'
    action='' accept='.xls,.xlsx'
    :show-file-list='false'
    :auto-upload='false'
    :on-change='handleUploadVipshopCode'
    :disabled='canUpdateVipShopCode'>
    <el-button type='text'
               :disabled='canUpdateVipShopCode'>
      <i class='iconfont icon-upload'></i>
      上传入库号
    </el-button>
  </el-upload>
  <span v-if='waybillCustomerSource===customerSourceEnum.SENDED'>
      <el-button type='text'
                 v-show="([statusEnum.INFORM, statusEnum.CANCEL, statusEnum.ALL].includes(waybillStatus)) && $hasPermission('004-c')"
                 :disabled='!customerCode || noInform' @click='noticeForPickup(selectedRows)'>
        <ky-icon type='iconnotice-pickup-button' />
        <span class='mg-l6'>{{waybillStatus===statusEnum.CANCEL?'重新下单':'通知取货'}}</span>
      </el-button>
    <!-- v-if="$hasPermission('070')" -->
       <el-button type='text'
                  v-show="authCodeList.includes('makeUpTag')&&(waybillStatus === statusEnum.INFORM||waybillStatus === statusEnum.PICKUP)"
                  :disabled='!customerCode || isNotInternational' @click='printLabels'>
            <svg-icon icon-class='waybill-print-tag-button' />补打取货标签
          </el-button>

      <el-button type='text' v-if="$hasPermission('004-b')" @click='printWaybill' :disabled='isNotInternational'>
        <ky-icon type='iconwaybill-print-button' />
        <span class='mg-l6'>打单</span>
      </el-button>
      <el-dropdown v-if='!isEncryptField' :class="['export-dropdown mg-l16',progressShow && 'export-dropdown-working']"
                   :disabled='!customerCode' trigger='click' @command='handleCommand'>
        <el-button type='text' class='el-dropdown-link' :disabled='!customerCode'>
          <template v-if='!progressShow'>
            <ky-icon type='iconwaybill-batch-export-button' />
            <span class='mg-l6'>导出</span>
          </template>
          <template v-else>
            <svg-icon icon-class='waybill-batch-export-button-gray' />正在导出
          </template>
        </el-button>
        <waybill-progress v-show='progressShow' ref='progressRef' />
        <el-dropdown-menu slot='dropdown'>
          <el-dropdown-item class='export-dropdown__item' command='all'>全部运单</el-dropdown-item>
          <el-dropdown-item class='export-dropdown__item' command='select'>选中运单</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    <!--引导-->
      <template v-if='guide && steps === 2'>
        <div class='guide_pic'></div>
        <div class='guide_text'>
          <p>1.选择“我寄的”或“我收的”或“转我付款”后，<br />点击[全部运单]，可导出全部状态 下的运单</p>
          <p>2.勾选运单后点击 [选中运单] 导出选中运单</p>
        </div>
        <div class='guide_setting'></div>
        <div class='guide_text_setting'>
          <p>自定义排序</p>
        </div>
      </template>
      <el-button type='text'
                 v-show='[statusEnum.INFORM, statusEnum.PICKUP, statusEnum.ALL].includes(waybillStatus)'
                 :disabled='!customerCode||canCancelOrder'
                 @click='handleCancelShipment(selectedRows)'>
        <ky-icon type='iconwaybill-cancel-button' />
        <span class='mg-l6'>取消运单</span>
      </el-button>
      <el-button type='text' v-show='waybillStatus === statusEnum.CANCEL'
                 :disabled='isNotInternational'
                 @click='handleDeleteWaybill(selectedRows)'>
        <ky-icon type='iconwaybill-delete-button' />
        <span class='mg-l6'>删除运单</span>
      </el-button>
      <el-button class='mg-l16' type='text' v-show='waybillStatus!==statusEnum.CANCEL' :disabled='isNotInternational' @click='copyWaybill'>
        <ky-icon type='iconwaybill-copy-button' />
        <span class='mg-l6'>再来一单</span>
      </el-button>
    
    <!-- <el-button type='text'
               :disabled='!customerCode' @click='printLabels(selectedRows, queryData)'>
      <svg-icon icon-class='waybill-print-tag-button' />打印标签
    </el-button> -->
    </span>
  <el-button type='text' v-if='waybillCustomerSource!==customerSourceEnum.SENDED' @click='printWaybill'>
    <ky-icon type='iconwaybill-print-button' />
    <span class='mg-l6'>打单</span>
  </el-button>
  <el-dropdown v-if='waybillCustomerSource!==customerSourceEnum.SENDED && !isEncryptField'
               :class="['export-dropdown mg-l16',progressShow && 'export-dropdown-working']"
               :disabled='!customerCode' trigger='click' @command='handleCommand'>
    <el-button type='text' class='el-dropdown-link' :disabled='!customerCode'>
      <template v-if='!progressShow'>
        <ky-icon type='iconwaybill-batch-export-button' />
        <span class='mg-l6'>导出</span>
      </template>
      <template v-else>
        <svg-icon icon-class='waybill-batch-export-button-gray' />
        正在导出
      </template>
    </el-button>
    <waybill-progress v-show='progressShow' ref='progressRef' />
    <el-dropdown-menu slot='dropdown'>
      <el-dropdown-item class='export-dropdown__item' command='all'>全部运单</el-dropdown-item>
      <el-dropdown-item class='export-dropdown__item' command='select'>选中运单</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
  <el-button class='mg-l16' type='text' @click='copyWaybill' v-if='waybillCustomerSource!==customerSourceEnum.SENDED'>
    <ky-icon type='iconwaybill-copy-button' />
    <span class='mg-l6'>再来一单</span>
  </el-button>
  <print-view ref='printView' />
  <notice-pickup ref='noticePickupRef' />
  <print-label ref='printLabel' />
  </div>
</template>

<script>
import { affectTextEnum, affectTypeEnum } from '@/views/waybill/enum/affectEnum'

const Clipboard = require('clipboard')

import { KyIcon } from '@comps'
import PrintView from '@/views/waybill/components/print-view'
import NoticePickup from './notice-pickup'
import { PrintLabel } from '@/views/waybill/components/detail'
import waybillProgress from './waybill-progress'
import waybillApi from '@/services/api/waybill'
import deliveryWaybill from '@/services/api/delivery'
import { mapGetters, mapState } from 'vuex'
import { getCustomerCode, getPhone } from '@/utils/storage'
import {
  customerSourceEnum,
  needFeeFlagEnum,
  queryModeEnum,
  queryTypeEnum,
  statusEnum
} from '@/views/waybill/enum/queryEnum.js'
import exportServe from '@utils/export/ExportServe'
import { readExcel } from '@utils/clientUtil'
import REGULAR from '@utils/regular'
import customerSource from '../config/customerSource'

export default {
  name: 'waybill-operation-buttons',
  props: {
    waybillStatus: {
      type: String,
      require: true
    },
    waybillCustomerSource: {
      type: String,
      require: true
    },
    selectedRows: {
      type: Array
    },
    guide: {
      type: Boolean,
      default: false
    },
    steps: {
      type: Number,
      default: 0
    }
  },
  components: {
    KyIcon,
    PrintView,
    NoticePickup,
    PrintLabel,
    waybillProgress
  },
  activated() {
    this.exportWorkFlow()
  },
  data() {
    return {
      statusEnum,
      customerSourceEnum,
      progressShow: false, // 是否展示进度条
      loadingOfUploadVipshopCode: false,
      customerSource,
    }
  },
  methods: {
    //刷新
    queryData() {
      this.$emit('handleQueryData')
    },
    //通知取货
    async noticeForPickup(waybills) {
      let title= this.waybillStatus===this.statusEnum.CANCEL?'重新下单':'通知取货'
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: title
      })

      if (this.checkWaybillsEmpty(waybills, title)) {
        return
      }
      const canNotice = waybills.some(i => i.limitType !== affectTypeEnum.LIMIT)
      if(!canNotice) {
        const { limitReason } = waybills.find(i => i.limitType === affectTypeEnum.LIMIT)
        const text = affectTextEnum[limitReason]
        return this.$message.warning(`所选运单因${text}管控不可下单`)
      }
      const flag = await this.$refs.noticePickupRef.showDialog(waybills)
      if (flag) {
        this.queryData()
      }
    },
    copyWaybill() {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '再来一单'
      })
      if (!this.selectedRows || this.selectedRows.length < 1) {
        this.$message.warning('请选择需要再下一单的运单')
        return
      }
      const params = { isCopy: true }
      if (this.selectedRows.length === 1) {
        params.ydNo = this.selectedRows[0].waybillNumber
      } else {
        params.ydNoList = this.selectedRows.map(m => m.waybillNumber)
      }
      this.$router.push({ name: 'delivery', params })
    },
    async printWaybill() {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '打单'
      })
      const waybills = this.selectedRows
      if (this.checkWaybillsEmpty(waybills, '打印')) {
        return
      }
      const flag = await this.$refs.printView.showDialog(waybills)
      if (flag) {
        this.queryData()
      }
    },
    //删除运单
    async handleDeleteWaybill(waybills) {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '删除运单'
      })
      if (this.checkWaybillsEmpty(waybills, '删除')) {
        return
      }
      this.$kye_message.confirm('是否删除该运单？', '删除该运单', {
        type: 'warning'
      }).then(async () => {
        try {
          this.$emit('updateLoading', true)
          const params = {
            waybillNumbers: waybills.map(el => {
              return el.waybillNumber
            }),
            operateType: '10',
            cancelSource: '210',
            cancelMobile: getPhone(),
            customerCode: getCustomerCode()
          }
          let res = await waybillApi.deleteWaybill(params)
          if (res.code === 0) {
            this.$message.success('删除成功')
            this.queryData()
          } else {
            this.$emit('updateLoading', false)
          }
        } catch {
          this.$emit('updateLoading', false)
        }
      })
      
    },
    //检查数据
    checkWaybillsEmpty(waybills, type) {
      if (!waybills || waybills.length < 1) {
        this.$message.warning(`请选择需要${type}的数据`)
        return true
      }
    },
    //取消发货
    async handleCancelShipment(waybills) {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '取消运单'
      })
      if (this.checkWaybillsEmpty(waybills, '取消运单')) {
        return
      }
      // 只有待揽件需要确认空跑费
      const waybillNumbers = waybills
        .filter(i => {
          return i.waybillStatus === Number(this.statusEnum.PICKUP)
        })
        .map(m => {
          return m.waybillNumber
        })
  
      let msg = '取消后,将不再为本运单提供运输服务,请确认是否取消?'
      if(waybillNumbers.length) {
        const data = await waybillApi.batchEmptyRunningFee(waybillNumbers)
        if (data.code === 0 && data.data.needFeeFlag === needFeeFlagEnum.NEED_FEE_FLAG) {
          msg = '司机即将到达取货地点，可能会产生空跑费，请确认是否取消?'
        }
      }
      
      this.$kye_message.confirm(msg, {
        customClass: 'cancel-message',
        confirmButtonText: '狠心取消',
        confirmButtonClass: 'confirm-button',
        cancelButtonText: '我再想想',
        cancelButtonClass: 'cancel-button'
      }).then(async () => {
        try {
          this.$emit('updateLoading', true)
          const inform = []
          const pickup = []
          waybills.forEach(i => {
            if(i.waybillStatus === Number(this.statusEnum.INFORM)) {
              inform.push(i.waybillNumber)
            }
            if(i.waybillStatus === Number(this.statusEnum.PICKUP)) {
              pickup.push(i.waybillNumber)
            }
          })
          let res = await waybillApi.batchCancelWaybill([
            { waybillNumbers: inform, waybillStatus: this.statusEnum.INFORM },
            { waybillNumbers: pickup, waybillStatus: this.statusEnum.PICKUP }
          ])
          if (res.code === 0) {
            this.$message.success('取消运单成功')
            this.queryData()
          } else {
            this.$emit('updateLoading', false)
          }
        } catch {
          this.$emit('updateLoading', false)
        }
      })
    },
    // 导出切换
    handleCommand(command) {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '导出'
      })
      let params = {}
      const {
        customerCodes = [],
        phones,
        queryMode,
        generalQuery = {},
        smallQuery = [],
        waybillStatus = [],
        waybillCustomerSource = []
      } = this.waybillSearchParams
      const includeColumn = []
      const headNames = []
      const visibleTableColumns = this.visibleTableColumns
      for (let i = 0; i < this.visibleTableColumns.length; i++) {
        if (visibleTableColumns[i].prop) {
          includeColumn.push(visibleTableColumns[i].prop.charAt(0).toLowerCase() + visibleTableColumns[i].prop.slice(1)).toString() // 展示列字段)
        }
        if (visibleTableColumns[i].text) {
          headNames.push(visibleTableColumns[i].text)
        }
      }
      if (command === 'all') {
        const statusList = {
          '10': {
            label: '待通知取货',
            key: 'stayInformedCount'
          },
          '20': {
            label: '待揽件',
            key: 'stayTookCount'
          },
          '30': {
            label: '待签收',
            key: 'staySignCount'
          },
          '40': {
            label: '已签收',
            key: 'signCount'
          },
          '50': {
            label: '已取消',
            key: 'cancelCount'
          },
          '': {
            label: '全部',
            key: 'allCount'
          }
        }
        const $parentStatus = this.$parent.waybillStatus || {}
        const currentCount = $parentStatus[statusList[this.waybillStatus]?.key] || 0
        if (currentCount === 0) {
          this.$message.error('抱歉，您没有选中任何运单，无法导出')
          return
        }
        
        const tipText = `您已经选择【${statusList[this.waybillStatus]?.label}】所有运单， 共${currentCount}条运单，确定导出吗？`
        this.$kye_message.confirm(tipText).then(() => {
          params = {
            ...this.waybillSearchParams,
            waybillStatus: waybillStatus,
            waybillCustomerSource: waybillCustomerSource,
            queryMode,
            generalQuery,
            customerCodes,
            phones,
            smallQuery,
            includeColumn: includeColumn.toString(),
            headNames: headNames.toString()
          }
          this.exportWaybills(params)
        })
      } else if (command === 'select') {
        if (!this.selectedRows || this.selectedRows.length === 0) {
          this.$message.error('您未选中任何运单，请先勾选要导出的运单')
          return
        }
        const tipText = `您已经选择${this.selectedRows.length}条运单，确定导出吗？`
        this.$kye_message.confirm(tipText).then(() => {
          params = {
            ...this.waybillSearchParams,
            waybillStatus: waybillStatus,
            waybillCustomerSource: waybillCustomerSource,
            queryMode: queryModeEnum.SMALL,
            customerCodes,
            generalQuery,
            smallQuery: [{
              conditionInput: this.selectedRows.map(item => {
                return item.waybillNumber
              }),
              conditionType: queryTypeEnum.OTHER
            }],
            includeColumn: includeColumn.toString(),
            headNames: headNames.toString()
          }
          this.exportWaybills(params)
        })
      }
    },
    // 复制运单
    handleCopy() {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: this.getCustomerSourceText,
        second_module: this.getWaybillStatusText,
        button_name: '复制运单号'
      })
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.error('您未选中任何运单，请先勾选要复制的运单')
        return
      }
      const tipText = `您已经选择${this.selectedRows.length}条运单，确定复制吗？`
      this.$kye_message.confirm(tipText)
        .then(() => {
          const data = this.selectedRows.map(i => {
            return i.waybillNumber
          }).join(',')
          this.silentCopy(data)
        })
        .catch(() => {
          // 报错处理
        })
    },
    silentCopy(data) {
      const copyBtn = document.createElement('a')
      copyBtn.id = 'fakeBtn'
      copyBtn.href = 'javascript:;'
      copyBtn.style.display = 'none'
      document.body.appendChild(copyBtn)
      const clipboard = new Clipboard('#fakeBtn')
      clipboard.text = () => data
      clipboard.on('success', () => {
        this.$message({
          message: '复制成功',
          type: 'success',
          duration: 1500
        })
      })
      clipboard.on('error', () => {
        this.$message({
          message: '复制失败',
          type: 'error'
        })
      })
      document.getElementById('fakeBtn').click()
      document.body.removeChild(copyBtn)
    },
    async exportWaybills(params) {
      this.progressShow = true
      // this.$refs.progressRef.progressInit(true)
      let res = exportServe.startExport(params, this)
      console.log(res)
      // if (res.code === 0 && res.data) {
      //   window.open(res.data.fileUrl)
      //   this.$refs.progressRef.progressInit(false, () => {
      //     this.progressShow = false
      //   })
      // } else {
      //   this.$message.error(res.msg || '请求错误')
      //   this.$refs.progressRef.progressInit(false, () => {
      //     this.progressShow = false
      //   })
      // }
      
    },
    exportWorkFlow() {
      exportServe.workFlow()
    },
    printLabels() {
      const waybills = this.selectedRows
      if (!waybills || waybills.length < 1) {
        this.$message.warning('请选择需要打印小标签的运单信息')
        return
        
      }
      if (waybills.length > 1) {
        this.$message.warning('补打标签只能操作单个运单信息')
        return
      }
      console.log(waybills, 'waybills')
      if (waybills[0].parentNumber) {
        this.$message.warning('子母单不支持打印货标签')
        return
      }
      const flag = this.$refs.printLabel.showDialog(waybills)
      if (flag) {
        this.queryData()
      }
    },
    closeOverlay() {
      this.$emit('close-overlay')
    },
    async handleUploadVipshopCode(file) {
      try {
        this.loadingOfUploadVipshopCode = true
        let { jsonData, msg } = await readExcel(file)
        if (msg || !jsonData.length) {
          this.$message.warning(msg || '你选择的Excel表格没有数据，请重新选择')
          return
        }
        const passList = jsonData.filter(f => REGULAR.vipshopCode.test(f['入库号'])).map(m => ({
          waybillNumber: m['运单号'],
          productCode: m['入库号']
        }))
        const errorList = jsonData.filter(f => !REGULAR.vipshopCode.test(f['入库号']))
        if (passList.length < 1) {
          this.$message.warning('没有符合规则的入库号，请检查')
          return
        }
        let res = await deliveryWaybill.uploadVipshopCode(passList)
        if (res.code === 0) {
          if (errorList.length > 0) {
            // this.$confirm('导入成功,但存在不符合要求的入库号，是否导出不符合要求的入库号？', '提示', { type: 'info' }).then(() => {
            //   exportExcel({ jsonData: errorList, filename: '不规则的入库号' })
            // })
            this.$alert('导入成功,但存在不符合要求的入库号', '提示', {
              confirmButtonText: '确定',
              callback: () => {
              }
            })
          }
          this.$message.success('导入成功')
          this.queryData()
        }
      } finally {
        this.loadingOfUploadVipshopCode = false
      }
    }
  },
  computed: {
    ...mapGetters([
      'serviceWay',
      'payCustomerInfo',
      'goodsBatchTimes',
      'isEncryptField'
    ]),
    ...mapState('waybill', ['waybillSearchParams', 'visibleTableColumns', 'exportStatus']),
    customerCode() {
      return getCustomerCode()
    },
    isNotInternational() {
      // 国际件不能展示的按钮
      if (!this.selectedRows) return false
      return (this.selectedRows.some(i => i.waybillBusinessRange === 10))
    },
    noInform() {
      /**
       * 是否置灰通知司机取货
       * 待通知、待取消以外的运单
       * 非国际件运单
       * */
      if (!this.selectedRows.length) return false
      return this.selectedRows.some(i => {
        return ((i.waybillStatus !== Number(statusEnum.INFORM) && i.waybillStatus !== Number(statusEnum.CANCEL)) || this.isNotInternational)
      })
    },
    canCancelOrder() {
      // 是否置灰取消运单
      if (!this.selectedRows.length) return false
      // return (this.selectedRows.some(i => i.waybillStatus !== Number(statusEnum.PICKUP)) || this.isNotInternational)
      return (this.selectedRows.some(i => i.waybillStatus !== Number(statusEnum.PICKUP) && i.waybillStatus !== Number(statusEnum.INFORM))|| this.isNotInternational)
    },
    canUpdateVipShopCode() {
      // 是否置灰上传入库号
      if (!this.selectedRows.length) return false
      return (this.selectedRows.some(i => i.waybillStatus !== Number(statusEnum.PICKUP) && i.waybillStatus !== Number(statusEnum.INFORM)) || this.isNotInternational)
    },
    ...mapState('auth', ['authCodeList']),
    getCustomerSourceText() {
      const obj = this.customerSource.find(i => i.value === this.waybillCustomerSource)
      return obj.label
    },
    getWaybillStatusText() {
      switch (this.waybillStatus) {
        case '10':
          return '待通知取货'
        case '20':
          return '待揽件'
        case'30':
          return '待签收'
        case'40':
          return '已签收'
        case '50':
          return '已取消'
        case'':
          return '全部'
      }
    }
  },
  watch: {
    // 监听导出状态
    exportStatus(val) {
      if (val && val !== 'WORKING') {
        setTimeout(() => {
          this.progressShow = false
        }, 500)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.table-buttons {
  margin: 8px 0 10px;
  display: flex;
  justify-content: flex-end;
  position: relative;
  
  .mg-l16 {
    margin-left: 16px;
  }
  
  .mg-l6 {
    margin-left: 6px;
  }
  
  .btn_print {
    color: #8365f6;
    border-color: #8365f6;
    width: 80px;
  }
  
  .svg-icon {
    padding-right: 8px;
  }
  
  .is-disabled {
    .iconfont {
      color: #C0C4CC;
    }
  }
  
  .icon-copy {
    padding-right: 6px;
  }
  
  /deep/ {
    .el-button {
      @extend .mg-l16;
      padding: 6px 8px;
      border-radius: 2px;
      font-size: 12px;
      
      &:hover {
        background-color: #F1EEFD;
      }
    }
  }
  
  .export-dropdown {
    // margin: 0 -8px 0 20px;
    &.export-dropdown-working {
      margin: 0 0 0 28px;
      background: #f3f3f3;
      color: #666666;
      border-radius: 2px;
      pointer-events: none;
      
      .el-button {
        color: inherit;
      }
    }
    
    .el-dropdown-link {
      margin: 0;
    }
  }
  
  /deep/ .export-dropdown__item {
    width: 75px;
  }
}

/deep/ .export-dropdown__item {
  width: 75px;
}

.guide_pic {
  width: 146px;
  height: 124px;
  position: absolute;
  top: -2px;
  right: 154px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/operation-buttons-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.guide_text {
  width: 399px;
  height: 169px;
  position: absolute;
  top: 106px;
  right: 154px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/operation-buttons-text-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 68px 0 0 17px;
  box-sizing: border-box;
  
  p {
    font-size: 16px;
    text-align: left;
    color: #ffffff;
    line-height: 25px;
    
    &:first-child {
      margin-bottom: 16px;
    }
  }
}

.guide_setting {
  width: 84px;
  height: 58px;
  position: absolute;
  top: 27px;
  right: -20px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/guide-pic-setting-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.guide_text_setting {
  width: 112px;
  height: 49px;
  position: absolute;
  top: 95px;
  right: -20px;
  z-index: 2000;
  background-image: url("~@assets/image/waybill/guide-setting-text-bg.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 18px 0 0 12px;
  box-sizing: border-box;
  
  p {
    font-size: 16px;
    text-align: left;
    color: #ffffff;
    line-height: 25px;
  }
}
</style>
<style lang='scss'>
.cancel-message {
  .el-message-box__btns {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    text-align: right;
  }
  
  .confirm-button {
    width: 82px;
    height: 32px;
    padding: 0 !important;
    line-height: 32px;
    text-align: center;
    color: #333333 !important;
    background: #fff !important;
    border: 1px solid #DCDFE6 !important;
    
    &:hover {
      color: #8365f6 !important;
      border-color: #dad1fc !important;
      background-color: #f3f0fe !important;
    }
  }
  
  .cancel-button {
    width: 82px;
    height: 32px;
    padding: 0 !important;
    line-height: 32px;
    text-align: center;
    background: #8365f6 !important;
    color: #ffffff !important;
  }
}
</style>
