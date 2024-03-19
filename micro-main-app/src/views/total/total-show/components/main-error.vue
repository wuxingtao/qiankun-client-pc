<template>
    <div class="mainErrorCustomer">
        <list-button :leftTitle="leftTitle" :rightTitle="rightTitle" v-model="type"></list-button>
        <main-error-time v-show="type==='left'"  :formData="formData" :data="data"></main-error-time>
        <main-error-customer v-show="type==='right'" :formData="formData" :data="data"></main-error-customer>
    </div>
</template>
<script>
import ListButton from '../../components/list-button'
import MainErrorTime from './main-error-time'
import MainErrorCustomer from './main-error-customer'
import {getAuth} from '@/utils/total'
export default {
  name: "mainError",
  props:{
    formData:{
      type: Object,
      default:()=>({})
    },
    data:{
      type: Object,
      default:()=>({})
    }
  },
  computed:{
    leftTitle(){
      if(getAuth(this,'delayRate') || getAuth(this,'delayNumber')||getAuth(this,'collectedTimeoutRate') || getAuth(this,'collectedTimeoutNumber')){
        return '超时分析'
      }
    },
    rightTitle(){
      if(getAuth(this,'wornLoseNumber')|| getAuth(this,'returnNumber')){
        return '客户异常分析'
      }
    }
  },
  mounted() {
    if(getAuth(this,'delayRate') || getAuth(this,'delayNumber')||getAuth(this,'collectedTimeoutRate') || getAuth(this,'collectedTimeoutNumber')){
      this.type='left'
    }else if(getAuth(this,'wornLoseNumber')|| getAuth(this,'returnNumber')){
      this.type='right'
    }
  },
  components:{
    ListButton,
    MainErrorTime,
    MainErrorCustomer
  },
  data(){
    return {
      type: 'left',
      winHeight: 937,
    }
  }
}
</script>

<style scoped lang="scss">
    .mainErrorCustomer{
        display: flex;
        flex-direction: column;
        flex: 1;
    }
</style>




