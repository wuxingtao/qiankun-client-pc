<template>
  <section class="info-wrapper coupon-info" v-if="datalist && datalist.length > 0">
    <single-info-header
      :is-show-in-dialog="isShowInDialog"
      icon="icon-category-coupon"
      title="优惠券">
      <template #common>
        <div class="coupon-info-desc">
          <template v-if="activeCoupon">
            <div class="coupon-info-active" >
              <span>{{ activeCoupon.shortDesc }}</span>
            </div>
          </template>
          <template v-else>
            <template v-if="warnMessage && datalist.length > 0 && usableCount > 0">
              <div class="coupon-info-change"> 
                <div>信息已更新，{{ warnMessage }}优惠券</div>
                <div @click="warnMessage = ''" class="coupon-info-change-close"><ky-icon type="icon-close" /></div>
              </div>
            </template>
            <template v-else>
              <div v-if="usableCount > 0" class="coupon-info-amount">
                (您有{{ usableCount || 0 }}张可用的优惠券)
              </div>
              <div v-else class="coupon-info-not">
                <div v-if="warnMessage" class="coupon-info-change"> 
                  <div>信息已更新，{{ warnMessage }}优惠券</div>
                  <div @click="warnMessage = ''" class="coupon-info-change-close"><ky-icon type="icon-close" /></div>
                </div>
                <span v-else>(暂无可用优惠券)</span>
              </div>
            </template>
          </template>
        </div>
        <div class="category-arrow" @click="onArrowClick">
          <el-button type="text">
            {{ isOpen ? '收起' : '展开' }}
          </el-button>
          <ky-icon type="icon-arrow-down2" />
        </div>
      </template>
    </single-info-header>
    <div class="category-content" v-show="isOpen">
      <template v-for="item in datalist">
        <coupon-item
          :item="item"
          :active="activeCode"
          :key="item.prizeCode"
          @change="onCouponChange"
        />
      </template>
    </div>
    <dialog-coupon-list ref="dialogCouponList" :formData="formData"/>
  </section>
</template>
<script>
import { KyIcon } from '@comps'
import * as API from '@api/coupon'
import _ from 'lodash'
import CouponItem from './coupon-item'
import DialogCouponList from './dialog-coupon-list'
import SingleInfoHeader from './single-info-header'
import soter from '../../../store'
const VALIDATE_KEYS = ['serviceWay', 'qhAddress', 'sjAddress', 'weight', 'payWay']
const EXTEND_KEYS = ['payAccount', 'count', 'sizeList', 'declaredValue', 'dsMoney', 'receiptFlag', 'mjWay']

