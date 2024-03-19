export default{
  data(){
    return{
      overviewDateRange:[] //当前卡片数据查询的时间段
    }
  },
  watch:{
    overviewDateRange(newVal,oldVal){
      if(oldVal!=newVal){
        this.loadData()
      }
    }
  }
}