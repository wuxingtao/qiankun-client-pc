<template>
  <div class='delivery--container'>
    <div class='template-tip' v-show='$store.state.delivery.importTemplateUpdateFlag'>
      <div class='template-tip--left'>
        <i class='iconfont icon-check' /> 导入成功，2022/05/20起旧模板将不再支持使用。为避免影响您下单，请尽快更新模板
        <el-button class='ky-button-secondary' size='mini' @click='downloadExcelTemplate'>下载模板</el-button>
      </div>
      <i class='iconfont icon-close' @click="$store.commit('delivery/setImportTemplateUpdateFlag',false)" />
    </div>
    <div class='nav' v-show="activeTabName === 'batch' && batchPage">
      <span @click='handleGoback'>
        <svg-icon icon-class='icon-return' class-name='icon-return' />
        {{ batchPage === "import" ? "批量导入" : "批量填写" }}
      </span>
    </div>
    <el-tabs :class="['ky-tabs', tabsClassName, activeTabName, batchPage]" v-model='activeTabName'
             @tab-click='tabClick'>
      <el-tab-pane label='单票发货' name='single'>
        <single-fill ref='singleFillRef' :supplierOrder='supplierOrderList[0]' :yd-no.sync='singleYdNo' />
      </el-tab-pane>
      <el-tab-pane label='批量发货' name='batch'>
        <batch-index
          ref='fillBatchIndex'
          :batchPage.sync='batchPage'
          :supplierOrderList='supplierOrderList'
        />
      </el-tab-pane>
    </el-tabs>
    <div class='realName'>
      <notice-item
        v-show='!isRealName && !isHideRealNameNotice'
        @on-close='isHideRealNameNotice = true'
      >
        <span
        >按照《邮件快件实名收寄管理办法》要求，寄件必须实名。<span
          style='color:#8365F6;cursor: pointer;'
          @click='goRealName'
        >去实名认证 ></span
        ></span
        >
      </notice-item>
    </div>
    <div id='single-yd-no' class='yd-no' v-show="activeTabName === 'single'">
      运单号：<span>{{ singleYdNo }}</span>
      <el-button type='text' v-clipboard='singleYdNo'>
        <svg-icon icon-class='copy' class='icon-copy' />
        复制
      </el-button>
    </div>
  </div>
</template>

<script>
import SingleFill from './single-fill'
import BatchIndex from './batch/batch-index'
import NoticeItem from '@/components/NoticeItem'
import * as storageUtil from '@/utils/storage'
import * as clientUtil from '@utils/clientUtil'
import { debounce } from 'lodash'
import useAdjustPrice from './hooks/useAdjustPrice'

