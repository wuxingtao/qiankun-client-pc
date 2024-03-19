<template>
  <section class="userInfo-box page-style1 "
           v-loading.lock='loading'>
    <el-form class="formInfo"
             :model="userFormInfo"
             label-position="top"
             label-width="88px"
             ref="userFormInfo">
      <!-- 寄方信息 -->
      <div class="send-info">
        <div class="title">
          <img src="../../../../../assets/image/vts/sendUser2.png"
               class="title-icon title-icon2" />寄方信息
          <div class="address-book">
            <div class="item"
                 @click="showAddressBook('send')"><img src="../../../../../assets/image/vts/address.png"
                   class="item-icon" />从地址簿选择</div>
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="寄件人"
                          prop="orderAddresserName"
                          :rules="orderAddresserName">
              <el-autocomplete popper-class="company-autocomplete"
                               size="medium"
                               :maxlength="30"
                               clearable
                               v-model.trim="userFormInfo.orderAddresserName"
                               :fetch-suggestions="querySearchClientName"
                               placeholder="请输入寄件人"
                               @select="setSenderInfo">
                <template slot-scope="{ item }">
                  <div class="name-phone-wrap">
                    <span v-html="item.contactRaw"></span>
                    <span v-html="item.companyRaw"></span>
                  </div>
                  <div class="address">{{item.address}}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话"
                          prop="orderAddresserPhone"
                          :rules="orderAddresserPhone">
              <el-input v-model="userFormInfo.orderAddresserPhone"
                        size="medium"
                        clearable
                        :maxlength="11"
                        placeholder="请填写11位手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="装货时间"
                          prop="loadingTime"
                          :rules="loadingTime">
              <el-date-picker v-model="userFormInfo.forGoodsPicker.curTime"
                              ref="forGoodsPicker"
                              type="datetime"
                              :clearable="false"
                              :disabledDate="true"
                              format="yyyy-MM-dd HH:mm"
                              :minDate="userFormInfo.forGoodsPicker.min"
                              :maxDate="userFormInfo.forGoodsPicker.max"
                              :default-value="userFormInfo.forGoodsPicker.curTime"
                              @focus="_=>handleFocusPicker('goods')"
                              @change="handleCheckLoadingTime"
                              :picker-options="cpPickerOptionsGoods"
                              :editable="false"
                              prefix-icon=""
                              placeholder="请选择装货时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="发货地址"
                          prop="startDetailedAddress"
                          :rules="startDetailedAddress">
              <ky-address ref="startDetailedAddress"
                          class="userInfo__address__input"
                          addressType="10"
                          :uicascader="11"
                          :uiautocomplete="13"
                          :data="userFormInfo.startAddress"
                          @change="handleSenderAddressChange" />
            </el-form-item>
          </el-col>
          <el-col :span="6"
                  class="checked">
            <el-checkbox v-model="userFormInfo.startChecked">保存到地址簿</el-checkbox>
          </el-col>
        </el-row>
      </div>
      <!-- 收放信息 -->
      <div class="received-info">
        <div class="title">
          <img src="../../../../../assets/image/vts/received2.png"
               class="title-icon" />收方信息
          <div class="address-book">
            <div class="item"
                 @click="showAddressBook('receive')"><img src="../../../../../assets/image/vts/address.png"
                   class="item-icon" />从地址簿选择</div>
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="收件人"
                          prop="orderContactName"
                          :rules="orderContactName">
              <el-autocomplete popper-class="company-autocomplete"
                               size="medium"
                               :maxlength="30"
                               clearable
                               v-model.trim="userFormInfo.orderContactName"
                               :fetch-suggestions="queryReceiverContactList"
                               placeholder="请输入收件人"
                               @select="setReceiverInfo">
                <template slot-scope="{ item }">
                  <div class="name-phone-wrap">
                    <span v-html="item.contactRaw"></span>
                    <span v-html="item.companyRaw"></span>
                  </div>
                  <div class="address">{{item.address}}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话"
                          prop="orderContactPhone"
                          :rules="orderContactPhone">
              <el-input v-model="userFormInfo.orderContactPhone"
                        size="medium"
                        clearable
                        :maxlength="11"
                        placeholder="请填写11位手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="期望到货时间"
                          prop="requireArrivalTime"
                          :rules="requireArrivalTime">
              <el-date-picker v-model="userFormInfo.forReceiverPicker.curTime"
                              type="datetime"
                              :clearable="false"
                              :disabled="cpForReceiverPicker"
                              format="yyyy-MM-dd HH:mm"
                              :minDate="userFormInfo.forReceiverPicker.min"
                              :default-value="userFormInfo.forReceiverPicker.min"
                              @focus="_=>handleFocusPicker('receiver')"
                              @change="handleCheckRequireTime"
                              placeholder="请选择期望到货时间"
                              :picker-options="cpPickerOptionsReceiver"
                              :editable="false"
                              prefix-icon="">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="收货地址"
                          prop="endDetailedAddress"
                          :rules="endDetailedAddress">
              <ky-address ref="endDetailedAddress"
                          class="userInfo__address__input"
                          addressType="20"
                          :data="userFormInfo.endAddress"
                          :uicascader="11"
                          :uiautocomplete="13"
                          @change="handleReceiverAddressChange" />
            </el-form-item>
          </el-col>
          <el-col :span="6"
                  class="checked">
            <el-checkbox v-model="userFormInfo.endChecked">保存到地址簿</el-checkbox>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <!-- 地址弹框 -->
    <dialog-address :visible.sync="visibleOfaddressBook"
                    :addressType="addressType"
                    :isVts="true"
                    @on-confirm="comfirmAddressInfo($event)" />
    <!-- 取派限制 -->
    <RestrictDialog :dialog="restrictOptions"></RestrictDialog>
  </section>
