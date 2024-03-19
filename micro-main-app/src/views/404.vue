<template>
  <div>
    <Unusual msg="抱歉，你访问的页面不存在！" :pic="picUrl" />
  </div>
</template>

<script>
import { Unusual } from "@comps"

export default {
  components: {
    Unusual
  },
  data() {
    return {
      picUrl: require("../assets/image/404.svg")
    }
  }
}
</script>
