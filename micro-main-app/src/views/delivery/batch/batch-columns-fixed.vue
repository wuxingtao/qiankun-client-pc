<template>
  <div class="batch-columns-fixed__container" v-if="!importCurrentStep || importCurrentStep < 2">
    <!-- <el-button @click.native.prevent="uploadFiles(rowIndex, row)" type="text" size="small">
      上传资料
    </el-button> -->
    <table-cell-error-tip v-if='!isBatchFill && row.errors &&row.errors.length>0' :errors="row.errors"/>
    <cell-tip-address :row="row"/>
  </div>
</template>

<script>
import TableCellErrorTip from '@/components/table/components/table-cell-error-tip'
import CellTipAddress from './table-cell-template/cell-tip-address'

export default {
  props: {
    row: {
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
  components:{
    TableCellErrorTip,
    CellTipAddress
  },
  setup(){
    const uploadFiles = () => {

    }
    return{
      uploadFiles
    }
  }
}
</script>

<style scoped>
.batch-columns-fixed__container{
  display: inline-block;
  /* padding-left: 20px; */
}
</style>
