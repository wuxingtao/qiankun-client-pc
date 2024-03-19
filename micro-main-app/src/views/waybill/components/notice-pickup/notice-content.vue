<template>
  <div class="notice-content--container">
    <div class="row-info" v-if="showSelectNum">
      <span class="c_666">已选运单：</span>
      <span v-if='!limitWaybills.length' class="c_333">{{ waybills && waybills.length }}票</span>
      <span v-if='limitWaybills.length' class="c_333">
        {{ allSelectWaybills && allSelectWaybills.length }}票
        ({{ limitWaybills.length }}票限制下单，
        <i class='height_light'>{{ waybills && waybills.length }}票可通知取货</i>
        )
      </span>
    </div>
    <el-form ref="form" :model="formData">
      <pickup-info :data="formData" :waybills="waybills" ref="formRef" />
    </el-form>
    <div class='history-remark__wrapper'>
      <div class='history-label'>备注选项</div>
      <div class="remark-item__wrapper">
        <div v-for='(item,index) in historyRemarkList' :key='index' class='remark-item mr_12 mb_12 cursor'
           @click='setRemark(item)'>{{ item.length > 10 ? item.slice(0, 9) + '...' : item }}
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getNightPickupFee, vaildSensitiveWord } from '@/services/api/waybillOld'
import pickupInfo from './pickup-info'
import { mapGetters } from 'vuex'
import { getOrderHistoryRemarkList, setOrderHistoryRemarkList } from '@/utils/localStorageUtil'
import * as storageUtil from '@/utils/storage'
import waybillApi from '@/services/api/waybill'
import waybillUtil from '@utils/waybillUtil'
import { affectTypeEnum } from '@/views/waybill/enum/affectEnum'

