<template>
  <div class='tabs-container'>
    <!-- v-if="! $store.state.app.isRealNameVerified" -->
    <notice-item class='notice'
                 v-show='false'>
      <span class='item'>按照《邮件快件实名收寄管理办法》要求，您填写的寄件人姓名需要与您所提供的实名信息一致。</span>
      <span class='to-verify-real-name'
            @click="$router.push('/admin/real-name-verify')">去实名认证<i class='el-icon-arrow-right'></i>
      </span>
    </notice-item>
    <el-tabs class='tabs'
             v-model='activeTab'
             type='card'
             closable
             @tab-remove='removeTab'
             @tab-click='clickTab'>
      <el-tab-pane v-for='tab in openTabs'
                   :key='tab.index'
                   :label='tab.title'
                   :name='tab.index'></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
const TAB_LIST = [
  // { index: '1', title: '运单管理', basePath: '/admin/waybill' },
  // { index: '2', title: '下单寄件', basePath: '/admin/order' },
  { index: "3", title: "时效运费查询", basePath: "/admin/query" },
  { index: "4", title: "我的账单", basePath: "/admin/bill" },
  // { index: '5', title: '统计报表', basePath: '/admin/report' },
  { index: "6", title: "地址簿", basePath: "/admin/address" },
  { index: "7", title: "打印设置", basePath: "/admin/print" },
  { index: "8", title: "个人中心", basePath: "/admin/user" },
  { index: "9", title: "默认设置", basePath: "/admin/setting" },
  { index: "10", title: "个性化模板设置", basePath: "/admin/batch-template" },
  { index: "11", title: "实名认证", basePath: "/admin/real-name-verify" },
  { index: "12", title: "运单跟踪", basePath: "/admin/search-waybill" },
  { index: "13", title: "我的优惠券", basePath: "/admin/coupon" },
  { index: "14", title: "国际会展", basePath: "/admin/exhibition-waybills" },
  { index: "15", title: "问卷调查", basePath: "/admin/question-naire" },
  { index: "16", title: "电子发票", basePath: "/admin/electronic-invoice" },
  { index: "17", title: "国际会展", basePath: "/admin/exhibition-waybills" },
  { index: "18", title: "预存报价查询", basePath: "/admin/customer" },
  { index: "19", title: "供应商信息", basePath: "/supplier/index" },
  { index: "19", title: "供应商信息", basePath: "/supplier/detail" },
  { index: "20", title: "SKU库", basePath: "/supplier/sku" },
  { index: "21", title: "供应商下单", basePath: "/supplier/allocation" },
  { index: "22", title: "汇总报表", basePath: "/admin/total-totals" },
  { index: "23", title: "明细报表", basePath: "/admin/total-list" },
  // { index: '22', title: '我的预存', basePath: '/admin/prestore' },
  // { index: '23', title: '我的报价', basePath: '/admin/quotation' },
  { index: "24", title: "功能反馈", basePath: "/admin/function-feedback" },
  { index: "25", title: "数据看板", basePath: "/admin/total-show" },
  { index: "26", title: "问卷调查", basePath: "/admin/survey" },
  { index: "27", title: "操作日志", basePath: "/admin/encrypt-records" },
  { index: "28", title: "问卷调查", basePath: "/admin/result" },
  { index: "29", title: "问卷调查", basePath: "/admin/status" },
  { index: "32", title: "运单查询", basePath: "/admin/waybill-v3" },
  { index: "30", title: "下单寄件", basePath: "/admin/delivery" },
  { index: "31", title: "查看运单资料", basePath: "/admin/waybill-detail-material" },
  { index: "33", title: "权限管理", basePath: "/admin/permission-manage" },
  { index: "35", title: "付款授权", basePath: "/admin/payment-authorization" },
  { index: "34", title: "本人签收", basePath: "/admin/self-sign" },
  { index: "41", title: "派送偏好", basePath: "/admin/preference-delivery" },
  { index: "99", title: "整车寄件", basePath: "/admin/vtsOrder" },
  { index: "100", title: "整车运单", basePath: "/admin/vtsWaybill" },
  // { index: "42", title: "外部页面", basePath: "/admin/outside-page" },
  { index: "42", title: "用户消息中心", basePath: "/admin/message-center" },
  { index: "43", title: "调价通知", basePath: "/admin/adjust-price-notice" },
  { index: "404", title: "页面不存在", basePath: "/admin/error" },
  { index: '1000', title: 'vue-micro', basePath: '/admin/vue' },
  { index: '1001', title: 'vue-micro-list', basePath: '/admin/vue/slot' },
]

