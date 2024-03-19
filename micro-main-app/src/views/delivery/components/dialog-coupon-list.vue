<template>
  <ky-dialog
    width="645px"
    title="选择优惠券"
    append-to-body
    class="coupon-dialog"
    :visible.sync="visible"
    :close-on-click-modal="false">
    <section class="coupon-dialog-body" v-loading="loading">
      <div class="coupon-dialog-row">
        <label class="coupon-dialog-row-title">可使用优惠券({{ usableCount }}张)</label>
        <div class="coupon-dialog-row-content">
          <template v-for="item in datalist">
            <coupon-item
              :item="item"
              v-if="item.status === 1"
              :active="activeCode"
              :key="item.prizeCode"
              @change="onCouponChange"
            />
          </template>
        </div>
      </div>
      <div class="coupon-dialog-row">
        <label class="coupon-dialog-row-title">不可使用优惠券({{ disabledCount }}张)</label>
        <div class="coupon-dialog-row-content">
          <template v-for="item in datalist">
            <coupon-item
              :item="item"
              :key="item.prizeCode"
              v-if="item.status === 0"
            />
          </template>
        </div>
      </div>
    </section>
    <section slot="footer" class="coupon-dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSave">保 存</el-button>
    </section>
  </ky-dialog>
</template>
<script>
import _ from 'lodash'
import * as API from '@api/coupon'
import CouponItem from './coupon-item'
import store from '../../../store'
export default {
  props: {
    formData: {
      type: Object
    }
  },
  components: {
    CouponItem
  },
  data() {
    return {
      loading: false,
      visible: false,
      usableCount: 0,
      disabledCount: 0,
      datalist: [],
      activeCoupon: null,
      currentRow: null,
      activeCoupons: []
    }
  },
  computed: {
    activeCode() {
      return this.activeCoupon && this.activeCoupon.prizeCode
    },
  },
  methods: {
    async show(row, coupons) {
      if (!row) {
        return 
      }
      if (row.coupon.value.prizeCode) {
        this.activeCoupon = row.coupon.value
      } else {
        this.activeCoupon = null
      }
      this.currentRow = row
      this.getCouponList(row, coupons)
      if (this.activeCoupon) {
        this.datalist = _.uniqBy([this.activeCoupon, ...this.datalist], 'prizeCode')
      }
      this.visible = true
    },
    filterActiveCoupons(coupon) {
      const result = (_.cloneDeep(this.activeCoupons)).filter(item => {
        if (item.prizeCode !== coupon.prizeCode) {
          return item
        }
      })
      console.log(result)
      return result
    },
    async getCouponList(row, coupons = []) {
      this.loading = true
      try {
        const { estimateFreight } = row
        const params = {
          /** 来源，字典：eam_marketing_operation_ticket_from */
          from: 4,
          /** 服务方式 */
          serviceMode: row.serviceWay.value,
          /** 预估运费 */
          amount: estimateFreight.value && estimateFreight.value.waybillAmount || 0,
          /** 增值服务费 */
          serviceAmount: estimateFreight.value && estimateFreight.value.addedValueAmount || 0,
          /** 寄件地址 */
          sendingRegion: row.qhAddress.value,
          /** 收件地址 */
          receivingRegion: row.sjAddress.value,
          /** 货物重量 */
          weight: row.weight.value,
          /** 付款方式 */
          payMode: row.payWay.value,
          /** 已选优惠券 */
          selectedTickets: coupons,
          /** 是否有预估运费权限 */
          estimateCostAuth: store.getters.hasFrightFeeAuth ? 1 : 0,
        }
        const { data } = await API.getListTicketsByOrder(params)
        if (!data) {
          this.datalist = []
          this.usableCount = 0
          this.disabledCount = 0
          return
        }
        this.usableCount = data.usableCount
        this.disabledCount = data.disabledCount

        this.datalist = data.externalTicketVOList
      } catch (err) {
        console.warn(err)
      } finally {
        this.loading = false
      }
    },
    onSave() {
      this.$emit('save', this.activeCoupon, this.currentRow,)
      this.visible = false
    },
    onCouponChange(item) {
      console.log(item)
      if (item) {
        this.activeCoupons.push(item)
        // this.datalist = _.uniqBy([item, ...this.datalist], 'prizeCode')
      } else {
        if (this.activeCoupon) {
          this.removeCoupon(this.activeCoupon)
        }
      }
      this.activeCoupon = item
    },
    removeCoupon(coupon) {
      console.log('删除过滤项', coupon)
      if (coupon) {
        this.activeCoupons = (_.cloneDeep(this.activeCoupons)).reduce((arr, item) => {
          if (item.prizeCode !== coupon.prizeCode) {
            arr.push(item)
          }
          return arr
        }, [])
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.coupon-dialog {
  /deep/ {
    .el-dialog .el-dialog__body {
      padding: 0 0 0 !important;
      margin-right: 0 !important;
    }
  }

  &-body {
    height: 518px;
    .coupon-dialog-row:first-child {
      margin-bottom: 16px;
      border-bottom: solid 1px #f1f1f5;
    }
  }
 
  &-row {
    &-label {
      color: #333333;
    }
    &-content {
      display: flex;
      flex-wrap: wrap;
      margin-top: 12px;
      min-height: 150px;
      // @include scroll-bar;
      // overflow-y: scroll;
      .coupon-item {
        margin-bottom: 16px;
        margin-right: 16px;
      }
    }
    // &:last-child {
    //   .coupon-dialog-row-content {
    //     min-height: 176px !important;
    //   }
    // }
  }
}
</style>
