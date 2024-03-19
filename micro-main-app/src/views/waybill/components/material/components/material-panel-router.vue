<template>
  <div class="material-panel-router" v-loading="loading">
    <section class="material-panel-router-map">
      <netc-route-map :routeData="route" />
    </section>
    <section class="material-panel-router-line">
      <material-panel-router-line :routeNodeVos="(route && route.routeNodeVos) || []" />
    </section>
  </div>
</template>
<script>
import NetcRouteMap from '../../netc-route-map'
import MaterialPanelRouterLine from './material-panel-router-line'
export default {
  components: {
    NetcRouteMap,
    MaterialPanelRouterLine,
  },
  data() {
    return {
      routeData: null,
      loading: false,
    }
  },
  computed: {
    route() {
      return this.$store.state.material.waybillRoute
    }
  }
}
</script>
<style lang="scss">
@import '../style.scss';
</style>
