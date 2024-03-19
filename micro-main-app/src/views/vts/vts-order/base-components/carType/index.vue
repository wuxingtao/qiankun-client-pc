<template>
  <section class="carTypeBox"
           v-loading="loading">
    <div class="title">
      <img src="../../../../../assets/image/vts/cartype.png"
           class="title-icon" />车型选择
      <div class="car-info">
        <div class="selece">已选 {{carInfo.carLength||'--'}}米{{carInfo.carTypeName||'--'}}</div>
        <div class="infoDetail">载重：{{cpCarWeight||'--'}}吨 &nbsp 体积：{{carInfo.carCubage||'--'}}方 &nbsp 长宽高：{{carInfo.carLength||'--'}}*{{carInfo.carWidth||'--'}}*{{carInfo.carHeight||'--'}}米 &nbsp 轴数：{{carInfo.axleNum||'--'}}</div>
      </div>
    </div>
    <div class="carList">
      <div v-for="(item,index) in carList"
           :key="index"
           :class="['carItem',carTypeIndex===index?'car-active':'']"
           @click="checkCar(item,index)">
        <img :src="item.url"
             alt=""
             class="carItem-img">
        <div class="carName">{{item.carName}}</div>
      </div>
    </div>
    <!-- 车型可选信息 -->
    <div class="selectType">
      <div class="carLength">
        <div class="type-title">可选车长：</div>
        <div class="type-list">
          <span :class="['list-item',carLengthIndex===index?'activeCarLength':'']"
                v-for="(item,index) in carLengthList"
                :key="index"
                @click="selectCarLength(item,index)">{{item.carLength}}米</span>
        </div>
      </div>
      <div class="weiban"
           v-if="showWhetherTailboard">
        <div class="type-title">加选尾板：</div>
        <div :class="['type-list',cpDisbleWhetherTailboard?'noWhether':'']">
          <span :class="['list-item',carWhetherTailboardIndex===index?'activeCarLength':'']"
                v-for="(item,index) in whetherTailboardList"
                :key="item.value"
                @click="selectCarNeed(item,index,'whetherTailboard')">{{item.lable}}</span>
          <span v-if="cpDisbleWhetherTailboard"
                class="cpDisbleWhetherTailboard"><i class="el-icon-message-solid icon"></i>{{cpDisbleWhetherTailboardText}}</span>
        </div>
      </div>
      <div class="weiban"
           v-if="showTemperature">
        <div class="type-title">运输温度：</div>
        <div class="type-list">
          <span :class="['list-item',carTemperatureIndex===index?'activeCarLength':'']"
                v-for="(item,index) in temperatureList"
                :key="item.value"
                @click="selectCarNeed(item,index,'temperature')">{{item.lable}}</span>
        </div>
      </div>
    </div>
    <!-- 加载 -->
    <!-- <div class="el-loading-spinner"
         v-if="loading"></div> -->
  </section>
</template>

