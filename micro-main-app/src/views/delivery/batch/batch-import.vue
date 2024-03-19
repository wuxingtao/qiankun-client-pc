<template>
  <div class='fill-batch-import-container' v-loading.lock='progressState.importLoading'>
    <el-progress v-if='progressState.importLoading' class='batch-import__progress' :text-inside='true'
                 :show-text='false' :percentage='progressState.importProgress'></el-progress>
    <import-vipshop-step v-if='isVipshopUser' class='vipshop-steps-wrapper' :currentIndex='currentStep-1' />
    <div class='table-wrapper' :element-loading-text='loadingText'>
      <!--      <div class="error-sumarry" v-show="errorSummaryVisible">-->
      <!--        <svg-icon icon-class="error" style="margin-right:8px;" />-->
      <!--    -->
      <!--      </div >-->
      <ky-ui-tip class='mt_10' type='error' v-show='errorSummaryVisible'>
        有&nbsp;{{ errorSummary.errorCount }}&nbsp;处错误，请修改
        <span class='link-wrapper c_333 f_w_b' v-if='currentStep===1'>
          您可<span class='link' @click='modifyTableRow'>批量修改</span>或
          <span class='link' @click='fileReUpload'>重新上传<i class='el-icon-arrow-right' /></span>
        </span>
      </ky-ui-tip>

      <div class='row-summary'>共有&nbsp; <span
        style='color: #7c57df;'>{{ $refs.tableEditableRef && $refs.tableEditableRef.totalRowCount }} 票</span>&nbsp;运单
      </div>
      <table-editable ref='tableEditableRef' class='editable-table delivery-batch__table-editable'
                      :tableColumns='tableColumns' :loading.sync='loading' :fixedColumnWidth="fixedColumnWidth" :height='tableHeight'
                      :verifyRules='verifyRules' :errorSummary.sync='errorSummary'
                      :visibleOfOperation='visibleOfOperation' :visibleOfModify='!isFillVipshopCode'
                      @on-modify-row='modifyTableRow' @on-delete-row='deleteTableRow' :clearable='false'
                      @value-change='handleTableValueChange'>
        <template v-slot:columns-fixed='{row}'>
            <batch-columns-fixed :row='row' :importCurrentStep="currentStep"/>
          </template>
        <template v-slot:header_declaredValue>
          <header-declared-value />
        </template>
        <template v-slot:columns--common={row,col}>
          <batch-columns-common :row='row' :col='col' :importCurrentStep='currentStep'
                                :tableEditableRef='tableEditableRef' @change='handleCellSelectChange'
                                @custom-event='handleColumnCustomEvent' />
        </template>
      </table-editable>
    </div>
    <batch-footer class='batch-footer__wrapper' :isBatchImport='true' :loading.sync='loading'
                  :getTableModelData='getTableModelData'
                  :getModelList="getModelList"
                  :getSaveResult='getSaveResult' :saveData='saveData' :isVipshopUser='isVipshopUser'
                  :totalEstimateFreight='totalEstimateFreight' @on-close="$emit('on-close')" @on-refill='handleReimport'
                  :reset='reset' @updateTableData="updateTableData" ref="batchFooterRef">
      <el-button @click='fileReUpload' :loading='loading'>重新上传</el-button>
      <template #default-btns v-if='isVipshopUser && [1,2].includes(currentStep)'>
        <el-button v-if='currentStep===1' type='primary' @click='saveData(null,null,true)' :loading='loading'>下一步</el-button>
        <el-button v-else-if='currentStep===2' type='primary' @click='confirmUploadVipshopCode' :loading='loading'>保存
        </el-button>
      </template>
    </batch-footer>

    <dialog-batch-import-modify ref='dialogBatchImportModifyRef' @on-confirm='confirmBatchModifyData' />
    <dialog-super-zone ref='dialogSuperZoneRef' />
    <dialog-address-restrict ref='dialogAddressRestrictRef'/>
    <!-- <dialog-standard-size ref="dialogGoodsSizeRef" /> -->
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { onMounted, reactive, ref, computed, nextTick, watch, onUnmounted, toRefs } from '@vue/composition-api'
import BatchMinx from './mixins/batch'

