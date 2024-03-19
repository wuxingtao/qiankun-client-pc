<template>
  <div :class="['freight-detail--conatiner', isInTable ? 'batch-table' : '']">
  <template v-if='$store.getters.hasFrightFeeAuth'>
    <div class='freight--wrapper'>
      <slot name='value'>
        <span>{{ isBatch ? "总" : "" }}预估费用:</span>
        <span v-show='loading' class='loading-wrapper'>
            <i class='el-icon-loading' />加载中
          </span>
        <span v-show='!loading'>
            <template v-if='estimateFreight.waybillAmount == 0'> 暂无报价 </template>
            <template v-else>
              <el-popover
                popper-class='freight-notice-popper'
                placement='top-start'
                trigger='manual'
                v-model='visibleLowestFreight'
                :popper-options="{ boundariesElement: 'body', gpuAcceleration: true }">
                <span class='freight-notice'>
                  <i class='iconfont icon-warn'></i>
                  {{ freightNotice.popperContent }}
                  <i class='iconfont icon-btn-icon' @click='visibleLowestFreight = false'></i>
                </span>
                <span slot='reference'>￥{{ estimateTotalFreight }}</span>
              </el-popover>
            </template>
          </span>
      </slot>
      <slot name='value-icon' />
      <el-popover v-if='!isBatch' :placement="popoverPlacement || (isInTable ? 'right' : 'top')" width='494'
                  v-model='visiblePopover' :trigger="isInTable ? 'hover' : 'click'"
                  popper-class='freight-detail--popper' ref='popoverRef'
                  :popper-options="{ boundariesElement: 'viewport', gpuAcceleration: true }" :close-delay='100'
                  :open-delay='100' @show='handlePopoverVisible(true)' @hide='handlePopoverVisible(false)'>
        <div class='freight-detail-popper--container'>
          <header class='freight-detail-popper--header'>
            <i class='el-icon-close' @click='visiblePopover = false' />
          </header>
          <freight-detail ref='freightDetailRef' :estimateFreight='estimateFreight'
                          :visibleDiscounted='visibleDiscounted' :detailContent='freightNotice.detailContent'
                          :coupon='coupon' :isBatch='isBatch' :isInTable='isInTable'
                          @height-change='handleHightChange' />
        </div>
        <el-link slot='reference' type='primary' :underline='false' style='font-size: 12px'
                 @click='visibleLowestFreight = false'>
          <slot>
            <template v-if='showDetailText()'>
              明细
              <i class='iconfont icon-arrow-down3' :class="{ 'is-reverse': visibleDetail }" />
            </template>
          </slot>
        </el-link>
      </el-popover>
      <el-link v-else type='primary' class='freight-table__link' :underline='false' style='font-size: 12px'
               @click='toggleVisibleDrawer'>
        <slot>
          <template v-if='showDetailText()'>
            明细
            <i class='iconfont icon-arrow-down3' :class="{ 'is-reverse': visibleDetail }" />
          </template>
        </slot>
      </el-link>
    </div>
    <div class='freight-desc' v-if='!isInTable && visibleDescription'>
      <slot name='description'>
        {{ defaultDescription }}
      </slot>
    </div>
  </template>
  <template v-else>
    <div class='freight--no-auth' v-if='showNoAuth'>
      <div class='freight--wrapper'>
        <slot name='noValue'>
          <span class='fs_20 no-wrap'>{{ isBatch ? "总" : "" }}预估费用:</span>
          <span v-show='loading' class='loading-wrapper'>
              <i class='el-icon-loading' />加载中
            </span>
          <span v-show='!loading'> </span>
          <span class='encry-text'>***</span>
          <span class='freight-apply-tip' v-if='freightApplyInfo.status'>{{ freightApplyInfo.tip }}</span>
          <el-button type='text' size='mini' @click='handleApplyAuth' v-else>
            <i class='iconfont iconedit fs_12--strict'></i>
            <span class='ml_4'>申请查看</span>
          </el-button>
        </slot>
      </div>
    </div>
    <freight-dialog @handleCheckFreight='handleCheckFreight' ref='freightDialogRef' />
  </template>
  <freight-drawer :visible.sync='visibleDrawer' :estimateFreight='estimateFreight'
                  :visibleDiscounted='visibleDiscounted'
                  :detailContent='drawerNotice.detailContent' :lessThanLowest='drawerNotice.lessThanLowest'
                  :coupon='coupon' :row='row' :isInTable='isInTable' />
  </div>
</template>

<script>
import commonUtil from "../../utils/commonUtil.js"
import { computed, ref, watch, nextTick, reactive, onMounted, toRefs } from "@vue/composition-api"
import numeral from "numeral"
import deliveryApi from "@/services/api/delivery"
import FreightDetail from "./freight-detail"
import FreightDrawer from "./freight-drawer"
import { getLowestContent } from "@/views/delivery/utils/lowestPrice"