<script>
  import { geiGolbalCarInfo } from '@/services/api/vts/index'
  import bus from "../../bus.js";
  import store from "../../../store.js"
  const CarList = [
    { url: require('../../../../../assets/image/vts/carList/面包车@2x.png'), carName: '面包车', },
    { url: require('../../../../../assets/image/vts/carList/厢式车@2x.png'), carName: '厢式车' },
    { url: require('../../../../../assets/image/vts/carList/平板车@2x.png'), carName: '平板车', },
    { url: require('../../../../../assets/image/vts/carList/高栏车@2x.png'), carName: '高栏车', },
    { url: require('../../../../../assets/image/vts/carList/冷藏车@2x.png'), carName: '冷藏车' },
    { url: require('../../../../../assets/image/vts/carList/高低板@2x.png'), carName: '高低板', },
    { url: require('../../../../../assets/image/vts/carList/飞翼车@2x.png'), carName: '飞翼车', }
  ]
  export default {
    props: {
      isAgianOrder: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        loading: false,
        carList: CarList,
        carTypeIndex: 0,
        carLengthIndex: 0,
        carWhetherTailboardIndex: '',
        carTemperatureIndex: 0,
        carInfo: {
          whetherTailboard: '20',
          temperature: '1001'
        },
        carInfoList: [], // 车型数据数据
        showWhetherTailboard: false,
        showTemperature: false,
        whetherTailboardList: [
          { value: 10, lable: '需要' },
          { value: 20, lable: '不需要' }
        ],
        temperatureList: [
          { value: 1001, lable: '恒温(10℃～25℃)' },
          { value: 1002, lable: '冷藏(0℃～10℃)' },
          { value: 1003, lable: '冷冻(-18℃～-28℃)' },
        ],
        busTransportInfo: {},
      }
    },
    // created () {
    //   this.getCarInfo()
    // },

    async activated () {
      await this.getCarInfo()
      if (sessionStorage.getItem('AgainOrderDetailInfo')) {
        this.checkCar(this.carList[this.cpCarTypeIndex()], this.cpCarTypeIndex())
      }
      console.log(this.$parent, 'this.$parent');

      bus.$on('ReceiveTransportInfo', (val) => {
        // 时效里程信息
        console.log('车型时效信息bus', val);
        this.busTransportInfo = val
      })
    },
    beforeDestroy () {
      console.log('车型时效信息bus-清除');
      bus.$off('ReceiveTransportInfo')
    },
    watch: {
      cpDisbleWhetherTailboard (val) {
        console.log(val, '监听尾板服务');
        if (val) {
          this.carInfo.whetherTailboard = null
          this.carWhetherTailboardIndex = 1
        } else {
          this.carWhetherTailboardIndex = ''
        }
      }
    },
    computed: {
      carLengthList () {
        switch (this.carTypeIndex) {
          case 0:
            return this.carInfoList['1001']
            break;
          case 1:
            return this.carInfoList['1003']
            break;
          case 2:
            return this.carInfoList['1005']
            break;
          case 3:
            return this.carInfoList['1006']
            break;
          case 4:
            return this.carInfoList['1008']
            break;
          case 5:
            return this.carInfoList['1009']
            break;
          case 6:
            return this.carInfoList['1010']
            break;
          default:
            return this.carInfoList['1001']
            break;
        }
      },
      cpCarWeight () {
        let { carMaxWeight } = this.carInfo
        if (carMaxWeight) {
          return carMaxWeight / 1000
        } else {
          return '--'
        }
      },
      // 是否禁用尾板
      cpDisbleWhetherTailboard () {
        let { referenceDistance } = this.busTransportInfo
        let { carLength, carTypeCode } = this.carInfo
        if ((referenceDistance && +referenceDistance >= 550) || (carTypeCode === '1003' && carLength && +carLength >= 9.6)) {
          return true
        } else {
          return false
        }
      },
      // 尾板禁用文本
      cpDisbleWhetherTailboardText () {
        let { referenceDistance } = this.busTransportInfo
        let { carLength, carTypeCode } = this.carInfo
        if (referenceDistance && +referenceDistance >= 550) {
          return '托运地址距离大于550KM，不可使用尾板服务!'
        }
        if (carTypeCode === '1003' && carLength && +carLength >= 9.6) {
          return '9.6米以上厢式车，不可使用尾板服务!'
        }
      },

    },
    methods: {
      // 再来一单根据车型获取索引carTypeIndex
      cpCarTypeIndex () {
        if (JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))) {
          let { needCarType } = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
          switch (needCarType) {
            case '1001':
              return 0
              break;
            case '1003':
              return 1
              break;
            case '1005':
              return 2
              break;
            case '1006':
              return 3
              break;
            case '1008':
              return 4
              break;
            case '1009':
              return 5
              break;
            case '1010':
              return 6
              break;
            default:
              return 0
              break;
          }
        } else {
          return 0
        }
      },
      // 再来一单根据车长获取索引
      getCarLengthIndex () {
        if (sessionStorage.getItem('AgainOrderDetailInfo') && this.carLengthList) {
          let { whetherTailboard, needCarLength, temperature } = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
          // let needCarLength = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo')).needCarLength
          if (+whetherTailboard === 10) {
            this.carWhetherTailboardIndex = 0
          } else {
            this.carWhetherTailboardIndex = 1
          }
          let indexItem = 0
          indexItem = this.carLengthList.findIndex((item, index) => {
            if (+item.carLength === +needCarLength) {
              return true
            }
          })
          if (indexItem == -1) {
            indexItem = 0
          }
          return indexItem
        } else {
          return 0
        }
      },
      // 选择车型
      checkCar (val, index) {
        this.showWhetherTailboard = this.showTemperature = false
        if (val.carName === '厢式车') {
          this.showWhetherTailboard = true
          this.carTemperatureIndex = 0
          this.carInfo.temperature = null
          if (!this.cpDisbleWhetherTailboard) {
            this.selectCarNeed({ value: 10, lable: '需要' }, 0, 'whetherTailboard')
          }
        } else if (val.carName === '冷藏车') {
          this.showTemperature = true
          this.carWhetherTailboardIndex = 0
          this.carInfo.whetherTailboard = null
          this.selectCarNeed({ value: 1001, lable: '恒温(10℃～25℃)' }, 0, 'temperature')
        } else {
          this.carInfo.whetherTailboard = null
          this.carInfo.temperature = null
        }
        this.carTypeIndex = index
        console.log(this.getCarLengthIndex(), this.cpCarTypeIndex(), '车长数组');
        this.selectCarLength(this.carLengthList[this.getCarLengthIndex()], this.getCarLengthIndex())
      },
      // 选择车长
      selectCarLength (item, val, type = false) {
        this.carLengthIndex = val;
        this.carInfo = { ...this.carInfo, ...item }
        // if (type) return // 如果是清空 则不发送bus信息
        console.log(this.carInfo, '选择的车型信息');
        bus.$emit('ReceiveCarInfo', this.carInfo)
        this.loading = false
      },
      // 选择车型附加项
      selectCarNeed (item, index, val) {
        if (val === 'whetherTailboard') {
          this.carWhetherTailboardIndex = index
          this.carInfo.whetherTailboard = item.value
        } else {
          this.carTemperatureIndex = index
          this.carInfo.temperature = item.value
        }
        console.log(this.carInfo, 'this.carInfo--selectCarNeed');
      },
      // 获取车型数据信息
      async getCarInfo () {
        console.log('执行获取车型数据信息');
        this.loading = true
        try {
          let _res = await geiGolbalCarInfo({})
          if (_res.code == 0) {
            let _resArr = JSON.parse(JSON.stringify(_res.data))
            sessionStorage.setItem('CarInfo', JSON.stringify(_res.data))
            this.carInfoList = _resArr.reduce((group, curP) => {
              let newKey = curP['carTypeCode']
              if (!group[newKey]) {
                group[newKey] = []
              }
              group[newKey].push(curP)
              return group
            }, [])
            if (sessionStorage.getItem('AgainOrderDetailInfo')) {
              this.checkCar(this.carList[this.cpCarTypeIndex()], this.cpCarTypeIndex())
            } else {
              this.checkCar(this.carList[0], 0)
            }
          } else {
            this.$message.error('网络异常，请刷新重试')
          }
          this.loading = false
        } catch (error) {
          this.loading = false
        }
      },
      // 重置
      reset () {
        this.carTypeIndex = 0
        this.carLengthIndex = 0
        this.carWhetherTailboardIndex = ''
        this.carTemperatureIndex = 0
        this.showWhetherTailboard = false
        this.showTemperature = false
        this.selectCarLength(this.carLengthList[0], 0, true)
        this.busTransportInfo = {}
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common.scss';
  @import 'index.scss';
</style>