export default {
  props: {
    isShowInDialog: {
      type: Boolean
    },
    formData: {
      type: Object
    },
    shareData: {
      type: Object
    }
  },
  components: {
    KyIcon,
    CouponItem,
    SingleInfoHeader,
    DialogCouponList
  },
  data() {
    return {
      form: null,
      isOpen: true,
      datalist: null,
      usableCount: 0,
      disabledCount: 0,
      activeCoupon: null,
      params: null,
      warnMessage: '',
      listenerKeys: [
        {
          label: '服务方式',
          key: 'serviceWay',
        },
        {
          label: '寄件地址',
          key: 'qhAddress',
        },
        {
          label: '收件地址',
          key: 'sjAddress',
        },
        {
          label: '付款方式',
          key: 'payWay',
        }
      ],
      filterCoupons: [],
    }
  },
  computed: {
    activeCode() {
      return this.activeCoupon && this.activeCoupon.prizeCode
    },
  },
  methods: {
    /** 设置已选优惠券列表 */
    setSelectedList(filterCoupons = []) {
      this.filterCoupons = filterCoupons
    },
    onDialogCouponListShow() {
      this.$refs.dialogCouponList.show()
    },
    onArrowClick() {
      this.isOpen = !this.isOpen
    },
    async fetchCouponList(row, fieldName, estimateFreight, isModify) {
      // console.log(fieldName, '字段名')
      // console.log(estimateFreight, '预估运费')
      let fields = VALIDATE_KEYS
      /** 有预估运费权限 */
      if (soter.getters.hasFrightFeeAuth && estimateFreight.waybillAmount) {
        fields = [...VALIDATE_KEYS, ...EXTEND_KEYS]
      }
      // console.log(fieldName, '字段')
      const result = fields.some(item => item === fieldName)
      /** 只在必填字段更新时执行 */
      if (!result && fieldName) {
        return
      }

      const form = _.cloneDeep({ ...row })
      this.form = form
      const isEmpty = this.validateEmpty(form)
      /**
       * 1. 付款方式=寄方付，才能使用优惠券
       * 2. 必填字段验证不通过
       */
      if (form.payWay !== '10' || !isEmpty) {
        this.resetData()
        return
      }
      
      this.$nextTick(async () => {
        await this.getCouponList(form, estimateFreight, isModify)
        const coupon = form.coupon || {}
        // console.log(coupon, '优惠券')
        /** 传入的数据中已有优惠券需要默认选中（适用于批量下单-修改/新增，运单列表-修改/司机取货） */
        if (coupon.prizeCode) {
          const oldCoupon = this.findCurrentCoupon(coupon)
          /**
           * 1. 选中的券已不存在
           * 2. 选中的券在本次查询中变为不可用
           */
          if (!oldCoupon || oldCoupon.status === 0) {
            this.activeCoupon = null
            // eslint-disable-next-line vue/no-mutating-props
            this.shareData.coupon = {}

            if (this.usableCount > 0) {
              this.warnMessage = '请重新选择'
            } else {
              this.warnMessage = '暂无可用'
            }
          } else {
            this.warnMessage = ''
            this.activeCoupon = oldCoupon
            // eslint-disable-next-line vue/no-mutating-props
            this.shareData.coupon = oldCoupon
            /** 首次弹窗修改的时候，选中的优惠券展示在第一位 */
            if (!fieldName) {
              this.datalist = _.uniqBy([this.activeCoupon, ...this.datalist], 'prizeCode')
            }
          }
        } else {
          if (this.activeCoupon) {
            const oldCoupon = this.findCurrentCoupon(this.activeCoupon)
            if (!oldCoupon || oldCoupon.status === 0) {
              this.activeCoupon = null
              if (this.usableCount > 0) {
                this.warnMessage = '请重新选择'
              } else {
                this.warnMessage = '暂无可用'
              }
              // eslint-disable-next-line vue/no-mutating-props
              this.shareData.coupon = {}
            } else {
              // eslint-disable-next-line vue/no-mutating-props
              this.shareData.coupon = oldCoupon
            }
          } else {
            this.warnMessage = ''
          }
        }
      })
    },
    async getCouponList(form, estimateFreight, isModify) {   
      try {
        const params = {
          /** 来源，字典：eam_marketing_operation_ticket_from */
          from: 4,
          /** 服务方式 */
          serviceMode: form.serviceWay,
          /** 预估运费 */
          amount: (estimateFreight && estimateFreight.waybillAmount) || 0,
          /** 增值服务费 */
          serviceAmount: (estimateFreight && estimateFreight.addedValueAmount) || 0,
          /** 寄件地址 */
          sendingRegion: form.qhAddress,
          /** 收件地址 */
          receivingRegion: form.sjAddress,
          /** 货物重量 */
          weight: form.weight,
          /** 付款方式 */
          payMode: form.payWay,
          /** 已选优惠券(通知司机取货时使用字段，此处不用) */
          selectedTickets: this.filterCoupons,
          /** 是否有预估运费权限 */
          estimateCostAuth: this.$store.getters.hasFrightFeeAuth ? 1 : 0,
          /** 运单号 */
          waybillNumber: form.ydNo || '',
          /** 运单列表修改时，需要把已绑优惠券编码 */
          bindingPrizeCode: (isModify && form.coupon) ? form.coupon.prizeCode : ''
        }
        const { data } = await API.getListTicketsByOrder(params)
        if (!data) {
          this.resetData()
          return
        }
        this.usableCount = data.usableCount
        this.disabledCount = data.disabledCount
        this.datalist = data.externalTicketVOList
      } catch (err) {
        this.resetData()
      }
    },
    /** 验证必填参数是否为空 */
    validateEmpty(params) {
      const result = this.listenerKeys.every(item => {
        return params[item.key]
      })
      return result
    },
    /** 选中/取消优惠券 */
    onCouponChange(item = null) {
      this.activeCoupon = item
      if (item) {
        item.usableCount = this.usableCount
        item.disabledCount = this.disabledCount
        // this.datalist = _.uniqBy([this.activeCoupon, ...this.datalist], 'prizeCode')
      } else {
        this.warnMessage = ''
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.shareData.coupon = item || {
        usableCount: this.usableCount,
        disabledCount: this.disabledCount
      }
      // console.log(this.activeCoupon, '选中的优惠券')
    },
    infoCouponGetActiveCoupon() {
      let coupon = null
      if (this.activeCoupon) {
        coupon = {
          ...this.activeCoupon,
          usableCount: this.usableCount,
          disabledCount: this.disabledCount
        }
      }
      return coupon
    },
    /** 绑定优惠券到下单表单内 */
    bindCouponInOrder() {
      // eslint-disable-next-line vue/no-mutating-props
      this.formData.coupon = this.activeCoupon || {}
      // eslint-disable-next-line vue/no-mutating-props
      this.formData.coupon.afterDiscountAmount = this.shareData.coupon?.afterDiscountAmount
    },
    findCurrentCoupon(coupon) {
      const result = this.datalist.filter(item => {
        if (item.prizeCode === coupon.prizeCode) {
          return item
        }
      })
      const firstItem = result[0]
      // if (firstItem) {
      //   this.datalist = _.uniqBy([firstItem, ...this.datalist], 'prizeCode')
      // }
      return firstItem
    },
    /** 重置数据源 */
    resetData() {
      this.datalist = null
      this.usableCount = 0
      this.disabledCount = 0
      this.activeCoupon = null
      // eslint-disable-next-line vue/no-mutating-props
      this.shareData.coupon = { }
      // eslint-disable-next-line vue/no-mutating-props
      // this.formData.coupon = { }
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/single-common.scss';
.coupon-info {
  overflow: hidden;
  padding-right: 0 !important;
  padding-bottom: 0px !important;
  .category-caption {
    display: flex;
    align-items: center;
    // justify-content: space-between;
  }
  .category-arrow {
    padding-right: 20px;
    display: inline-flex;
    cursor: pointer;
    align-items: center;
    // justify-content: center;
    margin-left: auto;
    .ky-iconfont {
      font-size: 10px;
      margin-left: 2px;
    }
  }

  .category-content {
    display: flex;
    flex-flow: wrap;
    height: 170px;
    overflow-y: scroll;
    @include scroll-bar;
  }

  .coupon-info-desc {
    // position: absolute;
    // left: 98px;
    padding-left: 9px;
    font-size: 14px;
    color: #999999;
  }

  .coupon-info {
    &-amount {
      color: #ffa40d;
    }
    &-change {
      background: rgba(255, 177, 6, 0.2);
      color: #ffa40d;
      padding: 6px;
      display: flex;

      justify-content: center;
      align-items: center;
      border-radius: 2px;
      &-close {
        margin-left: 5px;
        cursor: pointer;
        margin-top: -1px;
        .ky-iconfont {
          font-size: 12px;
          color: #ffa40d;
        }
      }
    }
    &-active {
      min-width: 45px;
      height: 18px;
      font-size: 13px;
      color: #fe743c;
      padding-left: 30px;
      padding-right: 10px;
      border-radius: 2px;
      background: rgba(255, 177, 6, 0.2) url(~@/assets/image/waybill/coupon-active.png) no-repeat;
      background-size: 23px 18px;
      & > span {
        display: inline-block;
        margin-top: 3px;
      }
    }
  }
}
</style>
