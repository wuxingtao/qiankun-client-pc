<template>
  <div class="chart-flow-container">
    <div class="select-address" v-if="sendCityList&&sendCityList.length>0">
      <el-form>
        <el-form-item label="发货地" prop="address" label-width="50px">
          <el-select v-model="sendCity" size="medium" @change="handleSendCityChange">
            <el-option v-for="(item, index) in sendCityList" :key="`0-${index}`" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
     <none-data v-if=" !existData" style="padding:20px 0"/>
    <div v-else style="height:300px;" ref="chart"></div>
  </div>
</template>

<script>
import resize from '../../mixins/resize'
import echarts from 'echarts'
import { chinaMap, chinaGeoUtil } from '../../assets/map/index.js'
import NoneData from '@/components/ky-table/none-data.vue'
import { getFlowSendCity, getFlowDirectionData } from '@/services/api/report'
export default {
  mixins: [resize],
  components:{NoneData},
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data () {
    return {
      chart: null,
      sendCity: '',
      sendCityList: [],
      existData:false
    }
  },
  methods: {
    async loadSendCitySource () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      const res = await getFlowSendCity(params)
      if (res.code === 0) {
        this.sendCityList =[]
        this.existData=res.data&&res.data.length>0 
        if(! this.existData){
          return 
        }
        this.sendCityList = res.data.map(r => r.shipCity)
        this.sendCity=this.sendCityList.length>0&& this.sendCityList[0]||''
        this.handleSendCityChange ()
      }
    },
    async handleDateChange () {
      await this.loadSendCitySource()
    },
    async handleSendCityChange () {
      if (!this.sendCity) {
        return
      }
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        shipCity: this.sendCity
      }
      const res = await getFlowDirectionData(params)
      if (res.code === 0) {
        this.existData=res.data&&res.data.length>0 
        if(! this.existData){
          return 
        }
        const regionList=Object.keys(chinaGeoUtil.geoCoordMap)
        const data = res.data.map(d => {
          const region= regionList.find(f=>d.receiveCity.includes(f))
          if(region){
            return { name: region, value: d.packetCount }
          }
          return { name: d.receiveCity, value: d.packetCount }
        })
        this.initChart(data)
      }
    },
    initChart (data) {
      data = data || []
      echarts.registerMap('china', chinaMap)
      this.chart = echarts.init(this.$refs.chart, 'light')
      const regionList=Object.keys(chinaGeoUtil.geoCoordMap) 
      const sendCity = regionList.find(f=>this.sendCity.includes(f))  || this.sendCity
      // const data = [
      //   // { name: '北京', value: 199 },
      //   { name: '山西', value: 81 },
      //   { name: '吉林', value: 82 },
      // ]
      var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'

      var option = {
        // tooltip: {
        //   trigger: 'item',
        //   formatter: function (params) {
        //     if(!params.name){
        //       return ''
        //     }
        //     if (params.value&&params.value.length>2&&params.value[2]) {
        //       return params.name + ' : ' + params.value[2]
              
        //     } else {
        //       return params.name + ' : 0'
        //     }
        //   }
        // },
        //视觉映射组件
        visualMap: {
          show: true,
          min: 0,
          max: 500,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'], // 文本，默认为数值文本
          calculable: true,
          seriesIndex: [1],
          // inRange: {
          //   color: ['skyblue', 'rgba(3,4,5,0.4)', 'red'],
          //   symbolSize: [100, 100]
          // }
        },
        geo: {
          map: 'china',
          zoom: 4,
          top: 100,
          show: true,
          roam: true, 
          scaleLimit: { //滚轮缩放的极限控制
            min: 1.5,
            // max: 2
          },
          center:chinaGeoUtil.geoCoordMap[sendCity] ,
          label: {
            normal: { show: false },
            emphasis: { show: false, }
          },
          itemStyle: {
            normal: {
              areaColor: '#eaeffe',
              borderColor: '#b9c4db',//行政区分界线
              // shadowColor: '#092f8f',//外发光
              // shadowBlur: 20
            },
            emphasis: {
              areaColor: '#eaeffe',//悬浮区背景
            }
          }
        },
        series: [
          {
            //点到点的连线
            type: 'lines',
            zlevel: 2,
            symbolSize: 10,
            effect: {
              show: true,
              period: 6,
              symbol: planePath,
              trailLength: 0,
              symbolSize: 15,
              color:'#984FFF'
            },
            lineStyle: {
              normal: {
                color: '#984FFF',
                width: 2,
                opacity: 0.5,
                curveness: 0.2
              }
            },
            data: chinaGeoUtil.geoCoordMap[sendCity] && data.filter(item => chinaGeoUtil.geoCoordMap[item.name])
              .map(item => {
                return {
                  coords: [
                    chinaGeoUtil.geoCoordMap[sendCity],//from
                    chinaGeoUtil.geoCoordMap[item.name]//to
                  ]
                }
              }) ||[]
          },
          {
            //地址显示涟漪特效
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: chinaGeoUtil.formatData(data),
            symbolSize: 8,
            showEffectOn: 'render',
            rippleEffect: {
              scale: 5,
              brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                color:'#2C3A57',
                show: true
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: '#333',
                shadowBlur: 20,
                shadowColor: '#333'
              }
            }
          },
          {
            //设置地理区域数据的可视化
            type: 'map',
            map: 'china',
            geoIndex: 0,
            aspectScale: 0.75, //长宽比
            showLegendSymbol: false, // 存在legend时显示
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: '#fff'
                }
              }
            },
            roam: true,//开启鼠标缩放和平移漫游
            itemStyle: {
              normal: {
                areaColor: '#031525',
                borderColor: '#FFFFFF',
              },
              emphasis: {
                areaColor: '#2B91B7'
              }
            },
            animation: false,
            data: data
          },
        ]
      }
      this.chart.setOption(option)
    }
  },
  watch: {
    dateRange: {
      handler () {
        this.$nextTick(() => {
          this.handleDateChange()
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .chart-flow-container {
    position: relative;
    .select-address {
      padding: 20px 0 0 14px;
      position: absolute;
      z-index: 2;
    }
  }
</style>