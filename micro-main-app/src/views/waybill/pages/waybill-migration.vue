<template>
  <ky-page-container
    :title="back.title"
    :showGoBack="back.showGoBack"
    :beforeRoutePath="back.beforeRoutePath">
    <div class="waybill-migration">
      <migration-table ref="migrationTable" />
    </div>
  </ky-page-container>
</template>
<script>
import { MigrationTable } from '../components/migration'
export default {
  components: {   MigrationTable},
  data() {
    return {
      back: {
        title: '待完善运单',
        showGoBack: true,
        beforeRoutePath: '/admin/waybill-v3',
      },
    }
  },
  mounted() {
    this.$store.dispatch('common/setServiceWayDictAction')
  },
  methods: {
    onGoBack() {
      this.$refs.migrationTable.goBack()
    },
  }
}
</script>

