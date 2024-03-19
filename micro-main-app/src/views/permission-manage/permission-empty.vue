<template></template>

<script>
export default {
  name: 'permission-empty',
  created() {
    // this.$router.push({ name: 'permission-manage', params: { 'pageRefresh': true } })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      const params = to.params
      vm.$router.push({ name: 'permission-manage', params })
    })
  }
}
</script>

<style scoped></style>
