<template>
  <div>
    <code-list :data-list="dataList"></code-list>
  </div>
</template>

<script>
import CodeList from './code-list'
import { getAllUser } from '@views/Lottery/api/api'

export default {
  name: "user-list" ,
  components: {CodeList} ,
  data() {
    return {
      dataList: [] ,
      pagination: {
        current: 0 ,
        size: 1000
      } ,
      totalNum: 0
    }
  } ,
  mounted() {
    this.handleList()
  } ,
  methods: {
    async handleList() {
      let res = await getAllUser(this.pagination)
      if (res.code === 0 && res.data) {
        this.dataList = res.data.records || []
        this.totalNum = res.data.total
      }
    }
  }
}
</script>

<style scoped>

</style>
