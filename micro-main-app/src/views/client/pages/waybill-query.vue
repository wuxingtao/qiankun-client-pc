<template>
  <waybill ref="waybill" :isQueryPage="true" />
</template>

<script>
import Waybill from './waybill.vue'
export default {
  components: { Waybill },
  // watch:{
  //   '$route'(){
  //     this.$refs.waybill.queryData(true,true)
  //   }
  // }
}
</script>

<style>
</style>