<template>
  <div class="fill-batch-index-container">
<!--  重新导入  -->
    <el-upload class="upload-hidden" :auto-upload="false" :show-file-list="false" :on-change="handleReadExcel" action="" accept=".xls,.xlsx" ref="uploadRef"></el-upload>
<!-- 批量发货主页 -->
    <div v-if="!batchPage" class="index-wrapper" v-loading.lock="loading" element-loading-text="数据加载中...">
      <div>
        <div class="import-content">
          <import-template-tip :templateModifyList="templateModifyList" :newTemplateFlag.sync="newTemplateFlag" v-if="existsNewImportTemplate && newTemplateFlag === 1"/>
          <div class="upload-wrapper">
            <div @click='clickHandler'>
              <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleReadExcel" action="" accept=".xls,.xlsx" drag>
                <svg-icon icon-class="fill-import-upload" class-name="icon-upload" />
                <div class="category-title">批量导入</div>
                <div class="el-upload__text">点击上传文件</div>
              </el-upload>
            </div>
            <div class="download-wrapper" v-show="newTemplateFlag !== 1">
              <span>请先下载表格填写，再批量导入。表格模版：</span>
              <el-button type="text" @click="downloadTemplate">
                <svg-icon icon-class="download2" class="icon-tabs" /> 下载模版
                <img v-if="existsNewImportTemplate && newTemplateFlag === 2" src="~@/assets/image/delivery/batch/template-new.png"/>
              </el-button>
            </div>
          </div>
          <div class="description-wrapper">
            <div class="title">温馨提示</div>
            1、单次导入限制1000条数据； <br />
            2、表格中标红的列名为必填项； <br />
            3、如需导入自己的Excel文件，请在“设置中心-个性化模板设置”进行自定义设置模版； <br />
            4、如模版无法导入时，请检查文档是否加密或者被损坏。<br />
          </div>
        </div>
      </div>
      <div>
        <div class="fill-content">
          <div class="background-wrapper el-upload-dragger" @click="handleToBatchFill">
            <svg-icon icon-class="fill-batch" class-name="icon-upload" />
            <div class="category-title">批量填写</div>
            <div >点击去填写</div>
          </div>
          <div class="description-wrapper">
            <div class="title">温馨提示</div>
            1、批量填单从地址簿批量选择收方信息填单； <br />
            2、批量填单一次最多可从地址簿选择200条数据； <br />
            3、选择收方信息后，需要选择服务方式完善货物信息。
          </div>
        </div>
      </div>
    </div>
    <batch-import ref="batchImportRef" v-else-if="batchPage==='import'" :supplierOrderList="supplierOrderList" :visibleOfTable.sync="visibleOfTable" @on-close="$emit('update:batchPage')" @fileReUpload="handleFileReSelect" />
    <batch-fill ref="batchFillRef" :supplierOrderList="supplierOrderList" v-else-if="batchPage==='fill'" @on-close="$emit('update:batchPage')" />
    <adjust-price-notice ref="adjustPriceNoticeRef"/>
  </div>
</template>

<script>
import { ref, nextTick, watch, reactive, toRefs, computed } from '@vue/composition-api'

import BatchImport from './batch-import'
import BatchFill from './batch-fill'
import ImportTemplateTip from './components/import-template-tip'

import deliveryApi from '@api/delivery'
import deliveryUtil from '@/utils/deliveryUtil'
import { downloadImportExcelTemplate } from '@utils/clientUtil'
import batchImportOld from '../utils/batch-import-old'
import defaultConfigUtil from '../utils/defaultConfigUtil'
import useSupplier from '../hooks/useSupplier'
import AdjustPriceNotice from '../adjust-price/adjust-price-notice'
import { debounce } from 'lodash'

