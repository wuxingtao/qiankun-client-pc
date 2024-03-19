<template>
  <div class='tabs-container'>
    <div class='tab-item-wrap' v-for='(item, index) in tabs' :key='index'>
      <div class='tab-item' :class='{active:activeTab === index}' @click='handleTabClick(index)'>{{ item.title
        }}{{ count[item.count] | formatSummaryCount }}
      </div>
    </div>
  </div>
</template>

<script>
import { ticketStatus } from '../enum/couponEnum'

export default {
  name: 'tabbar',
  props: {
    count: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      tabs: [
        {
          title: '未使用',
          count: 'unusedCount',
          status: ticketStatus.UNUSED
        },
        {
          title: '使用中',
          count: 'inUseCount',
          status: ticketStatus.IN_USE
        },
        {
          title: '已使用',
          count: 'hasBeenUsedCount',
          status: ticketStatus.HAS_BEEN_USED
        },
        {
          title: '已过期',
          count: 'expiredCount',
          status: ticketStatus.EXPIRED
        }
      ],
      activeTab: 0
    }
  },
  filters: {
    formatSummaryCount(count) {
      count = Number(count)
      if (!count) {
        return ''
      }
      return `(${count})`
    }
  },
  methods: {
    async handleTabClick(tabIndex) {
      this.activeTab = tabIndex
      this.$emit('tab-change', this.tabs[tabIndex].status, this.tabs[tabIndex].count)
    }
  }
}
</script>

<style lang='scss' scoped>
.tabs-container {
  display: flex;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #f1f1f5;

  .icon-tabs {
    padding-right: 3px;
  }

  .tab-item-wrap {
    display: flex;
    justify-content: center;
    margin-right: 40px;
  }

  .tab-item {
    font-size: 15px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: bold;
    color: $--color-text-primary;
    height: 100%;
    user-select: none;
    cursor: pointer;

    &.active {
      color: #7c57df;
      position: relative;

      &::after {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        height: 3px;
        width: 100%;
        background: #7c57df;
        border-radius: 2px;
      }
    }
  }
}
</style>