<template>
  <section class="vts-shipment-order"
           v-loading.lock='loading'>
    <div class="main"
         ref="main">
      <div class='realName'>
        <notice-item v-show='!isRealName && !isHideRealNameNotice'
                     @on-close='isHideRealNameNotice = true'>
          <span>按照《邮件快件实名收寄管理办法》要求，寄件必须实名。<span style='color:#8365F6;cursor: pointer;'
                  @click='goRealName'>去实名认证 ></span></span>
        </notice-item>
      </div>
      <!-- 车型选择 -->
      <FormCarType ref="FormCarType"
                   :isAgianOrder="isAgianOrder"></FormCarType>
      <!-- 用户信息及地址 -->
      <FormUserInfo ref="FormUserInfo"
                    :isAgianOrder="isAgianOrder"></FormUserInfo>
      <!-- 货物信息 -->
      <FormGoodsInfo ref="FormGoodsInfo"
                     :isAgianOrder="isAgianOrder"></FormGoodsInfo>
      <!-- 增值服务 -->
      <FormFeeInfo ref="FormFeeInfo"
                   :isAgianOrder="isAgianOrder"></FormFeeInfo>
      <!-- 司机备注 -->
      <FormDriveRemark ref="FormDriveRemark"
                       :isAgianOrder="isAgianOrder"></FormDriveRemark>
    </div>

    <!-- 按钮 -->
    <div class="btn-box">
      <el-button @click="reset">一键清空</el-button>
      <el-button type="primary"
                 @click="submit"
                 :disabled="disabled">立即询价</el-button>
    </div>
  </section>
</template>

