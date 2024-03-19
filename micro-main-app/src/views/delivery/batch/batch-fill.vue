<template>
  <div class='fill-batch-continer' v-loading='loadingAddRows'>
    <single-info-sender ref='senderInfoRef' :tempShareData.sync='shareData' :tempFormData.sync='formData' is-batch-fill @senderInfoInputValueChange='handleSenderInfoChange' />
    <dialog-coupon-list ref='dialogCouponListRef' @save='handleDialogCouponSave' />
    <div class='receiver-info-wrapper'>
      <single-info-header icon='icon-receiver' title='收方信息'>
        <template #title>
          <div class='title ellipsis'>
            收方信息
            <span class="title-tip">填写手机号更方便派货</span>
          </div>
        </template>
        <template #default>
          <div class='address-book'>
            <el-button type='text' size='mini' @click='parseAddressInfoClick'>
              <i class='iconfont icon-parse-address icon-btn' />智能填写
            </el-button>
            <el-button type='text' size='mini' @click='showVisibleOfaddressBook'>
              <i class='iconfont icon-address-book icon-btn' />从地址簿选择
            </el-button>
          </div>
        </template>
      </single-info-header>
      <div class='table-wrapper'>
        <ky-ui-tip class='mt_10' type='error' v-show='errorSummary.errorCount > 0'>
          <span>有&nbsp;{{ errorSummary.errorCount }}&nbsp;处错误，请修改</span>
        </ky-ui-tip>
        <div class='row-summary flex flex_jc_b'>
          <div>
            共有&nbsp;
            <span style='color: #7c57df;'>{{ $refs.tableEditableRef && $refs.tableEditableRef.totalRowCount }} 票</span>&nbsp;运单
          </div>
          <div class='flex flex_ai_c'>
            <div class=' btn_icon' @click='addReceiverInfo'>
              <i class="iconfont icon-add" />新增
            </div>
          </div>
        </div>
        <table-editable ref='tableEditableRef' class='editable-table delivery-batch__table-editable' empty-text='您未添加收件地址' :tableColumns='tableColumns' :loading.sync='loading' :fixedColumnWidth="fixedColumnWidth" :height='tableHeight' :verifyRules='verifyRules' :errorSummary.sync='errorSummary' @on-modify-row='modifyTableRow' @on-delete-row='deleteTableRow' @value-change='onTableValueChange' :sort-by-error-count='false' @scroll-change='handleTableScroll'>
          <div slot='empty'></div>
          <template v-slot:columns-fixed='{row}'>
            <batch-columns-fixed :row='row' is-batch-fill/>
          </template>
          <template v-slot:header_coupon>
            <div style='position:relative;'>
              <el-tooltip :disabled='!couponTitleTip' placement='bottom-start' effect='light' content='寄方信息已发生变化，请重新选择优惠券' v-model='couponTitleTip'>
                <span>优惠券</span>
              </el-tooltip>
            </div>
          </template>
          <template v-slot:header_declaredValue>
            <header-declared-value />
          </template>
          <template v-slot:column_coupon='{ row }'>
            <batch-coupon :value='row.coupon.value' :loading='row.loading' ref='batchCouponRef' @select='handleSelectCoupon(row)' @update='handleSelectCoupon(row)' />
          </template>
          <template v-slot:columns--common={row,col}>
            <batch-columns-common :row='row' :col='col' is-batch-fill :tableEditableRef='tableEditableRef' @change='handleCellSelectChange' @custom-event='handleColumnCustomEvent' />
          </template>
        </table-editable>
      </div>
    </div>
    <batch-footer :loading.sync='loading' :getTableModelData='getTableModelData' :getModelList="getModelList" :saveData='saveData' :totalEstimateFreight='totalEstimateFreight' @on-close="$emit('on-close')" :reset='resetWithoutTip' @on-refill='handleReimport' @updateTableData="updateTableData" ref="batchFooterRef">
      <el-button @click='reset' :loading='loading'>清空</el-button>
    </batch-footer>

    <dialog-single-receiver ref='dialogSingleReceiverRef' />
    <dialog-address :visible.sync='visibleOfaddressBook' addressType='20' :multiSelect='true' @on-confirm='addReceiverInfoByAddressBook($event, true)' />
    <parse-address-info ref='parseAddressInfoRef' :callbackFunc='addReceiverInfoByAddressBook' />
    <dialog-super-zone ref='dialogSuperZoneRef' />
    <dialog-address-restrict ref='dialogAddressRestrictRef'/>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import BatchCoupon from '../components/batch-coupon'
