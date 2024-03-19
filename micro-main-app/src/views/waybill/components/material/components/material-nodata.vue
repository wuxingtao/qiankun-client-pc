<template>
  <div class='material-nodata'>
    <section class='material-nodata-image'>
      <img src='./nodata.png' />
    </section>
    <section class='material-nodata-text'>{{ text }}</section>
  </div>
</template>

<script>

import { receiptFlag } from "@/views/waybill/enum/receiptFlagEnum"

export default {
  name: "material-nodata",
  props: {
    feedbackType: String
  },
  computed: {
    text() {
      switch (this.feedbackType) {
        case receiptFlag.NONE:
          return "您未选择回单服务，暂无回单"
        case receiptFlag.IMAGE:
          return "暂无回单"
        default:
          return "暂无数据"
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.material-nodata {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>