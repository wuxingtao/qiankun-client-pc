<template>
    <div class="error-map">
        <div class="echarts-map"  v-loading="data.agingFlowLoading">
            <ky-echarts ref="mapRef"  :options="mapOptions" @georoam ="zoom" autoresize :style="{'width': '100%', flex: 1}"></ky-echarts>
<!--
            <none-data v-else :style="{'width': '100%',flex: 1,'border-top': '1px solid #EBEBEB'}"></none-data>
-->
            <main-service-flow :formData="formData" :data="data"></main-service-flow>
        </div>
        <el-row style="background: #fff;margin-top: 1rem;" v-loading="this.data.agingTop5Loading" class="el-row-column">
            <list-title-line class="line" background="#f5a623">寄件线路排名</list-title-line>
            <main-service-table :isSortAgingTop5="data.isSortAgingTop5" :data="agingTop3" style=" border-top: 1px solid #EBEBEB" @change-sort-table="changeSort"></main-service-table>
        </el-row>
    </div>
</template>
<script>
import {getAuth} from '@/utils/total'
import echarts from 'echarts'
import MainServiceTable from './main-service-table'
import MainServiceFlow from './main-service-flow'
import KyEcharts from '@/components/ky-echarts'
import ListTitleLine from '../../components/list-title-line'
import 'echarts/extension/bmap/bmap'
import { turnHtml, doubleTurnHtml } from '@/utils/total'
import {chinaMapData} from "../comfig"
import {chinaMap} from "../map/index"
import {cityData} from "./cityData"
import {cloneDeep} from "lodash"
import NoneData from '../../components/none-data'
echarts.registerMap('china', chinaMap)