export default {
  props: {
    batchPage: String, //批量发货所在页面，首页为空，批量导入为'import'，批量填写为'fill'
    supplierOrderList: Array, //供应商订单
  },
  components: {
    BatchImport,
    BatchFill,
    ImportTemplateTip,
    AdjustPriceNotice
    // 'import-template-tip':()=>import('./components/import-template-tip')
  },
  setup (props,{root, emit}) {
    const batchImportRef = ref(null)
    const batchFillRef = ref(null)
    const adjustPriceNoticeRef = ref(null)
    const loading = ref(false)
    const visibleOfTable = ref(false)
    const { loadSupplierOrdersInBatchImport } = useSupplier()
    const state = reactive({
      newTemplateFlag:0, //0:无新模板，1:有新模板且提示详情，2：有新模板不提示详情
      templateModifyList:[]
    })

    watch(()=>root.$store.state.delivery.deliveryActiveTab,async tab=>{
      root.$store.commit('delivery/setImportTemplateUpdateFlag',false)
      if(tab === 'batch'){
        const res = await deliveryApi.getBatchImportTemplateStatus()
        const flag = res.data?.downloadStatus === 10
        root.$store.commit('delivery/setExistsNewImportTemplate',flag)
        if(res.code === 0 && res.data.downloadStatus === 10){
          state.newTemplateFlag = 1
          state.templateModifyList = res.data.tips
        }
      }
    })

    const existsNewImportTemplate = computed(()=>root.$store.state.delivery.existsNewImportTemplate)

    const loadSupplierOrderInfo = async () => {
      const rows = loadSupplierOrdersInBatchImport(props.supplierOrderList)
      if (!rows || rows.length < 1) {
        return
      }
      const modelList = await batchImportOld.convertExcelColumnNameAndData({
        isExcelDatas: false,
        excelDatas: rows,
      })
      visibleOfTable.value = true
      modelList.forEach((m,index)=>{
        m.no = index + 1
      })
      await defaultConfigUtil.handleDeclaredValue(modelList)
      nextTick(() => {
        batchImportRef.value.loadData({modelList,autoMatchService:true})
      })
    }
    const handleReadExcel = file=>{
      visibleOfTable.value = true
      nextTick(()=>{
        batchImportRef.value.loadExcelFile(file)
        adjustPriceNoticeRef.value.loadCustomerAdjustPriceNotice()
      })
    }
    
    const handleToBatchFill = () => {
      emit('update:batchPage','fill')
      adjustPriceNoticeRef.value.loadCustomerAdjustPriceNotice()

      root.$reportUtils.clkExpressBatchButton({ button_name: '批量填写' })
    }

    const checkSenderAddressListInFill = ()=>{
      setTimeout(() => {
        batchFillRef.value.checkSenderAddressList()
      }, 300)
    }

    return {
      batchImportRef,
      batchFillRef,
      adjustPriceNoticeRef,
      ...toRefs(state),
      existsNewImportTemplate,
      loading,
      visibleOfTable,
      loadSupplierOrderInfo,
      handleReadExcel,
      checkSenderAddressListInFill,
      handleToBatchFill
    }
  },
  data() {
    return {
      customerCode: '',
      phone: ''
    }
  },
  methods: {
    async downloadTemplate () {
      this.$reportUtils.clkExpressBatchButton({ button_name: "下载模板" })
      downloadImportExcelTemplate()
    },
    async loadCopyWaybills (ydNoList) {
      this.loading = true
      try {
        const res = await deliveryApi.queryWaybillListByWaybillNumbers(ydNoList)
        if(res.code !== 0 || !res.data?.result){
          return
        }
        const modelList = res.data.result.map(d=>deliveryUtil.convertWaybillDetaillToFormData(d,true))
        modelList.forEach((m,index)=>{
          m.no = index + 1
        })
        const modelListNew = await batchImportOld.convertExcelColumnNameAndData({
          isExcelDatas: false,
          excelDatas: modelList,
          notLoadDefaultConfig: true,
        })
        this.visibleOfTable = true
        await defaultConfigUtil.handleDeclaredValue(modelListNew)
        this.$nextTick(() => {
          this.$refs.batchImportRef.loadData({modelList:modelListNew,autoMatchService:true})
        })
      } finally {
        this.loading = false
      }
    },
    // 批量导入重选重选
    handleFileReSelect(){
      this.$refs.uploadRef?.$refs['upload-inner'].handleClick()
    },
    clickHandler: debounce(function(){
      // debounce处理点击时会触发两次
      this.$reportUtils.clkExpressBatchButton({ button_name: "批量导入" })
    })
  },
  watch: {
    visibleOfTable (val) {
      this.$emit('update:batchPage', val ? 'import' : '')
      this.$store.commit('delivery/setImportTemplateUpdateFlag',false)
    },
    batchPage (page) {
      this.$store.commit('delivery/setDeliveryBatchPage', page)
      if (!page) {
        this.visibleOfTable = false
        this.$refs.adjustPriceNoticeRef.handleClose()
      }
    },
    supplierOrderList: {
      handler (list) {
        if (!list || list.length < 1) {
          return
        }
        try {
          this.loading = true
          this.$nextTick(() => {
            this.loadSupplierOrderInfo()
          })
        } finally {
          this.loading = false
        }
      },
      immediate: true,
    },
  }
}
</script>


<style lang="scss" scoped>
  .fill-batch-index-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    .index-wrapper {
      display: flex;
      justify-content: space-between;
      height: 100%;
      background-color: #f5f7fb;
      & > div {
        background: #fff;
        border-radius: 8px;
        padding: 60px 8px;
        flex: 1;
        display: flex;
        justify-content: center;
        color: rgba(255, 255, 255, 0.93);
        &:first-of-type {
          margin-right: 8px;
        }
      }

      .import-content,
      .fill-content {
        width: 502px;
        .category-title {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 14px;
        }
        .icon-upload {
          width: 70px;
          height: 70px;
          margin-bottom: 21px;
        }
        .description-wrapper {
          margin-top: 75px;
          font-size: $--font-size-base;
          color: #999999;
          line-height: 22px;
          .title {
            color: $--color-text-primary;
            font-weight: bold;
            margin-bottom: 10px;
          }
        }
      }

      .import-content {
        position: relative;
        .upload-wrapper {
          /deep/.el-upload {
            width: 100%;
            height: 254px;
            background: url('~@/assets/image/shipment/fill-import-bg.png') no-repeat;
            background-size: 100% 100%;
            .el-upload-dragger {
              background: transparent;
              width: 100%;
              height: 100%;
              padding-top: 50px;
              .category-title,
              .el-upload__text {
                color: #4f7cee;
              }
              .el-upload__text {
                font-size: $--font-size-base;
              }
            }
          }
          .download-wrapper {
            font-size: $--font-size-small;
            color: #03050d;
             .el-button {
                padding: 10px 0;
                font-size: $--font-size-small;
                position: relative;
                /deep/img{
                  position: absolute;
                  top: 0;
                  right: -30px;
                  width: 35px;
                  height: 18px;
                }
            }
          }
        }
      }
      .fill-content {
        .background-wrapper {
          width: 100%;
          height: 254px;
          background: url('~@/assets/image/shipment/fill-batch-bg.png') no-repeat;
          background-size: 100% 100%;
          padding-top: 50px;
          margin-bottom: 116px;
          color: #d99825;
        }
      }
    }
    /deep/ {
      @include loading;
      .el-loading-mask .el-loading-text {
        padding-top: 130px;
      }
    }
  }
  .upload-hidden{
    visibility: hidden;
    height: 0;
  }
</style>
