<template>
  <div class="freight--cell">
    <freight ref="freightDetailRef" is-in-table is-batch :estimateFreight="row.estimateFreight.value || {}" :row="row" :coupon="row.coupon.value || {}" :visibleDiscounted="visibleDiscounted">
      <template #value>
        <span v-if="loading" class="loading-wrapper">
          <i class="el-icon-loading" />
        </span>
        <template v-else-if="row.payWay.value !== '10'">
          暂不支持
        </template>
        <template v-else-if="isHideFreight(row)">
          暂无报价
        </template>
        <template v-else>
          {{ getEstimateTotalFreight(row) }}
        </template>
      </template>
      <template #noValue>
        <template v-if="row.payWay.value !== '10'">
          暂不支持
        </template>
        <template v-else-if="uam_freight_status === 1">权限申请中</template>
        <template v-else-if="!$store.getters.hasFrightFeeAuth">暂无权限</template>
      </template>
      <div style="padding-left:6px" v-show="!isHideFreight(row) && exsitEstmateFreight(row)">明细</div>
      <!-- <i v-show=" !isHideFreight(row) && exsitEstmateFreight(row)" class="iconfont iconcoupon-issue"
         style="color:#9fa1b0"></i> -->
    </freight>
    <el-tooltip class="estimate-freight__tooltip" v-show="!loading && tipWithoutFreight(row)" effect="light" :content="tipWithoutFreight(row)" placement="right" >
      <i class="iconfont iconcoupon-issue" style="color:#9fa1b0"></i>
    </el-tooltip>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
import Freight from '../../components/freight/index'
import commonUtil from '../../utils/commonUtil'

export default {
  components: {
    Freight
  },
  props: {
    row: {
      type: Object
    },
    visibleDiscounted: { type: Boolean },
  },
  setup (props, { root }) {
    const getEstimateTotalFreight = row => {
      const result = commonUtil.getEstimateTotalFreightByRow(row)
      return result
    }

    const loading = computed(() => root.$store.state.delivery.loadingOfBatchFreight)

    const uam_freight_status = computed(() => {
      return Number(window.sessionStorage.getItem('UAM_FREIGHT_STATUS'))
    })

    //是否隐藏运费
    const isHideFreight = row => {
      return row.estimateFreight.value.waybillAmount == 0
    }
    //是否存在运费
    const exsitEstmateFreight = row => {
      return /\d/.test(getEstimateTotalFreight(row))
    }

    const tipWithoutFreight = row => {
      if (row.payWay.value !== '10') {
        return '仅寄方付支持预估运费'
      }
      if (uam_freight_status.value === 1) {
        return ''
      }
      if (!root.$store.getters.hasFrightFeeAuth) {
        return '请先申请权限'
      }
      if (!exsitEstmateFreight(row)) {
        return '请先填写必填项及重量、件数，获取预估费用'
      }
      if (isHideFreight(row)) {
        return '该路线暂无报价，详情可联系商务'
      }
    }

    return {
      loading,
      getEstimateTotalFreight,
      isHideFreight,
      exsitEstmateFreight,
      tipWithoutFreight,
      uam_freight_status
    }
  }
}
</script>

<style lang="scss" scoped>
  .freight--cell {
    display: flex;
    .estimate-freight__tooltip {
      margin-left: auto;
      padding-right: 5px;
      position: relative;
      top: 1px;
    }
  }
</style>
