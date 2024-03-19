<template>
  <div class="express-index-container">
    <return style="background-color:white">产品服务</return>
    <el-tabs v-model="activeTab" class="tab-wrapper">
      <el-tab-pane label="我发出的" name="1">
        <express-service-table :expressType="0" ref="table1"/>
      </el-tab-pane>
      <el-tab-pane label="我收到的" name="2">
        <express-service-table :expressType="1" ref="table2"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Return from '../components/Return.vue'
import ExpressServiceTable from './components/ExpressServiceTable'
export default {
  components: { Return, ExpressServiceTable },
  data () {
    return {
      activeTab: "1",
    }
  },
  activated(){
    this.activeTab="1"
  },
  watch:{
    activeTab(val){
      this.$nextTick(()=>this.$refs['table'+val].doLayout())
    }
  }
}
</script>

<style lang="scss" scoped>
  .express-index-container {
    height: 100%;
    background-color: white;
    font-size: 14px;
    color: #333333;
 @import "../scss/index.scss";
  }
</style>