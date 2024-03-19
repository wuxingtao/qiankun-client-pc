<!-- 查看物流 百度地图 -->
<template>
  <div class="map">
    <baidu-map class="bmView" :scroll-wheel-zoom="true" :center="location" :zoom="zoom" @ready="draw"
               :ak="app_key">
      <bm-view class="bm-view"></bm-view>
      <bm-marker :position="point0"
                 :icon="{url: markImg1, size: {width: 40, height: 40}}">
      </bm-marker>
      <bm-marker :position="point1"
                 :icon="{url: markImg2, size: {width: 40, height: 40}}">
      </bm-marker>
      <!-- <bm-polyline v-if="options.lineShow" :path="lineList" stroke-color="#F54436" :stroke-opacity="0.9"
                   :stroke-weight="2"></bm-polyline> -->

    </baidu-map>
  </div>
</template>

<script>
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import BmView from 'vue-baidu-map/components/map/MapView.vue'
import BmMarker from 'vue-baidu-map/components/overlays/Marker'
import BmOverlay from 'vue-baidu-map/components/overlays/Overlay'
import BmPolyline from 'vue-baidu-map/components/overlays/Polyline'

export default {
  name: 'express-map' ,
  props: {
    // 出发点 默认gps坐标系
    pointA: {
      type: Object ,
      default: () => {
      }
    } ,
    // 目标点
    pointB: {
      type: Object ,
      default: () => {
      }
    } ,
    // 地图配置项
    options: {
      type: Object ,
      default: () => {
        return {'lineShow': false}
      }
    }
  } ,
  data() {
    return {
      app_key: 'LbPHLcD8qI7VxGRwNqGI9aQF7nEKe7tP' ,
      // 中心点
      location: {
        // lng: 116.404 , lat: 39.915
        lng: '' , lat: ''
      } ,
      // 百度坐标系 出发点
      point0: [] ,
      // 百度坐标系 目的点
      point1: [] ,
      lineList: [] ,
      zoom: 15 ,
      active: false
    }
  } ,
  components: {
    BaiduMap ,
    BmView ,
    BmMarker ,
    BmOverlay ,
    BmPolyline
  } ,
  mounted() {
  } ,
  computed: {
    markImg1() {
      return this.options.lineShow ? require('@assets/image/client/express/icon-point-j.png') : require('@assets/image/client/express/icon-car.png')
    } ,
    markImg2() {
      return this.options.lineShow ? require('@assets/image/client/express/icon-point-s.png') : require('@assets/image/client/express/icon-point0.png')
    }
  } ,
  methods: {
    async draw({el , BMap , map}) {
      await this.mapConvertor({BMap , map})
      this.initCenter()
      this.initZoom({BMap , map})
      this.initLine({BMap , map})
      const {lng , lat} = this.location
      if (el) {
        const pixel = map.pointToOverlayPixel(new BMap.Point(lng , lat))
        el.style.left = pixel.x - 60 + 'px'
        el.style.top = pixel.y - 20 + 'px'
      }
    } ,
    // 初始化中心点
    initCenter() {
      const midLng = (Number(this.point0.lng) + Number(this.point1.lng)) / 2
      const midLat = (Number(this.point0.lat) + Number(this.point1.lat)) / 2
      this.location = {lng: midLng , lat: midLat}
    } ,
    initZoom({BMap , map}) {
      let zoom = ['50' , '100' , '200' , '500' , '1000' , '2000' , '5000' , '10000' , '20000' , '25000' , '50000' , '100000' , '200000' , '500000' , '1000000' , '2000000']//级别18到3。
      let pointX = new BMap.Point(this.point0.lng , this.point0.lat)  // 创建点坐标X
      let pointY = new BMap.Point(this.point1.lng , this.point1.lat)  // 创建点坐标Y
      let distance = map.getDistance(pointX , pointY).toFixed(1)  //获取两点距离,保留小数点后两位
      for (let i = 0 , zoomLen = zoom.length; i < zoomLen; i++) {
        if (zoom[i] - distance > 0) {
          this.zoom = 18 - i + 2 ////之所以会多2，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加2。
          break
        }
      }
    } ,
    // 初始化线路
    initLine({BMap , map}) {
      // this.lineList = [this.point0 , this.point1]
      if(!this.options.lineShow){
        return
      }
      var driving = new BMap.DrivingRoute(map, { 
        renderOptions: { 
          map: map, 
          autoViewport: true 
        },
        onMarkersSet:function(routes) {       
          map.removeOverlay(routes[0].marker) //删除起点
          map.removeOverlay(routes[1].marker)//删除终点
        }
      })
      driving.search(this.point0 , this.point1)
    } ,
    // 坐标系转换
    mapConvertor({BMap}) {
      return new Promise((resolve , reject) => {
        try {
          let convertor = new BMap.Convertor()
          const aPoint = new BMap.Point(this.pointA.lng , this.pointA.lat)
          const bPoint = new BMap.Point(this.pointB.lng , this.pointB.lat)
          let pointArr = [aPoint , bPoint]
          convertor.translate(pointArr , 1 , 5 , (data) => {
            this.point0 = data.points[0]
            this.point1 = data.points[1]
            resolve()
          })
        } catch (e) {
          this.point0 = this.pointA
          this.point1 = this.pointB
          reject('err: 坐标轴转换错误')
        }

      })

    }
  }
}
</script>

<style lang="scss" scoped>
.bmView {
  height: 370px;

  ::v-deep .anchorBL {
    display: none;
  }
  .bm-view{
    width: 100%; 
    height:370px; 
    flex: 1
  }
}

</style>
