<template>
  <div id="xt-main-app" :class="isClientMode?'client-mode':'web-mode'">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
  @import url('//at.alicdn.com/t/font_2361317_73pwjyc0aah.css');
#xt-main-app {
  height: 100%;
}
</style>