export default {
  props: {
    estimateFreight: { type: Object, default: () => ({}) },
    row: { type: Object }, // 批量表格行数据
    isInTable: { type: Boolean }, //是否是在表格中
    isBatch: { type: Boolean }, //是否是批量
    isInDialog: { type: Boolean }, // 是否在弹窗中显示
    coupon: { type: Object, default: () => ({}) },
    visibleDiscounted: { type: Boolean, default: true },
    visibleDescription: { type: Boolean, default: true },
    popoverPlacement: { type: String },
    loading: { type: Boolean },
  },
  components: {
    "freight-dialog": () => import("./freight-dialog"),
    FreightDetail,
    FreightDrawer
  },
  
  setup(props, { root }) {
    
    const popoverRef = ref(null)
    const freightDetailRef = ref(null)
    const freightDialogRef = ref(null)
    const state = reactive({
      visibleDrawer: false,
      visiblePopover: false,
      visibleDetail: false,
      lastNoticeType: "",
      visibleLowestFreight: false
    })
    const freightApplyInfo = reactive({
      tip: "",
      status: "", // 0-未申请 1-审核中 2-申请驳回 3-申请成功
      applyTime: "" // 申请时间
    })
    const freightNotice = reactive({
      popperContent: "",
      detailContent: ""
    })
    
    const drawerNotice = reactive({
      detailContent: "",
      lessThanLowest: false
    })
    
    const hasFrightFeeAuth = computed(() => {
      return root.$store.getters.hasFrightFeeAuth
    })
    
    const showNoAuth = computed(() => {
      return props.isInTable || /0|1/.test(freightApplyInfo.status)
    })
    const showDetailText = () => {
      return !props.loading && props.estimateFreight.waybillAmount != 0 &&
        Number(props.estimateFreight.totalAmount) > 0
    }
    
    onMounted(() => {
      if (!props.isInTable && !hasFrightFeeAuth.value) {
        handleCheckFreight()
      }
    })
    
    watch(
      () => props.loading,
      flag => {
        if (flag && state.visiblePopover) {
          state.visiblePopover = false
        }
      }
    )
    
    watch(() => root.$store.state.delivery.currentDeliveryPage,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          state.visibleLowestFreight = false
        }
      }
    )
    
    watch(
      () => props.estimateFreight,
      newVal => {
        if (props.isInDialog) return
        const { singleLowestAmount, lowestBatchCharge, waybillAmount, lessThanLowest } = newVal
        if (!waybillAmount && !singleLowestAmount && !lowestBatchCharge) {
          state.lastNoticeType = ""
          state.visibleLowestFreight = false
          return
        }
        const {
          noticeType,
          popperContent,
          detailContent
        } = getLowestContent(Number(singleLowestAmount), Number(lowestBatchCharge), waybillAmount, props.isBatch, lessThanLowest)
        freightNotice.popperContent = popperContent
        freightNotice.detailContent = detailContent
        freightNotice.lessThanLowest = lessThanLowest
        if (state.lastNoticeType !== noticeType) {
          state.lastNoticeType = noticeType
          state.visibleLowestFreight = !!popperContent
        }
      }
    )
    
    const handleHightChange = () => {
      nextTick(() => {
        popoverRef.value.updatePopper()
      })
    }
    
    const defaultDescription = computed(() => {
      if (props.estimateFreight?.waybillAmount === 0) {
        return "该路线暂无报价，详情可联系商务"
      }
      return "以上运费仅供参考，实际运费以最终运费为准"
    })
    
    const estimateTotalFreight = computed(() => {
      if (!root.$store.getters.hasFrightFeeAuth || !props.estimateFreight) {
        return "--"
      }
      const afterDiscountAmount = props.estimateFreight.afterDiscountAmount
      /** 表格内编辑的预估运费 */
      if (afterDiscountAmount && afterDiscountAmount > 0 && props.isBatch) {
        return formatValue(afterDiscountAmount)
      }
      
      const result = commonUtil.getEstimateTotalFreight(props.coupon, props.estimateFreight)
      if (props.coupon) {
        // eslint-disable-next-line vue/no-mutating-props
        props.coupon.afterDiscountAmount = result
      }
      return result
    })
    
    const handlePopoverVisible = flag => {
      state.visibleDetail = flag
      // if (flag) {
      //   freightDetailRef.value.freshAddtionalFeeDetails()
      // }
    }
    
    /** 运单运费, 增值费用格式化处理  */
    const formatValue = val => {
      return val ? numeral(val).format("0,0.00") : "0"
    }
    
    function handleApplyAuth() {
      freightDialogRef.value.showDialog()
    }
    
    async function handleCheckFreight() {
      let res = await deliveryApi.freightApplyCheck()
      if (res.code === 0 && res.data) {
        window.sessionStorage.setItem("UAM_FREIGHT_STATUS", res.data.status)
        Object.assign(freightApplyInfo, {
          ...res.data,
          tip: res.data.status !== 0 ? `您于${res.data.applyTime}已申请，如需加急处理请联系商务。` : "",
        })
      }
    }
    
    const toggleVisibleDrawer = () => {
      // 抽屉中值的修正
      const { singleLowestAmount, lowestBatchCharge, waybillAmount, lessThanLowest } = props.estimateFreight
      if (!waybillAmount && !singleLowestAmount && !lowestBatchCharge) return
      const {
        detailContent
      } = getLowestContent(Number(singleLowestAmount), Number(lowestBatchCharge), waybillAmount, props.isBatch, lessThanLowest)
      drawerNotice.detailContent = detailContent
      drawerNotice.lessThanLowest = lessThanLowest
      
      // state.visibleLowestFreight = false
      state.visibleDrawer = !state.visibleDrawer
    }
    
    
    return {
      ...toRefs(state),
      showNoAuth,
      popoverRef,
      freightDetailRef,
      freightDialogRef,
      freightApplyInfo,
      defaultDescription,
      estimateTotalFreight,
      handlePopoverVisible,
      formatValue,
      handleApplyAuth,
      handleCheckFreight,
      handleHightChange,
      showDetailText,
      freightNotice,
      drawerNotice,
      toggleVisibleDrawer
    }
  }
}
</script>

