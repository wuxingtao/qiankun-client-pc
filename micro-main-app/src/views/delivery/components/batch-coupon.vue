<template>
  <div class="batch-coupon">
    <template v-if="loading">
      <el-button type="text" :loading="loading"></el-button>
    </template>
    <template v-else>
      <div v-if="value.usableCount > 0">
        <!-- 已选优惠券 -->
        <div v-if="value.shortDesc">
          <el-button class="font-purpel" type="text" @click="onUpdateCoupon">
            <div class="batch-coupon-inner">
              <img :src="CouponIcon" />
              <span>{{ value.shortDesc }}</span>
            </div>
          </el-button>
        </div>
        <!-- 待选优惠券 -->
        <div v-else>
          <el-button class="font-purpel" type="text" @click="onSelectCoupon">
            <div class="batch-coupon-inner">
              <img :src="CouponIcon" />
              <span>{{ value.usableCount }}张可用</span>
            </div>
          </el-button>
        </div>
      </div>
      <div v-else class="font-gray">
        <!-- 不可用优惠券大于0 -->
        <div v-if="value.disabledCount > 0">
          <div class="batch-coupon-inner">
            <img :src="CouponIconDisabled"/>
            <span>暂无可用</span>
          </div>
        </div>
        <!-- 没有可用优惠券 -->
        <div v-else>--</div>
      </div>
    </template>
  </div>
</template>
<script>
import CouponIcon from '@/assets/image/delivery/coupon-icon.svg'
import CouponIconDisabled from '@/assets/image/delivery/coupon-icon-disabled.svg'
export default {
  props: {
    value: {
      type: [String, Object],
    },
    loading: [Boolean,Object]
  },
  data() {
    return {
      CouponIcon,
      CouponIconDisabled
    }
  },
  methods: {
    /** 待选优惠券 */
    onSelectCoupon() {
      this.$emit('select')
    },
    /** 更新优惠券 */
    onUpdateCoupon() {
      this.$emit('update')
    },
  },
}
</script>

<style lang="scss" scoped>
.batch-coupon {
  &-inner {
    display: flex;
    align-items: center;
    & > span {
      margin-left: 5px;
    }
  }
  &-row {
    .font {
      &-purpel {
        color: #8365f6;
      }
      &-gray {
        color: #a6acb5;
      }
    }
  }
}
</style>