export default {
  name: 'delivery',
  components: {
    SingleFill,
    BatchIndex,
    NoticeItem,
  },
  data() {
    return {
      activeTabName: 'single',
      tabsClassName: 'tabs-with-footer',
      batchPage: '', //批量发货所在页面，首页为空，批量导入为'import'，批量填写为'fill'
      supplierOrderList: [],
      singleYdNo: '',
      isHideRealNameNotice: false
    }
  },
  setup(props,{root}){
  },
  mounted() {
    this.$store.dispatch('delivery/setSenderHistoryContactListAction')
    this.$store.dispatch('delivery/setReceiverHistoryContactListAction')
    this.$store.dispatch('delivery/setWaybillHistoryRemarksListAction')
    this.$store.dispatch('delivery/setMinLengthWeightAction')
    this.$store.dispatch('common/setServiceWayDictAction')
    storageUtil.getOrSetDeclaredValueFlag() //更新保价说明勾选状态在vuex中的值
  },
  activated() {
    this.$store.dispatch('supplier/setExistSupplierInfoAction')
    if (this.$route.query.type === 'modify') {
      this.activeTabName = 'single'
    }
    this.loadSupplierOrders()
    this.checkSenderAddressList()
  },
  methods: {
    tabClick() {
      this.$reportUtils.clkExpressTab({
        button_name: this.activeTabName === 'single' ? '单票发货' : '批量发货'
      })
    },
    downloadExcelTemplate() {
      clientUtil.downloadImportExcelTemplate()
    },
    checkSenderAddressList: debounce(function() {
      const currentPage = this.$store.state.delivery.currentDeliveryPage
      if (currentPage === 'single') {
        this.$refs.singleFillRef.checkSenderAddressList()
      } else if (currentPage === 'batch-fill') {
        this.$refs.fillBatchIndex.checkSenderAddressListInFill()
      }
    }, 100),
    handleGoback() {
      this.$store.commit('delivery/setDeliveryBatchId')
      this.batchPage = ''
      if (this.supplierOrderList && this.supplierOrderList.length > 0) {
        this.$router.push('/supplier/allocation')
      }
    },
    //加载供应商下单资料
    loadSupplierOrders() {
      const orderList = this.$route.params.orderList || []
      this.supplierOrderList = orderList
      if (orderList.length > 0) {
        if (orderList.length === 1) {
          this.activeTabName = 'single'
        } else {
          this.activeTabName = 'batch'
          const count = new Set(orderList.map(m => m.supplierName)).size
          this.batchPage = count > 1 ? 'import' : 'fill'
        }
      }
    },
    goRealName() {
      this.$router.push({ name: 'realVerify' })
    },


  },
  computed: {
    isRealName() {
      return this.$store.state.realNameInfo ? this.$store.state.realNameInfo.isRealName : false
    }
  },
  watch: {
    activeTabName(name) {
      this.tabsClassName = name === 'single' ? 'tabs-with-footer' : ''
      this.$store.commit('delivery/setDeliveryActiveTab', name)
      this.$store.commit('delivery/setCurrentDeliveryPage', name === 'single' ? name : 'batch-index')
      if (name === 'batch') {
        this.$store.dispatch('client/setCustomerMappingFieldAction')
      }
    },
    batchPage(page) {
      this.tabsClassName = page ? 'tabs-with-footer' : ''
      this.$store.commit('delivery/setCurrentDeliveryPage', `batch-${page || 'index'}`)
    },
    '$route.params.isCopy': {
      handler(val) {
        if (!val) {
          return
        }
        const ydNoList = this.$route.params.ydNoList
        this.activeTabName = ydNoList ? 'batch' : 'single'
        if (ydNoList) {
          this.$nextTick(() => {
            this.$refs.fillBatchIndex.loadCopyWaybills(ydNoList)
          })
        }
      },
      immediate: true
    },
    '$store.state.delivery.currentDeliveryPage': {
      handler() {
        this.$nextTick(() => {
          this.checkSenderAddressList()
        })
      },
      immediate: true
    },
  },
}
</script>

<style lang='scss'>
div#driver-popover-item.waybill-single-guide {
  padding: 0 !important;
  width: 324px;
  border-radius: 12px;

  &::before {
    content: '';
    height: 64px;
    width: 64px;
    z-index: 2;
    position: absolute;
    top: -24px;
    left: 26px;
    background: url('~@/assets/image/shipment/tip.png') no-repeat top left;
  }

  .driver-popover-tip.top {
    top: -24px;
    right: 53px;
    border-width: 12px;
    border-color: transparent transparent #e2d9ff;
  }

  .driver-popover-title {
    height: 54px;
    border-radius: 12px 12px 0 0;
    background: linear-gradient(180deg, rgba(222, 213, 255, 0.88), #ffffff);
  }

  .driver-popover-description {
    padding-left: 26px;
    font-family: PingFangSC, PingFangSC-Regular !important;
    // font-weight: bold !important;
    font-size: 16px;
    color: #333333;
    line-height: 28px;
  }

  .driver-popover-footer {
    margin-top: 12px;

    .driver-close-btn {
      width: 86px;
      height: 32px;
      text-shadow: unset;
      color: #fff;
      background-color: #8365f6;
      border-radius: 16px;
      margin: 0 30px 12px 0;
    }
  }
}

