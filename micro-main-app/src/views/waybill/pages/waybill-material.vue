<template>
  <ky-page-container
    :title='back.title'
    :showGoBack='back.showGoBack'
    :beforeRoutePath='back.beforeRoutePath'>
    <div class='waybill-material'>
      <section class='waybill-material-filter'>
        <material-filter />
      </section>
      <section class='waybill-material-tabs'>
        <material-panel />
      </section>
    </div>
  </ky-page-container>
</template>
<script>
import { MaterialPanel, MaterialFilter } from '../components/material'

export default {
  components: { MaterialPanel, MaterialFilter },
  data() {
    return {
      back: {
        title: '运单资料',
        showGoBack: true,
        beforeRoutePath: '/admin/waybill-v3'
      },
      tabs: [
        { id: 1, label: '回单联', name: 'receipt' },
        { id: 2, label: '运单联', name: 'report' },
        { id: 3, label: '签收联', name: 'delivery' }
      ]
    }
  }
}
</script>
<style lang='scss' scoped>
.waybill-material {
  display: flex;
  min-width: 1284px;

  &-filter {
    width: 300px;
    box-sizing: border-box;
  }

  &-tabs {
    flex: 1;
    margin-left: 20px;
  }
}
</style>

