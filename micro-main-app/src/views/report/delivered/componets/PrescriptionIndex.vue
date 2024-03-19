<template>
  <div class="weight-index-container">
    <return style="background-color:white">时效内妥投分析</return>
    <el-tabs v-model="activeTab" class="tab-wrapper" @tab-click="handleClick">
      <el-tab-pane label="产品服务" name="1">
        <product-service  category="省份" datatype="1" ref="table1"/>
      </el-tab-pane>
      <el-tab-pane label="省份" name="2">
        <whole-table  category="省份" datatype="1" ref="table2"/>
      </el-tab-pane>
      <el-tab-pane label="城市" name="3">
        <whole-table  category="城市" datatype="1" ref="table3"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Return from '../../components/Return'
import WholeTable from './WholeTable'
import ProductService from './ProductService'

export default {
  components: { Return, WholeTable,ProductService },
  data () {
    return {
      activeTab: "1",
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    }
  },
  methods:{
    handleClick(tabs,event){
      this.$nextTick(() => {
        this.$refs[`table${tabs.name}`].doLayout()
      
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .weight-index-container {
    height: 100%;
    background-color: white;
    font-size: 14px;
    color: #333333;
 @import "../../scss/index.scss";
  }
</style>