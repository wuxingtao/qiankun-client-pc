<template>
  <footer class="footer admin-footer">
    <div :style="{paddingLeft:$store.state.isMenuCollapse?'93px':'196px'}">
      <freight :estimateFreight="totalEstimateFreight || {}"
                      :loading="$store.state.delivery.loadingOfBatchFreight"
                      :visible-description="visibleFreightDscription" :visible-discounted="!isBatchImport" is-batch
                      popover-placement="top">
        <template #value-icon>
          <el-tooltip
              v-show="!$store.state.delivery.loadingOfBatchFreight && $store.state.delivery.rowCountWithoutFreight>0"
              placement='right' effect="light"
              :content="`您有${$store.state.delivery.rowCountWithoutFreight}票寄方付运单，需填写必填项及重量、件数，获取预估费用`">
            <i class="iconfont iconfaq" style="font-size: 12px; padding-left:4px" />
          </el-tooltip>
        </template>
        <template #description>
          <!-- <div class="description__tip" v-show="$store.state.delivery.rowCountWithoutFreight>0">
          </div> -->
          <div v-show="existFreight">
            以上运费仅供参考，实际运费以最终运费为准
          </div>
        </template>
      </freight>
    </div>
    <div class="btn-wrapper">
      <slot />
      <slot name="default-btns">
        <el-button type="primary" class="btn-secondary" v-if="!isVipshopUser" @click="handleSaveData" :loading="buttonLoading">仅保存</el-button>
        <el-button class="btn-secondary" @click="handleSaveAndPrint" :loading="buttonLoading">保存并打印</el-button>
        <el-button class="btn-secondary" style="background: #f2effe;" @click="handleNoticePickup(false)" :loading="buttonLoading">通知司机取货</el-button>
        <el-button type="primary" @click="handleNoticePickup(true)" :loading="buttonLoading">通知司机并打印</el-button>
      </slot>
    </div>
    <notice-pickup ref='noticePickupRef' />
    <print-view ref="printViewRef" />
    <dialog-single-result ref="dialogSingleResultRef" />
    <dialog-batch-result ref="dialogBatchResultRef"/>
    <declare-ware type="batch" ref="declareWareRef"></declare-ware>
  </footer>
</template>

<script>
import { computed, reactive, ref, toRefs } from '@vue/composition-api'
import { throttle } from 'lodash'
import deliveryUtil from '@/utils/deliveryUtil'
import NoticePickup from '@/views/waybill/components/notice-pickup'
import PrintView from '@/views/waybill/components/print-view'
import Freight from '../components/freight/index'
import DialogSingleResult from '../components/dialog-single-result'
import DialogBatchResult from '../batch/dialog-batch-result'
import DeclareWare from '@views/waybill/components/declare-ware/index.vue'
import wareHouseUtil from '@/utils/wareHouseUtil'

