<template>
  <div class='single-fill--container' v-loading='loadingSave' element-loading-text='加载中...'>
    <single-info-whole ref='singleInfoWholeRef' v-bind='$attrs' :isModify='false' :tempFormData.sync='formData'
                       :tempShareData.sync='shareData' @mainInfoInputValueChange='inputValueChange'
                       @loading-change='loading=$event' :need-ware-check="true" />
    <single-footer :formData='formData' :shareData='shareData' :saveData='handleSaveData' :saveDataAndPrint='handleSaveDataAndPrint'
                   :noticeToPickup='handleNoticeToPickup' :noticePickupAndPrint='handleNoticePickupAndPrint'
                   :resetFormData='resetFormData' :loading='loadingSave' />
    <notice-pickup :show-select-num='false' ref='noticePickupRef' />
    <dialog-single-result ref='dialogSingleResultRef' :resetFormData='resetFormData' />
    <print-view ref='printViewRef' />
    <declare-ware ref="declareWareRef"></declare-ware>
    <!-- <single-fill-record ref="singleFillRecordRef" @on-continue="fillDataWithRecord" :style="{left:this.$store.state.isMenuCollapse?'75px':'177px'}" /> -->
  </div>
</template>

<script>
import { reactive, ref, nextTick, onMounted } from '@vue/composition-api'
import { debounce, throttle } from 'lodash'
import SingleInfoWhole from './components/single-info-whole'
import SingleFooter from './components/single-footer'
import NoticePickup from '@/views/waybill/components/notice-pickup'
import DialogSingleResult from './components/dialog-single-result'
import { getFormData, getShareData } from './utils/formData'
import PrintView from '@/views/waybill/components/print-view'
import DeclareWare from '@views/waybill/components/declare-ware/index.vue';

import useSupplier from './hooks/useSupplier'
import deliveryApi from '@api/delivery'
import deliveryUtil from '@/utils/deliveryUtil'
import wareHouseApi from '@api/wareHouseApi'
import { getCustomerCode } from '@/utils/storage'

