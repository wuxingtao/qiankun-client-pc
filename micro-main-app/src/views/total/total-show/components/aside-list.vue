<template>
  <div class="aside-list">
    <template v-for="(item,index) in list">
      <div v-if="item.auth" @click="select(item)" :class="['aside-list-item', item.type===value?isActiveClass:'']" :key="item.id?item.id:index">
        <div class="title">
            <list-title-icon :title="item.title" :upTime="item.upTime" :popper-class="item.popoverClass" :url="item.url" trigger="hover"  :placement="item.placement" :popoverData="item.popoverData"></list-title-icon>
        </div>
        <div class="data">
            <template v-for="(child, index) in item.list">
                <div :key="index" class="data-item" v-if="child.auth">
                    <el-popover v-if="child.tooltip === 'custom'" placement="top" trigger="hover">
                        <div v-html="child.tooltipContent"></div>
                        <list-item slot="reference" :total="child.total" :tooltip="true" :title="child.title" titleSize="1.6rem" totalSize="2rem" :totalWeight="700"></list-item>
                    </el-popover>
                    <el-popover v-if="child.tooltip === 'text'" placement="top" trigger="hover" :content="child.tooltipContent">
                        <list-item slot="reference" :total="child.total" :tooltip="true" :title="child.title" titleSize="1.6rem" totalSize="2rem" :totalWeight="700"></list-item>
                    </el-popover>
                    <list-item v-if="child.tooltip === 'none'" :total="child.total" :title="child.title" titleSize="1.6rem" totalSize="2rem" :totalWeight="700"></list-item>
                </div>
            </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import ListTitleIcon from '../../components/list-title-icon'