import { reactive, ref, watch, onMounted, onUnmounted, nextTick, toRefs } from '@vue/composition-api'
import BatchMinx from './mixins/batch'

import DialogAddress from '@/views/address-book/components/dialog-address'
import SingleInfoSender from '../components/single-info-sender'
import DialogSingleReceiver from '../components/dialog-single-receiver'
import ParseAddressInfo from '../components/parse-address-info'
import SingleInfoHeader from '../components/single-info-header'
import { KyUiTip } from '@comps/ky-ui'

import DialogCouponList from '../components/dialog-coupon-list'

import defaultConfigUtil from '../utils/defaultConfigUtil'
import batchImportUtil from '../utils/batch-import'
import * as formDataUtil from '../utils/formData'

import useBatchValidateRules from './hooks/useBatchValidateRules'
import useBatchModel from './hooks/useBatchModel'
import useBatch from './hooks/useBatch'
import useBatchFreight from './hooks/useBatchFreight'
import useSupplier from '../hooks/useSupplier'
import useCoupon from './hooks/useCoupon'
// import useSingleWareHouse from '../hooks/useSingleWareHouse'
import useSingleSender from '../hooks/useSingleSender'
import commonUtil from '../utils/commonUtil.js'
import DialogAddressRestrict from '../components/dialog-address-restrict'

