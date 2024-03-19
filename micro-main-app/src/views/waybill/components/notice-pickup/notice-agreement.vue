<template>
  <div class="notice-agreement--container">
     <el-checkbox class="checkbox" v-model="isChecked"></el-checkbox>
        <div @click="visibleOfTerms=true" style="cursor:pointer">
          <span>我已阅读并同意</span>
          <span class="spec">《电子运单契约条款》</span>
        </div>
        <!-- 电子运单协议 -->
    <ky-electronic :visible.sync="visibleOfTerms"></ky-electronic>
  </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import { ElectronicService } from '@comps'

export default {
  components:{
    'ky-electronic': ElectronicService,
  },
  props:{
    agreementChecked:{
      type:Boolean
    }
  },
  setup(props,{emit}) {
    const visibleOfTerms = ref(false)
    const isChecked = ref (props.agreementChecked)

    watch(isChecked,flag=>{
      emit('update:agreementChecked',flag)
    })
    return {
      visibleOfTerms,
      isChecked
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-agreement--container{
   display: flex;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    color: #666;
    .el-checkbox{
      margin-right: 8px;
    }
    .spec {
      color: #8365f6;
    }
}
/deep/ .el-checkbox__inner{
  &::after{
    transition: none;
  }
}
</style>