import ListItem from '../../components/list-item'
import { numberInt, numberFixed, toWamTon, toBaiWam, thousands, toWamTonUnit, toBaiWamUnit} from '@/utils/total.js'
import { getAuth } from '@/utils/total'
export default {
  name: 'aside-list',
  props:{
    business:{
      type: Object,
      default: ()=>({})
    },
    value:{
      type: String,
      default: 'business'
    },
    asideMenu:{
      type: Object,
      default: ()=>({})
    },
    asideList:{
      type:Object,
      default:()=>({})
    },
    upTime: {
      type: String,
      default: ''
    }
  },
  components:{
    ListTitleIcon,
    ListItem
  },
  data() {
    return {
    }
  },
  computed:{
    isActiveClass() {
      return 'is-active-' + this.value
    },
    list(){
      let sumWeightsTitle='计费重量(KG)'
      let sumAmountsTitle='总费用(元)'
      let sumActualWeightTitle='实际重量(KG)'
      let overview = this.asideMenu.overview || {}
      let serviceQuality= this.asideMenu.serviceQuality || {}
      let anomalous = this.asideMenu.anomalous || {}
      let toasts = this.asideMenu.toasts || {}
      
      if(overview&&overview.sumWeights){
        sumWeightsTitle='计费重量'+toWamTonUnit(overview.sumWeights)
      }
      if(overview&&overview.sumAmounts){
        sumAmountsTitle='总费用'+toBaiWamUnit(overview.sumAmounts)
      }
      if(overview&&overview.totalActualWeight) {
        sumActualWeightTitle='实际重量'+toWamTonUnit(overview.totalActualWeight)
      }
      let businessKey= ['totalPoll','totalNumber','realTotalWeight','totalBillWeight','totalCost']
      let serviceKey = ['delivereRate','deliveredPoll','reachRate','reachNumber','timelyCheckInNumber','timelyCheckInRate']
      let errorKey = ['delayRate', 'delayNumber', 'collectedTimeoutRate', 'collectedTimeoutNumber', 'wornLoseNumber', 'returnNumber', 'delayCheckInRate', 'delayCheckInNumber']
      let ar1= [
        {
          auth: getAuth(this,businessKey[0]),
          title: '总票数',
          total: thousands(overview.totalVote, 0),
          tooltip: 'none'
        },
        {
          auth: getAuth(this,businessKey[1]),
          title: '总件数',
          total: thousands(overview.totalUnit, 0),
          tooltip: 'none'
        },
        {
          auth: getAuth(this,businessKey[4]),
          title: sumAmountsTitle, //总费用
          total: toBaiWam(overview.sumAmounts,false),
          tooltipContent: numberFixed(overview.sumAmounts) + '(元)',
          tooltip: 'text'
        },
        {
          auth: getAuth(this,businessKey[3]),
          title: sumWeightsTitle, //计费总重量
          total: toWamTon(overview.sumWeights,false),
          tooltipContent: numberFixed(overview.sumWeights) + '(KG)',
          tooltip: 'text'
        },
        {
          auth: getAuth(this,businessKey[2]),
          title: sumActualWeightTitle, //实际总重量
          total: toWamTon(overview.totalActualWeight, false),
          tooltipContent: numberFixed(overview.totalActualWeight) + '(KG)',
          tooltip: 'text'
        }
      ]
      let ar2=[
        {
          auth: getAuth(this,businessKey[0]),
          title: '总票数',
          total: thousands(overview.totalVote, 0),
          tooltip: 'none'
        },
        {
          auth: getAuth(this,businessKey[1]),
          title: '总件数',
          total: thousands(overview.totalUnit, 0),
          tooltip: 'none'
        },
        {
          auth: getAuth(this,businessKey[4]),
          title: sumAmountsTitle,
          total: toBaiWam(overview.sumAmounts, false),
          tooltipContent: numberFixed(overview.sumAmounts) + '(元)',
          tooltip: 'text'
        },
        {
          auth: getAuth(this,businessKey[3]),
          title: sumWeightsTitle,
          total: toWamTon(overview.sumWeights,false),
          tooltipContent: numberFixed(overview.sumWeights) + '(KG)',
          tooltip: 'text'
        }
      ]
      let arr = overview.totalActualWeight || overview.totalActualWeight===0? ar1: ar2
      let businessPopover= '查询时间范围内，每票运单产生的费用总和，具体金额以公司对账单为准'
      if(this.business.costRation&&this.business.costRation.sumClientFlexDecimal){
        businessPopover= '查询时间范围内，每票运单产生的费用总和，已减去优惠金额，具体金额以公司对账单为准'
      }
      let list = [
        {
          upTime: this.upTime,
          type: 'business',
          title: '业务概况',
          url: require('../../../../assets/image/total/yewugaikuang.png'),
          list: arr,
          auth: this.isAuth(businessKey),
          popoverClass:'popover-business20210806',
          placement:'right-end',
          popoverData: [
            { title: '总票数', content: '查询时间范围内，运单总票数', auth: getAuth(this,businessKey[0])},
            { title: '总件数', content: '查询时间范围内，运单总件数', auth: getAuth(this,businessKey[1])},
            { title: '计费总重量', content: '查询时间范围内，运单总计费重量', auth:getAuth(this,businessKey[3])},
            { title: '实际总重量', content: '查询时间范围内，运单总实际重量', auth:getAuth(this,businessKey[2])},
            { title: '总费用', content: businessPopover, auth:getAuth(this,businessKey[4])},
          ]
        },
        {
          upTime: this.upTime,
          type: 'service',
          title: '服务质量',
          auth: this.isAuth(serviceKey),
          url: require('../../../../assets/image/total/fuwuzhiliang.png'),
          list:[
            {
              auth: getAuth(this,serviceKey[0]),
              title: '妥投率',
              total: serviceQuality.deliveredRate ? serviceQuality.deliveredRate+'%' : 0,
              tooltip: 'none'
            },
            {
              auth: getAuth(this,serviceKey[1]),
              title: '妥投票数',
              total: thousands(serviceQuality.deliveredVotes, 0),
              tooltip: 'none'
            },
            {
              auth: getAuth(this,serviceKey[2]),
              title: '时效达成率',
              total: serviceQuality.agingAchievedRate ? serviceQuality.agingAchievedRate + '%': 0,
              tooltip: 'none'
            }, 
            {
              auth: getAuth(this,serviceKey[3]),
              title: '时效达成票数',
              total: thousands(serviceQuality.agingAchievedVotes, 0),
              tooltip: 'none'
            },
            {
              auth: getAuth(this,serviceKey[4]),
              title: '派签到及时率',
              total: serviceQuality.deliveryInTimeRate ? serviceQuality.deliveryInTimeRate + '%': 0,
              tooltip: 'none'
            },
            {
              auth: getAuth(this,serviceKey[5]),
              title: '派签到及时票数',
              total: thousands(serviceQuality.deliveryInTimeVotes, 0),
              tooltip: 'none'
            }
          ],
          placement:'right-end',
          popoverData:[
            { title: '妥投率', content: ' 查询时间范围内，已签收票数 / 运单总票数',auth: getAuth(this,serviceKey[0])},
            { title: '妥投票数', content: '查询时间范围内，已签收票数',auth: getAuth(this,serviceKey[1])},
            { title: '时效达成率', content: '查询时间范围内，时效内已签收运单票数 / 运单总票数',auth: getAuth(this,serviceKey[2]) },
            { title: '时效达成票数', content: '查询时间范围内，时效内已签收票数',auth: getAuth(this,serviceKey[3]) },
            { title: '派签到及时率', content: '查询时间范围内，时效内已派签到运单票数/运单总票数',auth: getAuth(this,serviceKey[4]) },
            { title: '派签到及时票数', content: '查询时间范围内，时效内已派签到运单票数',auth: getAuth(this,serviceKey[5]) },
          ]
        },
        {
          upTime: this.upTime,
          type: 'error',
          title: '异常分析',
          auth: this.isAuth(errorKey),
          url: require('../../../../assets/image/total/yichangfenxi.png'),
          list:[
            {
              auth: getAuth(this,errorKey[0]),
              title: '时效延误率',
              total:anomalous.unAgingAchievedRate ? anomalous.unAgingAchievedRate+'%': 0,
              tooltipContent: `<p>客户原因 ${toasts.customerReasonSignTimeoutRate || 0}%</p><p>跨越原因 ${toasts.kyeReasonSignTimeoutRate || 0}%</p><p>不可抗力原因 ${toasts.forceMajeureSignTimeoutRate || 0}%</p>`,
              tooltip: 'custom'
            },
            {
              auth: getAuth(this,errorKey[1]),
              title: '时效延误票数',
              total: thousands(anomalous.unAgingAchievedVotes, 0),
              tooltipContent: `<p>客户原因 ${toasts.customerReasonSignTimeoutVote || 0}</p><p>跨越原因 ${toasts.kyeReasonSignTimeoutVote || 0}</p><p>不可抗力原因 ${toasts.forceMajeureSignTimeoutVote || 0}</p>`,
              tooltip: 'custom'
            },
            {
              auth: getAuth(this,errorKey[6]),
              title: '派签到延误率',
              total: anomalous.deliveryOuttimeRate ? anomalous.deliveryOuttimeRate + '%' : 0,
              tooltipContent: `<p>客户原因 ${toasts.customerReasonSendCheckTimeoutRate || 0}%</p><p>跨越原因 ${toasts.kyeReasonSendCheckTimeoutRate || 0}%</p><p>不可抗力原因 ${toasts.forceMajeureSendCheckTimeoutRate || 0}%</p>`,
              tooltip: 'custom'
            },
            {
              auth: getAuth(this,errorKey[7]),
              title: '派签到延误票数',
              total: numberInt(anomalous.deliveryOuttimeVotes),
              tooltipContent: `<p>客户原因 ${toasts.customerReasonSendCheckTimeoutVote || 0}</p><p>跨越原因 ${toasts.kyeReasonSendCheckTimeoutVote || 0}</p><p>不可抗力原因 ${toasts.forceMajeureSendCheckTimeoutVote || 0}</p>`,
              tooltip: 'custom'
            },
            {
              auth: getAuth(this,errorKey[4]),
              title: '破损丢失票数',
              total: numberInt(anomalous.damagedLostVotes),
              tooltip: 'none'
            },
            {
              auth: getAuth(this,errorKey[5]),
              title: '转寄退回票数',
              total: numberInt(anomalous.returnChangeVotes),
              tooltip: 'none'
            },
            {
              auth: getAuth(this,errorKey[2]),
              title: '揽收超时率',
              total: anomalous.collectTimeoutRate?anomalous.collectTimeoutRate+'%':0,
              tooltip: 'none'
            }, {
              auth: getAuth(this,errorKey[3]),
              title: '揽收超时票数',
              total: numberInt(anomalous.collectTimeoutVotes),
              tooltip: 'none'
            }
          ],
          placement:'right-end',
          popoverData:[
            { title: '时效延误率', content: '查询时间范围内，时效内未签收运单票数 / 运单总票数',auth: getAuth(this, errorKey[0])},
            { title: '时效延误票数', content: '查询时间范围内，时效内未签收的票数',  auth: getAuth(this, errorKey[1])},
            { title: '派签到延迟率', content: '查询时间范围内，运单在“时效外” 签到运单（汇总）的票数 / 运单总票数 ，百分比', auth: getAuth(this,errorKey[6])},
            { title: '派签到延迟票', content: '查询时间范围内，运单在“时效外” 签到运单（汇总）的票数', auth: getAuth(this, errorKey[7])},
            { title: '破损丢失票数', content: '查询时间范围内，破损丢失票数', auth: getAuth(this, errorKey[4])},
            { title: '转寄退回票数', content: ' 查询时间范围内，运单转寄或退回的运单票数', auth: getAuth(this, errorKey[5])},
            { title: '揽收超时率', content: '查询时间范围内，揽收超时票数 / 运单总票数',  auth: getAuth(this, errorKey[2])},
            { title: '揽收超时票数', content: '查询时间范围内，揽收超时的票数', auth: getAuth(this, errorKey[3])}
          ]
        }
      ]
      return list
    }
  },
  methods:{
    isAuth(keys) {
      let isAuth=false
      if (this.$store.state && this.$store.state.tatol && this.$store.state.tatol.auth && this.$store.state.tatol.auth.dataBoard) {
        let  dataBoard=this.$store.state.tatol.auth.dataBoard
        keys.forEach((key)=>{
          if(+dataBoard[key]===10){
            isAuth =true
          }
        })
      }
      return isAuth
    },
    computedHeight(){
      let timer= setTimeout(()=>{
        clearTimeout(timer)
        this.winHeight=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight
      },300)
    },
    select(value){
      this.$emit('input',value.type)
      this.$emit('select',value)
    },
  }
}
</script>

