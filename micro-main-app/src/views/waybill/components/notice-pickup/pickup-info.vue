<template>
  <el-form ref='form' :model='formData' :rules='formRules' class="pickup-info__container">
    <ky-ui-label title='取货信息' />
    <!-- <div class='now-goodTime fs_12 mb_10' v-show="formData.goodsTimeFlag === '10'">
      <svg-icon icon-class='notice-warning' class='notice-warning mr_8' />
      建议您<span class='public-color'>提前1小时下单</span>，更有利于您的取货时效
    </div> -->
    <!-- <el-row :gutter='4'>
      <el-col :span='15'>
        <el-form-item prop='goodsTimeFlag' class='goods-time-flag c_03050d'>
          <span>货好时间</span><span class='mr_20' style='color:red; padding-left: 2px'>*</span>
          <span class='radio-buttons'>
            <el-radio v-model='formData.goodsTimeFlag' label='10' class='c_03050d'><span>现在货好</span><span class='c_999 pl_2'>(最终以下单时间为准)</span></el-radio>
            <el-radio v-model='formData.goodsTimeFlag' label='20' class='c_03050d'>自定义时间</el-radio>
          </span>
        </el-form-item>
      </el-col>
      <el-col :span='8' v-show="formData.goodsTimeFlag === '20'">
        <delivery-time ref='deliveryTimeRef' @updateField='updateField' />
      </el-col>
    </el-row> -->

    <night-fee :visible='nightFeeTable.show' :data='nightFeeTable.data' />
    <!--  优惠券变化提示 start     -->
    <div class='label-tip mt_8' v-if='lotteryInfo.hasChange' @click='showLotteryDialog'>
      <div class='label-text'>您的运单优惠券发生变化 <span class='theme-color cursor ml-12'>查看详情</span></div>
    </div>
    <!--  优惠券变化提示 end     -->

    <el-row :gutter='20' class='mt_4 mb_18'>
      <el-col :span='8'>
        <el-form-item label='货好时间' maxlength='10'>
          <delivery-time ref='deliveryTimeRef' @updateField='updateField' />
        </el-form-item>
      </el-col>
      <el-col :span='8'>
        <el-form-item label='预估总件数' prop='Number' maxlength='10'>
          <el-input v-model='formData.Number' size='medium' clearable placeholder='请输入' v-kyerestrict.positive
                    maxlength='5'>
            <template slot='append'>(件)</template>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span='8'>
        <el-form-item label='预估总重量' prop='Weight' maxlength='10'>
          <el-input v-model='formData.Weight' size='medium' clearable placeholder='请输入' v-kyerestrict.float maxlength='7'>
            <template slot='append'>(kg)</template>
          </el-input>
        </el-form-item>
      </el-col>
      <!--  TODO大票货后续对接    -->
      <!--      <el-col :span="isVipshopUser?4:0">-->
      <!--        <el-checkbox v-if="isVipshopUser" v-model="formData.isBulkGoods" class="bulk-goods">大货入仓</el-checkbox>-->
      <!--      </el-col>-->
    </el-row>
    <pickup-big :visible='showBigCar' :tableData='tableData' />
    <ky-ui-label title='给取货司机捎句话' />
    <el-form-item prop='orderRemark' :error='formRemarkError'>
      <el-input type='textarea' :rows='3' v-model='formData.orderRemark' resize='none' clearable placeholder='给司机小哥捎句话' maxlength='150' show-word-limit></el-input>
    </el-form-item>
    <notice-lottery :visible='lotteryInfo.dialogVisible' :waybills='waybills' @lotteryChange='lotteryChange' />
  </el-form>
</template>

<script>
import dayjs from 'dayjs'
import { KyUiLabel } from '@comps/ky-ui'
import { mapGetters, mapState } from 'vuex'
import { getNgihtFeeNew } from '@api/waybillOld'
import { getCustomerCode } from '@utils/storage'
import { debounce } from 'lodash'

