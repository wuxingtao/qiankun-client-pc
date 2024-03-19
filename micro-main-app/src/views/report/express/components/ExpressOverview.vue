<template>
  <div class="express-overview-container card-wrapper">
    <div class="caption-info">
       <card-title title="快件统计"/> 
      <slot name="tip"></slot>
      <div class="detail" @click="$router.push({path:'report/express', query: { dateRange: JSON.stringify(dateRange)}})">查看服务方式<i class="el-icon-arrow-right"></i></div>
    </div>
    <div class="content">
      <div class="top">
        <div class="select-wrapper">
          <span>快件类型：</span>
          <el-select v-model="selectedExpressType" placeholder="请选择" size="small" @change="loadData">
            <el-option v-for="(item,index) in expressTypes" :key="index" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-wrapper">
         <span> 统计单位：</span>
          <el-select v-model="selectedStatisticUnit" placeholder="请选择" size="small" @change="loadData">
            <el-option v-for="(item,index) in statisticUnits" :key="index" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div> 
      </div>
      <div ref="chart" style="height:280px;"></div>
      <div class="lines">
        <line-chart icon="icon-express-receipt" :text="'有回单服务总'+(selectedStatisticUnit===0?'票':'件') +'数 '+linesData.receiptData.totalCount" :data="linesData.receiptData"/>
      <line-chart style="cursor:pointer" icon="icon-express-abnormal" :text="'异常总'+(selectedStatisticUnit===0?'票':'件') +'数 '+linesData.abnormalData.totalCount" :data="linesData.abnormalData" activeColor="#fe788b" @click.native="$router.push({path:'report/abnormal-waybill',query:{dateRange: JSON.stringify(dateRange) }})"/>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../../mixins/resize'
import {getExpressOverview} from '@/services/api/report'
import LineChart from './LineChart.vue'
import CardTitle from '../../components/CardTitle.vue'
export default {
  mixins: [resize],
  components:{LineChart,CardTitle},
  props:{
    dateRange:{
      type:Array,
      require:true
    },
  },
  data(){
    return{
      chart:null,
      paymentModes:{'寄付':10,'到付':20,'第三方付':30},
      expressTypes:[{label:'我发出的',value:0},{label:'我收到的',value:1}],
      selectedExpressType:0,
      statisticUnits:[{label:'按票数',value:0},{label:'按件数',value:1}],
      selectedStatisticUnit:0, 
      linesData:{receiptData:{},abnormalData:{}}
    }
  },
  methods:{
    async loadData(){
      const params={
        startDate:this.dateRange[0],
        endDate:this.dateRange[1],
        expressType:this.selectedExpressType,
        statisticsUnit:this.selectedStatisticUnit
      }
      const res=await getExpressOverview(params)
      let rawData={}
      if(res.code===0){
        rawData=res.data&&res.data[0]||{} 
      }
      const chartData=[
        {name:'寄付',value:this.$formatNumber(rawData.waybillCountByPayShip,0,false),totalCount:this.$formatNumber(rawData.waybillCount,0,false)},
        {name:'到付',value:this.$formatNumber(rawData.waybillCountByPayReceive,0,false),totalCount:this.$formatNumber(rawData.waybillCount,0,false)},
        {name:'第三方付',value:this.$formatNumber(rawData.waybillCountByPayOther,0,false),totalCount:this.$formatNumber(rawData.waybillCount,0,false)},
      
      ]
      this.linesData={
        receiptData:{
          type:0,
          proportion:Number(rawData.waybillCount)<=0?0: this.$formatNumber(rawData.waybillCountByReceipt/rawData.waybillCount*100,2)+'%',
          totalCount:this.$formatNumber(rawData.waybillCountByReceipt,0),
          masterCopyCount:this.$formatNumber(rawData.waybillCountByReceiptOriginal,0),
          imageCount:this.$formatNumber(rawData.waybillCountByReceiptPicture,0)
        },
        abnormalData:{
          proportion: Number(rawData.waybillCount)<=0?0:this.$formatNumber(rawData.errorWaybillCount/rawData.waybillCount*100)+'%',
          totalCount:this.$formatNumber(rawData.errorWaybillCount,0)
        }
      }
      this.setChart(chartData)
    },
    setChart (data) {
      let that=this
      const total=(data[0].totalCount+'').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const colorList = ['#9379fd', '#fac873', '#75c9ff', '#FDD56A', '#FDB36A']
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'white',
          textStyle: {
            color: '#666666'
          },
          padding: [16, 18],
          formatter: function (param) {
            return `${param.marker}${param.name}  <span style="color: #333333;padding-left:17px">
            ${that.$formatNumber(param.data.value,0)}(${Number(param.data.totalCount)<=0?0: (param.data.value/param.data.totalCount*100).toFixed(2)+'%'})</span><br/>`
          },
          extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;'
        },
        title: [{
          text: `{name|${this.selectedExpressType===0?'发货':'收货'}总${this.selectedStatisticUnit===0?'票':'件'}数}\n{val|${total}}`,
          top: 'center',
          left: 'center',
          textStyle: {
            rich: {
              name: {
                fontSize: 14,
                fontWeight: 'normal',
                color: '#666666',
                padding: [10, 0]
              },
              val: {
                fontSize: 32,
                fontWeight: 'bold',
                color: '#333333',
              }
            }
          }
        }],
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'],
            minAngle: 5,
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: (params) => {
                return colorList[params.dataIndex]
              }, 
              // borderColor: 'white',
              // borderWidth: 3
            },
            labelLine: {
              show: false
            },
            data
          }
        ]
      }
      this.chart = echarts.init(this.$refs.chart, 'light')
      this.chart.setOption(option)
      this.chart.off('click')
      this.chart.on('click',(params)=>{
        this.$router.push({path:'report/waybill-payment',query:{paymentMode:this.paymentModes[params.name],dateRange: JSON.stringify(this.dateRange)}})
      })
    },
  },
  watch:{
    dateRange:{
      handler(){
        this.loadData()
      },
      immediate:true
    }
  }
}
</script>

<style lang="scss" scoped>
 @import "../../scss/card.scss";
  .express-overview-container {
    @include scroll-bar;
    .content{
      .top{
        display: flex;
        &>div:first-of-type{
          margin-right: 12px;
        }
        /deep/.el-select{
           width: 72px;
        }
      }
      .lines{
        padding: 0 20px;
        &>div:not(:last-child){
          margin-bottom: 20px;
        }
      }
    }
  }
</style>