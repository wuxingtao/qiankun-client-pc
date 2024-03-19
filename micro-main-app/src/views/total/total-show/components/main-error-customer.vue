<template>
    <div class="mainErrorCustomer">
        <el-row  style="background: #fff;" v-loading="data.analysisLoading" class="el-row-column">
            <template v-if="isWornLoseNumber">
                <list-title-line class="line" :visibleSelect="isMonth" @change="damagedListChange" v-model="damagedListDataTime" background="#ff5050">破损丢失趋势 <span style="color: #ccc">(票数)</span></list-title-line>
                <ky-echarts ref="damagedList" v-if="damagedListShow&&isDamagedListData" autoresize :options="damagedListData"
                            :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
                <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
            </template>
            <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
        </el-row>
        <el-row  style="background: #fff;margin-top: 1rem;" v-loading="data.analysisLoading" class="el-row-column">
             <template v-if="isReturnNumber">
                 <list-title-line class="line"  :visibleSelect="isMonth" @change="backedListChange"  v-model="backedListDataTime" background="#ff5050">转寄退回趋势 <span style="color: #ccc">(票数)</span></list-title-line>
                 <ky-echarts ref="backedListRef" v-if="backedListShow&&isBackedListData" autoresize :options="backedListData" :style="{'width': '100%','flex': 1, 'border-top': '1px solid #EBEBEB'}"></ky-echarts>
                 <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
             </template>
            <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
        </el-row>
    </div>