import joeone from '../utils/joeone'
import * as storageUtil from '@/utils/storage'
import deliveryApi from '@api/delivery'
import ImportVipshopStep from './import-vipshop-step'
import DialogBatchImportModify from './dialog-batch-import-modify'
import batchImportUtil from '../utils/batch-import'
import { KyUiTip } from '@comps/ky-ui'

import useBatchValidateRules from './hooks/useBatchValidateRules'
import useBatchModel from './hooks/useBatchModel'
import useBatch from './hooks/useBatch'
import useBatchFreight from './hooks/useBatchFreight'
import useBatchProgress from './hooks/useBatchProgress'
import * as clientUtil from '@utils/clientUtil'
import deliveryUtil from '@utils/deliveryUtil'
import DialogAddressRestrict from '../components/dialog-address-restrict'

export default {
  mixins: [BatchMinx],
  components: {
    DialogBatchImportModify,
    ImportVipshopStep,
    KyUiTip,
    DialogAddressRestrict
  },
  props: {
    visibleOfTable: {
      type: Boolean
    },
  },
  setup(props, { root, emit }) {
    const tableEditableRef = ref(null)
    const dialogSuperZoneRef = ref(null)
    const dialogBatchImportModifyRef = ref(null)
    const dialogAddressRestrictRef = ref(null)
    const errorSummary = ref({})
    const currentStep = ref(1)
    const loading = ref(false)
    const loadingText = ref('拼命加载中...')
    const saveResult = [] //成功导入的结果
    const tableHeight = ref(200)
    const tableColumns = reactive(batchImportUtil.getCopyOfTableColumns())
    const totalEstimateFreight = ref({})
    const batchFooterRef = ref(null)
    const fixedColumnInitWidth = 210
    const state = reactive({
      fixedColumnWidth: fixedColumnInitWidth
    })

    const { importStepEnum, progressState, setImportProgress } = useBatchProgress()
    const { verifyRules, setVerifyImportDataResult } = useBatchValidateRules({
      vm: root,
      tableColumns,
      tableEditableRef,
      totalEstimateFreight
    })
    const { changToModelList, updateTableData } = useBatchModel({ tableEditableRef })
    const { calculateTotalEstimateFreight } = useBatchFreight({ vm: root, tableEditableRef, totalEstimateFreight })
    const {
      resetTableData,
      initTableColumnsProperties,
      handleTableValueChange,
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

    const errorSummaryVisible = computed(() => errorSummary.value.errorCount > 0)
    watch(errorSummaryVisible, () => setTableHeight())
    const isVipshopUser = computed(() => root.$store.getters.isVipshopUser)

    // watchEffect(flag=>console.log('flag :>> ', flag),{onTrigger(e) {
    //   debugger
    // }})
    const deleteTableRow = async () => {
      calculateTotalEstimateFreight()
    }
    const modifyTableRow = ({ row }) => {
      if (row) {
        dialogBatchImportModifyRef.value.showDialog([row], true)
        return
      }
      const editableTableData = tableEditableRef.value.editableTableData
      const rows = editableTableData.filter(e => (e.errors && e.errors.length > 0) || e._addressRestrictErrorInfo?.msg)
      dialogBatchImportModifyRef.value.showDialog(rows)
    }

    const toSetVipshopCodeStep = () => {
      state.fixedColumnWidth = 0
      const editableTableData = tableEditableRef.value.editableTableData
      editableTableData.forEach(row => {
        const ydNo = saveResult.value.sucessModelList.find(f => f.id == row.no.value)?.waybillNumber
        row.ydNo.value = ydNo
      })
      const errorRows = editableTableData.filter(r => !r.ydNo.value)
      if (errorRows.length > 0) {
        tableEditableRef.value.$refs.xTable.remove(errorRows)
        tableEditableRef.value.setErrorCount()
      }
      tableColumns.forEach(c => {
        // root.$set(c,'readOnly',c.prop !== 'vipshopCode')
        c.readOnly = c.prop !== 'vipshopCode'
        if (c.prop === 'ydNo') {
          c.hide = false
        }
      })
      setTableColoumnsProperty('vipshopCode', 'hide', false)
    }

    const confirmUploadVipshopCode = async () => {
      loading.value = true
      if (errorSummaryVisible.value) {
        root.$message.warning(`共有${errorSummary.value.errorCount}处错误，请先修改`)
        loading.value = false
        return
      }
      const editableTableData = tableEditableRef.value.editableTableData
      const vipshopList = editableTableData.filter(f => f.vipshopCode.value).map(row => ({
        waybillNumber: row.ydNo.value, productCode: row.vipshopCode.value
      }))
      try {
        if (vipshopList.length > 0) {
          const res = await deliveryApi.uploadVipshopCode(vipshopList)
          if (res.code === 0) {
            currentStep.value = 3
          }else{
            return
          }
        } else {
          currentStep.value = 3
        }
        setTableColoumnsProperty('vipshopCode', 'readOnly', true)
        tableEditableRef.value.applyXTableMethod('hideColumn','vipshopCode')
        setTimeout(() => {
          tableEditableRef.value.applyXTableMethod('showColumn','vipshopCode')
        }, 0)
      } finally {
        loading.value = false
      }
    }
    const getTableModelData = async () => {
      if(!await checkTableData()){
        return
      }
      const modelList = getModelList()
      return modelList
    }

    /**
     *
     * @param pickupInfo 通知司机取货信息 非必穿
     * @param force 是否需触发报关价格提醒
     * @returns {Promise<{sucessModelList: unknown[], failModelList: unknown[], allModelList: (*&{waybillNumber: *, isSaveSucess, id: *, isRestrict: *})[], totalCount: number, restrictModelList: unknown[]}>}
     */
    const saveData = async (pickupInfo, withPrint, force=false) => {
      try {
        if(!await checkTableData()){
          return
        }
        if (!pickupInfo) {
          loading.value = true
          // 报关服务费用提醒
          await batchFooterRef.value.handleBatchWareCheck(force)
        }

        loadingText.value = '数据保存中...'
        if (currentStep.value === 1) {
          progressState.importLoading = true
          setImportProgress(importStepEnum.SAVE)
          saveResult.value = await saveTableData(null, pickupInfo, withPrint)
        }
        const sucessModelList = saveResult.value?.sucessModelList
        if (isVipshopUser.value && currentStep.value === 1 && sucessModelList) {
          if (sucessModelList.length < 1) {
            return
          }
          currentStep.value = 2
          toSetVipshopCodeStep()
          return saveResult.value
        }
        return saveResult.value
      } finally {
        progressState.importLoading = false
        loading.value = false
      }
    }
    const getSaveResult = () => {
      return saveResult.value
    }
    const setTableHeight = debounce(function() {
      let clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      let height = clientHeight - ((isVipshopUser.value ? 305 : 250) + (errorSummaryVisible.value ? 51 : 0))
      tableHeight.value = height > 300 ? height : 300
    }, 50)
    const reset = () => {
      state.fixedColumnWidth = fixedColumnInitWidth
      resetTableData()
      emit('update:visibleOfTable', false)
    }
    const fileReUpload = () => {
      emit('fileReUpload')
    }
    //重置列属性，针对唯品会导入部分失败重新提交
    const resetColumnsProperties = () => {
      const columns = batchImportUtil.getCopyOfTableColumns()
      Object.assign(tableColumns, columns)
      initTableColumns()
    }

    //加载excel文件
    const loadExcelFile = async file => {
      try {
        state.fixedColumnWidth = fixedColumnInitWidth
        resetTableData()
        progressState.importLoading = loading.value = true
        loadingText.value = '读取Excel中...'
        setImportProgress(importStepEnum.LOADEXCEL)
        const customerCode = storageUtil.getCustomerCode()
        let result = null
        // if (customerCode === joeone.customeNo) {
        //   result = await joeone.convertExcelDataToModelList(file)
        // } else {
        const params = {
          file,
          customerInfo: { customCode: customerCode, phone: storageUtil.getPhone() },
        }
        result = await batchImportUtil.getModelListByExcel(params)
        // }
        if (result.errorMsg) {
          root.$message.warning(result.errorMsg)
          progressState.importLoading = loading.value = false
          return
        }
        if(!result.isCustomExcel && !await checkImportResult(result)){
          progressState.importLoading = loading.value = false
          return
        }
        loadData({ modelList: result.modelList, autoMatchService: true,initLoading:false })
      } catch (ex) {
        let msg = '您导入的表格文件存在异常，请检查后重新导入'
        if (ex && ex.name === 'SyntaxError') {
          msg = '您导入的表格有误,请检查文件是否损坏或加密'
        }
        root.$message.error(msg)
        console.log('ex :>> ', ex)
        progressState.importLoading = loading.value = false
      }
    }

    const showRequiredColumnTip = async missingColumnTexts => {
      const text = missingColumnTexts.map(m=>`【${m}】`).join('、')
      try{
        const msg = `标题名称（必填项）${text}缺失，请检查并导入正确模板。`
        await root.$kye_message.confirm(msg, {
          closeOnClickModal: false,
          title: '导入失败',
          distinguishCancelAndClose: true,
          confirmButtonText: '重新上传',
          cancelButtonText: '下载模板',
          type: 'warning'
        })
        fileReUpload()
      } catch (action) {
        if (action === 'cancel') {
          clientUtil.downloadImportExcelTemplate()
        }
      }
    }

    const showUpdateTemplateTip = async () => {
      try {
        const msg = '模板升级，请使用新模板，点击【下载模板】可获得新模板。'
        await root.$kye_message.confirm(msg, {
          closeOnClickModal:false,
          title:'温馨提示',
          distinguishCancelAndClose: true,
          confirmButtonText: '下载模板',
          cancelButtonText: '忽略, 继续下单',
          type: 'warning'
        })
        clientUtil.downloadImportExcelTemplate()
      }catch(action){
        if(action === 'cancel'){
          return true
        }
      }
    }

    const showUnsupportColumnTip = async result => {
      const text = result.extraColumnTexts.map(m=>`【${m}】`).join('、')
      try{
        const msg = `不支持导入${text}列，模板如需新增标题请联系您的专属商务，或忽略后继续下单`
        await root.$kye_message.confirm( msg, {
          closeOnClickModal:false,
          title:'温馨提示',
          distinguishCancelAndClose: true,
          confirmButtonText: '忽略, 继续下单',
          cancelButtonText: '重新上传',
          type: 'warning'
        })
        if (!root.$store.state.delivery.existsNewImportTemplate) {
          deliveryApi.setBatchImportTemplateCustomColumns(result)
          root.$store.commit('delivery/setImportTemplateUpdateFlag', true)
        }
        return true
      } catch (action) {
        if (action === 'cancel') {
          fileReUpload()
        }
      }
    }
    /**
     * 检查导入的excel，返回true时才继续导入
     */
    const checkImportResult = async result => {
      // if(!result.excelCustomColumnTexts || result.excelCustomColumnTexts.length < 1){
      //   return true
      // }
      const checkExcelCustomColumnFlag = deliveryUtil.checkImportExcelCustomColumn(result)

      if(result.missingColumnTexts?.length >0){
        if([0,2,3].includes(checkExcelCustomColumnFlag)){
          await showRequiredColumnTip(result.missingColumnTexts)
        }else{
          return await showUpdateTemplateTip()
        }
        return
      }
      const isCustomField123InExcel = ['自定义字段1','自定义字段2','自定义字段3'].every(f=>result.excelCustomColumnTexts.includes(f))
      if(isCustomField123InExcel){
        if([0,2].includes(checkExcelCustomColumnFlag)){
          root.$store.commit('delivery/setImportTemplateUpdateFlag',true)
          return true
        }else{
          return await showUpdateTemplateTip()
        }
      }
      if(checkExcelCustomColumnFlag < 0){
        return await showUpdateTemplateTip()
      }
      if( checkExcelCustomColumnFlag === 3){
        if(result.extraColumnTexts?.length > 0){
          return  await showUnsupportColumnTip(result)
        }
      }
      if (root.$store.state.delivery.existsNewImportTemplate) {
        deliveryApi.setBatchImportTemplateCustomColumns({ isDefaultKaColumns: true })
        root.$store.commit('delivery/setImportTemplateUpdateFlag', false)
      }
      return true
    }

    const loadData = async ({ modelList, sort = true, autoMatchService = false, initLoading = true }) => {
      resetTableData()
      if (initLoading) {
        progressState.importLoading = loading.value = true
      }
      loadingText.value = '数据校验中...'
      if (currentStep.value > 1) {
        currentStep.value = 1
        resetColumnsProperties()
      }
      const deliveryBatchId = root.$store.state.delivery.deliveryBatchId
      return new Promise((resolve, reject) => {
        nextTick(async () => {
          try {
            setImportProgress(importStepEnum.INITTABLE)
            await tableEditableRef.value.initTableData(modelList, false)
            if (!isTheSameBatch(deliveryBatchId)) {
              return
            }
            setImportProgress(importStepEnum.SERVICEWAY)
            await loadServiceWayOptions(modelList, autoMatchService)
            if (!isTheSameBatch(deliveryBatchId)) {
              return
            }
            setImportProgress(importStepEnum.VALIDATE)
            const flag = await setVerifyImportDataResult({ modelList })
            if (!isTheSameBatch(deliveryBatchId)) {
              return
            }
            refreshEstimateFreightColumn()
            progressState.importProgress = 99
            if (!flag) { //导入校验出错
              reset()
              reject(false)
              return
            }
            sort && tableEditableRef.value.setErrorCountAndSort()
            const editableTableData = tableEditableRef.value.editableTableData
            if (editableTableData.some(r => r.goods.errorInfo.includes('违禁品'))) {
              const msg = '您的托寄物包含违禁品,请确保您运单上填写的托寄物与内件物品一致，否则造成退货、扣款、罚款等责任将全部由您承担！'
              root.$message.warning(msg)
            }
            loading.value = false
            progressState.importLoading = false
            setTableHeight()
            // callbackFunc && callbackFunc()
            resolve(true)
            // console.timeEnd('test')
          } catch (ex) {
            const page = root.$store.state.delivery.deliveryBatchPage
            if (page === 'import') {
              let msg = '您导入的表格文件存在异常，请检查后重新导入'
              if (ex.message?.includes('timeout')) {
                msg = '请求超时，请稍候再尝试导入'
              }
              root.$message.error(msg)
            }
            console.log('ex :>> ', ex)
            loadingText.value = '拼命加载中...'
            loading.value = false
            progressState.importLoading = false
            reject(false)
          }
        })
      })
    }

    const refreshEstimateFreightColumn = async () => {
      if (!root.$store.getters.hasFrightFeeAuth) {
        return
      }
      //处理预估运费列显示值未更新的问题
      tableEditableRef.value.$refs.xTable.hideColumn('estimateFreight')
      // tableEditableRef.value.$refs.xTable.scrollTo(200,0)
      setTimeout(() => {
        tableEditableRef.value.$refs.xTable.showColumn('estimateFreight')
        // tableEditableRef.value.$refs.xTable.scrollTo(0,0)
      }, 10)
    }

    const confirmBatchModifyData = async ({ modelList, deleteNoList }) => {
      const editableTableData = tableEditableRef.value.editableTableData
      const modelNoList = modelList.map(m => m.no)
      if (deleteNoList) {
        modelNoList.push(...deleteNoList)
      }
      const editableTableDataWidthNoEdit = editableTableData.filter(f => !modelNoList.includes(f.no.value))
      // console.log('editableTableDataWidthNoEdit.length :>> ', editableTableDataWidthNoEdit.length,editableTableDataWidthNoEdit.map(r=>r.no.value))
      // console.log('modelList.length :>> ', modelList.length,modelList.map(m=>m.no))
      await loadData({ modelList, sort: false })
      if (editableTableDataWidthNoEdit.length > 0) {
        tableEditableRef.value.addValidatedTableRows(editableTableDataWidthNoEdit)
      }
      const noList = editableTableData.map(r => r.no.value)
      if (noList.length !== new Set(noList).size) {
        root.$message.error('数据有误，导入失败')
      }
      calculateTotalEstimateFreight()
      tableEditableRef.value.setErrorCountAndSort()
    }
    //部分保存失败时重新导入
    const handleReimport = async ({ failModelList }) => {
      resetColumnsProperties()
      loadData({ modelList: failModelList })
    }
    const clearData = () => {
      tableEditableRef.value.clearTableRows()
    }

    const initTableColumns = () => {
      initTableColumnsProperties()
      const canModify = root.$store.getters.canModifySenderCompany
      const isSignBySelf = root.$store.getters.isSignBySelf
      setTableColoumnsProperty('isSignSelf', 'hide', !isSignBySelf)
      setTableColoumnsProperty('jjCompany', 'readOnly', !canModify)
    }

    const handleColumnCustomEvent = async ({ fieldName, row }) => {
      switch (fieldName) {
        case 'declaredValue':
          handleTableValueChange({ fieldName: 'declaredValue', row, isInit: false, isValid: true })
          break
        case 'superZoneTip':
          handleDeliverModeChange(row)
          break
        case 'serviceWay':
          reloadServiceWayOptions(row)
          break
      }
    }

    onMounted(() => {
      initTableColumns()
      setTableHeight()
      window.addEventListener('resize', setTableHeight)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', setTableHeight)
    })

    return {
      ...toRefs(state),
      tableEditableRef,
      dialogSuperZoneRef,
      dialogBatchImportModifyRef,
      dialogAddressRestrictRef,
      batchFooterRef,
      progressState,
      errorSummary,
      errorSummaryVisible,
      totalEstimateFreight,
      isVipshopUser,
      currentStep,
      tableHeight,
      loading,
      loadingText,
      tableColumns,
      verifyRules,
      changToModelList,
      getModelList,
      modifyTableRow,
      deleteTableRow,
      handleTableValueChange,
      confirmUploadVipshopCode,
      confirmBatchModifyData,
      loadExcelFile,
      loadData,
      handleReimport,
      getTableModelData,
      saveData,
      reset,
      clearData,
      getSaveResult,
      fileReUpload,
      handleColumnCustomEvent,
      updateTableData
    }
  },
  // watch: {
  //   supplierOrderList: {
  //     handler (list) {
  //       this.$nextTick(() => {

  //       })
  //     },
  //     immediate: true
  //   },
  // },
  computed: {
    isFillVipshopCode(){
      return this.isVipshopUser && this.currentStep === 2
    },
    visibleOfOperation() {
      return !this.isVipshopUser || this.currentStep <= 2
    },
  }
}
</script>

<style lang='scss' scoped>
@import '~@/assets/scss/footer.scss';

.fill-batch-import-container {
  flex: 1;
  box-sizing: border-box;
  padding: 0 20px;
  background: white;
  overflow-y: auto;
  @import '../styles/edit-table.scss';

  .batch-import__progress {
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0;
    left: 0;
    z-index: 2001;
    display: flex;
    justify-content: center;
    justify-items: center;
    align-items: center;

    /deep/ .el-progress-bar {
      width: 220px;
      position: relative;
      top: -12px;
    }
  }

  .vipshop-steps-wrapper {
    padding: 21px 180px 5px;
  }

  .result-container {
    margin: 52px 204px 0;
    padding: 56px 0;
    text-align: center;
    background: #fbfbff;

    .result-icon {
      font-size: 24px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);

      .icon {
        height: 72px;
        width: 72px;
        margin-bottom: 24px;
      }
    }

    .result-tip {
      font-size: 14px;
      color: #999999;
      margin: 60px 0 24px;
    }

    .result-buttons {
      .el-button + .el-button {
        margin-left: 16px;
      }
    }
  }

  .batch-footer__wrapper {
    /deep/ .btn-wrapper {
      margin-left: auto;
    }
  }

  /deep/ {
    @include loading;

    .el-loading-mask .el-loading-text {
      padding-top: 130px;
    }
  }
}
</style>
