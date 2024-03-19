<template>
  <div class="clientdialog">
    <el-dialog title="物流详情"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               width="700px"
               height="600px">
      <div class="content">
        <div class="content-top">
          <div class="content-top-city"  v-show="routeInfo.jjCity&&routeInfo.sjCity">{{routeInfo.jjCity}}
            <span class="icon">
              <i class="el-icon-more"></i>
              <span style="display:inline-block;position:relative;top:-1px;left:3px; border:5px solid transparent; border-left:5px solid rgb(128,99,206);"></span>
            </span>
            {{routeInfo.sjCity}}
          </div>
          <div class="content-top-summary">
            <div class="content-top-summary-left">
              <div>
                <span class="content-top-summary-left-firstSpan">运单号：{{routeInfo.ydCode}}</span>
                <span>{{billMonth?`${billMonth}帐单发票`:''}}</span></div>
              <div>
                <span class="content-top-summary-left-firstSpan">{{routeInfo.jjDateTime}}</span>
                <span style="color: #999999;">{{routeInfo.sjPerson}}</span></div>
            </div>
            <div class="content-top-summary-right">
              <el-image style="width:36px;height:36px;"
                        :src="statusImgUrl"
                        fit="fit"></el-image>
              <div class="content-top-summary-right-text">{{statusName }}</div>
            </div>
          </div>
        </div>

        <div class="routes">
          <div v-for="(value, key,index) in groupedRoutes"
               :key="index">
            <div class="routes-title"> {{key.replace(/\"/g, "")}}
              <div :ref="'routesTitleArrow'+index"
                   class="el-icon-caret-bottom"
                   @click="expandOrFoldInfo(index)"></div>
            </div>
            <div :ref="'routesContent'+index"
                 class="routes-content">
              <el-timeline>
                <el-timeline-item v-for="(route, itemIndex) in value"
                                  :key="itemIndex"
                                  :timestamp="formateTimeStamp( route.dateTime ) ">
                  <div v-if="route.step=='机场发件'"
                       slot="dot"
                       :style="{backgroundColor:'#fff',    backgroundRepeat: 'no-repeat', backgroundImage:'url('+(index==0&&itemIndex==0?planeActiveImgUrl:planeImgUrl)+')'}"
                       class="routes-content-dot el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--">
                  </div>
                  <div v-else
                       slot="dot"
                       :style="{backgroundColor:getRouteFlag(route.step)?'#7352BF':'#E8E6EE',    
                                width: getRouteFlag(route.step)?'':'12px'  ,
                                height: getRouteFlag(route.step)?'':'12px',
                                left: getRouteFlag(route.step)?'':'-2px',
                              }"
                       class="routes-content-dot el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--">{{ getRouteFlag(route.step)}}</div>
                  <span v-html="route.stepDesc"></span>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer"
            style="border-top:0px">
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs"
import { formatDate2 } from '@utils/commonUtil'
import { getRoutesApi } from "@/services/api/common"
import { getPhone, getCustomerCode } from "@/utils/storage"
export default {
  data () {
    return {
      dialogVisible: false,
      groupedRoutes: [],
      routeInfo: {},
      billMonth:'',
      // routeInfo: {
      //   "ydCode": "00000000045",
      //   "jjDateTime": "2018-04-10 11:00",
      //   "serviceWay": "同城即日",
      //   "sjPerson": "张三",
      //   "sjCompany": "深圳乙宏",
      //   "qhDateTime": "2018-03-21 10:28",
      //   "arrivalDateTime": "2018-04-10 23:00",
      //   "sjCity": "武汉市",
      //   "jjCity": "深圳市",
      //   "route": [
      //     {
      //       "step": "出车取货",
      //       "stepDesc": "已安排取货员：洪丹前往客户处",
      //       "dateTime": "2018-04-10 11:00"
      //     },
      //     {
      //       "step": "出车取货",
      //       "stepDesc": "已安排取货员：洪丹前往客户处，车牌号：三轮粤B89177",
      //       "dateTime": "2018-03-21 10:26"
      //     },
      //     {
      //       "step": "机场发件",
      //       "stepDesc": "取货员已到客户处，待揽件",
      //       "dateTime": "2018-03-21 12:26"
      //     },
      //     {
      //       "step": "揽件完毕",
      //       "stepDesc": "快件已由沙井和平点部揽件完毕3",
      //       "dateTime": "2018-03-21 10:28"
      //     },
      //     {
      //       "step": "机场发件",
      //       "stepDesc": "快件已到达沙井塘尾点部",
      //       "dateTime": "2018-04-10 20:58"
      //     },
      //     {
      //       "step": "装车派送",
      //       "stepDesc": "快件正在派送途中，请注意查收！派件员：王远慧，电话：18988785406",
      //       "dateTime": "2018-03-22 14:21"
      //     },
      //     {
      //       "step": "交接扫描(派)",
      //       "stepDesc": "快件已到达沙井塘尾点部",
      //       "dateTime": "2018-04-10 20:38"
      //     },
      //     {
      //       "step": "装车派送",
      //       "stepDesc": "快件正在派送途中，请注意查收！派件员：王远慧，电话：18988785406",
      //       "dateTime": "2018-03-22 14:21"
      //     }
      //   ],
      //   "ydStatus": '3'
      // },
      statusName: '',
      statusImgUrl: '',
      planeImgUrl: require("../../../assets/image/plane.png"),
      planeActiveImgUrl: require("../../../assets/image/plane-active.png"),
      phones: []
    }
  },
  created () {

  },
  methods: {
    //查询列表
    async getRouteInfo (ydcode,type) {
      let params = {
        mobile: getPhone(),
        companyNo: getCustomerCode(),
        data: [{ "ydCode": ydcode }],
        // waybillSource: '120',
      }
      if(type!='client'){
        params.waybillSource="120"
      }
      let res = await getRoutesApi(params)
      if (res.success && res.data.successList.length > 0) {
        this.routeInfo = res.data.successList[0]
        return true
      } else {
        this.$message.error(res.msg)
      }
      return false
    },
    initRoutesInfo () {
      switch (this.routeInfo.ydStatus + '') {
        case '1':
          this.statusName = '待通知取货'
          this.statusImgUrl = require("@assets/image/route-status-unpicked.png")
          break
        case '2':
          this.statusName = "待取货"
          this.statusImgUrl = require("@assets/image/route-status-picking.png")
          break
        case '3':
          this.statusName = "待签收"
          this.statusImgUrl = require("@assets/image/route-status-unsign.png")
          break
        case '4':
          this.statusName = "已签收"
          this.statusImgUrl = require("@assets/image/route-status-signed.png")
          break
        default:
          this.statusName = '无'
      }

      // this.routeInfo.route.forEach(item => {
      //     let result = item.stepDesc.match(/1[3458][0-9]\d{8}/)
      //     if (result) {
      //         let phone = result[0]
      //         // let phone2 = phone.substr(0, 3) + '****' + phone.substr(7, 11)
      //         this.phones.push({ phone2: phone })
      //         item.stepDesc = item.stepDesc.replace(/(1\d{2})\d{4}(\d{4})/, "<span style='color: #7352BF;cursor:pointer'>$1****$2</span>")
      //     }
      // })
      this.groupedRoutes = this.getGroupedRoutes()
    }, 
    showPhone () {
      alert('sd')
    },
    getRouteFlag (step) {
      if (step == '揽件完毕') {
        return '发'
      } else if (step == '签收完毕') {
        return '收'
      }
    },
    formateTimeStamp (val) {
      return dayjs(val).format("HH:mm:ss")
    },
    showDialog (ydCode,type,billMonth) {
      this.billMonth=billMonth
      this.getRouteInfo(ydCode,type).then(r => {
        if (r) {
          this.dialogVisible = true
          this.initRoutesInfo()
        }
      })
      // this.initRoutesInfo();
    },
    expandOrFoldInfo (val) {
      let element = this.$refs['routesTitleArrow' + val][0]
      var isFold = !element.style.transform || (element.style.transform == 'rotate(0deg)')
      element.style.transform = `rotate(${isFold ? 180 : 0}deg)`
      this.$refs['routesContent' + val][0].style.display = isFold ? 'none' : 'block'
    },
    getGroupedRoutes () {
      this.routeInfo.route.sort((pre, next) => new Date(pre.dateTime) > new Date(next.dateTime) ? -1 : 1)
      const groupedList = this.groupBy(this.routeInfo.route, item => formatDate2(new Date(item.dateTime), "yyyy-MM-dd EEE"))
      return groupedList
    },
    groupBy (array, fn) {
      const groups = {}
      array.forEach(item => {
        const key = JSON.stringify(fn(item))
        groups[key] = groups[key] || []
        groups[key].push(item)
      })
      return groups
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    // height: 489px;
    width: 100%;
    .content-top {
      padding-left: 24px;
      .content-top-city {
        font-size: 18px;
        color: #333333;
        font-weight: bold;
        .icon {
          color: #7352bf;
          display: inline-block;
          margin: auto 4px;
        }
      }
      .content-top-summary {
        display: flex;
        .content-top-summary-left {
          line-height: 38px;
          color: #333333;
          margin-top: 12px;
          width: 564px;
          .content-top-summary-left-firstSpan {
            display: inline-block;
            width: 228px;
          }
        }
        .content-top-summary-right {
          padding-top: 10px;
          .content-top-summary-right-text {
            font-size: 14px;
            color: #7352bf;
            font-weight: bold;
            margin-top: 9px;
          }
        }
      }
    }
    .routes {
      height: 350px;
      overflow-y: scroll;
      overflow-x: hidden;
      margin-right: -15px;
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #dedce3;
        border-radius: 3px;
      }
      .routes-title {
        position: relative;
        width: 641px;
        height: 36px;
        background-color: #f1f1f5;
        border-left: 3px solid #7352bf;
        font-size: 14px;
        font-weight: bold;
        line-height: 36px;
        color: #333333;
        padding-left: 16px;
        margin-top: 12px;
        .el-icon-caret-bottom {
          display: inline-block;
          position: absolute;
          top: 12px;
          right: 16px;
          color: rgb(150, 149, 204);
          cursor: pointer;
        }
      }
      .routes-content {
        margin-left: 100px;
        padding-top: 34px;
        .routes-content-dot {
          font-size: 12px;
          color: #ffffff;
          width: 20px;
          height: 20px;
          left: -5px;
          padding-left: 1px;
          margin-top: -4px;
        }
        // /deep/.el-timeline-item__dot {
        //   // top: 5px;
        // }
        /deep/.el-timeline {
          margin: 0px 0 -8px;
          /deep/.el-timeline-item {
            padding-bottom: 2px;
            .el-timeline-item__wrapper {
              top: -11px;
            }
          }
          /deep/.el-timeline-item__timestamp {
            padding-bottom: 0;
            &.is-bottom {
              font-size: 12px;
              color: #333333;
              position: relative;
              left: -97px;
              top: -21px;
            }
          }
        }
        /deep/.el-timeline-item__tail {
          border-left-width: 1px;
        }
      }
    }
  }
  /deep/ .el-dialog__footer {
    border-top: none !important;
  }
</style>
