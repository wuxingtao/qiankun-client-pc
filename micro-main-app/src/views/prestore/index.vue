<template>
  <ky-page-container class="prestore-container" title="我的预存">
    <el-header height="null" class="display-values">
      <list-card></list-card>
    </el-header>
    <el-main class="tabs-wrapper">
      <el-container style="height: 100%;background: #fff;border-radius: 4px;">
        <el-header height="null" style="padding: 0 0 1px 0;border-radius: 4px;position: relative;margin:0 20px;">
          <ky-tabs v-model="activeName" :tabsData="tabData" />
        </el-header>
        <el-main style="padding: 0 20px 5px 20px;border-radius: 5px;">
          <keep-alive>
            <component :is="activeName"></component>
          </keep-alive>
        </el-main>
      </el-container>
    </el-main>
  </ky-page-container>
</template>

<script>
import { ListCard, ListRecharge, ListConsumption } from './components'
import KyTabsR from '@/components/ky-tabs-r/index.vue'
export default {
  data () {
    return {
      tabData: [
        { id: 1, label: '充值明细', name: 'ListRecharge' },
        { id: 2, label: '消费明细', name: 'ListConsumption' }
      ],
      activeName: 'ListRecharge'
    }
  },
  components: {
    ListCard,
    ListRecharge,
    ListConsumption,
    KyTabsR
  }
}
</script>

<style lang="scss" scoped>
  .prestore-container {
    background: #f5f6fb;
    &.ky-page-container {
      padding: 0;
      /deep/.page-header-wrapper {
        background: white;
        .ky-page-header {
          margin: 0 20px;
          background: white;
        }
      }
    }
    .display-values {
      padding: 20px 60px 0 0;
      border-radius: 4px;
      background: white;
    }
    .tabs-wrapper {
      padding: 15px 0 0 0;
      /deep/.ky-tabs .el-tabs__header {
        margin: 0;
      }
    }
  }
</style>