.mjway__el-select-dropdown {
  .el-select-dropdown__item {
    height: unset;
  }
}
</style>
<style lang='scss' scoped>
.delivery--container {
  background: #f5f7fb;
  height: 100%;
  position: relative;

  .template-tip {
    position: absolute;
    top: 12px;
    left: 20px;
    right: 20px;
    z-index: 3;
    padding: 5px 18px 5px 16px;
    color: $--color-text-primary;
    font-size: $--font-size-medium;
    background: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;

    &--left {
      .icon-check {
        color: #5bc482;
        margin-right: 9px;
      }

      .ky-button-secondary {
        margin-left: 16px;
      }
    }

    .icon-close {
      margin-left: auto;
    }
  }

  /deep/ {
    .el-tabs {
      display: flex;
      flex-direction: column;
      height: 100%;

      .el-tabs__header {
        background-color: #fff !important;
        padding: 0 20px;
        margin: 0 0 8px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;

        .el-tabs__nav-wrap {
          &::after {
            display: none;
          }

          .el-tabs__active-bar {
            height: 4px;
            border-radius: 4px;
          }

          .el-tabs__item {
            padding-right: 23px;
            height: 40px !important;
            line-height: 40px !important;
            // font-size: 14px;
            // font-weight: bold;
            // color: #03050d;

            &.is-active {
              color: #8365f6 !important;
            }
          }
        }
      }

      .el-tabs__content {
        flex: 1;
        overflow-y: auto;
        @include scroll-bar;
        display: flex;
        flex-direction: column;
        & > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          @media screen and (-webkit-min-device-pixel-ratio:0){
            display: -webkit-box;
          }
        }
      }

      &.batch.fill {
        .el-tabs__header {
          margin-bottom: 0;
        }
      }
    }

    .nav {
      background: #fff;
      width: 100%;
      height: 39px;
      box-sizing: border-box;
      border-bottom: 1px solid #f1f1f5;
      position: absolute;
      flex: unset;
      display: flex;
      align-items: center;
      padding-left: 21px;
      color: $--color-text-primary;

      & > span {
        font-size: $--tab-font-size;
        font-weight: bold;
        cursor: pointer;

        .icon-return {
          padding-right: 9px;
        }
      }
    }

    .yd-no {
      position: absolute;
      top: 4px;
      right: 20px;
      display: flex;
      align-items: center;
      padding-left: 8px;
      font-weight: bold;
      height: 30px;
      color: #333333;
      background: url('~@/assets/image/shipment/yd-no-bg.png') no-repeat;

      & > span {
        color: $--color-text-primary;
        font-weight: bold;
      }

      button {
        position: relative;
        padding-left: 25px;
        font-size: 12px;

        &::before {
          content: '';
          display: block;
          position: absolute;
          right: 60px;
          top: 8px;
          width: 1px;
          height: 14px;
          background: #dcdae2;
        }

        .icon-copy {
          padding-right: 4px;
        }
      }
    }

    .batch.tabs-with-footer .el-tabs__header {
      visibility: hidden;
    }

    .tabs-with-footer, .tabs-with-footer.import {
      .el-tabs__content {
        height: calc(100% - 118px) !important;
        flex: unset;
      }

      &.fill {
        .el-tabs__content {
          height: calc(100% - 110px) !important;
        }
      }
    }

    .realName {
      position: absolute;
      top: 3px;
      left: 256px;
      right: 304px;
      min-width: 680px;
      max-width: 1000px;
      margin: auto;
      z-index: 99;
      .notice-container{
        background: #fef6e2;
        border: 1px solid #ffe1b7;
        border-radius: 4px;
        padding: 6px 8px;
        min-width: 680px;
      }
    }
    @media (max-width: 1440px) {
      .realName{
        max-width: 500px;
        right: 200px;
        left: 100px;
        min-width: 480px;
        .notice-container{
          max-width: 480px;
          min-width: 480px;
        }
      }
    }
  }
}
</style>