export default {
  mixins: [BatchMinx],
  components: {
    BatchCoupon,
    SingleInfoSender,
    DialogSingleReceiver,
    DialogAddress,
    ParseAddressInfo,
    SingleInfoHeader,
    DialogCouponList,
    KyUiTip,
    DialogAddressRestrict
  },
  setup (props, { root }) {
    const tableEditableRef = ref(null)
    const dialogSingleReceiverRef = ref(null)
    const senderInfoRef = ref(null)
    const dialogSuperZoneRef = ref(null)
    const freightDetailRef = ref(null)

    const batchCouponRef = ref(null)
    const dialogCouponListRef = ref(null)
    const dialogAddressRestrictRef = ref(null)

    const couponTitleTip = ref(false)
    const tableHeight = ref(100)
    const loading = ref(false)
    const loadingAddRows = ref(false)
    const couponLoading = ref(false)
    const errorSummary = ref({})

    const tableColumns = reactive(batchImportUtil.getCopyOfTableColumns())
    const totalEstimateFreight = ref({})

    const shareData = ref(formDataUtil.getShareData())
    const formData = ref(formDataUtil.getFormData())
    const batchFooterRef = ref(null)
    const state = reactive({
      fixedColumnWidth:210,
      visibleOfaddressBook: false
    })

    const senderColumns = [
      'jjCompany',
      'jjContactPerson',
      'sms',
      'jjTelePhone',
      'backMobile',
      'qhContactPerson',
      'qhContactWay',
      'qhAddress',
      'qhTelePhone'
      // 'jjRemark',
    ]

    const { changeTableData, getSelectedCoupons, getListTicketsByOrder } = useCoupon({
      vm: root,
      tableEditableRef,
      totalEstimateFreight
    })
    const { loadSupplierOrdersInBatchFill } = useSupplier()
    const { verifyRules, setVerifyImportDataResult } = useBatchValidateRules({
      vm: root,
      tableColumns,
      tableEditableRef,
      senderInfoRef,
      totalEstimateFreight
    })
    const { changToModelList, changToModeWithParseAddress, updateTableData } = useBatchModel({tableEditableRef})
    const { calculateTotalEstimateFreight } = useBatchFreight({ vm: root, tableEditableRef, totalEstimateFreight })
    const {
      resetTableData,
      initTableColumnsProperties,
      handleTableValueChange,
      setTableInputPropertyOnValueChange,
      setTableColoumnsProperty,
      getModelList,
      loadServiceWayOptions,
      reloadServiceWayOptions,
      saveTableData,
      handleDeliverModeChange,
      isTheSameBatch,
      checkTableData
    } = useBatch({
      vm: root,
      loading,
      tableColumns,
      verifyRules,
      tableEditableRef,
      errorSummary,
      setVerifyImportDataResult,
      dialogSuperZoneRef,
      totalEstimateFreight,
      dialogAddressRestrictRef
    })
    const { validateSenderAddressRestrict } = useSingleSender()
    // const { isWareHouseVisible } = useSingleWareHouse({
    //   vm: root, formData, shareData
    // })

    watch(errorSummary, ({ errorRowCount: newCount }, { errorRowCount: oldCount }) => {
      if ((newCount > 0 && oldCount < 1) || (newCount < 1 && oldCount > 0)) {
        setTableHeight()
      }
    }, { deep: true })

    const setTableHeight = debounce(function () {
      let clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      let height = clientHeight - 490 - (errorSummary.value.errorRowCount > 0 ? 51 : 0)
      // height -= isWareHouseVisible.value ? 60 : 0
      tableHeight.value = height > 260 ? height : 260
    }, 50)

    const init = async () => {
      resetTableData()
      initTableColumnsProperties()
      setTableColoumnsProperty('coupon', 'hide', false)
      setTableColoumnsProperty(senderColumns, 'hide', true)
      setTableColoumnsProperty('isSignSelf', 'hide', !root.$store.getters.isSignBySelf)
      tableEditableRef.value.initTableData()
      loadSupplierOrderInfo()
      await defaultConfigUtil.loadDataBatch(formData.value, root)
      setTimeout(() => { //处理地址控件赋值延迟问题
        validateSenderAddress()
        senderInfoRef.value.validateSingleSenderAddressRestrict()
      }, 300)
    }

    const checkSenderAddressList = () => {
      setTimeout(() => {
        senderInfoRef.value.checkSenderAddressList(true)
      }, 500)
    }

    onMounted(() => {
      if (!props.supplierOrderList || props.supplierOrderList.length < 1) {
        init()
      }
      setTableHeight()
      window.addEventListener('resize', setTableHeight)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', setTableHeight)
    })

    const validateSenderAddress = async () => {
      const editableTableData = tableEditableRef.value.editableTableData
      if (editableTableData.length > 0) {
        return
      }
      await validateSenderAddressRestrict(senderInfoRef, formData.value)
    }
    const addRowsToEditableTable = async (rows, loadCoupon, isFromAddressBook, serviceWayOptions) => {
      try {
        if (rows.length + tableEditableRef.value.editableTableData.length > 1000) {
          root.$message.warning('批量填写总行数不能超过1000行')
          return
        }
        const deliveryBatchId = root.$store.state.delivery.deliveryBatchId
        loading.value = true
        const noList = tableEditableRef.value.editableTableData.map(m => m.no.value)
        let maxNo = 0
        if (noList.length > 0) {
          maxNo = Math.max(...noList)
        }

        //补全缺少的字段
        rows.forEach((row, index) => {
          row.no = maxNo + index + 1
          tableColumns.forEach(col => {
            row[col.prop] = row[col.prop] || ''
          })
        })
        const xTableRef = tableEditableRef.value.$refs.xTable
        await tableEditableRef.value.addTableRows(rows)
        xTableRef.refreshColumn()
        if (!isTheSameBatch(deliveryBatchId)) {
          return
        }
        const modelList = changToModelList(rows, true)

        if (rows.length === 1 && serviceWayOptions && serviceWayOptions.length > 0) {
          const row = tableEditableRef.value.editableTableData.find(r => r.no.value === rows[0].no)
          row.serviceWay.options = serviceWayOptions
        } else {
          await loadServiceWayOptions(modelList, isFromAddressBook)
        }

        if (!isTheSameBatch(deliveryBatchId)) {
          return
        }
        await setVerifyImportDataResult({ modelList })
        if (!isTheSameBatch(deliveryBatchId)) {
          return
        }
        tableEditableRef.value.setErrorCountAndSort()
        nextTick(() => {
          xTableRef.refreshScroll()
        })
        const editableTableData = tableEditableRef.value.editableTableData
        if (editableTableData.some(r => r.goods.errorInfo.includes('违禁品'))) {
          const msg =
              '您的托寄物包含违禁品,请确保您运单上填写的托寄物与内件物品一致，否则造成退货、扣款、罚款等责任将全部由您承担！'
          root.$message.warning(msg)
        }
        /** 加载优惠券数据 */
        if (loadCoupon) {
          loadViewbledTableData()
        }
      } finally {
        loading.value = false
      }
    }

    const loadSupplierOrderInfo = async () => {
      // if(root.$store.state.supplier.existSupplierInfo){
      //   const col = tableColumns.find(f => f.prop === 'goods')
      //   if (col) {
      //     root.$set(col, 'defaultSlot', 'column_goods')
      //   }
      // }
      const rows = loadSupplierOrdersInBatchFill(formData.value, props.supplierOrderList)
      if (!rows || rows.length < 1) {
        return
      }
      await addRowsToEditableTable(rows, false, true)
    }

    const VALIDATE_KEYS = ['serviceWay', 'qhAddress', 'sjAddress', 'weight', 'payWay']
    const EXTEND_KEYS = ['payAccount', 'count', 'sizeList', 'declaredValue', 'dsMoney', 'receiptFlag', 'mjWay']


    const onTableValueChange = async ({ fieldName, row, isInit, isValid }) => {
      await handleTableValueChange({ fieldName, row, isInit, isValid })
      /** 只在当前行编辑时触发 */
      if (!isInit) {
        const data = tableEditableRef.value.editableTableData
        const filterCoupons = await getSelectedCoupons(data, row)
        let fields = VALIDATE_KEYS
        if (root.$store.getters.hasFrightFeeAuth && row.estimateFreight.value.waybillAmount) {
          fields = [...VALIDATE_KEYS, ...EXTEND_KEYS]
        }
        // 表格内编辑
        for (let i = 0; i < fields.length; i++) {
          const item = fields[i]
          if (item === fieldName) {
            await getListTicketsByOrder(row, filterCoupons, 'edit', () => {
              loadViewbledTableData()
            })
          }
        }
      }

      /** 编辑项验证错误 */
      if (row[fieldName].errorInfo) {
        return
      }
    }

    /** 单个地址新增 */
    const addReceiverInfo = async () => {
      if(!await checkSenderAddressRestrict()){
        return
      }
      const data = tableEditableRef.value.editableTableData
      const filterCoupons = await getSelectedCoupons(data)
      const {
        formData: result,
        serviceWayOptions
      } = await dialogSingleReceiverRef.value.showDialog(formData.value, null, filterCoupons)
      if (result) {
        await addRowsToEditableTable([result], true, false, serviceWayOptions)
      }
    }

    /** 操作-删除 */
    const deleteTableRow = async () => {
      calculateTotalEstimateFreight()
      loadViewbledTableData()
    }

    /** 操作-修改 */
    const modifyTableRow = async ({ row }) => {
      window.couponAddmode = true
      const data = tableEditableRef.value.editableTableData
      const filterCoupons = await getSelectedCoupons(data, row)
      const modifyFormData = await changToModeWithParseAddress(row, 'sjAddress')
      const {
        formData: model,
        serviceWayOptions
      } = await dialogSingleReceiverRef.value.showDialog(modifyFormData, row, filterCoupons, formData.value)


      if (model) {
        const columns = tableColumns.filter(c => !senderColumns.includes(c.prop))
        columns
          .filter(c => row[c.prop])
          .forEach(c => {
            row[c.prop].value = model[c.prop]
            setTableInputPropertyOnValueChange({ fieldName: c.prop, row })
          })
        row.serviceWay.options = serviceWayOptions

        await setVerifyImportDataResult({ modelList: [model] })
        if (model.coupon) {
          model.coupon = { ...model.coupon, estimateFreight: true }
          if (model.estimateFreight) {
            const result = commonUtil.getEstimateTotalFreight(model.coupon, model.estimateFreight)
            /** 减去优惠金额后的预估运费 */
            model.estimateFreight.afterDiscountAmount = result
            /** 优惠金额 */
            model.estimateFreight.reduceAmount = model.coupon.reduceAmount
          }
        } else {
          // model.coupon = {}
          if (model.estimateFreight) {
            /** 无优惠券，使用接口返回预估运费 */
            model.estimateFreight.afterDiscountAmount = model.estimateFreight.totalAmount
            /** 无优惠券，优惠金额=0 */
            model.estimateFreight.reduceAmount = 0
          }
        }
        calculateTotalEstimateFreight()
        await loadViewbledTableData()
        loading.value = false
      }
    }

    /** 地址薄选择地址 */
    const addReceiverInfoByAddressBook = async (addressInfos, isFromAddressBook) => {
      if (!Array.isArray(addressInfos)) {
        //兼容智能解析
        addressInfos = [addressInfos]
      }
      const senderFields = [
        'jjCompany',
        'jjContactPerson',
        'sms',
        'jjTelePhone',
        'qhAddress',
        'qhContactPerson',
        'qhContactWay'
      ]
      const rows = addressInfos.map(item => {
        const row = {}
        row.sjCompany = item.company
        row.sjContactPerson = item.contact
        row.sjMobile = item.contactPhone
        row.sjTelephone = item.telephone
        if (isFromAddressBook) {
          const districtList = [item.province, item.city, item.area].filter(f => f)
          item.address = districtList.join('') + item.address
        }
        row.sjAddress = item.address
        return row
      })
      try {
        loading.value = true
        loadingAddRows.value = true
        await defaultConfigUtil.loadDataBatch(rows, null)
        rows.forEach(r => {
          senderFields.forEach(f => {
            r[f] = formData.value[f]
          })
          r.qhAddressData = { districtList: [], detailAddress: '' }
        })
        await addRowsToEditableTable(rows, true, isFromAddressBook)
      } finally {
        loading.value = false
        loadingAddRows.value = false
      }

    }

    const handleSenderInfoChange = async fieldName => {
      if (fieldName !== 'qhAddress') {
        return
      }
      loading.value = true
      try {
        validateSenderAddress()
        //寄件地址修改后，刷新服务方式及重新校验
        const modelList = getModelList(formData.value)
        if (!modelList || modelList.length < 1) {
          return
        }
        await loadServiceWayOptions(modelList)
        await setVerifyImportDataResult({ modelList })
        const editableTableData = tableEditableRef.value.editableTableData
        editableTableData.forEach(row => {
          row.qhAddress.value = formData.value.qhAddress
          // const getCity = data =>!data?.districtList?'':data.districtList[1]
          // const cacheCity = getCity(row.qhAddress.data)
          // if(!cacheCity || cacheCity!==getCity(formData.value.qhAddressData)){
          //   row.weight.warningInfo = ''
          // }
          row.qhAddress.data = formData.value.qhAddressData
          if (row.coupon.value.prizeCode) {
            /** 清空所有优惠券 */
            row.coupon.value = ''
            couponTitleTip.value = true
          }
        })
        loadViewbledTableData()
      } finally {
        loading.value = false
      }
    }

    const checkData = async () => {
      const editableTableData = tableEditableRef.value.editableTableData
      if (!editableTableData || editableTableData.length < 1) {
        root.$message.warning('收方信息不能为空')
        return
      }
      const senderRestrictErrorInfo = senderInfoRef.value._addressRestrictErrorInfo
      if(senderRestrictErrorInfo?.msg){
        await dialogAddressRestrictRef.value.showDialog(senderRestrictErrorInfo)
        // root.$message.warning('当前寄件地址限制下单')
        return
      }
      if(!await checkTableData()){
        return
      }
      if (Object.values(senderInfoRef.value.errorMsgs).some(e => e)) {
        root.$message.warning('请修改提示处错误内容')
        return
      }
      let valid = await senderInfoRef.value.validateForm()
      if (valid) {
        valid = await senderInfoRef.value.$refs.qhAddressRef.validateForm()
      }
      if (!valid) {
        root.$message.warning('请修改提示处错误内容')
        return
      }
      return true
    }

    const getTableModelData = async () => {
      if (!await checkData()) {
        return
      }
      const modelList = getModelList(formData.value)
      return modelList
    }

    const saveData = async (pickupInfo, withPrint) => {
      if (!await checkData()) {
        return
      }
      if(!pickupInfo){
        // 报关服务费用提醒
        await batchFooterRef.value.handleBatchWareCheck()
      }
      return await saveTableData(formData.value, pickupInfo, withPrint)
    }

    /** 待选优惠券 */
    const handleSelectCoupon = async row => {
      const data = await tableEditableRef.value.editableTableData
      const filterCoupons = await getSelectedCoupons(data, row)

      dialogCouponListRef.value.show(row, filterCoupons)
    }

    /** 更新优惠券 */
    const handleUpdateCoupon = async row => {
      const data = await tableEditableRef.value.editableTableData
      const filterCoupons = await getSelectedCoupons(data, row)

      dialogCouponListRef.value.show(row, filterCoupons)
    }

    /** 弹窗确认按钮 */
    const handleDialogCouponSave = async (coupon, row) => {
      const value = row.coupon.value
      const estimateFreight = row.estimateFreight.value
      if (coupon) {
        const result = commonUtil.getEstimateTotalFreight(coupon, estimateFreight)
        row.coupon.value = { ...value, ...coupon, estimateFreight: true }

        if (estimateFreight) {
          /** 减去优惠金额后的预估运费 */
          estimateFreight.afterDiscountAmount = result
          /** 优惠金额 */
          estimateFreight.reduceAmount = coupon.reduceAmount
        }
      } else {
        row.coupon.value = {
          usableCount: value.usableCount,
          disabledCount: value.disabledCount
        }
        if (estimateFreight) {
          /** 无优惠券，使用接口返回预估运费 */
          estimateFreight.afterDiscountAmount = estimateFreight.totalAmount
          /** 无优惠券，优惠金额=0 */
          estimateFreight.reduceAmount = 0
        }
      }
      row.coupon.errorInfo = ''
      calculateTotalEstimateFreight()
      await loadViewbledTableData()
    }

    /** 刷新可视区域数据 */
    const loadViewbledTableData = async () => {
      const { viewableTableData, editableTableData } = tableEditableRef.value
      await changeTableData(viewableTableData, editableTableData)
    }

    /** 表格滚动事件 */
    const handleTableScroll = async () => {
      loadViewbledTableData()
    }

    const resetWithoutTip = async () => {
      senderInfoRef.value.resetData()
      Object.assign(formData.value, formDataUtil.getFormData())
      resetTableData()
      await defaultConfigUtil.loadDataBatch(formData.value, root)
      setTimeout(() => {
        validateSenderAddress()
        senderInfoRef.value.validateSingleSenderAddressRestrict()
      }, 300)
    }

    const reset = async () => {
      root.$reportUtils.clkExpressBatchSubbutton({button_name: '清空'})
      const msg = '请确认是否清空当前数据？'
      await root.$confirm(msg, { type: 'warning' })
      resetWithoutTip()
    }

    //部分保存失败时重新导入
    const handleReimport = async ({ failModelList }) => {
      tableEditableRef.value.clearTableRows()
      try {
        loadingAddRows.value = true
        await addRowsToEditableTable(failModelList, true)
      } finally {
        loadingAddRows.value = false
      }
    }

    const handleColumnCustomEvent = async ({ fieldName, row }) => {
      switch (fieldName) {
        case 'declaredValue':
          onTableValueChange({ fieldName: 'declaredValue', row, isInit: false, isValid: true })
          break
        case 'superZoneTip':
          handleDeliverModeChange(row)
          break
        case 'serviceWay':
          reloadServiceWayOptions(row)
          break
      }
    }

    const checkSenderAddressRestrict = async () => {
      const errorInfo = senderInfoRef.value._addressRestrictErrorInfo
      if(!errorInfo.msg){
        return true
      }
      await dialogAddressRestrictRef.value.showDialog(errorInfo)
    }
    const showVisibleOfaddressBook = async () => {
      root.$reportUtils.clkExpressBatchSubbuttonSub({ button_name: "收方从地址薄选择" })
      if(!await checkSenderAddressRestrict()){
        return
      }
      state.visibleOfaddressBook = true
    }

    const parseAddressInfoRef = ref()
    const parseAddressInfoClick = async () => {
      root.$reportUtils.clkExpressBatchSubbuttonSub({ button_name: "收方智能填写" })
      if(!await checkSenderAddressRestrict()){
        return
      }
      parseAddressInfoRef.value.showDialog()
    }


    return {
      ...toRefs(state),
      tableEditableRef,
      senderInfoRef,
      dialogSingleReceiverRef,
      dialogSuperZoneRef,
      dialogAddressRestrictRef,
      tableHeight,
      loading,
      loadingAddRows,
      couponLoading,
      errorSummary,
      totalEstimateFreight,
      modifyTableRow,
      deleteTableRow,
      tableColumns,
      verifyRules,
      shareData,
      formData,

      reset,
      resetWithoutTip,
      addRowsToEditableTable,
      addReceiverInfo,
      addReceiverInfoByAddressBook,
      handleSenderInfoChange,
      getTableModelData,
      saveData,

      dialogCouponListRef,
      batchCouponRef,
      couponTitleTip,
      handleTableScroll,
      handleSelectCoupon,
      handleUpdateCoupon,
      handleDialogCouponSave,
      handleReimport,

      freightDetailRef,
      onTableValueChange,
      checkSenderAddressList,
      handleColumnCustomEvent,

      parseAddressInfoRef,
      parseAddressInfoClick,
      showVisibleOfaddressBook,
      updateTableData,
      getModelList,

      batchFooterRef
    }
  },
  watch: {
    supplierOrderList: {
      handler (list) {
        if (!list || list.length < 1) {
          return
        }
        this.$nextTick(() => {
          this.init()
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
  .fill-batch-continer {
    @import '../styles/single-common.scss';
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fb;

    /deep/ {
      .single-sender--container {
        .sender-info {
          padding-top: 5px;
          border-radius: 0 0 4px 4px;

          .el-input__suffix {
            width: 20px;
          }

          .el-col-4 {
            width: 16.66%;
          }

          .el-col-18 {
            width: 49.98%;
          }

          .input-container {
            .el-input__suffix {
              right: 4px;
            }
          }

          .address-input--wrapper {
            .el-input__suffix {
              width: 19px;
            }
          }
        }
      }

      .vxe-table--empty-placeholder {
        height: 48px !important;
        flex: 1;
        color: #999999;
        box-shadow: 0px -1px 0px 0px #e8eaec inset;
      }
    }

    /deep/ .el-form-item__label {
      padding-bottom: 1px !important;
    }

    .fill-coupon {
      border: solid 1px;
      position: relative;

      &-tip {
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .receiver-info-wrapper {
      flex: 1;
      background: #fff;
      padding: 7px 20px 0;
      margin-top: 8px;
      border-radius: 4px;
      @import '../styles/edit-table.scss';

      /deep/ .category-caption {
        .icon-receiver {
          color: #ff8c5d;
        }
      }
    }

    .line-text {
      width: 1px;
      height: 14px;
      background: #d5d2de;
      margin-left: 12px;
      margin-right: 12px;
    }

    .text-img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }
</style>
