<template>
  <div class="map-box_wrap">
    <div class="map-breadcrumb">
      <el-breadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <a @click="provinceMap">全国地图</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="province">
          <a @click="cityMap">{{province}}地图</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-show="city">
          <a @click="districtMap">{{city}}地图</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-show="district">
          <a>{{district}}地图</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="map-box" style="border: none;height:calc(100% - 51px);background: #fff;">
      <!-- 全国地图 省份地图 城市地图-->
      <div id="worldmain"
           ref="echartRef"
           style="width: 100%; height: 598px;"></div>
      <!-- 省份地图 -->
      <!-- 区域选择 -->
      <div class="area-list"
           v-show="mapState == 4">
        <div class="area-list-title">{{province}} - {{district}} <i class="el-icon-close"
                                                                    @click="mapState = 3"></i> </div>
        <div class="area-list-content">
          <el-button @click="handleDistrict(town)"
                     v-for="town in townList"
                     :key="town.districtID">{{town.districtName}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import cityMap from "./citymap.js"
import { autoMatch } from '@/services/api/address'
import echarts from 'echarts'
import { addListener, removeListener} from '@/utils/resize.js'
export default {
  data () {
    return {
      process: process.env.NODE_ENV == 'production' ? window.location.origin + '/file/map/' : '/file/map/',
      mapState: 0,
      mapdata: [],
      townList: [],
      country: '',
      provinceDatas: [],
      province: '',
      city: '',
      district: '',
      town: '',
      address: '',
      //直辖市和特别行政区-只有二级地图，没有三级地图
      special: ["北京", "天津", "上海", "重庆", "香港", "澳门"],
      // 初始化绘制全国地图配置
      option: {
        backgroundColor: "#fff",
        title: {
          left: "center",
          textStyle: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "normal",
            fontFamily: "Microsoft YaHei"
          },
          subtextStyle: {
            color: "#ccc",
            fontSize: 16,
            fontWeight: "600",
            fontFamily: "Microsoft YaHei"
          }
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return params.name
          }
        },
        toolbox: {
          show: true,
          orient: "vertical",
          left: "right",
          top: "center",
          feature: {
          },
          iconStyle: {
            normal: {
              color: "#fff"
            }
          }
        },
        animationDuration: 1000,
        animationEasing: "cubicOut",
        animationDurationUpdate: 1000
      },
      provinces: {
        //23个省
        台湾: "taiwan",
        河北: "hebei",
        山西: "shanxi",
        辽宁: "liaoning",
        吉林: "jilin",
        黑龙江: "heilongjiang",
        江苏: "jiangsu",
        浙江: "zhejiang",
        安徽: "anhui",
        福建: "fujian",
        江西: "jiangxi",
        山东: "shandong",
        河南: "henan",
        湖北: "hubei",
        湖南: "hunan",
        广东: "guangdong",
        海南: "hainan",
        四川: "sichuan",
        贵州: "guizhou",
        云南: "yunnan",
        陕西: "shanxi1",
        甘肃: "gansu",
        青海: "qinghai",
        //5个自治区
        新疆: "xinjiang",
        广西: "guangxi",
        内蒙古: "neimenggu",
        宁夏: "ningxia",
        西藏: "xizang",
        //4个直辖市
        北京: "beijing",
        天津: "tianjin",
        上海: "shanghai",
        重庆: "chongqing",
        //2个特别行政区
        香港: "xianggang",
        澳门: "aomen"
      }
    }
  },
  methods: {
    handleDistrict (town) {
      this.town = town.districtName
      this.address = `${this.address}-${town.districtName}`
      this.$emit('change', this.address)
    },

    // 绘制全国省份地图
    provinceMap () {
      let _self = this
        , _data = []
      _self.province = false
      _self.city = false
      _self.district = false
      _self.mapState = 1
      axios
        .get(`${_self.process}china.json`)
        .then(function (res) {
          let data = res.data
          _data = []
          for (var i = 0; i < data.features.length; i++) {
            _data.push({
              name: data.features[i].properties.name
            })
          }
          _self.mapdata = _data
          //注册地图
          echarts.registerMap("china", data)
          //绘制地图
          _self.renderMap("china", _data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 绘制省份下市级/直辖市和特别行政区-只有二级地图
    cityMap () {
      let _self = this
      let params = _self.provinceParams
      if (!params.name || params.name == "南海诸岛") {
        return
      }
      _self.province = params.name
      _self.city = false
      _self.district = false
      _self.mapState = 2
      //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
      axios
        .get(`${_self.process}province/${_self.provinces[params.name]}.json`)
        .then(function (res) {
          let data = res.data
          echarts.registerMap(params.name, data)
          var _data = []
          for (var i = 0; i < data.features.length; i++) {
            _data.push({
              name: data.features[i].properties.name
            })
          }
          _self.arrs = _data
          _self.country = params.name
          _self.renderMap(params.name, _data)
        })
    },
    // 绘制区域地图
    districtMap (params) {
      let _self = this
      _self.mapState = 3
      axios
        .get(`${_self.process}city/${cityMap[params.name]}.json`)
        .then(function (res) {
          let data = res.data
          echarts.registerMap(params.name, data)
          var _data = []
          for (var i = 0; i < data.features.length; i++) {
            _data.push({
              name: data.features[i].properties.name
            })
          }
          _self.renderMap(params.name, _data)
        })
    },
    getZoom(name){
      if(name==='内蒙古'){
        return 0.9
      }
      if(name==='甘肃' || name==='黑龙江'){
        return 0.7
      }
      if(name==='辽宁' || name==='广东'){
        return 0.75
      }
      if(name==='福建' || name==='河南'){
        return 0.85
      }
      if(name==='上海'){
        return 1.1
      }
      if(name==='重庆'){
        return 1.2
      }
      return 1
    },
    // 绘制地图
    renderMap (map, data) {
      console.log(map, data)
      let _self = this
      let zoom = 1.5
      _self.option.geo= {
        show: true,
        map: map,
        zoom: zoom,
        roam: false,
        itemStyle: {
          normal: {
            areaColor: "#f7f7f7",
            borderWidth: 2,
            borderColor:'#f8486b',
            shadowBlur:2,
            shadowColor:'#fd54b2',
            shadowOffsetX:1,
            shadowOffsetY:1,
          }
        },
      }
      _self.option.series = [
        {
          name: map,
          type: "map",
          mapType: map,
          zoom: zoom,
          roam: false,
          nameMap: {
            china: "中国"
          },
          label: {
            normal: {
              show: true,
              textStyle: {
                color: "#303133",
                fontSize: 12
              },
              formatter: function (data) {
                if (!data.name) {
                  data.value = ""
                }
                return data.name
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                color: "#0b92f6",
                fontSize: 13
              }
            }
          },
          itemStyle: {
            normal: {
              areaColor: "#f7f7f7",
              borderColor: "#babec3",
              borderWidth: "1"
            },
            emphasis: {
              areaColor: "#A366CC"
            }
          },
          data: data
        }
      ]
      //渲染地图
      _self.chart.setOption(_self.option)
      let t=setTimeout(()=>{
        zoom=this.getZoom(map) || 1
        _self.option.geo.zoom= zoom
        _self.option.series[0].zoom= zoom
        _self.chart.setOption(_self.option)
        clearTimeout(t)
      },100)
    },

    /**
       * @desc 区下面的地址
       */
    async getAutoMatch () {
      let res = await autoMatch(this.district)
      if(res.data){
        this.townList = res.data.districtList
        this.mapState = 4
        this.address = res.data.districtName
      }
    },
    resize(){
      this.chart.resize()
    }
  },
  created () {
  },
  mounted () {
    let _self = this

    //地图容器
    _self.chart = echarts.init(document.getElementById("worldmain"))

    //绘制全国地图
    _self.provinceMap()

    //地图点击事件
    _self.chart.on("click", function (params) {
      switch (_self.mapState) {
        case 1:
          // 绘制城市地图
          _self.provinceParams = params
          _self.province = params.name
          _self.cityMap()
          break
        case 2:
          // 绘制区地图
          if (_self.special.indexOf(params.seriesName) > -1) {
            _self.district = params.name
            _self.getAutoMatch()
          } else if (params.seriesName == "海南" && '三亚市海口市'.indexOf(params.name) == -1) {
            _self.district = params.name
            _self.getAutoMatch()
          } else {
            _self.city = params.name
            cityMap[params.name] && _self.districtMap(params)
          }
          break
        case 3:
          // 绘制县地图
          _self.district = params.name
          _self.getAutoMatch()
          break
        case 4:
          // 绘制县地图
          _self.district = params.name
          _self.getAutoMatch()
          break
        default:
                // 查询网点
      }
    })
    this.$nextTick(()=>{
      addListener(this.$refs.echartRef,this.resize)
    })
    // window.addEventListener('resize',this.resize)
  },
  destroyed() {
    removeListener(this.$refs.echartRef, this.resize)
    // window.removeEventListener('resize',this.resize)
  }
}
</script>
<style lang="scss" scoped>
  .map-box_wrap{
    height: 100%;
    background: #fff;
  }
  .map-breadcrumb{
    padding: 15px 40px 5px 40px;
    border-bottom: 1px solid #f1f1f5;
  }
</style>

