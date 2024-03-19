<template>
  <el-tabs v-model="activeTab" class="ky-tabs" @tab-click="handleTabClick" v-bind="$attrs">
    <slot></slot>
    <el-tab-pane  v-for="(tab,index) in tabsData" :key="index" :label="tab.label" :name="tab.name"/>
  </el-tabs>
</template>

<script>
export default {
  props: {
    value: {
      type: String
    },
    tabsData:{ 
      type:Array,
      validator: function (data) {
        const flag = data.some((d => {
          const keys = Object.keys(d)
          return !keys.includes('label') || !keys.includes('name')
        }))
        if (flag) {
          console.log('tabsData中的所有数据必须都包含label和name属性')
          return false
        }
        return true
      },
    }
  },
  data () {
    return {
      activeTab: this.value
    }
  },
  methods: {
    handleTabClick (tab, e) {
      this.$emit('tab-click',tab,e)
    }
  },
  watch: {
    activeTab (val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
  .ky-tabs {
    /deep/ {
      .el-tabs__header {
        margin-bottom: 20px;
      }
      .el-tabs__nav-wrap::after {
        height: 1px;
        background-color: #f1f1f5;
      }
      .el-tabs__item {
        height: 50px;
        line-height: 50px;
        font-size: 14px;
        font-weight: bold;
        &.is-active {
          color: #8365f6;
        }
      }
      .el-tabs__active-bar {
        height: 4px;
        border-radius: 4px;
      }
    }
  }
</style>