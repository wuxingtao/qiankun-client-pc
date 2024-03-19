<template>
  <div class="shipment-container_r">
    <el-container style="height: 100%;">
      <el-header height="40px" class="header_wrap" style="padding: 0;">
        <el-tabs :class="[activeTabName]" v-model="activeTabName" @tab-click="handleClick">
          <el-tab-pane label="时效运费查询" name="batch">
          </el-tab-pane>
          <el-tab-pane label="网点查询" name="single">
          </el-tab-pane>
        </el-tabs>
      </el-header>
      <el-main class="branch-query" style="padding: 0px;background: #fff;">
        <component :is="activeTabName"></component>
      </el-main>
    </el-container>
    <ky-text-image-popup ref='kyTextImagePopupRef' />
    <ky-activity-popup ref='kyActivityPopupRef' />
  </div>
</template>
<script>
import single from '../components/query/serviceStore'
import batch from '../components/query/target'
import messagePopup from '@/components/ky-message-popup/message-popup.js'

export default {
  name: 'query',
  mixins: [messagePopup],
  components: {
    batch,
    single
  },
  data () {
    return {
      activeTabName: 'batch',
    }
  },
  mounted () {
    this.handlePopup('pcQuery')
  },
  methods: {
    handleClick (tab, event) {
      window.report.sendClickEvent('other_freight_tab', { button_name: tab.label })
    }
  }
}
</script>

<style lang="scss" scoped>
  .shipment-container_r {
    background: #f7f9fa;
    height: 100%;
    position: relative;
    /*tab*/
    /deep/ {
      .el-tabs {
        .el-tabs__header {
          background-color: #fff !important;
          padding: 0 20px;
          margin: 0;
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
              font-size: 16px;
              font-weight: bold;
              color: #333333;
              &.is-active {
                color: #8365f6 !important;
              }
            }
          }
        }
      }
      .batch.tabs-with-footer .el-tabs__header {
        visibility: hidden;
      }
    }
    /* header */
    .header_wrap {
      background: #fff;
    }

    .branch-query {
      @include scroll-bar;
    }
  }

  .header_wrap {
    border-bottom: 1px solid #f1f1f5;
  }
</style>



<!--
<template>
    <div class="shipment-container_r">
        <el-tabs :class="[activeTabName]" v-model="activeTabName">
            <el-tab-pane label="时效运费查询" name="single">
                <batch></batch>
            </el-tab-pane>
            <el-tab-pane label="网点查询" name="batch">
                <single></single>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import single from "../components/query/serviceStore"
import batch from "../components/query/timer"
export default {
  name: 'query',
  components: {
    batch,
    single
  },
  data () {
    return {
      activeTabName: 'single',
    }
  }
}
</script>

<style lang="scss" scoped>
    .shipment-container_r {
        background: #f7f9fa;
        height: 100%;
        position: relative;
        /deep/ {
            .el-tabs {
                display: flex;
                flex-direction: column;
                height: 100%;
                .el-tabs__header {
                    background-color: #fff !important;
                    padding: 0 20px;
                    margin: 0;
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
                            height: 51px !important;
                            line-height: 47px !important;
                            font-size: 16px;
                            font-weight: bold;
                            color: #333333;
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
                    &>div{
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                }
            }
            .nav{
                height: 51px;
                position: absolute;
                flex: unset;
                display: flex;
                align-items: center;
                padding-left: 21px;
                color: rgba(51,51,51,0.93);
                font-weight: bold;
                cursor: pointer;
                .icon-return{
                    padding-right: 9px;
                }
            }
            .batch.tabs-with-footer .el-tabs__header{
                visibility: hidden;
            }
            .tabs-with-footer .el-tabs__content {
                height: calc(100% - 144px) !important;
                flex: unset;
            }

        }
    }
</style>
-->
