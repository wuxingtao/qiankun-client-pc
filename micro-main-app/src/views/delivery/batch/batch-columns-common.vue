<template>
  <cell-waybill-number v-if="showColumn('ydNo')" :row="row" :col="col"/>
  <cell-weight v-else-if="showColumn('weight')" :row="row" :col="col" @change="handleChange" />
  <cell-cube v-else-if="showColumn('cube')" :row="row" :col="col" @change="handleChange" />
  <cell-service-way v-else-if="showColumn('serviceWay')" :row="row" :col="col" @change="handleChange" @visible-change="serviceWayVisibleChange"/>
  <cell-mj-way v-else-if="showColumn('mjWay')" :row="row" :col="col" :is-batch-fill="isBatchFill" @change="handleChange" />
  <cell-freight v-else-if="showColumn('estimateFreight')" :row='row' :visibleDiscounted="isBatchFill" />
  <cell-declared-value v-else-if="showColumn('declaredValue')" :row='row' :col='col' :readonly="importCurrentStep > 1" @change='e=>{handleColumnCustomEvent(e)}' />
  <cell-customs-charge v-else-if="showColumn('checkedCustomsCharge')" :row='row' :col='col' :readonly="importCurrentStep > 1"  @change="handleChange"/>
  <el-button  v-else-if="showColumn('superZoneTip')"  @click='handleColumnCustomEvent({row})' type='text' size='small' style='color:#f13e3e'>
     {{ row[col.prop].value }}
  </el-button>
  <el-button v-else-if="showColumn('goods')" @click='handleModifyGoods(row)' type='text' size='small'>
    {{ row[col.prop].value || '添加托寄物' }}
    <dialog-goods ref='dialogGoodsRef' />
  </el-button>
  <el-button v-else-if="showColumn('sizeList')" @click='handleModifySizeList(row)' size='mini' style="height:28px;padding: 0 6px;width:100%;">
    <i class='iconfont icon-edit' />
    {{ importCurrentStep > 1 ? '查看' : (row.sizeList.value && row.sizeList.value.length > 0) ? '修改' : '添加' }} 
    <!-- <tip-normal style="margin-top: 12px" :msg="getVolumetricWeightText(row)" :can-close="false"/> -->
    <dialog-standard-size ref='dialogGoodsSizeRef' />
  </el-button>

</template>

<script>
import { ref } from '@vue/composition-api'
import DialogGoods from '@/views/supplier-management/sku/components/dialog-goods.vue'
import DialogStandardSize from './../components/dialog-standard-size/index'

import CellWeight from './table-cell-template/cell-weight'
import CellCube from './table-cell-template/cell-cube'
import CellServiceWay from './table-cell-template/cell-service-way'
import CellMjWay from './table-cell-template/cell-mj-way'
import CellFreight from './table-cell-template/cell-freight'
import CellDeclaredValue from './table-cell-template/cell-declared-value'
import CellWaybillNumber from './table-cell-template/cell-waybill-number'
import CellCustomsCharge from './table-cell-template/cell-customs-charge'

import useBatchWeightSizeValidate from './hooks/useBatchWeightSizeValidate'

export default {
  components: {
    CellCube,
    CellWeight,
    CellServiceWay,
    CellMjWay,
    CellFreight,
    DialogGoods,
    DialogStandardSize,
    CellDeclaredValue,
    CellWaybillNumber,
    CellCustomsCharge
  },
  props: {
    row: {
      type: Object,
      required: true
    },
    col: {
      type: Object,
      required: true
    },
    isBatchFill: {
      type: Boolean
    },
    importCurrentStep: {
      type: Number
    },
    tableEditableRef: {
      type: Object
    }
  },
  setup (props, { emit }) {
    const dialogGoodsRef = ref(null)
    const dialogGoodsSizeRef = ref(null)
    const showColumn = columnName => props.col.prop === columnName
    const handleChange = e => {
      emit('change', e)
    }
    const handleColumnCustomEvent = e => {
      const params = Object.assign({}, e, { fieldName: props.col.prop })
      if( params.fieldName === 'declaredValue'){
        handleChange(e)
      }
      emit('custom-event', params)
    }

    const handleModifyGoods = row => {
      dialogGoodsRef.value.showDialog(row)
    }
    const handleModifySizeList = async row => {
      const { setPlaneOverloadInfo } = useBatchWeightSizeValidate()
      if(!row['planeListInfo']?.value){
        await setPlaneOverloadInfo(row)
      }
      const callbackFunc = (sizeList, cube) => {
        row.sizeList.value = sizeList
        row.cube.value = cube
        props.tableEditableRef.verifyField('sizeList', row.sizeList, row, false)
      }
      const params = {
        sizeList: row.sizeList.value,
        callback: callbackFunc,
        readonly: props.importCurrentStep > 1,
        cube: row.cube.value,
        planeListInfo:row.planeListInfo?.value,
        serviceWay:row.serviceWay.value,
        volumetricWeightRatio: row.volumetricWeightRatio.value
      }
      dialogGoodsSizeRef.value.showDialog(params)
    }
    
    const serviceWayVisibleChange = flag => {
      const haveDescription = props.row.serviceWay?.options?.some(i=>i.description)
      if(flag && !haveDescription){
        emit('custom-event',  { fieldName:'serviceWay',row:props.row})
      }
    }

   

    return {
      dialogGoodsRef,
      dialogGoodsSizeRef,
      showColumn,
      handleChange,
      handleColumnCustomEvent,
      handleModifyGoods,
      handleModifySizeList,
      serviceWayVisibleChange
    }
  }
}
</script>

<style>
</style>