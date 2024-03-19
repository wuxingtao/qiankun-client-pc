<template>
  <div class='external-page-container'>
    <iframe :src='url'></iframe>
  </div>
</template>

<script>
export default {
  name: "OutsidePage",
  data() {
    return {
      url: ""
    }
  },
  mounted() {
    const { url } = this.$route.params
    console.log(url, 123123)
    if (!url) {
      this.$router.push("/admin/waybill-v3")
    } else {
      this.url = url
    }
  }
}
</script>

<style lang='scss' scoped>
.external-page-container {
  height: 100%;
  
  iframe {
    border: none;
    height: 100%;
    width: 100%;
  }
}
</style>