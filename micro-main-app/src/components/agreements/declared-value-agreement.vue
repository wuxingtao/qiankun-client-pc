<template>
  <ky-dialog title='保价声明' custom-class='declared-value-agreement__container' :visible.sync='visibleFlag' append-to-body width='700px'>
    <el-scrollbar style='height: 500px;'>
      <declared-value />
    </el-scrollbar>
    <div slot='footer' class='dialog-footer'>
      <el-button size='medium' type='primary' @click='visibleFlag = false'>我知道了</el-button>
    </div>
    <!-- <div slot="footer-left">
      <el-checkbox v-model="isChecked" @change="handleCheckChange">我已知晓，下次不再提醒</el-checkbox>
    </div> -->
  </ky-dialog>
</template>

<script>
import DeclaredValue from './declared-value.vue'
// import * as storageUtil from '@/utils/storage'

export default {
  components: {
    DeclaredValue
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      visibleFlag: false,
      // isChecked:false
    }
  },
  // methods:{
  //   handleCheckChange(checked){
  //     if(checked){
  //       storageUtil.getOrSetDeclaredValueFlag(true)
  //     }else{
  //       storageUtil.removeDeclaredValueFlag()
  //     }
  //   }
  // },
  watch: {
    visible (val) {
      this.visibleFlag = val
      // if(val){
      //   this.isChecked = storageUtil.getOrSetDeclaredValueFlag()
      // }
    },
    visibleFlag (val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
  .declared-value-agreement__container {
    .el-dialog__body {
      border-top: 1px solid #f1f1f5;
      border-bottom: 1px solid #f1f1f5;
      padding: 0 !important;
      margin: 0 !important;
      border-top: unset;
    }
    // .el-dialog__footer {
    //   display: flex;
    //   & > div:first-of-type {
    //     display: flex;
    //     align-items: center;
    //     .el-checkbox__input {
    //       line-height: 12px;
    //     }
    //     .el-checkbox__label {
    //       font-size: 12px;
    //       padding-left: 8px;
    //       color: #666666;
    //     }
    //   }
    // }
    // .dialog-footer {
    //   margin-left: auto;
    // }
  }
</style>


