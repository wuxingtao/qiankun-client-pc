<template>
  <div style="height:100%">
    <iframe id="message-center" X-Frame-Options="sameorigin" :src="src" ref="message-center" width="100%" height="100%" ></iframe>
  </div>
</template>

<script>
export default {
  name: 'message-center',
  data() {
    return {
      src: ''
    }
  },

  activated(){
    const { url } = this.$route.query
    if (url&&url.includes('http')>0) {
      this.src = url
    }
  }
  
}
</script>