<template>
  <ky-page-container styleName="new" class="adjust-price-notice__container" title="调价通知">
    <weight/>
    <adjust-price-dialog ref="adjustPriceDialogRef"/>
  </ky-page-container>
</template>

<script>
import Weight from './components/weight.vue'
import AdjustPriceDialog from './adjust-price-dialog'
import { ref } from '@vue/composition-api'

export default {
  components:{
    Weight,
    AdjustPriceDialog
  },
  setup(props, { root }) {
    const adjustPriceDialogRef = ref(null)
    setTimeout(() => {
      adjustPriceDialogRef.value.showDialog()
    },2000)
    return{
      adjustPriceDialogRef
    }
  }
}
</script>

<style lang='scss' scoped>
.adjust-price-notice__container {
  /deep/ .content-wrapper{
     width: 600px;
   }
}
</style>
