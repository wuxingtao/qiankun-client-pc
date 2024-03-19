<template>
  <tooltip-affect-reason :tipType="tipType" :reasonCode="reasonCode" v-if="reasonCode">
    <template #tip-msg>
      {{ tipMsg }}
    </template>
  </tooltip-affect-reason>
</template>

<script>
import { computed, watch, defineComponent, reactive, toRefs } from '@vue/composition-api'
import TooltipAffectReason from './tooltip-affect-reason.vue'

export default defineComponent({
  props: {
    row: {
      type: Object
    }
  },
  components: {
    TooltipAffectReason
  },
  setup(props) {
    const state = reactive({
      tempTipMsg: ''
    })

    const tipMsg = computed(
      () => props.row._addressRestrictWarningInfo?.msg || props.row._addressRestrictErrorInfo?.msg
    )
    const reasonCode = computed(
      () =>
        props.row._addressRestrictWarningInfo?.reasonCode ||
        props.row._addressRestrictErrorInfo?.reasonCode
    )

    const tipType = computed(() => {
      if (props.row._addressRestrictWarningInfo?.msg) {
        return 'warning'
      } else if (props.row._addressRestrictErrorInfo?.msg) {
        return 'error'
      }
      return ''
    })

    watch(tipMsg, val => {
      state.tempTipMsg = val
    })

    return {
      ...toRefs(state),
      tipMsg,
      tipType,
      reasonCode
    }
  }
})
</script>

<style lang="scss" scoped>
// .cell-tip-address__container {
//   display: inline-block;
//   padding-left: 10px;
//   .info {
//     border-radius: 2px;
//     padding: 4px 6px;
//     color: white;
//     & > i {
//       padding-right: 4px;
//     }
//   }
//   .address-tip {
//     @extend .info;
//     background: $--color-warning;
//   }
//   .address-restrict {
//     @extend .info;
//     background: #ff7374;
//   }
// }
</style>