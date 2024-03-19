<template>
  <div>
    <div class="map-box" style="height: calc(100vh - 210px)">
      <div v-if="!first" class="points-box" style="height: 95%;width: 230px">
        <div class="points-box-title">
          <!-- <p class="points-box-result">查询结果：</p> -->
          <span v-if="pointList.length>0">共找到{{pointList.length}} 个网点</span>
          <span v-else>您查询的地区暂无网点</span>
        </div>
 <div v-if="pointList.length>0" style="margin-top:10px; overflow-y: auto;">
          <div class="points-box-item" v-for="(item, index) in pointList" :key="item.id" @click="handleCenter(item)">
            <el-row class="network">
              <el-col :span="5">
                <div class="network-position">{{index + 1}}</div>
              </el-col>
              <el-col :span="19" class="font-bold">{{item.pointName}}</el-col>
            </el-row>
            <el-row class="address">
              <el-col :span="5">
                <div class="left-icon">
                  <svg-icon icon-class="network-address"></svg-icon>
                </div>
              </el-col>
              <el-col :span="19">{{item.companyAddress}}</el-col>
            </el-row>
            <el-row class="phone-number">
              <el-col :span="5">
                <div class="left-icon">
                  <svg-icon icon-class="contact-number"></svg-icon>
                </div>
              </el-col>
              <el-col :span="19">{{item.companyTelephone}}</el-col>
            </el-row>
            <el-row>
              <el-col :span="5">
                <div class="left-icon">
                  <svg-icon icon-class="service-time"></svg-icon>
                </div>
              </el-col>
              <el-col :span="19">{{item.serviceTime}}</el-col>
            </el-row>
            <!-- <p class="points-box-name points-box-name_active">{{index + 1}}、{{item.pointName}}<span class="points-box-distance"></span></p>
          <p class="points-box-address">地址：{{item.companyAddress}}</p> -->
          </div>
        </div>
      </div>
      <div id="bdmap" class="map-box-baidu" style="height: 100%;"></div>
    </div>
  </div>
</template>
<script>
const addressUrl = require("@/assets/image/network-address.png")

const phoneUrl = require("@/assets/image/contact-number.png")

const timeUrl = require("@/assets/image/service-time.png")