export default {
  name: 'pickup-info',
  props: {
    // 表单数据
    data: {
      type: Object,
      default: () => {
      }
    },
    // 运单数据
    waybills: {
      type: Array,
      default: () => []
    }
  },
  components: {
    KyUiLabel,
    'night-fee': () => import('./night-fee'),
    'pickup-big': () => import('./pickup-big'),
    'notice-lottery': () => import('./notice-lottery'),
    'delivery-time': () => import('../../components/delivery-time/index2')
  },
  data () {
    const validateHhDateTime = (rule, value, callback) => {
      if (this.formData.goodsTimeFlag !== '20') {
        callback()
      }
      if (!this.formData.hhDateTime) {
        return callback(new Error('请选择货好时间'))
      }
      let flag = dayjs().isAfter(
        dayjs(this.formData.hhDateTime),
        'minute')
      if (flag) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      flag = dayjs(this.formData.hhDateTime).isAfter(
        dayjs().add(1, 'month'),
        'month')
      if (flag) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    return {
      formData: {
        hhDateCurrentTime: dayjs().add(5, 'minute'), // 现在货好
        hhDateTime: dayjs().add(5, 'minute'),
        hhDate: dayjs().format('YYYY-MM-DD'),
        goodsTime: '',
        customDate: '',
        Number: '',
        Weight: '',
        orderRemark: '',
        isBulkGoods: '',
        goodsTimeFlag: '20'
      },
      formRules: {
        hhDateTime: [
          // { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDateTime, trigger: 'blur' }
        ],
        Weight: [
          {
            required: true,
            type: 'number',
            message: '请输入大于零的数值',
            transform (value) {
              return Number(value)
            },
            min: 0.01,
            trigger: 'blur'
          }
        ],
        Number: [
          {
            required: true,
            type: 'integer',
            message: '请输入大于零的整数',
            transform (value) {
              return Number(value)
            },
            min: 1,
            trigger: 'blur'
          }
        ]
      },
      // 过滤过期的批次时间
      goodsBatchTimesFilter: [],
      // 夜间取货表格
      nightFeeTable: {
        show: false,
        data: [
          {
            address: '深圳市宝安区航城街道机场航城四路99号场',
            nightFee: '190.00'
          },
          {
            address: '深圳市宝安区航城街道机场航城四路99号场',
            nightFee: '190.00'
          }
        ]
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      timePickerOptions: {
        step: '00:15',
        minTime: '',
        start: '00:00',
        end: '23:45'
      },
      // 优惠券信息
      lotteryInfo: {
        // 是否展示优惠券变动
        hasChange: false,
        dialogVisible: false
      },
      // 大票货数据
      tableData: [],
      // 备注错误提示
      formRemarkError: ''
    }
  },
  mounted () {
    this.initForm()
  },
  methods: {
    // 初始化表单数据
    initForm () {
      this.clearForm()
      const { Weight, Number, hhDateTime, hhDate, goodsTime, isBulkGoods } = this.data
      this.formData.Weight = Weight
      this.formData.Number = Number
      this.formData.hhDateTime = hhDateTime
      this.formData.isBulkGoods = isBulkGoods

      this.nightFeeTable.show = false

      this.lotteryInfo.hasChange = false
      this.lotteryInfo.dialogVisible = false
      // 大票货地址数据
      this.tableData = this.mergeAddressArr(this.waybills)
      // 初始化货好时间自定义
        this.$refs.deliveryTimeRef?.reset()
        this.$refs.deliveryTimeRef?.goodsBatchTimesInit()
        this.getNightFee()
        setTimeout(() => {
          this.formData.goodsTimeFlag = '20'
        }, 600)
    },
    clearForm () {
      this.$refs.form.resetFields()
        this.$refs.deliveryTimeRef?.reset()
    },
    setRemark (value) {
      const split = this.formData.orderRemark.trim()?',':''
      this.formData.orderRemark +=  split + value
    },
    // 根据货好时间获取夜间取货费
    getNightFee: debounce(async function () {
      if (!this.tableData || this.tableData.length === 0) {
        return
      }
      const date = this.pickDate
      if (!date) {
        return
      }

      const customerCode = getCustomerCode()
      let params = this.tableData.map(d => {
        const item = d.itemValue || {}

        return {
          customerCode,
          waybillNo: item.ydNo || item.ydCode || item.waybillNumber, // 运单号或者唯一标识
          sendAddress: item.deliveryAddress,
          calculationFeeTime: date // 计费时间
        }
      })
      try {
        let res = await getNgihtFeeNew(params)
        if (res.code === 0 && res.data) {
          this.nightFeeTable.data = res.data.filter(item => item?.feeResponse?.nightPickupFlag === '10' && item?.feeResponse?.nightPickupFee).map(item => {
            return {
              nightFee: item?.feeResponse?.nightPickupFee,
              address: params.find(e => e.waybillNo === item.waybillNo).sendAddress || ''
            }
          })
          this.nightFeeTable.show = this.nightFeeTable.data.length > 0
        }
      } catch (e) {
        this.nightFeeTable.show = false
      }
    }, 300),
    // 展示优惠券变动提示
    switchLotteryChange (val) {
      this.lotteryInfo.hasChange = val
    },
    // TODO 展示优惠券变动弹窗
    showLotteryDialog () {
      if ('localhost' !== window.location.hostname) {
        this.$message.warning('暂不提供测试')
        return
      }
      this.lotteryInfo.dialogVisible = true
    },
    // TODO 优惠券改动回调
    lotteryChange (val) {

    },
    // 合并相同地址数据
    mergeAddressArr (arr) {
      let obj = {}
      arr.forEach(item => {
        let { deliveryAddress } = item
        if (!obj[deliveryAddress]) {
          obj[deliveryAddress] = {
            deliveryAddress,
            children: [],
            showBigCar: false,
            isSupport: false,
            itemValue: { ...item }
          }
        }
        obj[deliveryAddress].children.push(item)
      })
      // 最终输出
      return Object.values(obj)
    },
    handleTimeChange () {
      this.$refs.form.validateField('hhDate')
    },
    // 自定义货好时间验证
    hdDateValid () {
      return new Promise(async (resolve, reject) => {
        try {
          if (this.formData.goodsTimeFlag === '10') {
            resolve(true)
          } else if (this.formData.goodsTimeFlag === '20') {
            // await this.$refs.deliveryTimeRef.$refs.form.validate()
            await this.$refs.deliveryTimeRef.validateForm()
          }
          resolve(true)
        } catch (e) {
          reject(false)
        }
      })

    },
    // 更新表单数据
    updateField ({ key, val }) {
      if (key === 'customDate') {
        val = dayjs(val).format('YYYY-MM-DD HH:mm:ss')
      }
      this.formData[key] = val
    },
    // 备注敏感数据展示
    showRemarkError (show = false) {
      this.formRemarkError = show ? '存在敏感信息，请重新填写' : ''
    }
  },
  computed: {
    isVipshopUser () {
      return this.$store.getters.isVipshopUser
    },
    // ...mapGetters(['goodsBatchTimes']),//更换数据来源
    ...mapState('waybill', ['goodsBatchTimes']),
    // 大票货是否显示,当同一取货地址物品总重量大于等于8 显示使用拖车，（过滤不符合要求地址）
    showBigCar () {
      let result = false
      const mergeAddressList = this.tableData
      if (!this.formData.Weight || !mergeAddressList || mergeAddressList.length === 0) {
        return result
      }
      // 每件平均重量
      let avgWeight = Number(this.formData.Weight) / Number(this.waybills.length)

      mergeAddressList.forEach(item => {
        item.weight = item.children.length * avgWeight
        item.showBigCar = item.weight >= 8000
      })

      return !!mergeAddressList.find(item => item.showBigCar)
    },
    // 选中的取货时间
    pickDate () {
      if (!this.formData.goodsTimeFlag) {
        return null
      }
      const currentDate = dayjs(this.formData.hhDateCurrentTime).format(
        'YYYY-MM-DD HH:mm:ss'
      )
      const customDate = this.formData.customDate
      return this.formData.goodsTimeFlag === '10' ? currentDate : customDate
    }
  },
  watch: {
    pickDate: {
      handler (val) {
        if (val === 'Invalid Date') {
          return
        }
        this.getNightFee()

        // // 存在已选优惠券
        // if(!this.formData.goodsTimeFlag && this.waybills.find(item=>item.prizeCode).prizeCode){
        //   this.switchLotteryChange(true)
        // }
      },
      immediate: true
    },
    // 监听货好时间变更
    'formData.goodsTimeFlag': {
      handler (val) {
        switch (val) {
          case '10':
            this.formData.hhDateCurrentTime = dayjs().add(5, 'minute')
            break
          case '20':
            // 初始化货好时间自定义
            this.$refs.deliveryTimeRef.init()
            // this.$refs.deliveryTimeRef.$refs.form.validateField('hhDate')
            this.$refs.deliveryTimeRef.validateForm()
            break
          default:
            break
        }
      }
    },
    'formData.orderRemark': {
      handler (val) {
        if (!val) {
          this.showRemarkError(false)
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  .pickup-info__container {
    /deep/ {
      .el-form-item{
        margin-bottom: 8px;
      }
      .el-form-item__content {
          line-height: 30px;
        }
      .delivery-form {
        .delivery-input {
          width: 100%;
        }
      }
    }
  }
  .label-tip {
    background: #fff9e6;
    border-radius: 4px;
    padding: 12px;

    .label-text {
      color: #ff8038;
    }
  }

  .bulk-goods {
    padding-top: 32px;
  }

  .radio-buttons {
    /deep/ {
      .el-radio__input {
        line-height: 16px;
      }

      .el-radio__inner {
        width: 12px;
        height: 12px;

        &::after {
          transition: none;
        }
      }

      .el-radio__label {
        padding-left: 8px;
      }
    }
  }

  .goods-time-flag {
    span {
      font-size: 12px;
    }

    /deep/ {
      .el-radio__input.is-checked + .el-radio__label {
        color: initial;
      }
    }
  }
</style>
