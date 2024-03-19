<template>
  <div class='netc-route-map'>
    <slot />
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { lineString } from '@turf/helpers'
import bearing from '@turf/bearing'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import midpoint from '@turf/midpoint'
import truncate from '@turf/truncate'
import cleanCoords from '@turf/clean-coords'
import { getCarLocation, getNavigation, fetchTrackWithNav } from './api'
import dayjs from 'dayjs'

let AMap = null
let map = null

export default {
  name: 'netc-route-map',
  props: {
    fitViewPadding: { type: Array, default: () => [160, 60, 60, 60] },
    routeData: { type: Object, default: () => ({}) },
    orderRoute: { type: Boolean, default: false }, // 是否订单路由
  },
  data() {
    return {
      maxLength: 10, // 小车移动时，距离目的地多少km时显示气泡
      intervalTime: 60 * 1000, // 取货或派货时，获取车辆实时纠偏轨迹的间隔时长
      strokeWeight: 6, // 线条粗细
      strokeOpacity: 1, // 线条透明度
      strokeColorMajor: '#8365F6', // 主线颜色
      strokeColorMinor: '#BEADFF', // 次线颜色
    }
  },
  computed: {
    /**
     * 寄方经纬度
     * @returns {(string|number|*)[]}
     */
    startLngLat() {
      const { delivery } = this.routeData
      return [delivery?.longitude, delivery?.latitude]
    },
    /**
     * 寄方城市名
     * @returns {*}
     */
    startCity() {
      const { delivery } = this.routeData
      return delivery?.city
    },
    /**
     * 寄方区名
     * @returns {string|*}
     */
    startDistrict() {
      const { delivery } = this.routeData
      return delivery?.district || ''
    },
    /**
     * 收方经纬度
     * @returns {(string|number|*)[]}
     */
    endLngLat() {
      const { pickup } = this.routeData
      return [pickup?.longitude, pickup?.latitude]
    },
    /**
     * 收方城市名
     * @returns {*}
     */
    endCity() {
      const { pickup } = this.routeData
      return pickup?.city
    },
    /**
     * 收方区名
     * @returns {string|*}
     */
    endDistrict() {
      const { pickup } = this.routeData
      return pickup?.district || ''
    },
    /**
     * 经纬度有错误
     *  null, or 0.0
     */
    lngLatHasError() {
      return (
        this.startLngLat.includes(null) ||
        this.startLngLat.includes('0.0') ||
        this.endLngLat.includes(null) ||
        this.endLngLat.includes('0.0')
      )
    },
  },
  watch: {
    'routeData.waybillNumber': {
      handler(newVal, oldVal) {
        this.$nextTick(async () => {
          if (newVal !== oldVal) {
            await this.initMap()
            await this.handlerData()
          }
        })
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * 重新加载
     */
    async reload() {
      if (map) {
        this.handlerData()
      } else {
        await this.initMap()
        await this.handlerData()
      }
    },

    loadMap() {
      return new Promise((resolve, reject) => {
        const ua = navigator.userAgent
        const isAppBrowse = /appType=/.test(ua)
        const isKsBrowse = /KuaSheng/.test(ua)
        const isIphone = /(iPhone\sOS)\s([\d_]+)/.test(ua)
        const isAppiOS = isAppBrowse && isIphone
        // 处理AppIOS 马卡龙不生效
        if (isAppiOS || isKsBrowse) {
          window.forceWebGL = true
        }
        AMapLoader.load({
          key: 'e65dd5290922c7ad06836de72be72ebe', // 公司的
          version: '2.0',
          plugins: ['AMap.MoveAnimation'],
        })
          .then(data => {
            window.AMap = data
            AMap = data
            resolve()
          })
          .catch(error => {
            AMapLoader.reset()
            console.log('loadMap 出错', error)
            reject(error)
          })
      })
    },

    /**
     * 初始化地图
     */
    async initMap() {
      try {
        console.time('initMap')

        if (!AMap) {
          await this.loadMap()
        }

        map = new AMap.Map(this.$el, {
          center: [104.019037, 24.284627],
          zoom: 3,
          zooms: [3, 18],
          rotateEnable: false,
          keyboardEnable: false,
          doubleClickZoom: false,
          mapStyle: 'amap://styles/macaron', // 地图样式，https://lbs.amap.com/demo/jsapi-v2/example/personalized-map/set-theme-style
        })

        this.$emit('initMapSuccess')
        console.timeEnd('initMap')
      } catch (e) {
        this.$emit('initMapError')
        console.log('initMap 出错', e)
        throw new Error('initMap 出错')
      }
    },

    /**
     * 处理数据
     */
    async handlerData() {
      if (!this.routeData) return
      map && map.clearMap()
      try {
        const { status, visitorFlag } = this.routeData
        if (this.lngLatHasError) return

        if (this.orderRoute) {
          // 订单路由
          return this.drawOrderView()
        }
        if (visitorFlag) {
          // 游客
          return this.drawVisitorView()
        }
        this[`draw${status}View`] && (await this[`draw${status}View`]())
      } catch (e) {
        console.error('handlerData', e)
        map.clearMap()
        this.drawDefaultView()
      }
    },

    /**
     * 添加 Marker
     * @param lngLat 经纬度
     * @param type default-水滴，delivery-寄方，pickup-收方，network-网点
     */
    addMarker(lngLat, type = 'default') {
      let content = `<div class='marker-${type}'><div class='marker-${type}__icon'></div></div>`

      const marker = new AMap.Marker({ position: lngLat, content, anchor: 'center' })

      /**
       * 添加气泡
       * @param text 文本
       * @param transType 运输方式，fly - 客运 car - 陆运
       */
      marker.setText = function(text, transType) {
        const content = `<div class='popup-${type} popup-${type}--${transType}'>${text}</div>`
        this.setLabel({
          content,
          offset: new AMap.Pixel(0, -10), //设置文本标注偏移量
          direction: 'top',
        })
        return this
      }

      map.add(marker)
      return marker
    },

    /**
     * 添加 FlyMarker or CarMarker
     * @param lngLat
     * @param text
     * @param type
     * @param angle
     */
    addFlyOrCarMarker(lngLat, text, type, angle = 0) {
      new AMap.Marker({ map, angle, position: lngLat, content: `<div class='marker-${type}'></div>`, anchor: 'center' })

      if (text) {
        new AMap.Text({
          map,
          position: lngLat,
          text: `<div class='text-default'>${text}</div>`,
          anchor: 'bottom-center',
          offset: [0, -35],
        })
      }
    },

    addCarMarker(lngLat, text, angle = 0) {
      new AMap.Marker({
        map,
        angle,
        position: lngLat,
        icon: require('./assets/icon_car.png'),
        offset: [-13, -26],
      })

      if (text) {
        new AMap.Text({
          map,
          position: lngLat,
          text: `<div class='text-default'>${text}</div>`,
          anchor: 'bottom-center',
          offset: [0, -40],
        })
      }
    },

    /**
     * 路径规划
     * @param start
     * @param end
     * @returns {Promise<void>}
     */
    async drivingSearch(start, end) {
      try {
        const { data } = await getNavigation(start, end)
        if (data && data.navigation) {
          let { coords } = data.navigation.routes[0].pathList[0]
          // 清除重复坐标点
          coords = cleanCoords(lineString(coords)).geometry.coordinates
          return coords
        }
      } catch (e) {
        console.error('drivingSearch', e)
        throw new Error(e)
      }
    },

    /**
     * 添加线段
     * @param path
     * @param color
     */
    addPolyline(path, color = this.strokeColorMajor) {
      const polyline = new AMap.Polyline({
        path,
        strokeColor: color,
        strokeOpacity: this.strokeOpacity,
        strokeWeight: this.strokeWeight,
        lineJoin: 'round',
        lineCap: 'round',
        geodesic: true,
      })

      map.add(polyline)
      return polyline
    },

    /**
     * 聚焦
     */
    fitViewBox(maxZoom = 14) {
      map.setFitView(null, true, this.fitViewPadding, maxZoom)
    },

    /**
     * 绘制默认地图，两点一线
     */
    drawDefaultView() {
      this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
      this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      this.addPolyline([this.startLngLat, this.endLngLat])
      this.fitViewBox()
    },

    /**
     * 绘制游客地图，不可缩放与平移
     */
    drawVisitorView() {
      this.drawDefaultView()
      map.setStatus({
        dragEnable: false, // 平移
        zoomEnable: false, // 缩放
        doubleClickZoom: false, // 双击缩放
        rotateEnable: false, // 旋转
      })
    },

    /**
     * 绘制订单地图
     */
    drawOrderView() {
      this.addMarker(this.startLngLat, 'delivery').setText('待揽件')
      this.fitViewBox()
    },

    /**
     * 0 - 待揽件
     *  只展示寄件位置定位点
     *  0 - 待揽件
     *  10 - 正在安排司机
     *  90 - 下单成功，请尽快投递
     */
    draw0View() {
      this.addMarker(this.startLngLat, 'delivery').setText('待揽件')
      this.fitViewBox()
    },

    draw10View() {
      this.draw0View()
    },
    /**
     * 绘制车辆移动视图
     * @param carNumber 车牌号
     * @param destLngLat 目的地经纬度
     * @param alwaysShowBubbles 是否总是显示气泡
     */
    drawCarMoveView(carNumber, destLngLat, alwaysShowBubbles = true) {
      let fetchTrackWithNavParams = {
        carNo: carNumber, // 车牌号
        interval: 1, // 纠偏轨迹时长，单位分钟
        trackStartTime: dayjs().subtract(3, 'minutes').format('YYYY-MM-DD HH:mm:ss'), // 纠偏轨迹开始时间
        hisMatchInfo: null, // 上一次匹配信息
        destLng: destLngLat[0], // 目的地经度
        destLat: destLngLat[1], // 目的地纬度
      }
      const polyline = new AMap.Polyline({
        map,
        strokeColor: this.strokeColorMajor,
        strokeOpacity: this.strokeOpacity,
        strokeWeight: this.strokeWeight,
        lineJoin: 'round',
        lineCap: 'round',
      })
      const carMarker = new AMap.Marker({
        map,
        visible: false,
        icon: require('./assets/icon_car.png'),
        offset: new AMap.Pixel(-13, -26),
      })
      carMarker.setText = function(text) {
        const content = `<div class='popup-default'>${text}</div>`
        if (!this.textMarker) {
          this.textMarker = new AMap.Text({
            map,
            text: content,
            position: this.getPosition(),
            anchor: 'bottom-center',
            offset: new AMap.Pixel(0, -40),
          })
        } else {
          this.textMarker.setText(content)
          this.textMarker.setPosition(this.getPosition())
        }
      }
      carMarker.on('moving', e => {
        const length = (polyline.getLength() / 1000).toFixed(2) // 单位km
        let newPolylinePath = polyline.getExtData().slice(e.index)
        newPolylinePath[0] = e.pos
        polyline.setPath(newPolylinePath)

        if (alwaysShowBubbles || length <= this.maxLength) {
          carMarker.setText(`司机距离您${length}km`)
        }

        if (length <= this.maxLength) {
          this.$emit('within10')
        }
      })
      carMarker.on('movealong', () => {
        getLocation()
      })

      const getLocation = async () => {
        const {
          data: { matchInfo, trackCoords, navInfo },
        } = await fetchTrackWithNav(fetchTrackWithNavParams)
        fetchTrackWithNavParams.hisMatchInfo = matchInfo
        fetchTrackWithNavParams.trackStartTime = dayjs(matchInfo.lastStartTime)
          .add(1, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss')

        let historyCoords = trackCoords.map(item => [item.lng, item.lat])
        const carLocation = historyCoords[0] // 车辆坐标取第一个历史轨迹坐标
        const carAngle = bearing(historyCoords[0], historyCoords[1]) // 车辆角度
        const polylinePath = [...historyCoords, ...navInfo.coords] // 路径规划

        carMarker.setPosition(carLocation)
        carMarker.setAngle(carAngle)
        carMarker.show()
        polyline.setPath(polylinePath)
        polyline.setExtData(polylinePath)

        carMarker.moveAlong(historyCoords, { duration: Math.floor(this.intervalTime / historyCoords.length) })
        this.fitViewBox()
      }
      getLocation().catch(e => {
        console.error('drawCarMoveView', e.message)
        map.clearMap()
        this.drawDefaultView()
      })
    },

    /**
     * 取货、派货。小车定位
     * @param carNumber 车牌号
     * @param driverPhone 司机手机号
     * @param endLngLat 目的地坐标
     */
    async drawCarLocation(carNumber, driverPhone, endLngLat) {
      try {
        // 获取车辆位置
        const {
          data: { correctLocation },
        } = await getCarLocation({ carNo: carNumber, employeeNo: driverPhone })
        if (!correctLocation) {
          console.error('获取车辆位置失败')
          return
        }
        let carLocation = correctLocation.split(',').reverse()
        console.log(carLocation)

        // 路径规划
        const path = await this.drivingSearch(carLocation, endLngLat)
        const polyline = this.addPolyline(path)

        const carText = `司机距离您${(polyline.getLength() / 1000).toFixed(2)}km`
        const carAngle = bearing(path[0], path[1])
        this.addCarMarker(carLocation, carText, carAngle)

        this.fitViewBox(18)

      } catch (error) {
        console.log('drawCarLocation - error', error)
        map && map.clearMap()
        this.drawDefaultView()
      }
    },

    /**
     * 20 - 取货
     */
    draw20View() {
      const { carNumber, driverPhone } = this.routeData
      this.addMarker(this.startLngLat, 'delivery').setText('待揽件')
      this.drawCarLocation(carNumber, driverPhone, this.startLngLat)

      this.timer = setInterval(() => {
        map && map.clearMap()
        this.addMarker(this.startLngLat, 'delivery').setText('待揽件')
        this.drawCarLocation(carNumber, driverPhone, this.startLngLat)
      }, this.intervalTime)
    },

    /**
     * 60 - 派货
     */
    draw60View() {
      const { carNumber, driverPhone } = this.routeData
      this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      this.drawCarLocation(carNumber, driverPhone, this.endLngLat)

      this.timer = setInterval(() => {
        map && map.clearMap()
        this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
        this.drawCarLocation(carNumber, driverPhone, this.endLngLat)
      }, this.intervalTime)
    },

    /**
     * 30 - 司机已到达
     */
    draw30View() {
      console.log('30 - 司机已到达')
      this.addMarker(this.startLngLat, 'delivery').setText('待揽件')
      this.addMarker(this.startLngLat, 'default')
      this.fitViewBox()
    },

    /**
     * 40 - 已揽件
     */
    draw40View() {
      this.addMarker(this.startLngLat, 'delivery').setText('已揽件')
      this.addMarker(this.startLngLat, 'default')
      this.fitViewBox()
    },

    /**
     * 50 - 运输中
     */
    async draw50View() {
      try {
        const { transType } = this.routeData
        if (transType === 0) {
          this.drawDefaultView()
        } else if (transType === 1) {
          this.drawTransportByCar()
        } else if (transType === 2) {
          this.drawTransportByFly()
        }
      } catch (e) {
        throw new Error(e)
      }
    },

    /**
     * 运输中 - 陆运
     */
    async drawTransportByCar() {
      console.log('运输中 - 陆运')
      const { carNumber, driverPhone, routeCity, routeCounty } = this.routeData
      // 路径规划
      const path = await this.drivingSearch(this.startLngLat, this.endLngLat)
      this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
      this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      this.addPolyline(path)
      this.fitViewBox()

      // 获取车辆位置
      const {
        data: { correctLocation },
      } = await getCarLocation({ carNo: carNumber, employeeNo: driverPhone })
      if (!correctLocation) {
        console.error('获取车辆位置失败')
        return
      }
      let carLocation = correctLocation.split(',').reverse()
      // 计算 path 上距离 carLocation 最近的点的下标
      const {
        properties: { index },
      } = nearestPointOnLine(lineString(path), carLocation)
      carLocation = path[index]

      const carAngle = path[index + 1] ? bearing(path[index], path[index + 1]) : 0 // 角度
      // const carLocationText = this.startCity === this.endCity ? routeCounty : routeCity
      let carLocationText = ''
      // 同城时
      // routeCounty !== endDistrict  , 快件发往 endDistrict
      // routeCounty === endDistrict  ， 快件到达 endDistrict
      // 非同城
      // routeCity !== endCity  , 快件发往 endCity
      // routeCity === endCity  , 快件到达 endCity
      if (this.startCity === this.endCity) {
        if (routeCounty !== this.endDistrict) {
          carLocationText = `快件发往${this.endDistrict}`
        } else {
          carLocationText = `快件到达${this.endDistrict}`
        }
      } else {
        if (routeCity !== this.endCity) {
          carLocationText = `快件发往${this.endCity}`
        } else {
          carLocationText = `快件到达${this.endCity}`
        }
      }

      this.addFlyOrCarMarker(carLocation, carLocationText, 'car', carAngle)

      const path2 = path.slice(0, index + 1)
      this.addPolyline(path2, this.strokeColorMinor)
    },

    /**
     * 运输中 - 空运
     */
    drawTransportByFly() {
      console.log('运输中 - 空运')

      const flyAngle = bearing(this.startLngLat, this.endLngLat) // 角度
      const { flyLocation, flyLocationType, flyBubbleTips } = this.getFlyLocationAndBubbleTips()

      if (flyLocationType === 'start') {
        this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      } else if (flyLocationType === 'end') {
        this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
      } else {
        this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
        this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      }

      this.addPolyline([this.startLngLat, this.endLngLat])
      this.addPolyline([this.startLngLat, flyLocation], this.strokeColorMinor)
      this.addFlyOrCarMarker(flyLocation, flyBubbleTips, 'fly', flyAngle)
      this.fitViewBox()
    },

    /**
     * 获取飞机定位点与气泡提示文案
     *  http://zentao.ky-tech.com.cn/story-view-142190.html
     */
    getFlyLocationAndBubbleTips() {
      const { routeCity, routeNodeVos } = this.routeData

      if (routeCity === this.endCity) {
        return {
          flyLocation: this.endLngLat,
          flyLocationType: 'end',
          flyBubbleTips: `快件到达${this.endCity}`,
        }
      }

      if (routeNodeVos.some(item => item.icon === 'node-plane-start')) {
        return {
          flyLocation: truncate(midpoint(this.startLngLat, this.endLngLat)).geometry.coordinates,
          flyLocationType: 'center',
          flyBubbleTips: `快件发往${this.endCity}`,
        }
      }

      return {
        flyLocation: this.startLngLat,
        flyLocationType: 'start',
        flyBubbleTips: '快件送往机场',
      }
    },

    /**
     * 70 - 派送异常
     */
    async draw70View() {
      try {
        const { transType } = this.routeData
        let path = [this.startLngLat, this.endLngLat]

        if (transType === 1) {
          path = await this.drivingSearch(this.startLngLat, this.endLngLat)
        }

        this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
        this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
        this.addMarker(this.endLngLat, 'default')

        this.addPolyline(path, this.strokeColorMinor)
        this.fitViewBox()
      } catch (error) {
        console.log(error)
      }
    },

    /**
     * 80 - 已签收
     */
    draw80View() {
      this.drawDefaultView()
    },

    /**
     * 90 - 下单成功，请尽快投递
     */
    draw90View() {
      this.draw10View()
    },

    /**
     * 100 - 待通知取货
     */
    draw100View() {
      this.draw10View()
    },

    /**
     * 101 - 司机已送达
     */
    async draw101View() {
      console.log('101-司机已送达')
      const path = await this.drivingSearch(this.startLngLat, this.endLngLat)
      this.addMarker(this.startLngLat, 'delivery').setText(this.startCity)
      this.addMarker(this.endLngLat, 'pickup').setText(this.endCity)
      this.addMarker(this.endLngLat, 'default')
      this.addPolyline(path, this.strokeColorMinor)
      this.fitViewBox()
    },
  },
  deactivated() {
    console.log('map deactivated')
    this.timer && clearInterval(this.timer)
  },
  beforeDestroy() {
    console.log('map beforeDestroy')
    this.timer && clearInterval(this.timer)
  }
}
</script>

<style lang='scss' scoped>
@import './index.scss';
</style>
