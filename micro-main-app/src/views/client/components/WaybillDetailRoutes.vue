<template>
  <div class="routes-container" v-if="routeInfo.route&&routeInfo.route.length>0">
    <div class="summary">
      <div class="summary-city" v-show="routeInfo.jjCity&&routeInfo.sjCity">{{routeInfo.jjCity}}
        <svg-icon icon-class="arrow-right" class="icon-arrow-right"/>
        {{routeInfo.sjCity}}
      </div>
      <div class="service-way">
        {{routeInfo.serviceWay}}
      </div>
      <div class="arrival-time">
        预计 {{routeInfo.arrivalDateTime}} 到达
      </div>
    </div>

    <div class="routes">
      <div class="routes-group" v-for="(value, key,index) in groupedRoutes" :key="index">
        <div class="routes-title"> {{key.replace(/\"/g, "")}} </div>
        <div :ref="'routesContent'+index" class="routes-content">
          <el-timeline>
            <el-timeline-item v-for="(route, itemIndex) in value" :key="itemIndex" :timestamp="formateTimeStamp( route.dateTime ) ">
              <!-- <div v-if="route.step=='机场发件'" slot="dot" :style="{backgroundColor:'#fff',    backgroundRepeat: 'no-repeat', backgroundImage:'url('+(index==0&&itemIndex==0?planeActiveImgUrl:planeImgUrl)+')'}" class="routes-content-dot el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--">
                </div> -->
              <div slot="dot" :style="{backgroundColor:getRouteFlag(route.step)?'#7352BF':'#E8E6EE',    
                                width: getRouteFlag(route.step)?'':'12px'  ,
                                height: getRouteFlag(route.step)?'':'12px',
                                left: getRouteFlag(route.step)?'':'-2px',
                              }" class="routes-content-dot el-timeline-item__node el-timeline-item__node--normal el-timeline-item__node--">{{ getRouteFlag(route.step)}}</div>
              <span  v-html="route.stepDesc">asd</span>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs"
import { getRoutesApi } from "@/services/api/common"
import { getPhone, getCustomerCode } from "@/utils/storage"
export default {
  data() {
    return {
      groupedRoutes: [],
      routeInfo: {},
      // routeInfo: {
      //     ydCode: "00000000045",
      //     jjDateTime: "2018-04-10 11:00",
      //     serviceWay: "同城即日",
      //     sjPerson: "张三",
      //     sjCompany: "深圳乙宏",
      //     qhDateTime: "2018-03-21 10:28",
      //     arrivalDateTime: "2018-04-10 23:00",
      //     sjCity: "武汉市",
      //     jjCity: "深圳市",
      //     route: [
      //         {
      //             step: "出车取货",
      //             stepDesc: "已安排取货员：洪丹前往客户处",
      //             dateTime: "2018-04-10 11:00"
      //         },
      //         {
      //             step: "出车取货",
      //             stepDesc: "已安排取货员：洪丹前往客户处，车牌号：三轮粤B89177",
      //             dateTime: "2018-03-21 10:26"
      //         },
      //         {
      //             step: "机场发件",
      //             stepDesc: "取货员已到客户处，待揽件",
      //             dateTime: "2018-03-21 12:26"
      //         },
      //         {
      //             step: "揽件完毕",
      //             stepDesc: "快件已由沙井和平点部揽件完毕3",
      //             dateTime: "2018-03-21 10:28"
      //         },
      //         {
      //             step: "机场发件",
      //             stepDesc: "快件已到达沙井塘尾点部",
      //             dateTime: "2018-04-10 20:58"
      //         },
      //         {
      //             step: "装车派送",
      //             stepDesc:
      //     "快件正在派送途中，请注意查收！派件员：王远慧，电话：18988785406",
      //             dateTime: "2018-03-22 14:21"
      //         },
      //         {
      //             step: "交接扫描(派)",
      //             stepDesc: "快件已到达沙井塘尾点部",
      //             dateTime: "2018-04-10 20:38"
      //         },
      //         {
      //             step: "装车派送",
      //             stepDesc:
      //     "快件正在派送途中，请注意查收！派件员：王远慧，电话：18988785406",
      //             dateTime: "2018-03-22 14:21"
      //         }
      //     ],
      //     ydStatus: "3"
      // },
      planeImgUrl: require("@assets/image/plane.png"),
      planeActiveImgUrl: require("@assets/image/plane-active.png")
    }
  },
  methods: {
    async freshRoutes(ydCode) {
      // 需判断是在官网还是客户端
      let result= await this.getRouteInfo(ydCode, "client")
      if(result){
        this.initRoutesInfo()
      }
      // this.initRoutesInfo()
    },
    //查询路由信息
    async getRouteInfo(ydcode, type) {
      let params = {
        mobile: getPhone(),
        companyNo: getCustomerCode(),
        data: [{ ydCode: ydcode }]
      }
      if (type != "client") {
        params.waybillSource = "120"
      }
      let res = await getRoutesApi(params)
      if (res.success && res.data.successList.length > 0) {
        this.routeInfo = res.data.successList[0]
        return true
      }  
      return false
    },
    initRoutesInfo() {
      this.routeInfo.route.forEach(item => {
        let result = item.stepDesc.match(/1[3458][0-9]\d{8}/)
        if (result) {
          item.stepDesc = item.stepDesc.replace(
            /(1\d{10})/,
            "<span style='color: #7352BF;cursor:pointer'>$1</span>"
          )
        }
      })
      this.groupedRoutes = this.getGroupedRoutes()
    },
    changePhone(route) {
      route.stepDesc = "stepDesc"
    },
    showPhone() {
      // alert("sd")
    },
    getRouteFlag(step) {
      if (step == "揽件完毕") {
        return "发"
      } else if (step == "签收完毕") {
        return "收"
      }
    },
    formateTimeStamp(val) {
      return dayjs(val).format("HH:mm:ss")
    },
    getGroupedRoutes() {
      this.routeInfo.route.sort((pre, next) =>
        new Date(pre.dateTime) > new Date(next.dateTime) ? -1 : 1
      )
      const groupedList = this.groupBy(this.routeInfo.route, item =>
        dayjs(item.dateTime).format("YYYY-MM-DD")
      )
      return groupedList
    },
    groupBy(array, fn) {
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
  .routes-container {
    overflow: hidden;
    box-sizing: border-box;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    padding: 24px 0;
    height: 217px;
    margin-bottom: 20px;
    font-size: 14px;

    .summary {
      float: left;
      padding-left: 24px;
      border-right: 1px solid #e6e6e6;
      height: 100%;
      width: 294px;
      box-sizing: border-box;
      position: relative;
      margin-right: 62px;
      padding: 29px 0 0 49px;
      &::after {
        content: "";
        display: block;
        position: absolute;
        right: -5px;
        top: 81px;
        width: 7px;
        height: 7px;
        background: white;
        border-right: 1px solid #e6e6e6;
        border-bottom: 1px solid #e6e6e6;
        transform: rotate(-45deg);
      }
      .summary-city {
        font-size: 18px;
        color: #333333;
        font-weight: 500;
        .icon-arrow-right{
          width: 36px;
          height: 36px;
          vertical-align: -11px;
          padding: 0 8px;
        }
      }
      .service-way {
        display: inline-block;
        margin: 35px 0 25px;
        background: #ff9d32;
        border-radius: 4px;
        padding: 0 10px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        color: #ffffff;
      }
      .arrival-time {
        color: #999999;
      }
    }
    .routes {
      height: 100%;
      overflow-y: scroll;
      overflow-x: hidden;
      margin-right: -15px;
      color: #999999;
      margin-right: 8px;
      &::-webkit-scrollbar {
        width: 6px;
        height: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #ebebeb;
        border-radius: 4px;
      }
      .routes-group {
        overflow: hidden;
        .routes-title {
          float: left;
          height: 36px;
          line-height: 36px;
          padding-left: 16px;
          margin-top: -8px;
        }
        .routes-content {
          float: left;
          margin-left: 100px;
          padding-top: 14px;
          .routes-content-dot {
            font-size: 12px;
            color: #ffffff;
            width: 20px;
            height: 20px;
            left: -5px;
            padding-left: 1px;
            margin-top: -4px;
          }

          /deep/ {
            .el-timeline {
              margin: 0px 0 -8px;
              .el-timeline-item {
                padding-bottom: 2px;
                .el-timeline-item__wrapper {
                  top: -11px;
                  .el-timeline-item__content {
                    color: #999;
                  }
                }
              }
              .el-timeline-item__timestamp {
                padding-bottom: 0;
                &.is-bottom {
                  position: relative;
                  left: -97px;
                  top: -21px;
                }
              }
            }
            .el-timeline-item__tail {
              border-left-width: 1px;
            }
          }
        }
        &:first-of-type {
          /deep/ .el-timeline-item:first-of-type {
            .el-timeline-item__content,
            .el-timeline-item__timestamp {
              color: #333333 !important;
            }
          }
          color: #333333;
        }
        &:not(:last-child) {
          /deep/
            .el-timeline
            .el-timeline-item:last-child
            .el-timeline-item__tail {
            display: block;
          }
        }
      }
    }
  }
  /deep/ .el-dialog__footer {
    border-top: none !important;
  }

  .win-form{
    .routes-content-dot {
      margin-top: -12px !important;
    }
  }
</style>
