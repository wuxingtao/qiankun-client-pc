<template>
  <div class="weight-index-container">
    <return style="background-color:white">货物重量</return>
    <el-tabs v-model="activeTab" class="tab-wrapper">
      <el-tab-pane label="省份" name="1">
        <weight-table category="省份"/>
      </el-tab-pane>
      <el-tab-pane label="城市" name="2">
        <weight-table category="城市"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Return from '../components/Return.vue'
import WeightTable from './components/WeightTable.vue'
export default {
  components: { Return, WeightTable },
  data () {
    return {
      activeTab: "1", 
    }
  },
  activated(){
    this.activeTab="1"
  }
}
</script>

<style lang="scss" scoped>
  .weight-index-container {
    height: 100%;
    background-color: white;
    font-size: 14px;
    color: #333333;
 @import "../scss/index.scss";
  }
</style>