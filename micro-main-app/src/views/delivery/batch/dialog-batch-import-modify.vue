<template>
  <ky-dialog :title="(isModifySingle?'':'批量') + '修改'" :visible.sync="dialogVisible" width="820px">
    <div class="dialog-body">
      <div class="rows-summary" v-if="!isModifySingle">
        第{{currentIndex+1}}条<i />共{{rowCount}}条
        <div class="btn-wrapper">
          <el-button size="mini" class="btn-delete" plain :disabled="rowCount===1" @click="handleDelete" :loading="loading">删除本条</el-button>
          <el-button size="mini" plain :disabled="currentIndex<=0" @click="toPrevious" :loading="loading">上一条</el-button>
          <el-button size="mini" plain :disabled="currentIndex===rowCount-1" @click="toNext" :loading="loading">下一条</el-button>
        </div>
      </div>
      <single-info-whole ref="singleInfoWholeRef" :isModify="true" :isShowInDialog="true" :tempFormData.sync='formData' :tempShareData.sync='shareData' @loading-change="loading=$event" :visibleOfCoupon="false"/>
    </div>

    <dialog-waybill-footer slot="footer" :visible.sync="dialogVisible" :loading="loading" :shareData="shareData" is-batch-import :confirmButtonEvent="saveData" />
  </ky-dialog>
</template>

<script>
import SingleInfoWhole from '../components/single-info-whole'
import DialogWaybillFooter from '../components/dialog-waybill-footer'
import * as formDataUtil from '../utils/formData'
import deliveryUtil from '@/utils/deliveryUtil'
import useBatchModel from './hooks/useBatchModel'
import useSingleFee from '../hooks/useSingleFee'
import { debounce,cloneDeep } from 'lodash'

export default {
  components: {
    SingleInfoWhole,
    DialogWaybillFooter
  },
  setup (props) {
    const { changToModelList, changToModeWithParseAddress, parseAddressOfModel } = useBatchModel()
    const { getServiceCharge } =useSingleFee({})
    return {
      changToModelList,
      getServiceCharge,
      changToModeWithParseAddress,
      parseAddressOfModel
    }
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      isModifySingle: false,
      currentIndex: -1,
      shareData: formDataUtil.getShareData(),
      formData: formDataUtil.getFormData(),
      modelList: [],
      rows:[],
    }
  },
  methods: {
    showDialog (rows, isModifySingle) {
      this.isModifySingle = isModifySingle
      this.rows = cloneDeep(rows)
      this.modelList = this.changToModelList(rows)
      this.currentIndex = 0
      this.loadData(0,-1)
      this.$nextTick(() => {
        this.dialogVisible = true
      })
    },
    async saveData () {
      try {
        this.loading = true
        const flag = await this.$refs.singleInfoWholeRef.checkFormData(true)
        if(!flag){
          this.loading = false
          return
        }
        //解决数据较多，没有loading效果的问题
        setTimeout(()=>{
          const modelNoList = this.modelList.map(m=>m.no)
          const deleteNoList = this.rows.map(r=>r.no.value).filter(n=>!modelNoList.includes(n))
          this.$emit('on-confirm', { modelList: this.modelList,deleteNoList ,isModifySingle: this.isModifySingle })
          this.dialogVisible = false
          this.loading = false
        },5)
      } catch {
        this.loading = false
      }
    },
    async showModel (index) {
      const model = this.modelList[index]
      // console.log('showModel :>> ', index,model.no)
      let needConvert = model.qhAddress && deliveryUtil.isAddressDataEmpty(model.qhAddressData)
      needConvert = needConvert || model.sjAddress && deliveryUtil.isAddressDataEmpty(model.sjAddressData)
      if(needConvert){
        await this.parseAddressOfModel(model)
      }
      this.shareData.estimateFreight = model.estimateFreight
      Object.assign(this.formData,model)
      const payAccount = model.payAccount
      this.$nextTick(() => {
        this.formData.payAccount = payAccount
        const currentRow = this.rows.find(r => r.no.value == model.no)
        const wholeRef = this.$refs.singleInfoWholeRef
        wholeRef.displayErrorAndWarningInfoByTableRow(currentRow)
        this.shareData.disabledCollectionPrice = (currentRow.businessData?.value?.feature != 0)
        const options = currentRow?.serviceWay.options
        const haveDescription = options?.some(i=>i.description)
        wholeRef.loadServiceWayOption(haveDescription?options : null)
      })
      this.formData.dsCommission = await this.getServiceCharge('collectionFee',model.dsMoney,this.formData)
    },
    async handleDelete () {
      const msg = '请确认是否删除本条数据？'
      await this.$confirm(msg, { type: 'warning' })
      this.modelList.splice(this.currentIndex, 1)
      if (this.currentIndex === this.rowCount) { //最后一条时
        this.currentIndex = this.rowCount - 1
      } 
      this.showModel(this.currentIndex)
    },
    async toNext(){
      const newIndex = this.currentIndex + 1
      this.loadData(newIndex,this.currentIndex)
      this.currentIndex = newIndex
    },
    async toPrevious(){
      const newIndex = this.currentIndex - 1
      this.loadData(newIndex,this.currentIndex)
      this.currentIndex = newIndex
    },
    loadData(newIndex,oldIndex){
      // console.log('newIndex,oldIndex :>> ', newIndex,oldIndex)
      if (newIndex < 0) {
        return
      }
      if(oldIndex >= 0){
        const model = this.modelList[oldIndex]
        const tempRow = this.rows.find(r => r.no.value == model.no)
        const wholeRef = this.$refs.singleInfoWholeRef
        wholeRef.setTableRowErrorAndWarningInfo(tempRow)
      }
      this.showModel(newIndex)
    }
  },
  computed: {
    rowCount () {
      return this.modelList.length
    }
  },
  watch: {
    formData:{
      handler:debounce(function(data){
        // console.log('this.currentIndex :>> ', this.currentIndex)
        const model = this.modelList[this.currentIndex]
        if(!model){
          return
        }
        // console.log('this.currentIndex :>> ', this.currentIndex,model.no,data.no)
        Object.assign(model,data) 
      },100),
      deep:true
    },
    dialogVisible (flag) {
      if (!flag) {
        this.currentIndex = -1
        this.$emit('update:visible', false)
      }
      // else{
      //   this.$refs.singleInfoWholeRef?.showBatchDialog()
      // }
    }
  }
}
</script>

<style lang="scss" scoped>
  .ky-dialog {
    /deep/ {
      .el-dialog__body {
        margin: 0 !important;
        padding: 0 !important;
        .rows-summary {
          position: relative;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f1f1f5;
          padding: 8px 12px;
          margin: 16px 20px;
          background-color: #f6f6f6;
          font-weight: bold;
          & > i {
            display: inline-block;
            width: 1px;
            height: 14px;
            background: #d8d8d8;
            margin: 0 10px 0 12px;
          }
          .btn-wrapper {
            position: relative;
            margin-left: auto;

            .el-button {
              border-radius: 4px;
              width: 80px;
              height: 28px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              &:not(.is-disabled) {
                border: 1px solid #8365f6;
                color: #8365f6;
              }
            }
            .el-button + .el-button {
              margin-left: 12px;
            }
            .btn-delete {
              margin-right: 12px;

              &::after {
                position: absolute;
                top: 5px;
                left: 91px;
                content: '';
                display: block;
                border-right: 1px solid #f1f1f5;
                height: 22px;
              }
            }
          }
        }
        .single-info-whole--container {
          background-color: #fff;
          .notice-container {
            min-width: 708px;
          }
        }
      }
    }
  }
</style>
