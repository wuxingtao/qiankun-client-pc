<template>
  <div style="height:100%">
    <iframe id="question" :src="src" ref="question" width="100%" height="100%" ></iframe>
  </div>
</template>

<script>
import { getToken } from '@/utils/storage'
export default {
  data(){
    return{
      src:''
    }
  },
  async activated () {
    // this.src=this.$route.query.url+'&sourceKey=30&pageKey=300&token='+getToken()
    this.src= this.$route.query.uuid
  },
  methods:{
   
  },

}
</script>