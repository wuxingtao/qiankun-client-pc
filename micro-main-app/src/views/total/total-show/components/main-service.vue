<template>
    <div class="main-service">
        <list-button :leftTitle="leftTitle" :rightTitle="rightTitle" v-model="type"></list-button>
        <main-service-success v-show="type==='left'" :data="data" :formData="formData"></main-service-success>
        <main-service-time v-show="type==='right'" :data="data"  :formData="formData" :changeSort="changeSort"></main-service-time>
    </div>
</template>
<script>
import {getAuth} from '@/utils/total'
import ListButton from '../../components/list-button'
import MainServiceSuccess from './main-service-success'
import MainServiceTime from './main-service-time'
export default {
  name: "mainService",
  props:{
    formData:{
      type: Object,
      default:()=>({})
    },
    data:{
      type: Object,
      default:()=>({})
    },
    changeSort: { type: Function }
  },
  components:{
    ListButton,
    MainServiceSuccess,
    MainServiceTime
  },
  computed:{
    rightTitle(){
      return '时效流向分析'
      /*if(getAuth(this,'reachRate')){
        return '时效流向分析'
      }*/
    },
      leftTitle() {
          if (getAuth(this, 'reachNumber') || getAuth(this, 'reachRate') || getAuth(this, 'deliveredPoll') || getAuth(this, 'delivereRate')) {
              return '质量达成'
          }
      }
  },
  mounted() {
    if(getAuth(this,'deliveredPoll')|| getAuth(this,'delivereRate')||getAuth(this,'reachNumber') || getAuth(this,'reachRate')){
      this.type='left'
    }else if(getAuth(this,'reachRate')){
      this.type='right'
    }
  },
  data(){
    return {
      type: 'left',
    }
  }
}
</script>

<style scoped lang="scss">
    .main-service{
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
</style>




