<template>
  <!-- 网点查询 -->
  <div class="ky-fixation page-dotinquire query-map_r" style="padding: 0;height: 100%">
    <div class="address-comtent">
      <el-form class="search-form search-form_r" style="padding: 12px 40px 0 20px;border-radius: 0 0 5px 5px;" ref="form" :inline="true" :model="form">
        <!-- 新地址选择 -->
        <el-form-item>
          <ky-address ref="serderaddress" class="ky-address_r"  placeholder="请选择省市区" :defaultDistrict="defaultDistrict" level="street" @change="changeAddress"></ky-address>
        </el-form-item>
        <el-form-item label="" >
          <el-button type="primary" size="medium" round @click="onSubmit(true)">查询</el-button>
          <el-button size="medium" round @click="onRest">清空</el-button>
        </el-form-item>
      </el-form>
      <!-- echars 全国地图 -->
      <template class="map_wrap">
        <!-- <div v-show="searchState == 0" style="margin-top: 15px;height: calc(100% - 85px);max-height: calc(100% - 85px)">
          <ky-map ref='kyMap' @change="echartChange" style="border-radius: 5px 5px 0 0;"></ky-map>
        </div> -->
        <!-- 百度地图查询结果 -->
        <bd-map  ref="baidu" style="border-radius: 5px 5px 0 0;height: calc(100% - 85px);padding: 5px;background: #fff;"></bd-map>
        <!-- 定位地图 不展示 -->
        <div id="localtionMap"></div>
      </template>
    </div>
  </div>
</template>
<script>
import Map from "./components/map.vue"
import Baidu from "./components/baidu.vue"
import Address from "@/components/address/address.vue"
import { listCompanyNode } from "@/services/api/address"
export default {
  components: {
    "ky-map": Map,
    "ky-address": Address,
    "bd-map": Baidu,
  },
  data() {
    return {
      searchState: 0, // 0: 默认状态, 1: 有查询数据, 2: 无查询数据
      showMap: true,
      placeName: "请选择",
      point: {},
      restaurants: [],
      placeOptions: [],
      defaultDistrict: [],
      chart: {},
      form: {
        v1: "",
        v2: ""
      }
    }
  },
  watch: {
    searchState(val) {
      let _self = this
      switch (val) {
        case 0:
          break
        case 1:
          break
        case 2:
          _self.searchState = 0
          this.$alert("抱歉，您查询的地区暂无网点！", "抱歉！", {
            confirmButtonText: "知道啦",
            type: "error",
            center: true
          })
          break

        default:
          break
      }
    }
  },
  methods: {
    handleCommand(command) {
      this.placeName = command.address
      this.form.v2 = command.point
    },
    showdropdown() {
      if (this.placeOptions[0]) {
        this.$refs.dropdown.handleClick()
      } else {
        this.$message.warning("没有找到附近街道")
      }
    },
    /**
     * @desc 查询网点
     */
    async echartChange(address) {
      this.form.v1 = address
      let arr = address.split("-")
      let params = {
        province: arr[0],
        city: arr[1],
        district: arr[2],
        town: arr.pop()
      }
      let res = await listCompanyNode(params)
      if (res.data ) {
        this.$refs.baidu.init(res.data)
        this.searchState = 1
      } 
      // else {
      //   this.searchState = 2
      // }
    },
    // 四级联动change
    changeAddress(ids, names,str,data) {
      let sendProvinceName=data.filter(item=>item.districtLevel=="province")
      let sendCityName=data.filter(item=>item.districtLevel=="city")
      let sendCountyName=data.filter(item=>item.districtLevel=="zone")
      let sendTownName=data.filter(item=>item.districtLevel=="street")
      this.addressNames =[
        sendProvinceName.length>0?sendProvinceName[0].districtName:'',
        sendCityName.length>0?sendCityName[0].districtName:'',
        sendCountyName.length>0?sendCountyName[0].districtName:'',
        sendTownName.length>0?sendTownName[0].districtName:''
      ]
      this.form.v1 = names.join("-")
    },

    /**
     * @desc 当前经纬度
     */
    geolocation() {
      let _self = this
      var geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition(
        function(r) {
          if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            var pt = r.point
            var map = new BMap.Map("localtionMap")
            map.centerAndZoom(new BMap.Point(r.point.lng, r.point.lat), 11)
            var options = {
              onSearchComplete: function(results) {
                // 判断状态是否正确
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                  var s = []
                  let addressData = results.Lq
                  for (var i = 0; i < addressData.length; i++) {
                    let item = {
                      title: addressData[i].title,
                      address: addressData[i].address,
                      point: addressData[i].point
                    }
                    s.push(item)
                  }
                  _self.placeOptions = s
                  _self.showdropdown()
                }
              }
            }
            var local = new BMap.LocalSearch(map, options)
            local.search("街道")
          } else {
            alert("failed" + this.getStatus())
          }
        },
        { enableHighAccuracy: true }
      )
    },

    /**
     * @desc 根据经纬度返回地址
     */
    geolocationAddress(point) {
      let _self = this
      var geoc = new BMap.Geocoder()
      geoc.getLocation(point, function(rs) {
        var addComp = rs.addressComponents
        _self.echartChange(
          `${addComp.province}-${addComp.city}-${addComp.district}-${
            addComp.street
          }`
        )
        //alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber)
      })
    },

    async onSubmit() {
      let _self = this
      if (this.form.v1) {
        let params = {
          province: this.addressNames[0],
          city: this.addressNames[1],
          district: this.addressNames[2],
          town: this.addressNames[3]
        }
        //let params = {province: "广东省", city: "深圳市", district: "宝安区", town: "福永街道"}
        const res = await listCompanyNode(params)
        if (res.data) {
          this.$refs.baidu.init(res.data)
          this.searchState = 1
        } 
        // else {
        //   this.searchState = 2
        // }
      } else if (this.form.v2) {
        var geoc = new BMap.Geocoder()
        geoc.getLocation(_self.form.v2, function(res) {
          let data = res.addressComponents
          let params = {
            province: data.province,
            city: data.city,
            district: data.district,
            town: data.street
          }
          listCompanyNode(params)
            .then(noderes => {
              if (noderes.data&&noderes.data.length>0) {
                this.$refs.baidu.init(res.data)
                _self.searchState = 1
              } else {
                _self.searchState = 2
              }
            })
            .catch(error => {
              _self.searchState = 2
            })
        })
      } else {
        this.$message.error("请选择区域进行查询")
      }
    },
    onRest() {
      this.defaultDistrict = []
      this.searchState=0
      this.addressNames = []
      this.form.v1 = ""
      this.form.v2 = ""
      this.$refs.kyMap.provinceMap()
    }
  },
  mounted() {}
}
</script>
<style lang="scss">
@import "./style.scss";
.address-comtent{
  background: #f5f7fb;
  height: 100%;
}

.search-form_r {
  background: #fff;
  box-shadow: 0 0 2px rgba(0, 0, 0, .12), 0 0 4px rgba(0, 0, 0, .04)
}

.query-map_r .ky-address_r .el-input__inner {
  border-radius: 18px;
  // background: #eef3fc;
  // border: 0 !important;
}

.map_wrap {
  background: #fff;
}
</style>