export default {
  components: {
    NoticePickup,
    PrintView,
    Freight,
    DialogSingleResult,
    DialogBatchResult,
    DeclareWare
  },
  props: {
    totalEstimateFreight: {
      type: Object,
    },
    loading: {
      type: Boolean
    },
    getTableModelData: {
      type: Function
    },
    getModelList: {
      type: Function
    },
    saveData: {
      type: Function
    },
    getSaveResult:{ //获取保存结果，针对唯品会用户先保存，再通知司机取货
      type: Function
    },
    isVipshopUser: {
      type: Boolean
    },
    isBatchImport: {
      type: Boolean
    },
    reset: {
      type: Function,
      required: true,
    }
  },
  setup (props, { root, emit }) {
    const noticePickupRef = ref(null)
    const printViewRef = ref(null)
    const dialogSingleResultRef = ref(null)
    const dialogBatchResultRef = ref(null)
    const declareWareRef = ref(null)
    const state = reactive({
      saveLoading:false,
    })
    const existFreight = computed(()=>{
      const existFreight = /\d/.test( props.totalEstimateFreight?.afterDiscountAmount)
      return existFreight
    })
    const visibleFreightDscription = computed(()=>{
      if(existFreight.value || root.$store.state.delivery.rowCountWithoutFreight>0){
        return true
      }
      return false
    })

    const buttonLoading = computed(()=>props.loading || state.saveLoading)
    const isInLoading = computed(()=> root.$store.state.delivery.loadingOfBatch?.declaredValue)

    /** 仅保存（批量发货） */
    const handleSaveData = throttle(async function() {
      root.$reportUtils.clkExpressBatchSubbutton({button_name: '仅保存'})
      try{
        state.saveLoading = true
        await saveDataFunc()
      }finally{
        state.saveLoading = false
      }
    },1000)

    const saveDataFunc = async ()=> {
      await deliveryUtil.sleep(500)
      if(isInLoading.value){
        await saveDataFunc()
        return
      }

      const saveResult = await getWaybillNumbersBySaveData()
      if (saveResult.ydNos) {
        redirectToWaybillPage('save',saveResult)
      }
    }

    /** 通知司机取货或通知司机取货并打印*/
    const handleNoticePickup = throttle(async function(withPrint) {
      root.$reportUtils.clkExpressBatchSubbutton({button_name: withPrint ? '通知司机并打印' : '通知司机取货'})
      try{
        state.saveLoading = true
        await noticePickupFunc(withPrint)
      }finally{
        state.saveLoading = false
      }
    },1000)

    const noticePickupFunc = async withPrint => {
      await deliveryUtil.sleep(300)
      if(isInLoading.value){
        await noticePickupFunc(withPrint)
        return
      }
      let modelList = await props.getTableModelData()
      if (!modelList || modelList.length < 1) {
        return
      }

      await handleBatchWareCheck()

      let pickupSucessCallback = null
      let placeOrderFunc = async (pickupInfo, callback) => {
        const saveResult = await props.saveData(pickupInfo,withPrint)
        if (!saveResult) {
          return
        }
        if (saveResult.sucessModelList && saveResult.sucessModelList.length > 0) {
          callback && callback(false, saveResult)
          return saveResult
        }
      }
      if(props.isVipshopUser){
        placeOrderFunc =null
        const saveResult = props.getSaveResult()
        pickupSucessCallback = async callback =>{
          callback && callback(false,saveResult)
          return saveResult
        }
      }
      const ref = withPrint ? printViewRef.value : noticePickupRef.value
      const saveResult = await ref.showDialog(modelList, placeOrderFunc,pickupSucessCallback)
      if (saveResult) {
        redirectToWaybillPage('noticePickup',saveResult)
      }
    }

    const handleSaveAndPrint = throttle(async function () {
      root.$reportUtils.clkExpressBatchSubbutton({button_name: '保存并打印'})
      try{
        state.saveLoading = true
        await saveAndPrintFunc()
      }finally{
        state.saveLoading = false
      }
    },1000)

    const saveAndPrintFunc = async () => {
      await deliveryUtil.sleep(300)
      if(isInLoading.value){
        await saveAndPrintFunc()
        return
      }

      const saveResult = await getWaybillNumbersBySaveData(true)
      if (saveResult.waybills) {
        const flag = await printViewRef.value.showDialog(saveResult.waybills)
        redirectToWaybillPage(flag?'print':'save',saveResult)
      }
    }

    const getWaybillNumbersBySaveData = async withPrint => {
      try {
        emit('update:loading', true)
        const saveResult = await props.saveData(null,withPrint)
        if(!saveResult){
          return{}
        }
        if (saveResult.sucessModelList && saveResult.sucessModelList.length > 0) {
          const waybills = saveResult.sucessModelList.map(m => {
            m.pickupContactPerson = m.qhContactPerson || m.jjContactPerson
            m.pickupContactPhone = m.qhContactWay || m.sms || m.jjTelePhone
            m.goodsType = m.goods
            m.deliveryAddress = m.qhAddress
            return m
          })
          const ydNos = saveResult.sucessModelList.map(m => m.waybillNumber)
          return { ydNos, waybills,...saveResult }
        }
        return {}
      } finally {
        emit('update:loading', false)
      }
    }

    const redirectToWaybillPage = async (type,saveResult) => {
      if(saveResult.totalCount != saveResult.sucessModelList.length){
        const result = await dialogBatchResultRef.value.showDialog(saveResult,type)
        if (result?.continue) {
          emit('on-refill',{failModelList:saveResult.failModelList})
        }else{
          emit('on-close')
        }
        return
      }

      let msg = ''
      if (type === 'save') {
        msg = '运单保存成功'
      } else if (type === 'noticePickup') {
        msg = '运单已通知司机取货'
      } else if (type === 'print') {
        msg = '运单已打印'
      }
      if (!msg) {
        emit('on-close')
        return
      }
      const result = await dialogSingleResultRef.value.showDialog(msg, true,type)
      if (result?.continue) {
        props.reset()
      }else{
        emit('on-close')
      }
    }

    /**
     * 批量场景报关费用检查
     * @param force <true 强制检查> 默认唯品会不触发，唯品会仅在下一步强制触发
     * @returns {Promise<unknown>}
     */
    const handleBatchWareCheck = async (force=false) => {
      return new Promise(async (resolve, reject) => {
        // <1 是否非强制, 是否唯品会>
        if(!force && props.isVipshopUser){
          resolve(false)
          return
        }

        let modelList = await props.getModelList()
        const wareData = wareHouseUtil.getPointEditTableData(modelList)
        if(wareData?.length === 0){
          resolve(false)
          return
        }

        const resolveResult = await declareWareRef.value?.showDialog({data: wareData})
        if(resolveResult.data){
          resolveResult.data.forEach(item =>{
            const findItem = modelList.find(f => f.no === item.no)
            if(findItem){
              findItem.checkedCustomsCharge = item.checkedCustomsCharge
            }
          })
        }

        if(resolveResult.type === 'close'){
          state.saveLoading = false
          reject(false)
        }
        emit('updateTableData',{modelList, key: 'checkedCustomsCharge'})
        resolve(true)

      })
    }
    return {
      noticePickupRef,
      dialogSingleResultRef,
      printViewRef,
      declareWareRef,
      ...toRefs(state),
      isInLoading,
      buttonLoading,
      existFreight,
      visibleFreightDscription,
      redirectToWaybillPage,
      handleSaveData,
      handleNoticePickup,
      handleSaveAndPrint,
      dialogBatchResultRef,
      handleBatchWareCheck
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/footer.scss';
  .admin-footer{
    .description__tip{
      font-size: 12px;
      color: #f8782d;
    }
  }
</style>
