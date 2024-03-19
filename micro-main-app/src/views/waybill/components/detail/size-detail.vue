<template>
    <ky-dialog :visible.sync="sizeDetailVisible" class="waybill-size" width="820px" title="尺寸详情">

    </ky-dialog>
</template>

<script>
export default {
  name:'size-detail',

  props:{
    sizeDetailVisible: {
      type: Boolean,
      default: false
    }
  },
  
  data(){

  }
}
</script>

<style lang="scss" scoped>
  .waybill-size{

  }
</style>