<style lang='scss'>
.freight-detail--popper {
  width: unset !important;
  min-width: 820px !important;
  // position: relative;
  padding: 0px !important;
  box-sizing: border-box;
  border-top: 1px solid #fff;
  
  .freight-detail-popper--container {
    padding-bottom: 20px;
    
    .freight-detail-popper--header {
      height: 36px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      display: flex;
      align-items: center;
      
      .el-icon-close {
        margin-left: auto;
        margin-right: 20px;
        cursor: pointer;
      }
    }
    
    .freight-detail__container {
      padding: 0 20px;
      max-height: calc(100vh - 125px);
      overflow-y: auto;
    }
  }
  
  // &::before {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   content: '';
  //   width: 100%;
  //   height: 46px;
  //   background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
  // }
}

.freight-notice-popper {
  height: 28px;
  top: 12px;
  background: #fef6e2;
  border: 1px solid #ffba93;
  border-radius: 4px;
  padding: 0;
  color: #ff8038;
  box-shadow: 0px 6px 16px 0px rgba(0, 0, 0, 0.08);
  
  .popper__arrow {
    border-top-color: #ffba93 !important;
    
    &::after {
      border-top-color: #fef6e2 !important;
    }
  }
}
</style>

<style lang='scss' scoped>
.freight-detail--conatiner {
  &.batch-table {
    flex: 1;
  }
  
  .freight--wrapper {
    color: #424242;
    display: flex;
    align-items: center;
    
    & > span {
      font-weight: bold;
      font-size: 16px;
      color: #ff7374;
      padding-right: 4px;
      
      &:first-of-type {
        color: #333333;
      }
      
      &:last-of-type {
        margin-left: auto;
        
        .icon-arrow-down3 {
          font-size: 12px;
          position: relative;
          top: 0px;
          
          &.is-reverse {
            top: 0px;
            position: relative;
            display: inline-block;
            transform: rotateX(180deg);
            // transition: transform .3s;
          }
        }
      }
    }
    
    .freight-table__link {
      flex: 1;
      
      /deep/ .el-link--inner {
        margin-left: auto;
        
        & > i {
          font-size: 13px;
        }
      }
    }
    
    .loading-wrapper {
      font-size: 12px;
      color: #999999;
      font-weight: 400;
      line-height: 26px;
      height: 21px;
      display: inline-block;
      
      & > i {
        margin-right: 4px;
      }
    }
  }
  
  .freight-desc {
    margin-top: 8px;
    font-size: 12px;
    color: #999999;
    line-height: 12px;
  }
  
  .freight--no-auth {
    .encry-text {
      font-size: 20px;
      font-weight: 500;
      text-align: left;
      color: #ff706d;
      padding-right: 12px;
      padding-top: 3px;
    }
    
    .freight-apply-tip {
      color: #8f8fa8;
      font-size: 12px;
      font-weight: 400;
    }
    
    .no-wrap {
      white-space: nowrap;
    }
  }
}

.freight-notice {
  font-size: 12px;
  line-height: 28px;
  padding: 0 32px 0 8px;
  overflow: hidden;
  
  .icon-warn {
    vertical-align: baseline;
  }
  
  .icon-btn-icon {
    float: right;
    margin-right: 8px;
    
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