<style scoped lang="scss">
  .aside-list {
    background: url('../../../../assets/image/total/aside_bg.png') no-repeat;
    background-size: 100% 100%;

    .aside-list-item {
      background: #fff;
      cursor: pointer;
      border-top: 1px solid #f5f4f4;
      display: flex;
      flex-direction: column;
      .title {
        margin: 3.2rem auto 2rem 3.2rem;
      }
      .data {
        margin: 0 3.2rem;
        display: flex;
        flex-wrap: wrap;

        &-item {
          width: 25%;
          margin-bottom: 3.2rem;
        }
      }
    }
    .is-active-business {
      position: relative;
        cursor: default;
      background: linear-gradient(90deg,#ebf3ff, #f6f8fb 67%);
      &::before {
        content: '';
        position: absolute;
        left: 0;
        width: 5px;
        height: 100%;
        background: #3385fa;
      }
    }

    .is-active-service {
      position: relative;
        cursor: default;
      background: linear-gradient(90deg,#fffbf4 0%, #f6f8fb 91%);
      &::before {
        content: '';
        position: absolute;
        left: 0;
        width: 5px;
        height: 100%;
        background: #F5A623;
      }
    }
    .is-active-error {
      position: relative;
        cursor: default;
      background: linear-gradient(90deg,#fff7f7 0%, #f6f8fb 91%);
      &::before {
        content: '';
        position: absolute;
        left: 0;
        width: 5px;
        height: 100%;
        background: #FF5050;
      }
    }
  }
</style>