</template>

<script>
  // import DialogAddress from '@/views/vts/components/address-book/components/dialog-address'
  import DialogAddress from '@/views/address-book/components/dialog-address'
  import RestrictDialog from '@/views/vts/components/restrict-dialog'
  // import vtsDatePicker from '@/views/vts/components/vts-date-picker/picker/date-picker'
  import AddressItem from '@/views/vts/components/address-item'
  import Rules from './rules'
  import mixin from './mixin'
  import dayjs from 'dayjs'
  import bus from "../../bus.js";
  import { untilPickerTime, untilPicker5Time, untilIntervalHour } from '@/views/vts/utils'
  import { calcArriveTimeApi, fetchMapResolve, fetchNoExpress } from '@/services/api/vts/index'
  import store from "../../../store.js"
  const timePickerParams = {
    min: null,
    max: null,
    curTime: null
  }
  export default {
    mixins: [Rules, mixin],
    // components: { DialogAddress, vtsDatePicker, AddressItem },
    components: { DialogAddress, AddressItem, RestrictDialog },
    data () {
      return {
        loading: false,
        visibleOfaddressBook: false, // 地址弹框
        disableOrder: false, // 禁止询价下单
        restrictOptions: {
          show: false
        },
        addressType: "10", // 地址弹框类型
        userFormInfo: {
          startChecked: false,
          endChecked: false,
          loadingTime: dayjs(new Date).format('YYYY-MM-DD'), // 装货时间
          requireArrivalTime: '', // 期望到货时间
          orderAddresserName: '', // 寄件人
          orderAddresserPhone: '', // 寄件人联系方式
          endDetailedAddress: '', // 收货地址
          startDetailedAddress: '', // 寄件地址
          orderContactName: '',// 收件人
          orderContactPhone: '', //收件人联系方式
          startAddress: {
            districtList: [], districtIdList: [], detailAddress: ''
          },
          endAddress: {
            districtList: [], districtIdList: [], detailAddress: ''
          },
          // 货好时间
          forGoodsPicker: {
            min: null,
            max: null,
            curTime: null
          },
          // 要求到货时间
          forReceiverPicker: {
            min: null,
            max: null,
            curTime: null
          },
        },
        // 运输信息
        transportInfo: {
          highWayPrescription: '', // 高速时效
          expectReceiverTime: '', // 预到收方时间
          predictPrescription: '', // 预估失效
          referenceDistance: '', //  客客距离
        },
        senderList: [], // 寄件人地址簿数据
        receriverList: [], // 收件人地址簿数据
        carInfo: {},
        isHit: false, // 地址是否禁发
        HitTime: '', //禁发时间
        Hitrequset: false,
        btnFlag: false
      }
    },
    created () {
      bus.$on("ReceiveCarInfo", (val) => {
        console.log('-->用户信息bus', val);
        this.carInfo = val
        this.validFetchAddress()
      });
    },
    activated () {
      this.restrictOptions = {
        show: false
      }
      if (sessionStorage.getItem('AgainOrderDetailInfo')) {
        let { orderAddresserName, orderAddresserPhone, orderContactName, orderContactPhone, loadingTime, requireArrivalTime, startAddress, endAddress, startProvince, startCity, startArea, endProvince, endCity, endArea } = JSON.parse(sessionStorage.getItem('AgainOrderDetailInfo'))
        console.log(orderAddresserName, orderAddresserPhone, orderContactName, orderContactPhone, loadingTime, requireArrivalTime, dayjs(loadingTime).valueOf(), dayjs(new Date()).valueOf(), '===');
        let districtList1 = [this.$trim(startProvince, '市'), startCity, startArea].filter(f => f)
        let districtList2 = [this.$trim(endProvince, '市'), endCity, endArea].filter(f => f)

        this.userFormInfo.orderAddresserName = orderAddresserName
        this.userFormInfo.orderAddresserPhone = orderAddresserPhone
        this.userFormInfo.orderContactName = orderContactName
        this.userFormInfo.orderContactPhone = orderContactPhone
        this.userFormInfo.forGoodsPicker.curTime = dayjs(loadingTime).valueOf() < new Date() ? '' : loadingTime
        this.userFormInfo.forReceiverPicker.curTime = requireArrivalTime
        this.userFormInfo.loadingTime = dayjs(loadingTime).valueOf() < new Date() ? '' : loadingTime
        this.userFormInfo.requireArrivalTime = requireArrivalTime
        // this.userFormInfo.endDetailedAddress = endAddress
        // this.userFormInfo.startDetailedAddress = startAddress
        let _startAddress = startProvince + startCity + startArea + startAddress
        let _endAddress = endProvince + endCity + endArea + endAddress
        this.userFormInfo.endDetailedAddress = _endAddress
        this.userFormInfo.startDetailedAddress = _startAddress

        this.userFormInfo.startAddress.districtList = districtList1
        this.userFormInfo.startAddress.detailAddress = startAddress
        this.userFormInfo.endAddress.districtList = districtList2
        this.userFormInfo.endAddress.detailAddress = endAddress
        // this.$refs.startDetailedAddress.fillTheAddress(_startAddress, null, startProvince && startCity && startArea ? [startProvince, startCity, startArea] : [])
        // this.$refs.endDetailedAddress.fillTheAddress(_endAddress, null, endProvince && endCity && endArea ? [endProvince, endCity, endArea] : [])
        this.validFetchAddress()
      } else {
        this.getUserBookList()
      }
    },
    mounted () {

    },
    beforeDestroy () {
      console.log('清除bus-用户');
      bus.$off('ReceiveCarInfo')
    },
    computed: {
      // 货好时间
      cpPickerOptionsGoods () {
        const { min, max } = this.userFormInfo.forGoodsPicker
        return {
          disabledDate: val => min - (1000 * 60 * 60 * 24) > val || max < val
        }
      },
      // 要求到货时间
      cpPickerOptionsReceiver () {
        const { min } = this.userFormInfo.forReceiverPicker
        return {
          disabledDate: val => min - (1000 * 60 * 60 * 24) >= val
        }
      },
      // 货好时间禁用
      cpForGoodsrPicker () {
        return false
      },
      // 要求到货时间禁用
      cpForReceiverPicker () {
        const { loadingTime } = this.userFormInfo
        const { highWayPrescription } = this.transportInfo
        if (!loadingTime) {
          this.$set(this.userFormInfo.forReceiverPicker, 'curTime', '')
          this.$set(this.userFormInfo, 'requireArrivalTime', '')
        }
        return !highWayPrescription
      }
    },
    methods: {
      // 获取寄件人/收件人地址簿信息数据
      async getUserBookList () {
        const [_senderList, _receriverList] = await Promise.all([this.queryContactList('10', '', 10000), this.queryContactList('20', '', 10000)])
        console.log('-->寄件/收件人地址簿信息', _senderList, _receriverList);
        this.senderList = _senderList
        this.receriverList = _receriverList
        if (this.senderList && this.senderList.length > 0 && this.senderList[0].isDefault) {
          this.setSenderInfo(this.senderList[0])
        }
      },

      //   地址弹框选择地址信息
      async comfirmAddressInfo (item) {
        console.log(item, '弹框');
        let districtList = [this.$trim(item.province, '市'), item.city, item.area].filter(f => f)
        console.log(districtList, 'districtList');

        if (this.addressType === '10') {
          this.userFormInfo.orderAddresserName = item.contact
          this.userFormInfo.orderAddresserPhone = item.contactPhone
          this.userFormInfo.startDetailedAddress = item.fullAddress

          this.userFormInfo.startAddress.districtList = districtList
          this.userFormInfo.startAddress.detailAddress = item.detailAddress
        } else {
          this.userFormInfo.orderContactName = item.contact
          this.userFormInfo.orderContactPhone = item.contactPhone
          this.userFormInfo.endDetailedAddress = item.fullAddress

          this.userFormInfo.endAddress.districtList = districtList
          this.userFormInfo.endAddress.detailAddress = item.detailAddress
        }
        this.validFetchAddress()
        this.validRestrict()
      },

      //   寄件人查询
      async querySearchClientName (queryString, cb) {
        let results = []
        if (this.senderList && this.senderList.length > 0) {
          let list = this.senderList
          if (queryString) {
            list = list.filter(f => (f.address || '').includes(queryString) || (f.company || '').includes(queryString)
              || (f.contactPhone || '').includes(queryString) || (f.contact || '').includes(queryString))
          }
          results = list.slice(0, 50)
        } else {
          results = await this.queryContactList('10', queryString)
        }
        console.log(results, 'results');

        results && results.forEach(item => {
          const regExp = new RegExp(`(${queryString})`, 'ig')
          const replacement = '<span style=\'color:#8365f6\'>$1</span>'
          item.contactRaw = item.contact && item.contact.replace(regExp, replacement)
          item.companyRaw = item.contactPhone && item.contactPhone.replace(regExp, replacement)
        })
        cb(results)
      },

      // 收件人查询
      async queryReceiverContactList (queryString, cb) {
        let results = []
        if (this.receriverList && this.receriverList.length > 0) {
          let list = this.receriverList
          if (queryString) {
            list = list.filter(f => (f.address || '').includes(queryString) || (f.company || '').includes(queryString)
              || (f.contactPhone || '').includes(queryString) || (f.contact || '').includes(queryString))
          }
          results = list.slice(0, 50)
        } else {
          results = await this.queryContactList('20', queryString, 50)
        }
        results && results.forEach(item => {
          const regExp = new RegExp(`(${queryString})`, 'ig')
          const replacement = '<span style=\'color:#8365f6\'>$1</span>'
          item.contactRaw = item.contact && item.contact.replace(regExp, replacement)
          item.companyRaw = item.contactPhone && item.contactPhone.replace(regExp, replacement)
        })
        cb(results)
      },

      // 选择寄件人
      async setSenderInfo (item) {
        console.log(item);
        let districtList = [this.$trim(item.province, '市'), item.city, item.area].filter(f => f)
        this.userFormInfo.orderAddresserName = item.contact
        this.userFormInfo.orderAddresserPhone = item.contactPhone
        this.userFormInfo.startDetailedAddress = item.address


        this.userFormInfo.startAddress.districtList = districtList
        this.userFormInfo.startAddress.detailAddress = item.detailAddress
        this.validFetchAddress()
      },

      // 选择收件人
      async setReceiverInfo (item) {
        console.log(item);
        let districtList = [this.$trim(item.province, '市'), item.city, item.area].filter(f => f)
        this.userFormInfo.orderContactName = item.contact
        this.userFormInfo.orderContactPhone = item.contactPhone
        this.userFormInfo.endDetailedAddress = item.address

        this.userFormInfo.endAddress.districtList = districtList
        this.userFormInfo.endAddress.detailAddress = item.detailAddress
        this.validFetchAddress()
      },

      // 寄件地址change
      async handleSenderAddressChange (item) {
        let { startAddress } = this.userFormInfo
        if (startAddress.districtList.length && startAddress.detailAddress) {
          this.userFormInfo.startDetailedAddress = item.fullAddress
          let res = await this.validFetchAddress()
          if (!res) this.validRestrict()
        }
      },

      // 收货地址change
      async handleReceiverAddressChange (item) {
        let { endAddress } = this.userFormInfo
        if (endAddress.districtList.length && endAddress.detailAddress) {
          this.userFormInfo.endDetailedAddress = item.fullAddress
          let res = await this.validFetchAddress()
          if (!res) this.validRestrict()
        }
      },

      // -----时间相关----
      // 货好时间/到货时间  时间选择器
      handleFocusPicker (type) {
        let { requireArrivalTime, loadingTime } = this.userFormInfo
        let _curTime = untilPickerTime(0)
        let _forPickers = {
          min: null,
          max: null,
          curTime: null,
        }
        switch (type) {
          // 货好时间
          case 'goods':
            let _curGoodsPicker = (loadingTime >= _curTime) ? dayjs(loadingTime).format('YYYY-MM-DD HH:mm:ss') : ''
            _forPickers = {
              min: _curTime,
              max: dayjs(_curTime).add('3', 'days').subtract('1', 'hours').valueOf(),
              curTime: _curGoodsPicker,
            }
            this.userFormInfo.forGoodsPicker = _forPickers
            this.$set(this.userFormInfo, 'loadingTime', (_curGoodsPicker && dayjs(_curGoodsPicker).valueOf()) || '')
            break
          // 到货时间
          case 'receiver':
            // 高速时间
            let { expectHighArriveTime } = { ...this.transportInfo }
            let _expectHighArriveTime = dayjs(expectHighArriveTime).valueOf()
            let _requireArrivalTime = dayjs(requireArrivalTime).valueOf()
            // 最小值
            let _minForPickers = expectHighArriveTime ? untilPicker5Time(_expectHighArriveTime) : _curTime
            // 当前设定时间 >= 高速预计到+5分钟 = 时间组件最小值
            let _curReceiverPicker = (requireArrivalTime && _requireArrivalTime >= _minForPickers) ? dayjs(requireArrivalTime).format('YYYY-MM-DD HH:mm:ss') : ''
            _forPickers = {
              min: _minForPickers,
              max: null,
              curTime: _curReceiverPicker,
            }
            this.userFormInfo.forReceiverPicker = _forPickers
            this.$set(this.userFormInfo, 'requireArrivalTime', _curReceiverPicker ? dayjs(_curReceiverPicker).valueOf() : '')
            break
          default:
            break
        }
      },

      // 校验货好时间
      handleCheckLoadingTime (val) {
        const { min, max } = this.userFormInfo.forGoodsPicker
        if (dayjs(val).valueOf() < min) {
          let _curTime = untilPickerTime(0)
          this.userFormInfo.forGoodsPicker.curTime = _curTime
          this.$set(this.userFormInfo, 'loadingTime', (min && dayjs(min).valueOf()) || '')
        } else {
          this.$set(this.userFormInfo, 'loadingTime', (val && dayjs(val).valueOf()) || '')
        }
        // 初始化需到时间
        this.userFormInfo.forReceiverPicker = Object.assign(this.userFormInfo.forReceiverPicker, timePickerParams)
        this.$set(this.userFormInfo, 'requireArrivalTime', '')
        this.validFetchAddress()
        this.validRestrict()
      },

      // 校验到货时间
      async handleCheckRequireTime (val) {
        let { loadingTime } = { ...this.userFormInfo } // 当前货好时间
        let { expectHighArriveTime, expectArriveTime } = { ...this.transportInfo }

        const { min } = this.userFormInfo.forReceiverPicker
        if (dayjs(val).valueOf() < min) {
          this.userFormInfo.forReceiverPicker.curTime = min
          this.$set(this.userFormInfo, 'requireArrivalTime', (min && dayjs(min).valueOf()) || '')
        } else {
          this.$set(this.userFormInfo, 'requireArrivalTime', (val && dayjs(val).valueOf()) || '')
        }

        // 预估时效-高速非高速 提示语文案
        let _textTips = ''
        // 弹窗文案
        let _dialogTips = ''
        let highwayArriveTime = dayjs(expectHighArriveTime).valueOf() // 高速预计到达时间
        let notHighwayArriveTime = dayjs(expectArriveTime).valueOf() // 非高速预计到达时时间
        let _time = highwayArriveTime + (notHighwayArriveTime - highwayArriveTime) / 3
        let requireTime = dayjs(val).valueOf() // 当前要求到货时间
        let _loadingTime = dayjs(loadingTime).valueOf() // 当前要求到货时间
        if (highwayArriveTime < requireTime && requireTime <= _time) {
          _dialogTips = '该期望到货时间需全程高速，预计请车成本较高，是否调整到货时间？'
          _textTips = '高速'
        } else if (untilIntervalHour(expectArriveTime, val, false) >= 2) {
          _dialogTips = '该期望到货时间大于不走高速预到收方时间2小时以上，可能产生额外压车费，是否调整?'
          _textTips = '非高速'
        } else {
          _textTips = '非高速'
        }
        this.$set(this.transportInfo, 'expectReceiverTime', dayjs(requireTime).format('YYYY-MM-DD HH:mm:ss'))
        // 到货时间 时间差
        let _timeDifference = requireTime - _loadingTime
        if (_dialogTips) {
          this.$confirm(
            _dialogTips,
            '提示', {
            confirmButtonText: '去调整',
            cancelButtonText: '取消',
            customClass: 'vts-reset-confirmMsg'
          }).then(async () => {
            this.userFormInfo.requireArrivalTime = ''
            // 到货时间
            this.userFormInfo.forReceiverPicker = Object.assign(this.userFormInfo.forReceiverPicker, timePickerParams)
            setTimeout(() => {
              this.validRestrict()
            }, 1000)
          }).catch(() => {
            setTimeout(() => {
              this.validRestrict()
            }, 1000)
          })
        } else {
          // 非高速高速 文案
          this.predictPrescriptionTips = _textTips
          this.validRestrict()
        }
      },

      // -----地址相关-----

      // 地址时效/距离信息
      async validFetchCalcArriveTime () {
        let { carTypeCode: needCarType, carLength: needCarLength } = this.carInfo
        let { loadingTime, endDetailedAddress: endDetailedAddress, startDetailedAddress: startDetailedAddress } = this.userFormInfo
        let parmas = {
          needCarType,
          needCarLength,
          loadingTime: loadingTime && dayjs(loadingTime).valueOf(),
          endDetailedAddress,
          startDetailedAddress,
          lineType: '20',
        }

        try {
          let _res = await calcArriveTimeApi(parmas)
          if (+_res.code == 0 && _res.data) {
            this.transportInfo = _res.data
            bus.$emit('ReceiveTransportInfo', this.transportInfo)
            return true
          } else {
            this.transportInfo = {}
            bus.$emit('ReceiveTransportInfo', this.transportInfo)
            return false
            // this.$message.error(_res.msg)
          }
        } catch (error) {
          this.$message.error('寄件与收件运输时效解析失败，请重新输入地址解析')
        }
      },

      //  转寄区校验
      async validFetchMapResolve (type) {
        let { startDetailedAddress, endDetailedAddress, startAddress, endAddress } = this.userFormInfo
        let _startDetailedAddress = ''
        let _endDetailedAddress = ''
        if (startAddress.districtList.length && startAddress.detailAddress) {
          _startDetailedAddress = startDetailedAddress
        }
        if (endAddress.districtList.length && endAddress.detailAddress) {
          _endDetailedAddress = endDetailedAddress
        }
        let parmas = {
          address: type === 1 ? _startDetailedAddress : _endDetailedAddress,
          addressType: type
        }
        if (parmas.address) {
          try {
            let _res = await fetchMapResolve(parmas)
            if (+_res.code === 0) {
              return _res.data
            } else {
              if (type === 1) {
                this.$refs.startDetailedAddress.formData.detailAddress = ''
                // this.$message.error('寄件地址校验解析失败，请检查重新输入地址')
                return 'validFetchMapResolveFalse1'
              } else {
                this.$refs.endDetailedAddress.formData.detailAddress = ''
                // this.$message.error('收件地址校验解析失败，请检查重新输入地址')
                return 'validFetchMapResolveFalse2'
              }
            }
          } catch (error) {
            if (type === 1) {
              this.$refs.startDetailedAddress.formData.detailAddress = ''
              this.$message.error('寄件地址校验解析失败，请检查重新输入地址')
            } else {
              this.$refs.endDetailedAddress.formData.detailAddress = ''
              this.$message.error('收件地址校验解析失败，请检查重新输入地址')
            }
          }
        }
      },

      // 地址禁发校验
      async validFetchAddressNoExpress (startMapResolve, endMapResolve, loadingTime) {
        let { carTypeCode, carLength } = this.carInfo
        let { provinceCode: startProvinceCode, cityCode: startCityCode } = startMapResolve
        let { provinceCode: endProvinceCode, cityCode: endCityCode } = endMapResolve
        let parmas = {
          carTypeCode,
          carLength,
          startProvinceCode,
          startCityCode,
          endProvinceCode,
          endCityCode,
          departTime: dayjs(loadingTime).format('YYYY-MM-DD HH:mm:ss')
        }
        let checkUndefined = Object.keys(parmas).filter(v => { return !parmas[v] })
        if (!checkUndefined.length) {
          try {
            let _res = await fetchNoExpress(parmas)
            this.Hitrequset = false
            if (+_res.code == 0 && _res.data && _res.data.hit) {
              let endTime = _res.data.endTime
              let _endTime = dayjs(endTime).format('YYYY年MM月DD日 HH:mm')
              this.isHit = true
              this.HitTime = _endTime
            } else {
              this.isHit = false
            }
          } catch (error) {
            this.Hitrequset = true
          }
        }
      },

      // 校验地址
      async validFetchAddress () {
        let flag = this.checkIsValidFetchAddress()
        if (!flag) return
        this.loading = true
        this.btnFlag = false
        let [_transportInfo, startMapResolve, endMapResolve] = await Promise.all([this.validFetchCalcArriveTime(), this.validFetchMapResolve(1), this.validFetchMapResolve(2)])
        console.log(_transportInfo, startMapResolve, endMapResolve, 'validFetchAddress地址校验');
        if (!_transportInfo) {
          this.loading = false
          this.btnFlag = true
          return this.$message.error('寄件与收件运输时效解析失败，请重新输入地址解析')
        }
        if (startMapResolve == 'validFetchMapResolveFalse1') {
          this.loading = false
          this.btnFlag = true
          return this.$message.error('寄件地址校验解析失败，请检查重新输入地址')
        }
        if (endMapResolve == 'validFetchMapResolveFalse2') {
          this.loading = false
          this.btnFlag = true
          return this.$message.error('收件地址校验解析失败，请检查重新输入地址')
        }
        if (startMapResolve && endMapResolve && this.userFormInfo.forGoodsPicker.curTime) {
          this.userFormInfo.startProvince = startMapResolve.province
          this.userFormInfo.startProvinceCode = startMapResolve.provinceCode
          this.userFormInfo.startCity = startMapResolve.city
          this.userFormInfo.startCityCode = startMapResolve.cityCode
          this.userFormInfo.startCounty = startMapResolve.county || startMapResolve.town
          this.userFormInfo.startCountyCode = startMapResolve.countyCode || startMapResolve.townCode
          this.userFormInfo.startTown = startMapResolve.town
          this.userFormInfo.startTownCode = startMapResolve.townCode
          this.userFormInfo.startLat = startMapResolve.lat
          this.userFormInfo.startLng = startMapResolve.lng
          this.userFormInfo.endProvince = endMapResolve.province
          this.userFormInfo.endProvinceCode = endMapResolve.provinceCode
          this.userFormInfo.endCity = endMapResolve.city
          this.userFormInfo.endCityCode = endMapResolve.cityCode
          this.userFormInfo.endCounty = endMapResolve.county || endMapResolve.town
          this.userFormInfo.endTown = endMapResolve.town
          this.userFormInfo.endCountyCode = endMapResolve.countyCode || endMapResolve.townCode
          this.userFormInfo.endTownCode = endMapResolve.townCode
          this.userFormInfo.endLat = endMapResolve.lat
          this.userFormInfo.endLng = endMapResolve.lng
          bus.$emit('MapResolve', { start: startMapResolve, end: endMapResolve })
          await this.validFetchAddressNoExpress(startMapResolve, endMapResolve, this.userFormInfo.forGoodsPicker.curTime)
        }
        this.loading = false
      },

      // 校验地址时机-参数必备的情况
      checkIsValidFetchAddress () {
        let { carTypeCode: needCarType, carLength: needCarLength } = this.carInfo
        let { loadingTime, endDetailedAddress: endDetailedAddress, startDetailedAddress: startDetailedAddress, } = this.userFormInfo
        let parmas = {
          needCarType,
          needCarLength,
          loadingTime,
          endDetailedAddress,
          startDetailedAddress,
        }
        let checkUndefined = Object.keys(parmas).filter(v => { return !parmas[v] })
        if (!checkUndefined.length) {
          return true
        } else {
          return false
        }
      },

      validForm () {
        return new Promise((resolve, reject) => {
          this.$refs.userFormInfo.validate(valid => {
            if (valid) {
              const data = { ...this.userFormInfo }
              data.loadingTime = dayjs(data.loadingTime).format('YYYY-MM-DD HH:mm:00')
              data.requireArrivalTime = data.requireArrivalTime ? dayjs(data.requireArrivalTime).format('YYYY-MM-DD HH:mm:00') : ''
              resolve({ ...data })
            } else {
              reject(Error('校验失败'))
              this.$rule.error(this, this.$refs.userFormInfo)
            }
          })
        })
      },
      // 重置
      reset () {
        this.userFormInfo = {
          startChecked: false,
          endChecked: false,
          loadingTime: '', // 装货时间
          requireArrivalTime: '', // 期望到货时间
          orderAddresserName: '', // 寄件人
          orderAddresserPhone: '', // 寄件人联系方式
          endDetailedAddress: '', // 收货地址
          startDetailedAddress: '', // 寄件地址
          orderContactName: '',// 收件人
          orderContactPhone: '', //收件人联系方式
          startAddress: {
            districtList: [], districtIdList: [], detailAddress: ''
          },
          endAddress: {
            districtList: [], districtIdList: [], detailAddress: ''
          },
          // 货好时间
          forGoodsPicker: {
            min: null,
            max: null,
            curTime: null
          },
          // 要求到货时间
          forReceiverPicker: {
            min: null,
            max: null,
            curTime: null
          },
        }
        this.transportInfo = {
          highWayPrescription: '', // 高速时效
          expectReceiverTime: '', // 预到收方时间
          predictPrescription: '', // 预估失效
          referenceDistance: '', //  客客距离
        }
        this.$refs.userFormInfo.resetFields()
        this.$refs.startDetailedAddress.$refs.formRef.resetFields('detailAddress')
        this.$refs.endDetailedAddress.$refs.formRef.resetFields('detailAddress')
        bus.$emit('MapResolve', { start: {}, end: {} })
        bus.$emit('ReceiveTransportInfo', {})
      },
      beforeDestroy () {
        bus.$off('ReceiveTransportInfo')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common.scss';
  @import 'index.scss';
  /deep/ {
    @include loading;
  }
  .el-autocomplete-suggestion.company-autocomplete {
    width: 296px !important;
  }
  .name-phone-wrap {
    font-size: 14px;
    color: #333333;
    line-height: 14px;
    margin: 12px 0 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    & > :first-child {
      padding-right: 1em;
    }
  }
  .address {
    font-size: 12px;
    line-height: 18px;
    color: #999999;
    margin-bottom: 8px;
    white-space: normal;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
</style>
