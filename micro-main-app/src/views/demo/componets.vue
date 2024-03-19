<template>
  <ky-page-container title="组件示例" >
    <ky-tabs v-model="activeTab"  >
      <el-tab-pane label="用户管理" name="first">
         
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    </ky-tabs>
  </ky-page-container>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'

export default { 
  setup () {
    const state = reactive({
      activeTab : 'first',
    })

    return{
      ...toRefs(state)
    }
  }
}
</script>

<style>
</style>