const NEVER_FRESH = [
  "online-settlement",
  "outside-page"
]

import NoticeItem from "@/components/NoticeItem"
import addressStorage from "@comps/ky-address/utils/addressStorage"
import { mapGetters } from "vuex"

export default {
  components: {
    NoticeItem
  },
  data() {
    return {
      openTabs: [],
      activeTab: ""
    }
  },
  mounted() {
    this.updateTab(this.$route)
  },
  watch: {
    // 监听路由变化，激活对应tab
    $route(to) {
      this.updateTab(to)
    },
    openTabs: {
      handler(newVal) {
        this.$store.commit("SET_OPEN_TABS", this.openTabs)
        this.$emit("openTabsChange", newVal)
      },
      // immediate: true
    },
    permissionMenuAble: {
      handler(val) {
        if (!val) {
          const tabIndex = this.openTabs.filter(item => item.title === "权限管理")[0]?.index
          if (tabIndex) {
            this.removeTab(tabIndex)
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    // 根据路由更新tab
    updateTab(route) {
      const { path, query, params, redirectedFrom } = route
      for (let tab of TAB_LIST) {
        // 处理重定向  redirectedFrom
        if (
          path.startsWith(tab.basePath) ||
          (redirectedFrom && redirectedFrom.startsWith(tab.basePath))
        ) {
          let index = -1
          for (let i = 0; i < this.openTabs.length; i++) {
            if (tab.index == this.openTabs[i].index) {
              index = i
              break
            }
          }
          if (index === -1) {
            // 未打开则创建
            this.openTabs.push({ path, query, ...tab })
          } else {
            // 已打开则更新
            if (!NEVER_FRESH.includes(this.$route.name)) {
              this.openTabs[index] = { path, query, ...tab }
            }
          }
          // 激活
          this.activeTab = tab.index
        }
      }
      if (params.closeTab === "1") {
        this.removeTab(1)
      }
    },

    // 点击tab
    clickTab() {
      let openTab = this.getOpenTab("index", this.activeTab)
      if (openTab.path != this.$route.path) {
        const { path, query } = openTab
        this.$router.push({ path, query })
      }
    },

    // 获取指定的tab对象
    getOpenTab(key, value) {
      for (let tab of this.openTabs) {
        if (tab[key] == value) {
          return tab
        }
      }
      return
    },

    // 关闭tab
    removeTab(index) {
      // 至少保留一个
      if (this.openTabs.length <= 1) return

      for (let i = 0; i < this.openTabs.length; i++) {
        let tab = this.openTabs[i]
        if (tab.index == index) {
          // 若关闭当前激活页签，关闭后需要激活另一个tab
          if (index == this.activeTab) {
            let activeIndex = i < this.openTabs.length - 1 ? i + 1 : i - 1
            this.activeTab = this.openTabs[activeIndex].index
          }
          // 清除页面地址提醒记录
          addressStorage.deleteOne(tab.basePath)
          // 删除当前tab
          this.openTabs.splice(i, 1)
          this.clickTab()
          return
        }
      }

    }
  },
  computed: {
    ...mapGetters("permission", ["permissionMenuAble"])
  }
}
</script>


<style lang='scss' scoped>
.tabs-container {
  position: relative;

  .notice {
    position: absolute;
    top: 35px;
    left: 184px;
    right: 184px;
    min-width: 740px;
    z-index: 99;

    .to-verify-real-name {
      color: #8365f6;
      padding-left: 9px;
      white-space: nowrap;
      cursor: pointer;

      .el-icon-arrow-right {
        padding-left: 9px;
      }
    }
  }

  .tabs {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 28px;
    overflow: hidden;

    /deep/ .el-tabs__header {
      margin: 0;
      background-color: #dddaf9;
    }

    /deep/ .el-tabs__item {
      height: 28px;
      line-height: 28px;
      color: #666666;
      font-weight: normal;
      font-size: $--font-size-base;
    }

    /deep/ .el-tabs__item.is-active {
      background-color: #fdfdfd;
      color: #333333;
      border-radius: 4px 4px 0 0;
    }
  }

  /deep/ {
    .el-tabs__nav-prev,
    .el-tabs__nav-next {
      line-height: 28px;
    }
  }
}
</style>