export default {
  name: 'NoticeContent',
  components: {
    pickupInfo
  },
  props: {
    footerHide: {
      type: Boolean,
      default: false
    },
    loading: { type: Boolean },
    showSelectNum: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {
      isLoading: this.loading,
      waybills: [],
      placeOrderFunc: null, //下单方法
      pickupSucessCallback: null, //通知司机取货成功回调方法（唯品会通知司机取货使用）
      historyRemarkList: [],
      visibleOfTerms: false,
      formData: {
        hhDateCurrentTime: dayjs().add(5, 'minute'), // 现在货好
        hhDateTime: dayjs().format('YYYY-MM-DD'),
        hhDate: dayjs().format('YYYY-MM-DD'),
        goodsTime: '',
        customDate: '', // 自定义时间
        Number: '',
        Weight: '',
        orderRemark: '',
        isBulkGoods: '',
        goodsTimeFlag: '20' //  '' 未选中
      },
      allSelectWaybills: [], // 所有运单
      limitWaybills: [] // 限制下单的运单
    }
  },
  created () {},
  methods: {
    loadData (waybills, placeOrderFunc, pickupSucessCallback) {
      this.allSelectWaybills = waybills
      this.waybills = waybills
        .filter(i => i.limitType !== affectTypeEnum.LIMIT)
        .map(item => waybillUtil.waybillNoticeFormat(item))
      this.limitWaybills = waybills.filter(i => i.limitType === affectTypeEnum.LIMIT)
      this.placeOrderFunc = placeOrderFunc
      this.pickupSucessCallback = pickupSucessCallback

      getOrderHistoryRemarkList().then(res => {
        this.historyRemarkList = res.filter(m => m.replace(/^\s+|\s+$/g, '').length > 0)
      })

      this.$nextTick(() => {
        this.$refs.form.resetFields()
        const weight = this.sum(this.waybills.map(w => Number(w.weight || w.actualWeight) || 0)) || ''
        this.formData.Weight = weight ? weight.toFixed(2) : ''
        this.formData.Number = this.sum(this.waybills.map(w => Number(w.count) || 0)) || ''
        this.formData.hhDateTime = dayjs().format('YYYY-MM-DD')
        this.formData.goodsTime = ''
        this.$refs.formRef.initForm()
      })
    },
    sum(array) {
      return array.reduce((total, cur) => {
        return total + cur
      }, 0)
    },
    // 更新表单数据
    updateFormValue(val = {}) {
      this.formData = Object.assign(this.formData, val)
    },
    async checkData() {
      try {
        await this.$refs.formRef.$refs.form.validate()
        await this.$refs.formRef.hdDateValid()
        return true
      } catch {
        return false
      }
    },
    // 是否取货敏感词检测 <true 是 false 否>
    async checkRemark() {
      let result = true // 后台报错忽视敏感词,默认通过检测
      const content = this.formData.orderRemark
      if (!content) {
        return result
      }
      let res = await vaildSensitiveWord(content)
      if (res.code === 0 && !res.data) {
        result = false
        this.$refs.formRef.showRemarkError(true)
      } else {
        this.$refs.formRef.showRemarkError(false)
      }
      return result
    },
    async confirm() {
      const formRef = this.$refs.formRef || {}
      // 获取最新表单数据
      this.updateFormValue(formRef.formData)
      // 展示的大票货数据
      const tableDataVisible = formRef.tableData.filter(item => item.showBigCar)
      const showBigCar = formRef.showBigCar || false
      if (showBigCar && tableDataVisible.find(item => !item.isSupport)) {
        this.$message.warning('请补充大票货信息')
        return
      }
      if (!this.formData.goodsTimeFlag) {
        this.$message.warning('请选择货好时间')
        return
      }
      console.log('list :>> ', this.waybills)
      const list = this.waybills.map(m => {
        return {
          waybillNumber: m.ydNo || m.ydCode || m.waybillNumber,
          count: Number(m.count),
          goodsType: m.goodsType,
          weight: parseFloat(m.weight || m.actualWeight),
          contactPhone: m.pickupContactPhone|| m.deliveryMobile || m.contactPhone ,
          contactName: m.pickupContactPerson || m.contactName,
          sendAddress: m.deliveryAddress || m.qHAddress,
          senderName: m.deliveryPerson,
          waybillParentInden: m.waybillParentInden,
          // deliveryCustomerCode: m.deliveryCustomerCode,
          receiveAddress: m.waybillPickup?.address || m.sjAddress || m.pickupAddress,
          orderMobile: m.orderMobile || storageUtil.getPhone(),
          payMode: m.payMode || m.payWay,
          paymentCustomerCode: m.payAccount || m.paymentCustomerCode || m.paymentCustomer,
          paymentCustomer: m.paymentCustomer,
          receiveCompanyName: m.pickupCustomerName || m.sjCompany || m.waybillPickup?.customerName,
          receiveMobile: m.pickupMobile || m.sjMobile || m.waybillPickup?.mobile,
          receivePhone: m.pickupPhone || m.sjTelephone || m.waybillPickup?.phone,
          receiveProvince: m.pickupProvince,
          receiveCity: m.pickupCity,
          receiveDistrict: m.pickupDistrict,
        }
      })
      const bulkCargoInfos = tableDataVisible.map(m => {
        return {
          bulkCargoFlag: m.isSupport,
          pickupAddress: m.deliveryAddress
        }
      })
      try {
        if (!(await this.checkData())) {
          return
        }
        this.isLoading = true
        // if (!await this.checkRemark()) {
        //   return
        // }
        return await this.saveData(list, bulkCargoInfos)
        //return await this.nightPickupNotice(list, bulkCargoInfos)
      } finally {
        this.isLoading = false
      }
    },
    async saveData(list, bulkCargoInfos) {
      let goodsTimeFinally = ''
      if (this.goodsBatchTimes.length > 0) {
        this.formData.hhDateTime =
            dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      }
      switch (this.formData.goodsTimeFlag) {
        case '10':
          goodsTimeFinally = dayjs(this.formData.hhDateCurrentTime).format('YYYY-MM-DD HH:mm:ss')
          break
        case '20':
          goodsTimeFinally = this.formData.customDate
          break
      }

      let params = {
        goodsTime: goodsTimeFinally,
        estimateCount: this.formData.Number,
        estimateWeight: this.formData.Weight,
        bigGoodsFlag: this.formData.isBulkGoods ? '10' : '20',
        bulkCargoInfos: bulkCargoInfos || [],
        orderContent: this.formData.orderRemark,
        orderSource: this.isClientMode ? '210' : '120',
        waybillBaseInfos: list,
        goodsTimeFlag: this.formData.goodsTimeFlag
      }
      if (this.placeOrderFunc) {
        const saveResult = await this.placeOrderFunc(params, this.saveDataSucessCallback)
        return saveResult
      } else {
        const res = await waybillApi.orderNoticePickup(params)
        if (res.code === 0) {
          const resResult = await waybillApi.orderNoticePickupAsync({ batchNo: res.data })
          if (resResult.code === 0) {
            if (resResult.data?.errorMsg) {
              this.$message.error(resResult.data?.errorMsg)
            }
            if (resResult.data?.state === '1') {
              this.$message.success('通知取货成功')
            }
          } else {
            return
          }
          if (this.pickupSucessCallback) {
            return await this.pickupSucessCallback(this.saveDataSucessCallback)
          } else {
            this.saveDataSucessCallback()
          }
          return true
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    saveDataSucessCallback(isRedirect = true, saveResult) {
      this.$emit('on-success', saveResult || true)
      isRedirect &&
      this.$nextTick(() => {
        if (this.placeOrderFunc || this.pickupSucessCallback) {
          this.$message.success('通知取货成功')
        }
        this.$router.push({ name: 'waybill-v3', params: { refreshData: true } })
      })
      if (this.formData.orderRemark) {
        setOrderHistoryRemarkList(this.formData.orderRemark)
      }
    },
    // TODO 该逻辑已弃用
    // 通知取货成功返回true
    async nightPickupNotice(list, bulkCargoInfos) {
      try {
        const hour = dayjs(this.formData.hhDateTime).hour
        if (hour >= 8 && hour < 17) {
          return await this.saveData(list, bulkCargoInfos)
        }
        let areaCodes = list.filter(f => f.areacode).map(f => f.areacode)
        areaCodes = Array.from(new Set(areaCodes))
        let msg = ''
        if (areaCodes.length === 1) {
          const time = dayjs(this.formData.hhDateTime).format('YYYY-MM-DD HH:mm:ss')
          let res = await getNightPickupFee(time, areaCodes[0])
          if (res.code === 0 && parseFloat(res.data.nightPickupFee) > 0) {
            msg = `温馨提示：当前寄件地址${res.data.chargeStartTime}-${res.data.endChargeTime}取货会加收取货费用，详情可咨询您的市场员`
          }
        } else if (areaCodes.length > 1) {
          msg = '温馨提示：部分地区17:00-08:00取货会加收取货费用，详情可咨询您的市场员'
        }
        if (msg) {
          try {
            await this.$confirm(msg, '夜间收费提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info '
            })
            return await this.saveData(list, bulkCargoInfos)
          } catch {
            // this.isLoading = false
          }
        } else {
          return await this.saveData(list, bulkCargoInfos)
        }
      } catch (ex) {
        this.$message.error('通知取货失败')
        console.log('nightPickupNotice :>> ', ex)
      }
    },
    setRemark(value) {
      this.$refs.formRef.setRemark(value)
    }
  },
  computed: {
    ...mapGetters(['goodsBatchTimes'])
  },
  watch: {
    isLoading(flag) {
      this.$emit('update:loading', flag)
    }
    // dialogVisible (val) {
    //   this.$emit('dialogVisibleChange',val)
    //   if (!val) {
    //     Object.assign(this.$data.formData,this.$options.data().formData)
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
