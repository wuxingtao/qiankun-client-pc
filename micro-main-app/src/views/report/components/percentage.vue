<template>
  <div class="percentage-container">
    <div class="content" :style="{'height':foreHeight}">
      <div class="container" :style="{'background': backColorVue,'height':backHeight,'width':'100%','top':'1px'}">
      </div>
      <div class="container" :style="{'background':foreColorVue,'height':foreHeight,'width':foreWidth}"></div>
    </div>
  </div>

</template>

<script>
export default {
  props: ['backcolor', 'foreColor', 'height', 'percentageValue'],
  computed: {
    backColorVue () {
      return this.backcolor || '#DBDFF1'
    },
    backHeight () {
      return this.height || '3px'
    },
    foreColorVue () {
      return this.foreColor || 'linear-gradient(90deg,#ffc979 1%, #ffb079)'
    },
    foreWidth () {
      return this.$formatNumber(this.percentageValue * 100,0) + '%'
    },
    foreHeight () {
      return parseInt(this.backHeight) + 2 + 'px'
    }
  }

}
</script>

<style lang="scss" scoped>
  .percentage-container {
    .content {
      position: relative;
      padding: 0;
      .container {
        border-radius: 3px;
        position: absolute;
        top: 0;
      }
    }
  }
</style>