export default {
  name: "mainServiceTime",
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
    KyEcharts,
    MainServiceTable,
    ListTitleLine,
    MainServiceFlow,
    NoneData
  },
  data(){
    return {
      zoomIndex:4,
      showEchart:true,
      type: 'right',
      mapData: {},
      echartHeight: 380,
      size: [{size: 30, word: '大于1000(票)'}, {size: 20, word: '101-1000(票)'}, {size: 15, word: '51-100(票)'}, {size: 10, word: '11-50(票)'}, {size: 5, word: ' 0-10(票)'}],
    }
  },
  computed:{
    agingTop3(){
      if(this.data.agingTop5&&this.data.agingTop5.length>3){
        return this.data.agingTop5.slice(0,3)
      }
      return this.data.agingTop5 || []
    },
    isAuth(){
      if(getAuth(this,'reachRate')){
        return true
      }
    },
    agingFlowShow(){
      return this.data.agingFlow&&Object.keys(this.data.agingFlow).length>0
    },
    mapOptions(){
    /*  if(this.$refs.mapRef){
        this.$refs.mapRef.clear()
      }*/
      let geoCoordMap = cityData
      let map=cloneDeep(chinaMapData)
      let convertData = function (data) {
        let res = []
        for (let i = 0; i < data.length; i++) {
          let geoCoord = geoCoordMap[data[i].name]
          if (geoCoord) {
            res.push({
              name: data[i].name,
              value: geoCoord.concat(`${data[i].totalVote},${data[i].agingAchievedRate}`)
            })
          }
        }
        return res
      }
      let index = -1, obj = {}
      let top20List0_60=[]
      let top20List60_80=[]
      let top20List80_100=[]
      if(this.data.agingFlow&&this.data.agingFlow.agingFlowsTop20List&&this.data.agingFlow.agingFlowsTop20List.length>0){
        let top20List=cloneDeep(this.data.agingFlow.agingFlowsTop20List)
        top20List.forEach((item)=>{
          item.name= item.receiveCity
          if(item.agingAchievedRate>=0&&item.agingAchievedRate<60){
            top20List0_60.push(item)
          }
          if(item.agingAchievedRate>=60&&item.agingAchievedRate<80){
            top20List60_80.push(item)
          }
          if(item.agingAchievedRate>=80&&item.agingAchievedRate<=100){
            top20List80_100.push(item)
          }
        })
      }
      top20List0_60.forEach(item => {
        if (item.name === this.formData.shipingCity) {
          obj = item
          index = 0
        }
      })
      top20List60_80.forEach(item => {
        if (item.name === this.formData.shipingCity) {
          obj = item
          index = 1
        }
      })
      top20List80_100.forEach(item => {
        if (item.name === this.formData.shipingCity) {
          obj = item
          index = 2
        }
      })
      let startPosition= geoCoordMap[this.formData.shipingCity]
      let data60= convertData(top20List0_60)
      let data80= convertData(top20List60_80)
      let data100= convertData(top20List80_100)
      let color60= '#ff6262'
      let color80= '#FFB148'
      let color100='#57CD7C'
      //  加线
      let size= (4/12)*this.zoomIndex*10
      size= size > 30 ? 30 : size
      map.series[0].symbolSize= size || 12
      map.series[1].symbolSize= size || 12
      map.series[2].symbolSize= size || 12
      map.series[3].symbolSize= size || 12
      map.geo.zoom= this.zoomIndex || 4
      map.series[0].data= data60
      map.series[1].data= data80
      map.series[2].data= data100
      map.series[3].data[0].value= startPosition
      const shipingCity = this.formData.shipingCity
      if([data60,data80,data100].find(data=>data.find(d=>d.name === shipingCity))){
        map.series[3].label.show = false
      }else{
        // map.series[3].data[0].name= '始发城市：'+this.formData.shipingCity
        map.series[3].data[0].name= this.formData.shipingCity
      }
      map.series.push(this.lineTo(data60, '时效达成率0~60%', startPosition,color60))
      map.series.push(this.lineTo(data80, '时效达成率60~80%', startPosition,color80))
      map.series.push(this.lineTo(data100, '时效达成率80~100%', startPosition,color100))

      if(this.isAuth!==true){
        map.series[0].itemStyle.color= '#57CD7C'
        map.series[1].itemStyle.color= '#57CD7C'
        map.series[2].itemStyle.color= '#57CD7C'
        map.legend.data.splice(0,3)
      }
      let shipingCityArr = geoCoordMap[this.formData.shipingCity]
      let agingFlow = this.data.agingFlow || {}
      map.tooltip = {
        show: true,
        trigger: 'item',
        backgroundColor: 'transparent',
        extraCssText: 'border: none; box-shadow: null',
        formatter:  (params) =>{
          let arr = (((params || {}).value || [])[2] || '').split(',')
          if(params.seriesType=== "lines"){
            let lines = params && params.data&& params.data.coords? params.data.coords[0] : []
            arr = lines[2].split(',')
          }
          let bool = (params || {}).name.match('始发城市')
          if (index !== -1 && shipingCityArr[0] === (params.value || [])[0] && shipingCityArr[1] === (params.value || [])[1]) {
            let object = map.series[index] || {}
            let tooltip1= [
              {
                backgroundColor: object.itemStyle.color,
                text: '票数: ',
                value: obj.totalVote ? `${obj.totalVote}(票)` : 0
              },
            ]
            let tooltip2=[{
              backgroundColor:'#6495ED',
              text: '票数: ',
              value: agingFlow.totalCountryVotes ? `${agingFlow.totalCountryVotes}(票)` : 0
            }]
            if(this.isAuth===true){
              tooltip1.push({
                backgroundColor: object.itemStyle.color,
                text: '时效达成率: ',
                value: obj.agingAchievedRate ? `${obj.agingAchievedRate}%` : 0
              })
              tooltip2.push({
                backgroundColor: '#6495ED',
                text: '时效达成率: ',
                value: agingFlow.agingAchievedRate ? `${agingFlow.agingAchievedRate}%` : 0
              })

            }
            return doubleTurnHtml(shipingCity, shipingCity,tooltip1, tooltip2)
          }
          if (index === -1 && bool) return
          let tooltip3= [{
            backgroundColor:this.isAuth===true? '#57CD7C':  bool ? '#6495ED' : (params || {}).color,
            text: '票数: ',
            value: arr[0] ? `${arr[0]}(票)` : 0
          }]
          if(this.isAuth===true) {
            tooltip3.push({
              backgroundColor: bool ? '#6495ED' : (params || {}).color,
              text: '时效达成率: ',
              value: `${arr[1] || 0}%` || 0
            })
          }
          return turnHtml(bool ? (params || {}).name : `目的城市：${(params || {}).name}` ,tooltip3)
        }
      }
      return map
    }
  },
  methods:{
    lineTo(data,name,position,color){
      let bjData=[]
      let series= {
        name: name,
        type: 'lines',
        zlevel: 1,
        symbol: ['none'],
        symbolSize: 10,
        lineStyle: {
          normal: {
            color: color || '#f00',
            opacity: 0.6,
            curveness: 0.2
          }
        },
        data: bjData
      }
      if(data&&data.length>0){
        data.forEach((item)=>{
          let obj={}
          obj.name=item.name
          obj.coords=[item.value,position]
          bjData.push(obj)
        })
      }
      series.data= bjData
      return series
    },
    zoom(){
      let option=this.$refs.mapRef.chart.getOption()
      let data= option?option.geo[0]: {}
      this.zoomIndex=data.zoom
    }
  }
}
</script>

<style scoped lang="scss">

  .error-map {
      flex: 1;
      display: flex;
      flex-direction: column;
      .echarts-map{
          display: flex;
          flex-direction: column;
          position: relative;
          flex: 1;
            .send-size {
                position: absolute;
                bottom: 20px;
                left: 21px;
                z-index: 100;

                .text {
                    font-size: 12px;
                    color: #0c092b;
                    margin-bottom: 15px;
                }

                .size {
                    display: flex;
                    align-items: flex-end;

                    .size-status {
                        margin-right: 19px;
                        /*background: #57cd7c;*/
                        border-radius: 50%;
                        border: 1px solid #333;
                       /* color: #57cd7c*/
                    }
                }


          }
      }
      .el-row-column {
        display: flex;
        flex-direction: column;
      }
      .line{
          color: #0c092b !important;
      }
  }



</style>
<style>
    .error-map  .anchorBL{
        display: none;
    }
    .popover-el {
        padding: 0;
    }
</style>