</template>
<script>
import ListTitleLine from '../../components/list-title-line'
import KyEcharts from '@/components/ky-echarts'
import {barLineData, lineData} from '../comfig'
import {cloneDeep} from "lodash"
import {turnHtml,checkSaveMonth} from '@/utils/total'
import NoneData from '../../components/none-data'
import {getAuth} from '@/utils/total'
import dayjs from "dayjs";
import echarts from "echarts";
export default {
  name: "mainErrorCustomer",
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
  watch:{
      'data.analysis':{
          handler(){
              this.isMonth?this.damagedListDataTime=2: this.damagedListDataTime=1
              this.isMonth?this.backedListDataTime=2: this.backedListDataTime=1
              this.getDamagedListData()
              this.getBackedListData()
          },
          deep:true,
          immediate:true
      }
  },
  components:{
    KyEcharts,
    ListTitleLine,
    NoneData
  },
  computed:{
      isMonth(){
          return checkSaveMonth(this.formData)
      },
      isDamagedListDataTime(){
          return this.damagedListDataTime===2&&this.isMonth
      },
      isBackedListDataTime(){
          return this.backedListDataTime===2&&this.isMonth
      },
    isReturnNumber(){
      return getAuth(this,'returnNumber')
    },
    isWornLoseNumber(){
      return getAuth(this,'wornLoseNumber')
    },
    damagedListShow(){
      return (this.data.analysis&&this.data.analysis.damagedList&&Object.keys(this.data.analysis.damagedList).length>0) || (this.data.analysis&&this.data.analysis.damagedMonthList&&Object.keys(this.data.analysis.damagedMonthList).length>0)
    },
    backedListShow(){
      return (this.data.analysis&&this.data.analysis.returnChangeList&&Object.keys(this.data.analysis.returnChangeList).length>0) || (this.data.analysis&&this.data.analysis.returnChangeMonthList&&Object.keys(this.data.analysis.returnChangeMonthList).length>0)
    }
  },
  methods:{
      damagedListChange(){
          this.getDamagedListData()
      },
      backedListChange(){
          this.getBackedListData()
      },
      /*破损丢失趋势*/
      getDamagedListData(){
         /* if( this.$refs.damagedList){
              this.$refs.damagedList.clear()
          }*/
          let dataInfo=this.data.analysis || {}
          let line=cloneDeep(barLineData)
          let time=[] // 日期
          let damagedList=[] //总票数
          let data= this.isDamagedListDataTime? dataInfo.damagedMonthList : dataInfo.damagedList
          let series=[]
          if(data&&data.length>0){
              data.forEach((item)=>{
                  let shipingDate=item.shipingDate
                  time.push(shipingDate)
                  damagedList.push(item.votes)
              })
          }else{
              line.title= {
                  text: '暂无数据',
                  top: 60,
                  left: 'center',
                  textStyle: {
                      color: '#C0C4CC',
                      fontStyle: 'normal'
                  }
              }
              this.isDamagedListData=false
              this.damagedListData= line
              return line
          }
          this.isDamagedListData=true
          series.push({
              name: '破损丢失票数',
              type: 'bar',
              barMaxWidth: 20,
              itemStyle:{
                  normal: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                          offset: 0,
                          color: '#8cbbff'
                      }, {
                          offset: 1,
                          color: '#cee2ff'
                      }]),
                  }
              },
              data: damagedList
          })
          line.yAxis[0].interval = Math.ceil(Math.max.apply(null, damagedList) / 5) || 1
          line.yAxis[0].max = Math.ceil(Math.max.apply(null, damagedList) / 5) * 5 || 5
          line.yAxis[0].min = 0
          line.xAxis[0].data=time
          switch((time || []).length) {
              case 365:
                  line.xAxis[0].axisLabel.interval = 30
                  break
              case 180:
                  line.xAxis[0].axisLabel.interval = 15
                  break
              case 90:
                  line.xAxis[0].axisLabel.interval = 7
                  break
          }
          // line.xAxis[0].axisLabel.showMaxLabel = true
          if(this.isDamagedListDataTime){
              line.xAxis[0].axisLabel.formatter = (name)=> {
                  if(name){
                      return dayjs(name).format('YYYY-MM')
                  }
                  return name
              }
          }
          line.xAxis[0].axisLabel.showMaxLabel = true
          line.xAxis[0].axisLabel.rotate=28
          line.xAxis[0].axisLabel.fontSize=11
          
          line.series=series
          line.grid={
              left: 60 ,
              top: 30 ,
              right: 30 ,
              bottom: 40 ,
          }
          line.tooltip.backgroundColor = null
          line.tooltip.extraCssText = 'border: none;'
          line.tooltip.formatter = function (params) {
              let obj = (params || [])[0] || {}
              return turnHtml(obj.name || '', [{
                  backgroundColor: '#ffb148',
                  text: '破损丢失票数: ',
                  value: obj.value ? `${obj.value}(票)` : 0
              }])
          }
          this.damagedListData= line
          return line
      },
      /*退货*/
      getBackedListData(){
         /* if( this.$refs.backedListRef){
              this.$refs.backedListRef.clear()
          }*/
          let dataInfo=this.data.analysis || {}
          let line=cloneDeep(barLineData)
          let time=[] // 日期
          let damagedList=[] //总票数
          let series=[]
          let data= this.isBackedListDataTime? dataInfo.returnChangeMonthList : dataInfo.returnChangeList
          if(data&&data.length>0){
              data.forEach((item)=>{
                  let shipingDate=item.shipingDate
                  time.push(shipingDate)
                  damagedList.push(item.votes)
              })
          }else{
              line.title= {
                  text: '暂无数据',
                  top: 60,
                  left: 'center',
                  textStyle: {
                      color: '#C0C4CC',
                      fontStyle: 'normal'
                  }
              }
              this.isBackedListData=false
              this.backedListData= line
              return line
          }
          this.isBackedListData=true
          series.push({
              name: '转寄退回票数',
              type: 'bar',
              barMaxWidth: 20,
              itemStyle:{
                  normal: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                          offset: 0,
                          color: '#8cbbff'
                      }, {
                          offset: 1,
                          color: '#cee2ff'
                      }]),
                  }
              },
              data: damagedList
          })
          line.yAxis[0].interval = Math.ceil(Math.max.apply(null, damagedList) / 5) || 1
          line.yAxis[0].max = Math.ceil(Math.max.apply(null, damagedList) / 5) * 5 || 5
          line.yAxis[0].min = 0
          line.xAxis[0].data=time
          switch((time || []).length) {
              case 365:
                  line.xAxis[0].axisLabel.interval = 30
                  break
              case 180:
                  line.xAxis[0].axisLabel.interval = 15
                  break
              case 90:
                  line.xAxis[0].axisLabel.interval = 7
                  break
          }
          // line.xAxis[0].axisLabel.showMaxLabel = true
          if(this.isBackedListDataTime){
              line.xAxis[0].axisLabel.formatter = (name)=> {
                  if(name){
                      return dayjs(name).format('YYYY-MM')
                  }
                  return name
              }
          }
          line.xAxis[0].axisLabel.showMaxLabel = true
          line.xAxis[0].axisLabel.rotate=28
          line.xAxis[0].axisLabel.fontSize=11
          line.series=series
          line.grid={
              left: 60 ,
              top: 30 ,
              right: 30 ,
              bottom: 40 ,
          }
          line.tooltip.backgroundColor = null
          line.tooltip.extraCssText = 'border: none;'
          line.tooltip.formatter = function (params) {
              let obj = (params || [])[0] || {}
              return turnHtml(obj.name || '', [{
                  backgroundColor: '#ff7b7b',
                  text: '转寄退回票数: ',
                  value: obj.value ? `${obj.value}(票)` : 0
              }])
          }
          this.backedListData= line
          return line
      },
  },
  data(){
    return {
      isDamagedListData: false,
      isBackedListData: false,
      damagedListData: {},
      backedListData: {},
      damagedListDataTime: 1,
      backedListDataTime: 1,
      showEchart: true,
      echartHeight: 308,
    }
  }
}
</script>

<style scoped lang="scss">
    .mainErrorCustomer{
      flex: 1;
      display: flex;
      flex-direction: column;

      .el-row-column {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    }
</style>