export default {
  components: {
    SingleInfoWhole,
    SingleFooter,
    NoticePickup,
    DialogSingleResult,
    PrintView,
    DeclareWare
  },
  props: {
    ydNo: {
      type: String
    },
    supplierOrder: {
      type: Object
    }
  },
  setup(props, { root }) {
    const singleInfoWholeRef = ref(null)
    const noticePickupRef = ref(null)
    const dialogSingleResultRef = ref(null)
    const singleFillRecordRef = ref(null)
    const printViewRef = ref(null)
    const declareWareRef = ref(null)
    const loading = ref(false)
    const loadingSave = ref(false)
    const shareData = reactive(getShareData())
    const formData = reactive(getFormData())

    const { loadSupplierOrderInfo, updateAllocationWaybillNumber } = useSupplier()

    const inputValueChange = fieldName => {
      switch (fieldName) {
        case 'sjAddress':
        case 'qhAddress':
          // addressChange()
          break
      }
    }

    const resetFormData = async (...args) => {
      singleInfoWholeRef.value.resetFormData(...args)
    }

    const handleSaveData = throttle(async function(type = 'save'){
      try {
        loadingSave.value = true
        // await handleWareHouse()
        await saveData(type)
      } finally {
        loadingSave.value = false
      }
    },1000)

    const saveData = async (type = 'save') =>{
      await deliveryUtil.sleep(500)
      if(loading.value){
        await saveData(type)
        return
      }
      const waybill = await singleInfoWholeRef.value.saveData(type === 'print')
      if (waybill) {
        saveSucessCallback({type, waybill, ydNo:waybill.ydNo})
        return waybill
      }
    }

    const getFormDataModel = async () => {
      try {
        // loading.value = loadingSave.value = true
        return await singleInfoWholeRef.value.getFormDataModel()
      } finally {
        // loading.value = loadingSave.value = false
      }
    }

    const handleNoticeToPickup = throttle(async function(){
      try {
        loadingSave.value = true
        await noticeToPickup()
      } finally {
        loadingSave.value = false
      }
    },1000)

    const noticeToPickup = async () => {
      await deliveryUtil.sleep(300)
      if(loading.value){
        await noticeToPickup()
        return
      }
      const model = await getFormDataModel()
      if (!model) {
        return
      }
      await handleWareHouse(model)

      const placeOrderFunc = async (pickupInfo, callback) => {
        const params = deliveryUtil.convertFormDataListToApiParams(model, pickupInfo)
        const res = await deliveryApi.saveWaybill(params)
        if (res.code === 0) {
          saveSucessCallback({type:'noticePickup',ydNo:model.ydNo})
          callback && callback(false)
          return true
        }
        let msg = res.msg || '保存失败'
        if (res.data?.errorResult.length > 0) {
          msg = res.data?.errorResult[0].msg
        }
        root.$message.error(msg)
      }
      noticePickupRef.value.showDialog([model], placeOrderFunc)
    }

    const handleNoticePickupAndPrint = throttle(async function(){
      try {
        loadingSave.value = true
        await noticePickupAndPrint()
      } finally {
        loadingSave.value = false
      }
    },1000)

    // 调起报关入仓
    const handleWareHouse = async function (model) {
      // const model = await getFormDataModel()
      // if (!model) {
      //   return Promise.reject(false)
      // }
      return new Promise(async (resolve,reject) => {
        if(formData.checkedCustomsCharge === '20' || !formData.checkedCustomsCharge){
          resolve(false)
          return
        }
        const {payWay , serviceWay , qhAddress , sjAddress} = formData
        const warehousingList = [{
          id: 1 ,
          payMode: payWay ,
          serviceType: serviceWay ,
          beginAddress: qhAddress ,
          endAddress: sjAddress ,
          // waybillNumber: props.ydNo,
          sendCustomerCode: getCustomerCode()
        }]
        const params = {
          warehousingList
        }
        const res = await wareHouseApi.getWarehousingPrice(params)
        if (res.code === 0 && res.data && res.data.length > 0) {
          let resolveResult = await declareWareRef.value?.showDialog({data: res.data})
          if (resolveResult.checkedCustomsCharge) {
            formData.checkedCustomsCharge = resolveResult.checkedCustomsCharge
            model.checkedCustomsCharge = resolveResult.checkedCustomsCharge
          }
          if(resolveResult.type === 'close'){
            loadingSave.value = false
            reject(false)
          }
        }
        resolve(true)
      })
    }

    // 通知司机取货并打印
    const noticePickupAndPrint = async () => {
      await deliveryUtil.sleep(300)
      if(loading.value){
        await noticePickupAndPrint()
        return
      }
      const model = await getFormDataModel()
      if (!model) {
        return
      }

      await handleWareHouse(model)

      const placeOrderFunc = async (pickupInfo, callback) => {
        const params = deliveryUtil.convertFormDataListToApiParams(model, pickupInfo,true)
        const res = await deliveryApi.saveWaybill(params)
        if (res.code === 0) {
          callback && callback(false)
          return true
        }
        let msg = res.msg || '保存失败'
        if (res.data?.errorResult.length > 0) {
          msg = res.data?.errorResult[0].msg
        }
        root.$message.error(msg)
      }
      const printParam = {
        waybills:[model],
        placeOrderFunc,
        waybillNumber: model.ydNo
      }
      const flag = await printViewRef.value.showDialogNew(printParam)
      // const flag = await printViewRef.value.showDialog([model], placeOrderFunc)
      if (flag) {
        saveSucessCallback({type:'noticePickup',ydNo:model.ydNo})
      }
    }

    const handleSaveDataAndPrint = throttle(async function(){
      try {
        loadingSave.value = true
        // await handleWareHouse()
        await saveDataAndPrint()
      } finally {
        loadingSave.value = false
      }
    },1000)

    //保存并打印
    const saveDataAndPrint = async () =>{
      await deliveryUtil.sleep(300)
      if(loading.value){
        await saveDataAndPrint()
        return
      }
      const waybill = await saveData('print')
      if (waybill) {
        const printParam = {
          waybills:[{ waybillNumber: waybill.ydNo, count: waybill.count }],
          waybillNumber: waybill.ydNo
        }
        const flag = await printViewRef.value.showDialogNew(printParam)
        // const flag = await printViewRef.value.showDialog([{ waybillNumber: waybill.ydNo, count: waybill.count }])
        saveSucessCallback({type:flag ? 'print' : 'save',ydNo:waybill.ydNo})
      }
    }

    const saveSucessCallback = ({type, waybill, ydNo}) => {
      singleInfoWholeRef.value.saveGoodsAndPayAccountToHistory()
      if (waybill) {
        updateAllocationWaybillNumber(waybill)
      }
      const text = `运单${ydNo || ''}`
      let msg = ''
      if (type === 'save') {
        msg = text + '保存成功'
      } else if (type === 'noticePickup') {
        msg = text + '已通知司机取货'
      } else if (type === 'print') {
        msg = text + '已打印'
      }
      msg && dialogSingleResultRef.value.showDialog(msg, false, type)
      root.$store.dispatch('delivery/setSenderHistoryContactListAction')
      root.$store.dispatch('delivery/setReceiverHistoryContactListAction')
      root.$store.dispatch('delivery/setWaybillHistoryRemarksListAction')
    }

    const init = debounce(async function() {
      if (root.$store.getters.historyGoodsList.length < 1) {
        root.$store.dispatch('client/setHistoryGoodsListAction')
      }
      nextTick(async () => {
        loadSupplierOrderInfo(props.formData, props.supplierOrder)
        await singleInfoWholeRef.value.showModel()
        singleInfoWholeRef.value.setWaybillNo()
      })
    }, 300)

    const checkSenderAddressList = ()=>{
      singleInfoWholeRef.value.singleInfoSenderRef.checkSenderAddressList()
    }

    onMounted(() => {
      init()
    })

    return {
      singleInfoWholeRef,
      noticePickupRef,
      printViewRef,
      dialogSingleResultRef,
      singleFillRecordRef,
      declareWareRef,
      loading,
      loadingSave,
      inputValueChange,

      init,
      shareData,
      formData,
      handleNoticeToPickup,
      handleNoticePickupAndPrint,
      handleSaveDataAndPrint,
      resetFormData,
      handleSaveData,
      checkSenderAddressList
    }
  },
  watch: {
    'formData.ydNo': {
      handler(val) {
        this.$emit('update:ydNo', val) //单票填单时更新外部运单号
      },
      immediate: true
    },
    supplierOrder: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.init()
          })
        }
      },
      immediate: true
    },
    '$route.params.ydNo': {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.init()
          })
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
.single-fill--container {
  position: relative;
  height: 100%;

  /deep/ {
    @include loading;
  }

  // background: #f7f9fa;
  // margin-top: 4px;
  // margin-right: 4px;

  /deep/ {
    .sender-receiver--wrapper {
      margin-bottom: 4px;

      .single-receiver--container {
        border-radius: 4px;
      }

      @media (max-width: 1400px) {
        .sjCompany-style__warn .text {
          display: none;
        }
      }
    }

    .sender-receiver--wrapper,
    .goods-info,
    .service-info,
    .info-remarks {
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(29, 26, 33, 0.03);
    }
  }

  @import '~@/assets/scss/footer.scss';

  .footer {
    .fregith--wrapper {
      font-size: 14px;
      color: #424242;
      display: flex;
      align-items: center;

      & > span {
        font-size: 18px;
        color: #ffa40d;
        padding-right: 4px;
      }

      /deep/ .icon-question {
        color: #999999;
      }
    }
  }

  .notices {
    position: fixed;
    // left: 372px;
    // right: 204px;
    left: 196px;
    right: 204px;
    min-width: 740px;
    z-index: 2;
  }

  .single-fill-record--container {
    position: fixed;
    z-index: 2;
    bottom: 69px;
    left: 0;
    right: 13px;

    //   .single-sender--container,
    // .single-receiver--container,
    // .goods-info,
    // .service-info,
    // .info-remarks

    .info-wrapper {
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(29, 26, 33, 0.1);
    }
  }
}
</style>
