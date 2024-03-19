<template>
  <div class="waybill-info">
    <div class="delivery-company">
      <svg-icon icon-class="icon-sender"
                class-name="icon-category" />
      <span class="company-name">{{detailInfo|FTstartAddress}}</span>
      <restrict-dialog></restrict-dialog>
    </div>
    <div class="delivery-info">
      <p class="padding-buttom-12">
        <span v-if="detailInfo.orderAddresserName">{{detailInfo.orderAddresserName||''}} | </span> <span v-if="detailInfo.orderAddresserPhone">{{detailInfo.orderAddresserPhone||''}} | </span> <span v-if="detailInfo.loadingTime">装货时间：{{detailInfo.loadingTime}}</span>
      </p>
    </div>
    <!-- 经停地 -->
    <div v-for="(o,i) in stopoverList"
         :key="i">
      <div class="delivery-company">
        <svg-icon icon-class="icon-stop"
                  class-name="icon-category" />
        <span class="company-name">{{`${o.province}${o.city}${o.area || o.town || ''}  ${o.address}`}}</span>
      </div>
      <div class="delivery-info">
        <p class="padding-buttom-12">
          <span v-if="o.contactName">{{o.contactName||''}} | </span> <span v-if="o.contactPhone">{{o.contactPhone||''}} </span>
        </p>
      </div>
    </div>

    <div class="delivery-company">
      <!-- <svg-icon icon-class="icon-receiver"
                class-name="icon-category" /> -->
      <!-- <img src="../../../../../assets/image/vts/icon收2x.png"
           alt=""> -->
      <i class='iconfont icon-receiver'></i>
      <span class="company-name">{{detailInfo|FTendAddress}}</span>
    </div>
    <div class="delivery-info">
      <p class="padding-buttom-12">
        <span v-if="detailInfo.orderContactName">{{detailInfo.orderContactName||''}} | </span> <span v-if="detailInfo.orderContactPhone">{{detailInfo.orderContactPhone||''}} | </span> <span v-if="detailInfo.requireArrivalTime">期望到货时间：{{detailInfo.requireArrivalTime}}</span>
      </p>
      <div class="detail">
        <div class="item"><span class="label">运输里程：</span>{{detailInfo.referenceDistance}}公里</div>
        <div class="item"><span class="label">车长车型：</span>{{detailInfo|FTcarType}}</div>
        <div class="item"><span class="label">货物名称：</span>{{detailInfo.goodsName}}</div>
        <div class="item"> <span class="label">包装类型：</span>{{detailInfo.packageType|FTpackageType}} </div>
        <div class="item"><span class="label">总&nbsp;&nbsp;重&nbsp;&nbsp;量：</span>{{detailInfo.goodsWeight|FTGoodsWeight}}</div>
        <div class="item"><span class="label">体&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;积：</span>{{detailInfo.goodsVolume|FTGoodsVolume}}</div>
        <div class="item"> <span class="label">装货服务：</span>{{detailInfo.loadService|FTyesNo}}</div>
        <div class="item"> <span class="label">卸货服务：</span>{{detailInfo.unloadService|FTyesNo}}</div>
        <div class="item"> <span class="label">回单服务：</span>{{cpreceiptType}} <span class="whetherReceiptPic"
                @click="lookPic"
                v-if="detailInfo.receiptPictures">回单照片</span></div>
        <div class="itemRemask">
          <div class="label">备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：</div>
          <div class="remask">{{cpepidemicType}}</div>
        </div>
      </div>
    </div>
    <KyImage :config="configImg"
             ref="dialogVisibleImg"></KyImage>
  </div>
</template>