<script>
  // 表单块
  import { FormCarType, FormUserInfo, FormGoodsInfo, FormFeeInfo, FormDriveRemark } from "./base-components"
  import { addCreateOrder, addAddressList, fetchCheckRemark } from '@/services/api/vts'
  import NoticeItem from '@/components/NoticeItem'
  import dayjs from 'dayjs'
  export default {
    name: 'vtsOrder',
    components: { FormCarType, FormUserInfo, FormGoodsInfo, FormFeeInfo, FormDriveRemark, NoticeItem },
    data () {
      return {
        loading: false,
        isAgianOrder: false,
        isHideRealNameNotice: false,
        setTime: null,
        disabled: false
      }
    },
    // 再来一单
    beforeRouteEnter (to, from, next) {
      console.log(to, from, '判断再来一单');
      next(vm => {
        vm.isAgianOrder = false
        if (to.query && to.query.demandOrderCode) {
          // vm.getOrderDetail(to.query.demandOrderCode)
          console.log('确定是再来一单');

          setTimeout(() => {
            vm.isAgianOrder = true
          }, 1000)
        } else {
          vm.isAgianOrder = false
          sessionStorage.removeItem('AgainOrderDetailInfo')
        }
      })
    },
    // activated () {
    //   this.isAgianOrder = false
    // },
    computed: {
      isRealName () {
        return this.$store.state.realNameInfo ? this.$store.state.realNameInfo.isRealName : false
      }
    },
    methods: {
      // 发布询价
      async submit () {
        if (this.setTime) {
          clearTimeout(this.setTime)
        }
        this.setTime = setTimeout(() => {
          this.saveOrder()
        }, 500)
      },
      // 下单保存
      async saveOrder () {

        // 公司信息
        let companyInfo = JSON.parse(window.sessionStorage.getItem('USER_DATA'))
        let _carInfo = {}
        if (this.$refs.FormCarType) {
          let carForm = { ...this.$refs.FormCarType }
          _carInfo = { ...carForm.carInfo, carTemperatureIndex: carForm.carTemperatureIndex, carWhetherTailboardIndex: carForm.carWhetherTailboardIndex, }
        }
        const [_userInfo, _goodsInfo, _feeInfo, _driverRemark] = await Promise.all([
          this.$refs.FormUserInfo.validForm(),
          this.$refs.FormGoodsInfo.validForm(),
          this.$refs.FormFeeInfo.validForm(),
          this.$refs.FormDriveRemark.validForm()
        ])
        console.log('-->确认下单', 'companyInfo--', companyInfo, '_carInfo--', _carInfo, '_userInfo--', _userInfo, '_goodsInfo--', _goodsInfo, '_feeInfo--', _feeInfo, '_driverRemark--', _driverRemark);
        console.log('-->高速欲到时间', this.$refs.FormUserInfo.transportInfo);
        if (companyInfo && _carInfo && _userInfo && _goodsInfo && _feeInfo && _driverRemark) {
          this.disabled = true
        }

        // 当前时间大于货好时间
        if (dayjs().valueOf() > dayjs(_userInfo.loadingTime).valueOf()) {
          this.$message.error('当前时间大于装货时间(货好时间),请修改货好时间')
          this.disabled = false
          return
        }
        // 判断货到时间不能小于预计走高速时间
        let { expectHighArriveTime } = this.$refs.FormUserInfo.transportInfo
        if (expectHighArriveTime) {
          if (dayjs(_userInfo.requireArrivalTime).valueOf() < dayjs(expectHighArriveTime).valueOf()) {
            this.$message.error('要求到货时间不能小于预计高速到货时间，请修改到货时间')
            this.disabled = false
            return
          }
        }

        //  判断userInfo地址校验必填
        if (_userInfo.startAddress.detailAddress == '' || _userInfo.startAddress.districtList.length < 1) {
          // 寄件地址必填
          await this.$refs.FormUserInfo.$refs.startDetailedAddress.validateForm()
          this.disabled = false
          return
        }
        if (_userInfo.endAddress.detailAddress == '' || _userInfo.endAddress.districtList.length < 1) {
          // 收件地址必填
          await this.$refs.FormUserInfo.$refs.endDetailedAddress.validateForm()
          this.disabled = false
          return
        }
        // 是否有限制取派
        let { disableOrder } = this.$refs.FormUserInfo
        if (disableOrder) {
          this.$refs.FormUserInfo.restrictOptions.show = true
          this.disabled = false
          return
        }
        // 是再来一单的情况 特殊处理地址
        if (this.isAgianOrder) {
          _userInfo.startDetailedAddress = _userInfo.startAddress.detailAddress
          _userInfo.endDetailedAddress = _userInfo.endAddress.detailAddress
        }
        if (this.$refs.FormUserInfo.isHit) {
          this.$message.error(`当前询价线路为禁区线路，开放时间为：${this.$refs.FormUserInfo.HitTime} `)
          this.disabled = false
          return
        }
        if (this.$refs.FormUserInfo.Hitrequset) {
          this.$message.error('地址禁发校验错误，请重新选择地址校验')
          this.disabled = false
          return
        }
        if (this.$refs.FormUserInfo.btnFlag) {
          this.disabled = false
          return this.$message.error('寄件与收件运输时效解析失败，请重新输入地址解析')
        }
        console.log(this.$refs.FormUserInfo.btnFlag, '------btnFlag--------');

        let _parmas = {
          makePriceMode: '1', // 定价模式
          channelType: '8', // 下单渠道
          lineType: '20', //线路类型
          carConfigId: '', // 非必填
          needCarType: _carInfo.carTypeCode,
          needCarLength: _carInfo.carLength,
          goodsWeight: _goodsInfo.goodsWeight,
          goodsVolume: _goodsInfo.goodsVolume,
          goodsName: _goodsInfo.goodsName,
          goodsId: _goodsInfo.goodsId,
          goodsValueFee: _feeInfo.goodsValueFee,
          keyTemperature: _carInfo.temperature && _carInfo.carTypeCode == '1008' ? _carInfo.temperature : '',//冷链车温度
          whetherTailboard: _carInfo.whetherTailboard && _carInfo.carTypeCode == '1003' ? _carInfo.whetherTailboard : '20',//尾板
          unloadService: _feeInfo.unloadService,//卸货服务
          loadService: _feeInfo.loadService, //装货服务
          receiptType: _feeInfo.receiptType,
          whetherReceipt: +_feeInfo.receiptType === 10 || +_feeInfo.receiptType === 20 ? '10' : '20', //回单服务
          loadingTime: _userInfo.loadingTime,//装货时间
          requireArrivalTime: _userInfo.requireArrivalTime,//要求到货时间
          startProvince: _userInfo.startProvince,//始发地省
          startCity: _userInfo.startCity,//始发地市
          startArea: _userInfo.startCounty, //始发地区
          startAddress: _userInfo.startDetailedAddress,//始发地详情地址
          endProvince: _userInfo.endProvince,
          endCity: _userInfo.endCity,
          endArea: _userInfo.endCounty,
          endAddress: _userInfo.endDetailedAddress,
          companyNo: companyInfo.customerInfo.customerCode, // 公司编号
          companyName: companyInfo.customerInfo.customerName, // 公司名称
          customerRemark: _driverRemark.remark, // 备注
          insuredCoefficient: _feeInfo.insuredCoefficient,
          orderAddresserName: _userInfo.orderAddresserName,
          orderAddresserPhone: _userInfo.orderAddresserPhone,
          orderContactName: _userInfo.orderContactName,
          orderContactPhone: _userInfo.orderContactPhone,
          packageType: _goodsInfo.packageType,
          epidemicType: this.$refs.FormDriveRemark.tackepidemicType()
        }
        this.loading = true
        if (_userInfo.startChecked && _userInfo.endChecked) {
          let [_startChecked, _endChecked, _created] = await Promise.all([this.saveAddress('10', { ..._userInfo, ...companyInfo }), this.saveAddress('20', { ..._userInfo, ...companyInfo }), addCreateOrder(_parmas)])
          console.log(_startChecked, _endChecked, _created, '都保存');
          if (_startChecked.code !== 0) {
            this.loading = false
            this.$message.error('寄件地址保存失败')
            this.disabled = false
            return
          }
          if (_endChecked.code !== 0) {
            this.loading = false
            this.$message.error('收件地址保存失败')
            this.disabled = false
            return
          }
          if (_created.code !== 0) {
            this.loading = false
            this.$message.error(_created.msg)
            this.disabled = false
            return
          }
          if (_created.code == 0 && _startChecked.code == 0 && _endChecked.code == 0) {
            this.loading = false
            // 下单成功 清空下单数据
            this.disabled = false
            this.reset()
            this.$router.push(`vtsWaybill-detail/${_created.data.demandOrderCode}`)
          }
          return
        } else if (_userInfo.startChecked) {
          this.saveAddress('10', { ..._userInfo, ...companyInfo })
        } else if (_userInfo.endChecked) {
          this.saveAddress('20', { ..._userInfo, ...companyInfo })
        }
        if (_driverRemark.remark) {
          let checkFlagDriverRemark = await this.fetchValidatorStringContain(_driverRemark.remark)
          if (checkFlagDriverRemark.containContactWay) {
            this.$message.error('为保护您的隐私，请勿填写联系方式')
            this.loading = false
            this.disabled = false
            return
          } else if (checkFlagDriverRemark.containIllegalCharacter) {
            this.$message.error(`为保护您的隐私，请勿填写关键词：${checkFlagDriverRemark.illegalCharacter}`)
            this.loading = false
            this.disabled = false
            return
          }
        }
        try {

          let _res = await addCreateOrder(_parmas)
          if (_res.code === 0) {
            sessionStorage.removeItem('AgainOrderDetailInfo')
            // 下单成功 清空下单数据
            this.disabled = false
            this.reset()
            this.loading = false
            this.$router.push(`vtsWaybill-detail/${_res.data.demandOrderCode}`)
          } else {
            this.disabled = false
            this.loading = false
            this.$message.error(_res.msg)
          }
        } catch (error) {
          console.log(error);
          this.disabled = false
          this.loading = false
        }
      },
      // 地址保存地址簿
      async saveAddress (type, info) {
        console.log(info, '保存地址簿')
        let parmas = {
          addressType: type,
          addressList: [
            {
              // address: type === '10' ? info.startDetailedAddress : info.endDetailedAddress,
              address: type === '10' ? info.startAddress.detailAddress : info.endAddress.detailAddress,
              area: type === '10' ? info.startCounty : info.endCounty,
              city: type === '10' ? info.startCity : info.endCity,
              company: '',
              contact: type === '10' ? info.orderAddresserName : info.orderContactName,
              contactPhone: type === '10' ? info.orderAddresserPhone : info.orderContactPhone,
              customerCode: info.customerInfo.customerCode,
              isCollect: false,
              phone: info.phone,
              province: type === '10' ? info.startProvince : info.endProvince,
              remark: '',
              source: 'PC客户端',
              telephone: ''
            }
          ]
        }
        let _res = await addAddressList(parmas)
        return _res
      },
      // 清空
      reset () {
        this.$refs.FormUserInfo.reset()
        this.$refs.FormCarType.reset()

        this.$refs.FormGoodsInfo.reset()
        this.$refs.FormFeeInfo.reset()
        this.$refs.FormDriveRemark.reset()
      },
      goRealName () {
        this.$router.push({ name: 'realVerify' })
      },
      // 校验司机备注
      async fetchValidatorStringContain (val) {
        const { data } = await fetchCheckRemark({ param1: val })
        console.log(data, '校验');
        return data
      }
    },
    beforeDestroy () {
      clearTimeout(this.setTime)
    }
  }
</script>

<style lang="scss" scoped>
  @import 'index.scss';
  /deep/ {
    @include loading;
  }
  .realName {
    position: absolute;
    top: 3px;
    left: 256px;
    right: 304px;
    min-width: 680px;
    max-width: 1000px;
    margin: auto;
    z-index: 99;
    .notice-container{
      background: #fef6e2;
      border: 1px solid #ffe1b7;
      border-radius: 4px;
      padding: 6px 8px;
      min-width: 680px;
    }
  }
  @media (max-width: 1440px) {
    .realName{
      max-width: 500px;
      right: 200px;
      left: 100px;
      min-width: 480px;
      .notice-container{
        max-width: 480px;
        min-width: 480px;
      }
    }
  }
</style>
