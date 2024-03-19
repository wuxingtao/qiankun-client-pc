<template>
  <div class="mix-line-bar">
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from "../../mixins/resize"

export default {
  mixins: [resize],
  props: ['option'],
  data() {
    return {
      chart: null
    }
  },
  watch: {
    option: {
      handler() {
        if (!this.option) return
        if (this.chart) {
          this.chart.clear()
        }
        this.chart = echarts.init(this.$refs.chart)
        this.chart.setOption(this.option)
      }
    },
    immediate: true
  }
}
</script>

<style lang="scss" scoped>
.mix-line-bar {
  height: 100%;

  .chart {
    height: 100%;
  }
}
</style>