<template>
  <el-drawer append-to-body custom-class="freight-drawer__container ky-drawer" title="预估运费" :visible.sync="visibleDrawer" direction="rtl" :size="539">
    <freight-detail ref="freightDetailRef" :estimateFreight="estimateFreight" :visibleDiscounted="visibleDiscounted" :row="row" :coupon="coupon" :isBatch="true" :isInTable="isInTable" :detailContent='detailContent' :lessThanLowest='lessThanLowest'/>
  </el-drawer>
</template>

<script>
import { reactive, toRefs, watch } from '@vue/composition-api'
import FreightDetail from './freight-detail'
import useBatchWeightSizeValidate from '@views/delivery/batch/hooks/useBatchWeightSizeValidate'

export default {
  components: {
    FreightDetail,
  },
  props: {
    visible: {
      type: Boolean
    },
    estimateFreight: {
      type: Object
    },
    visibleDiscounted: {
      type: Boolean
    },
    row:{type:Object}, // 批量表格行数据
    coupon: {
      type: Object
    },
    isInTable:{type:Boolean},
    detailContent: { type: String },
    lessThanLowest: { type: Boolean } // 是否存在某单预估运费小于最小运费
  },
  setup (props, { emit }) {
    const { parseSendAndReceiverAddress } = useBatchWeightSizeValidate()
    // const freightDetailRef = ref(null)
    const state = reactive({
      visibleDrawer: false,
    })
    watch(() => props.visible, async flag => {
      state.visibleDrawer = flag
      if(flag && props.row){
        await parseSendAndReceiverAddress(props.row)
      }
      // if(flag){
      //   freightDetailRef.value.freshAddtionalFeeDetails()
      // }
    })
    watch(() => state.visibleDrawer, val => {
      if (!val) {
        emit('update:visible', false)
      }
    })



    return {
      // freightDetailRef,
      ...toRefs(state),
    }
  }
}
</script>

<style lang="scss">
.freight-drawer__container{
  .freight-detail__container{
    .summary.is-column-flex{
      .text .item{
        margin-left:20px;
      }
    }
  }
}
</style>