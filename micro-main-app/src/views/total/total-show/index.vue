<template>
  <div class='dashboard'>
    <header-bg :formData='formData' :path='path'></header-bg>
    <header-list v-if='isReal' :data='realData' :formData='formData'></header-list>
    <header-form :formData='formData' :needSendTime='needSendTime' @search='searchHeader'></header-form>
    <div class='container'>
      <aside-list class='aside' v-model='asideType' :business='business' :asideMenu='asideMenu' :asideList='realData'
                  :upTime='updateTime' @select='searchAside'></aside-list>
      <div class='main' ref='main'>
        <!-- 业务概况 -->
        <main-business v-if="asideType==='business'" :data='business' :formData='copyFormData'></main-business>
        <!-- 服务质量 -->
        <main-service v-if="asideType==='service'" :data='service' :formData='copyFormData'
                      :changeSort='changeSort'></main-service>
        <!-- 异常分析 -->
        <main-error v-if="asideType==='error'" :data='error' :formData='copyFormData'></main-error>
      </div>
    </div>
  </div>
</template>

<script>
import methods from './methods'
import { cloneDeep } from 'lodash'
import { initParm } from './comfig'
import HeaderBg from './components/header-bg'
import HeaderList from './components/header-list'
import HeaderForm from './components/header-form'
import AsideList from './components/aside-list'
import MainBusiness from './components/main-business'
import MainError from './components/main-error'
import MainService from './components/main-service'
import { getAuth, checkAuth } from '@/utils/total'

export default {
  name: 'total-show',
  components: {
    HeaderBg,
    HeaderList,
    HeaderForm,
    AsideList,
    MainBusiness,
    MainError,
    MainService
  },
  data() {
    return {
      copyFormData: cloneDeep(initParm),
      param: {},
      oldParams: {},
      // form 数据
      formData: cloneDeep(initParm),
      formDataOld: {},
      asideType: 'business',
      asideMenu: {
        overview: {},
        serviceQuality: {},
        anomalous: {}
      },
      //  业务概况
      business: {
        ticketData: {},
        weightRation: {},
        actualWeightRation: {},
        costRation: {},
        costTrendList: {},
        weightRationLoading: false,
        costRationLoading: false,
        actualWeightRationLoading: false,
        ticketDataLoading: false
      },
      //服务质量
      service: {
        isSortAgingTop5: false,
        agingTop5: [],
        delivered: {},
        agingAchieved: {},
        agingFlow: {},
        qualityAreaList: [],
        agingTop5Loading: false,
        deliveredLoading: false,
        agingAchievedLoading: false,
        agingFlowLoading: false,
        qualityAreaListLoading: false
      },
      // 错误分析
      error: {
        collectTimeout: {},
        unAgingAchieved: {},
        deliveryOuttimes: {},
        analysis: {},
        unAgingAchievedLoading: false,
        collectTimeoutLoading: false,
        analysisLoading: false,
        deliveryOuttimesLoading: false
      },
      // 物流实时状态 数据
      realData: {},
      path: '',
      updateTime: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  mounted() {
    /* //  权限的key
    let businessKey= ['totalPoll','totalNumber','realTotalWeight','totalBillWeight','totalCost']
    let serviceKey=['delivereRate','deliveredPoll','reachRate','reachNumber']
    let errorKey=['delayRate','delayNumber','collectedTimeoutRate','collectedTimeoutNumber','wornLoseNumber','returnNumber']
    this.search(this.formData)
    this.leftPanel(this.formData)
    if( getAuth(this,'collected')||getAuth(this,'transiting')||getAuth(this,'delivey')||getAuth(this,'notsigned')){
      this.getNavigateQueryRealTime()
      //  实时查询
      this.timer=setInterval(()=>{
        this.getNavigateQueryRealTime()
      },10000)
    }
    if(this.isAuth(businessKey)){
      this.asideType= 'business'
    }else if(this.isAuth(serviceKey)){
      this.asideType= 'service'
    }else if(this.isAuth(errorKey)){
      this.asideType= 'error'
    }*/
  },
  methods: methods,
  //路由
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.path = from.path
      vm.$store.dispatch('tatol/GET_TOTALS_AUTH', 'dataBoard').then(async (reg) => {
        let data = reg['dataBoard']
        if (checkAuth(data)) {
          //  权限的key
          let businessKey = ['totalPoll', 'totalNumber', 'realTotalWeight', 'totalBillWeight', 'totalCost']
          let serviceKey = ['delivereRate', 'deliveredPoll', 'reachRate', 'reachNumber', 'timelyCheckInNumber', 'timelyCheckInRate']
          let errorKey = ['delayRate', 'delayNumber', 'collectedTimeoutRate', 'collectedTimeoutNumber', 'wornLoseNumber', 'returnNumber']
          vm.search(vm.formData)
          vm.leftPanel(vm.formData)
          if (getAuth(vm, 'collected') || getAuth(vm, 'transiting') || getAuth(vm, 'delivey') || getAuth(vm, 'notsigned')) {
            vm.getNavigateQueryRealTime()
            //  实时查询
            vm.timer = setInterval(() => {
              vm.getNavigateQueryRealTime()
            }, 10000)
          }
          if (vm.isAuth(businessKey)) {
            vm.asideType = 'business'
          } else if (vm.isAuth(serviceKey)) {
            vm.asideType = 'service'
          } else if (vm.isAuth(errorKey)) {
            vm.asideType = 'error'
          }
        } else {
          vm.$message.error('请检查是否有权限')
          vm.$router.push('/admin/waybill')
        }
      }).catch((error) => {
        if (error && error.auth === true) {
          vm.$message.error(error.msg)
          vm.$router.push('/admin/waybill')
        }
      })
    })
  },
  computed: {
    isReal() {
      return getAuth(this, 'collected') || getAuth(this, 'transiting') || getAuth(this, 'delivey') || getAuth(this, 'notsigned')
    },
    needSendTime() {
      return getAuth(this, 'needSendTime')
    },
    mainHeight() {
      return this.$refs.main.offsetHeight
    }
  }
}
</script>

<style scoped lang='scss'>
.dashboard {
  width: 100%;
  height: 100%;
  min-width: 1280px;
  min-height: 705px;
  display: flex;
  flex-direction: column;
  
  .container {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .aside {
      width: 27.6vw;
      min-width: 400px;
    }
    
    .main {
      display: flex;
      flex: 1;
      padding: 1.2rem 1.8rem;
      overflow: hidden;
    }
  }
}
</style>