export default {
  data () {
    return {
      map: {},
      markerDesc: {},
      apiData: {
        "code": 0,
        "msg": "OK",
        "data": [{
          "serviceTime": "7*24小时",
          "serviceType": "航空快递",
          "longitude": 114.2545,
          "latitude": 22.71525,
          "pointName": "南联点部00",
          "hotCity": "00",
          "provinceOrder": 5,
          "cityOrder": 2,
          "countyOrder": 0,
          "townOrder": 0,
          "hotCityOrder": 1,
          "companyName": "跨越速运",
          "companyTelephone": "95324",
          "companyAddress": "广东省深圳市龙岗区龙岗街道南联社区丘屋村上进2巷8号1楼",
          "companyNodeCode": "GSWD171100443",
          "distance": null,
          "province": "广东省",
          "city": "深圳市",
          "county": "龙岗区",
          "town": "龙岗街道",
          "auditDate": null,
          "createData": null,
          "upDate": null,
          "areaSynData": {},
          "id": "500000000000004901"
        }, {
          "serviceTime": "7*24小时",
          "serviceType": "航空快递",
          "longitude": 114.24566,
          "latitude": 22.75283,
          "pointName": "龙西点部",
          "hotCity": "00",
          "provinceOrder": 5,
          "cityOrder": 2,
          "countyOrder": 0,
          "townOrder": 0,
          "hotCityOrder": 1,
          "companyName": "跨越速运",
          "companyTelephone": "95324",
          "companyAddress": "广东省深圳市龙岗区龙岗街道龙西社区第三工业区29栋1楼",
          "companyNodeCode": "GSWD180400354",
          "distance": null,
          "province": "广东省",
          "city": "深圳市",
          "county": "龙岗区",
          "town": "龙岗街道",
          "auditDate": null,
          "createData": null,
          "upDate": null,
          "areaSynData": {},
          "id": "500000000000005345"
        }],
        "traceId": "bcfa12c12547454d86198d3ec96232b4"
      },
      pointData: [],
      pointList: [],
      first:true
    }
  },
  methods: {
    // 绘制地图
    init (list) {
      this.pointList = list
      this.first=false
      if (!list||list.length===0) {
        this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 5)
        return
      }
      var pointArray = new Array()
      let first = list[0]
      let _self = this
      this.map.centerAndZoom(
        new BMap.Point(first.longitude, first.latitude),
        16
      )
      var allOverlay = _self.map.getOverlays()
      if (allOverlay && allOverlay.length > 0) {
        allOverlay.forEach((mark) => {
          _self.map.removeOverlay(mark)
        })
      }
      list.forEach((item, index) => {
        var point = new BMap.Point(item.longitude, item.latitude)
        var marker = new BMap.Marker(point)
        let nun = index + 1
        let x = nun < 10 ? 5 : 1
        let y = 4
        //  添加文字
        var label = new BMap.Label(nun, {
          offset: new BMap.Size(x, y)
        })
        label.setStyle({
          color: '#fff',
          fontSize: 12,
          border: 0,
          position: 'absolute',
          left: 5,
          background: 'transparent'
        })
        marker.setLabel(label)
        _self.map.addOverlay(marker)
        marker.addEventListener("click", function () {
          _self.addOverlay(point, item)
        })
        //pointArray[index] = marker
      })
      _self.map.enableScrollWheelZoom(true)
      //让所有点在视野范围内（失效）
      _self.map.setViewport(pointArray)
    },
    // 展示详细信息
    addOverlay (point, data) {
      this.deleteOverlay()
      var opts = {
        position: point,    // 指定文本标注所在的地理位置
        offset: new BMap.Size(-50, 0)    //设置文本偏移量
      }
      let html =
          `    <div class="network-pop">
                <div aria-hidden="false" id="el-popover" class="el-popover el-popper el-popover--plain el-popover--map" style="width: 360px;" x-placement="bottom">
                    <div class="map-label">
                    <p class="map-label-title"> ${data.pointName}</p>
                       </div>
                    <div>
                      <div class=container>       
                        <div class=left><img src='${addressUrl}'></img></div>
                         <div class=right>${data.companyAddress}</div>
                      </div>

            <div class=container>       
        <div class=left><img src='${phoneUrl}'></img></div>
        <div class=right>${data.companyTelephone}</div>
    </div>

                <div class=container>       
        <div class=left><img src='${timeUrl}'></img></div>
        <div class=right>${data.serviceTime}</div>
    </div>

           
                   
                    </div>
                    <div x-arrow="" class="popper__arrow" style="left: 42px;"></div>
                </div>
              </div>
            `
      //  <ul class="map-label-content">
      //         <li><span>地址：</span>${data.companyAddress}</li>
      //         <li><span>联系方式：</span>${data.companyTelephone}</li>
      //         <li><span>服务时间：</span>${data.serviceTime}</li>
      //         <li><span>服务内容：</span>${data.serviceType}</li>
      //         </ul>
      var label = new BMap.Label(html, opts)  // 创建文本标注对象
      label.setStyle({
        border: "none"
      })
      this.markerDesc = label
      this.map.addOverlay(label)
      //关闭按钮
      document.getElementById('el-popover').addEventListener('click', function () {
        document.getElementById('el-popover').style.display = 'none'
      })
    },
    // 点击列表/地图point
    handleCenter (data) {

      this.map.centerAndZoom(new BMap.Point(data.longitude, data.latitude), 18)
      var point = new BMap.Point(data.longitude, data.latitude)
      this.addOverlay(point, data)
    },
    // 删除详细信息
    deleteOverlay () {
      this.map.removeOverlay(this.markerDesc)
    }
  },

  mounted () {
    let map = new BMap.Map("bdmap")
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 5)
    map.enableScrollWheelZoom()
    map.enableContinuousZoom()
    this.map = map
  }
}
</script>
<style scoped lang="scss">
  .points-box-name_active {
    &:hover {
      color: #7c57df;
    }
  }
  .network {
    margin-bottom: 14px;
    cursor: pointer;
  }
  .network-position {
    // margin-left:20px;
    background: url("~@/assets/image/network.png") no-repeat;
    height: 24px;
    width: 20px;
    line-height: 24px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
    color: white;
  }
  .padding-24 {
    padding-left: 24px;
  }
  .font-bold {
    font-weight: bold;
    line-height: 24px;
  }
  .left-icon {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 14px;
    height: 14px;
  }
  .address {
    line-height: 18px;
    margin-bottom: 12px;
  }
  .phone-number {
    margin-bottom: 12px;
  }
</style>
<style lang="scss">
  .network-pop {
    .el-popover {
      padding: unset !important;
      border-radius: 8px;
    }
    .container {
      margin: 12px 0;
      display: flex;
    }
    .left {
      height: 100%;
      padding-left: 31px;
      padding-right: 12px;
      > img {
        padding-top: 3px;
        height: 14px;
        width: 14px;
      }
    }
    .right {
      height: 100%;
      font-size: 14px;
      line-height: 20px;
      padding-right: 30px;
      white-space:normal;
      width:277px;
    }
  }
</style>