<script>
  import RestrictDialog from './../../../components/restrict-dialog'
  import KyImage from '@/views/vts/components/kye-image'
  import { carType } from '@/views/vts/config/order.js'
  export default {
    components: { KyImage, RestrictDialog },
    name: 'waybill-info',
    props: {
      detailInfo: {
        type: Object,
        require: true,
      },
    },
    created () { },
    data () {
      return {
        configImg: {},
      }
    },
    filters: {
      FTstartAddress (val) {
        if (val) {
          return `${val.startProvince || ''}${val.startCity || ''}${val.startArea || ''} ${val.startAddress || ''}`
        }
      },
      FTendAddress (val) {
        if (val) {
          return `${val.endProvince || ''}${val.endCity || ''}${val.endArea || ''} ${val.endAddress || ''}`
        }
      },
      FTcarType (val) {
        if (val.needCarType && val.needCarLength) {
          let car = `${val.needCarLength}米${carType(val.needCarType)}`
          if (+val.needCarType == 1003) {
            return `${car} | ${+val.whetherTailboard === 10 ? '有尾板' : '无尾板'}`
          } else if (+val.needCarType == 1008 && val.keyTemperature) {
            let _keyTemperature = {
              1001: '恒温(10℃～25℃)',
              1002: '冷藏(0℃～10℃)',
              1003: '冷冻(-18℃～-28℃)'
            }
            return `${car} | (${_keyTemperature[+val.keyTemperature]}) `
          } else {
            return car
          }
        }
      },
      formatEmpty (val) {
        if (!val) {
          return '-'
        }
        return val
      },
      FTGoodsWeight (val) {
        if (val) {
          return (val / 1000) + '吨'
        } else {
          return '--'
        }
      },
      FTGoodsVolume (val) {
        if (val) {
          return val + '方'
        } else {
          return '--'
        }
      },
      FTyesNo (val) {
        if (val) {
          return +val === 10 ? '是' : '否'
        }
      },
      FTpackageType (val) {
        if (val) {
          let arr = [
            { value: '1', label: '袋装' },
            { value: '2', label: '吨包' },
            { value: '3', label: '罐装' },
            { value: '4', label: '架子' },
            { value: '5', label: '框装' },
            { value: '6', label: '困扎' },
            { value: '7', label: '笼装' },
            { value: '8', label: '裸装' },
            { value: '9', label: '木箱' },
            { value: '10', label: '泡沫箱' },
            { value: '11', label: '散装' },
            { value: '12', label: '水箱' },
            { value: '13', label: '桶装' },
            { value: '14', label: '托盘' },
            { value: '15', label: '网兜' },
            { value: '16', label: '线盘' },
            { value: '17', label: '压块' },
            { value: '18', label: '纸箱' },
            { value: '19', label: '周转箱' },
            { value: '20', label: '其他' },
          ]
          return arr[val - 1].label || '--'
        } else {
          return '--'
        }
      }
    },
    computed: {
      stopoverList () {
        return this.detailInfo.stopoverAddressRvoList ? this.detailInfo.stopoverAddressRvoList.filter(item => +item.locationTypeCode === 2) : []
      },
      // 抗疫要求列表
      cpepidemicType () {
        let LK_VTS_EPIDEMIC_TYPE = [
          { value: '10', label: '48小时核算证明' },
          { value: '20', label: '行程卡不带*' },
          { value: '30', label: '健康绿码' },
          { value: '40', label: '防疫通行证' },
          { value: '50', label: '疫苗接种记录' }
        ]
        if (!this.detailInfo.epidemicType) {
          return this.detailInfo.customerRemark || ''
        } else {
          // 防疫枚举
          let _epidemicType = LK_VTS_EPIDEMIC_TYPE
          let epiList = this.detailInfo.epidemicType.split(',')
          let tmp = this.detailInfo.customerRemark || ''
          epiList.forEach(item => {
            let type = item.split(':')[0]
            let value = item.split(':')[1]
            let obj = _epidemicType.find(item2 => item2.value === type)
            if (obj) {
              obj.active = value === '10' && this.detailInfo.orderStatus !== '700'
              console.log(obj, 'obj');
              tmp += ` [${obj.label}]`
              // tmp.push(obj)
            }
          })
          return tmp
        }
      },
      // 回单服务
      cpreceiptType () {
        let { receiptType, whetherReceipt } = this.detailInfo
        if (+receiptType === 10) {
          return '回单原件'
        }
        if (+receiptType === 20) {
          return '回单照片'
        }
        return '无'
      }
    },
    methods: {
      // 查看回单照片
      lookPic (val) {
        this.$refs.dialogVisibleImg.showDialogVisibleImg()
        let { receiptPictures } = this.detailInfo
        let imgArr = []
        receiptPictures.forEach(item => {
          imgArr.push(item.imageUrl)
        })
        this.configImg = {
          imgSrc: imgArr
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .waybill-info {
    font-family: PingFangSC, PingFangSC-Regular;
    font-size: 14px;
    color: #333333;

    .padding-buttom-12 {
      padding-bottom: 12px;
      font-size: 13px;
      color: #666;
      padding-left: 2px;
      box-sizing: border-box;
    }

    .padding-left-12 {
      padding-bottom: 12px;
    }
    .margin-button-20 {
      margin-left: 20px;
    }
    .company-name {
      font-size: 15px;
      text-align: center;
      color: #333333;
      padding: 0 24px 0 12px;
    }
    .delivery-info {
      font-size: 14px;
    }

    .delivery-company {
      display: flex;
      align-items: center;
      padding-bottom: 12px;
      margin-top: 12px;
    }
    .detail {
      display: flex;
      flex-wrap: wrap;
      margin-top: 10px;
      align-content: space-between;
      border-top: 1px solid #f1f1f5;
      .item {
        flex: 0 0 33.3%;
        padding: 12px 0 0 0;
        flex-wrap: wrap;
        line-height: 18px;
        color: #333;
        font-size: 13px;
        .label {
          @extend .class__label-style;
        }
      }
      .item1 {
        flex: 0 0 33.3%;
      }
      .itemRemask {
        padding: 12px 0 0 0;
        line-height: 18px;
        width: 100% !important;
        display: flex;
        color: #333;

        .label {
          @extend .class__label-style;
        }
        .remask {
          width: 80%;
          word-break: break-all;
        }
      }
      .whetherReceiptPic {
        color: #8365f6;
        cursor: pointer;
      }
    }
    .icon-category {
      font-size: 22px;
    }
    .icon-receiver {
      color: #ff8000;
      font-size: 20px;
    }
  }

  // extend style
  .class__label-style {
    display: inline-block;
    width: 70px;
    color: #666;
    text-align: right;
    margin-right: 8px;
    font-size: 13px;
  }
</style>
