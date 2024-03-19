<template>
  <div class="fee-overview-container card-wrapper" ref="feeOverviewContainer">
    <div class="caption-info">
      <card-title title="费用概况" />
      <slot name="tip"></slot>
      <div class="detail" @click="$router.push({path:'report/fee', query: { dateRange: JSON.stringify(dateRange) }})">详情<i class="el-icon-arrow-right"></i></div>
    </div>
    <div class="content">
      <div class="select-wrapper">
        <span>付款方式：</span>
        <el-select v-model="selectedPayway" placeholder="请选择" size="small" @change="loadData">
          <el-option v-for="(item,index) in payways" :key="index" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="top">
        <div>
          <div class="label">应付快递费(元)</div>
          <div class="value" :style="{fontSize:fontSizeTotal+'px'}">{{summaryData.expressFeeAmount}}</div>
        </div>
        <div>

          <div class="label">
            单票均价(元)
            <el-tooltip content="单票均价=应付费用 / 发货总票数，其中已剔除服务方式为整车的运单；" placement="bottom" effect="light" popper-class="el-tooltip-report-card-title">
              <svg-icon icon-class="icon-question-gray" style="padding-left:4px;color:#8365F6;" />
            </el-tooltip>
          </div>

          <div class="value" :style="{fontSize:fontSizeTotal+'px'}">
            {{ summaryData.averagePrice}}
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="row">
          <div>
            <svg-icon icon-class="icon-fee-freight" />
            <div>
              <div>运单运费(元)</div>
              <div class="value" :style="{fontSize:fontSizeDetail+'px'}">{{summaryData.waybillAmount}}</div>
            </div>
          </div>
          <div>
            <svg-icon icon-class="icon-fee-accretion" />
            <div>
              <div>总增值费(元)</div>
              <div class="value" :style="{fontSize:fontSizeDetail+'px'}">{{summaryData.totalValueAddAmount }}</div>
            </div>
          </div>
        </div>
        <div class="row">
          <div>
            <svg-icon icon-class="icon-fee-tax" />
            <div>
              <div>另补税金(元)</div>
              <div class="value" :style="{fontSize:fontSizeDetail+'px'}">{{summaryData.additionalTaxAmount}}</div>
            </div>
          </div>
          <div v-show="Number(summaryData.discountAmount)>0">
            <svg-icon icon-class="icon-fee-discount" />
            <div>
              <div>优惠金额(元)</div>
              <div class="value" :style="{fontSize:fontSizeDetail+'px'}">{{summaryData.discountAmount}}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { getFeeSummary } from '@/services/api/report'
import CardTitle from '../../components/CardTitle.vue'
export default {
  components: {
    CardTitle
  },
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data () {
    return {
      payways: [{ label: '寄付', value: 10 }, { label: '到付', value: 20 }, { label: '第三方付', value: 30 }],
      selectedPayway: 10,
      summaryData: {},
      fontSizeTotal: '36',
      fontSizeDetail: '26'
    }
  },
  activated () {
    window.addEventListener('resize', this.handleResize)
  },
  deactivated () {
    window.removeEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize: _.throttle(function () {
      const containerRef = this.$refs.feeOverviewContainer
      // console.log('containerRef :>> ', containerRef.clientWidth)
      this.fontSizeTotal = 36
      this.fontSizeDetail = 26
      if (containerRef.clientWidth <= 534) {
        this.fontSizeTotal = 28
        this.fontSizeDetail = 19
      } if (containerRef.clientWidth <= 463) {
        this.fontSizeTotal = 22
        this.fontSizeDetail = 14
      }
    }, 500),
    async loadData () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        payMode: this.selectedPayway
      }
      const res = await getFeeSummary(params)
      if (res.code === 0) {
        this.summaryData = res.data[0] || {}
        const totalFields = ['expressFeeAmount', 'averagePrice']
        const detailFields = ['waybillAmount', 'totalValueAddAmount', 'additionalTaxAmount', 'discountAmount']
        const fields = [...totalFields, ...detailFields]
        fields.forEach(f => {
          // this.summaryData[f]=999999999
          this.summaryData[f] = this.$formatNumber(this.summaryData[f])
        })
      }
    },
  },
  watch: {
    dateRange: {
      handler () {
        this.loadData()
      },
      immediate: true
    }
  }
}
</script>

<style>
  @import "../../scss/card.scss";
</style>

<style lang="scss" scoped>
  @import "../../scss/card.scss";
  .fee-overview-container {
    .content {
      /deep/.el-select {
        width: 72px;
      }
      .top {
        padding: 48px 47px 0;
        display: flex;
        justify-content: space-between;
        & > div {
          flex: 1;
          &:first-child {
            padding-right: 20px;
          }
          &:last-child {
            border-left: 1px solid #dadce3;
            padding-left: 20px;
          }
          overflow: hidden;
          .label {
            color: #9494b5;
            white-space: nowrap;
          }
          .value {
            margin-top: 12px;
            color: #333333;
            font-size: 36px;
            font-weight: bold;
            line-height: 56px;
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
          }
        }
      }
      .bottom {
        margin: 35px 20px 0;
        background: #f9faff;
        border: 1px solid #dadce3;
        border-radius: 17px;
        padding: 0 27px;
        color: #8888ac;
        position: relative;
        &::before {
          content: "";
          position: absolute;
          top: -12px;
          width: 24px;
          height: 12px;
          background-image: url("~@assets/image/icon-fee-arrow.png");
        }
        .row {
          display: flex;
          padding: 30px 0;
          & > div {
            flex: 50%;
            display: flex;
            overflow: hidden;
            & > div {
              overflow: hidden;
            }
            &:last-child {
              border-left: 1px solid #dadce3;
              padding-left: 34px;
            }
            & > svg {
              width: 30px;
              height: 30px;
              margin-right: 16px;
            }
            .value {
              padding-top: 9px;
              font-size: 26px;
              font-weight: bold;
              color: #333333;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
            }
          }
          &:first-child {
            border-bottom: 1px solid #dadce3;
          }
        }
      }
    }
  }
</style>