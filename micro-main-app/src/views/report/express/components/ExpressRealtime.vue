<template>
  <div class="express-realtime-container card-wrapper">
    <div class="caption-info">
       <card-title title="快件实时动态"/> 
      <div class="updatetime-tip">{{updateTimeTip}}</div>
    </div>
    <div class="content">
      <div class="top">
        <div class="select-wrapper">
          <span>快件类型：</span>
          <el-select v-model="selectedExpressType" placeholder="请选择" size="small" @change="loadData">
            <el-option v-for="(item,index) in expressTypes" :key="index" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-wrapper">
          <span>统计单位：</span>
          <el-select v-model="selectedStatisticUnit" placeholder="请选择" size="small" @change="setData">
            <el-option v-for="(item,index) in statisticUnits" :key="index" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="summary">
        <div class="total">
          总{{selectedStatisticUnit===0?'票':'件'}}数
          <div>{{data.totalCount}}</div>
        </div>
        <div class="value-list">
          <div v-for="(item,index) in statusData" :key="index" @click="viewWaybills(index)">
            <svg-icon :icon-class="item.icon" />
            <div class="right" >
              <div class="label">
                <span>{{item.text}}</span>
                <span>{{getProportion(data[item.prop])}}</span>
              </div>
              <div class="value">
                {{data[item.prop]}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getExpressRealtimeOverview } from '@/services/api/report'
import CardTitle from '../../components/CardTitle.vue'
export default {
  components:{CardTitle},
  data () {
    return {
      expressTypes: [{ label: '我发出的', value: 0 }, { label: '我收到的', value: 1 }],
      selectedExpressType: 0,
      statisticUnits: [{label:'按票数',value:0}, {label:'按件数',value:1}],
      selectedStatisticUnit: 0,
      dataSource: {},
      updateTimeTip: `${dayjs().add(-30,'day').format('YYYY/MM/DD HH:mm:ss')} ~ ${dayjs().format('YYYY/MM/DD HH:mm:ss')} | 过去30天`,
      timer: null,
      statusData: [
        { icon: 'icon-express-unpickup', text: '待取货', prop: 'unpickupCount' },
        { icon: 'icon-express-transit', text: '运输中', prop: 'transitCount' },
        { icon: 'icon-express-delivering', text: '派送中', prop: 'deliveringCount' },
        { icon: 'icon-express-signed', text: '已签收', prop: 'signedCount' },
      ],
      data: {
        totalCount: 0,
        unpickupCount: 0,
        transitCount: 0,
        deliveringCount: 0,
        signedCount: 0,
      },
    }
  },
  activated () {
    this.loadData()
    this.timer = setInterval(() => {
      this.loadData()
    },10*60*1000)
  },
  destroyed () {
    clearInterval(this.timer)
  },
  deactivated () {
    clearInterval(this.timer)
  },
  methods: {
    async loadData () {
      const params = {
        expressType: this.selectedExpressType
      }
      const res = await getExpressRealtimeOverview(params)
      if (res.code === 0) {
        this.dataSource = res.data[0]||{}
        this.setData()
        this.updateTimeTip = `${dayjs().add(-30,'day').format('YYYY/MM/DD HH:mm:ss')} ~ ${dayjs().format('YYYY/MM/DD HH:mm:ss')} | 过去30天`
      }
    },
    setData () {
      const isByTicket = this.selectedStatisticUnit === 0
      this.data.totalCount = (isByTicket ? this.dataSource.waybillcounttotal : this.dataSource.packetcounttotal) || 0
      this.data.unpickupCount = (isByTicket ? this.dataSource.waitdeliverywaybillcount : this.dataSource.waitdeliverypacketcount) || 0
      this.data.transitCount = (isByTicket ? this.dataSource.intransitwaybillcount : this.dataSource.intransitpacketcount) || 0
      this.data.deliveringCount = (isByTicket ? this.dataSource.indeliverywaybillcount : this.dataSource.indeliverypacketcount) || 0
      this.data.signedCount = (isByTicket ? this.dataSource.alreadyreceiptwaybillcount : this.dataSource.alreadyreceiptpacketcount) || 0
    },
    getProportion (num) {
      if (Number(this.data.totalCount) <= 0) {
        return '0%'
      }
      return (num * 100 / this.data.totalCount).toFixed(2) + '%'
    },
    viewWaybills (status) {
      this.$router.push({ path: 'report/waybill-deliver-status', query: { status ,expressType:this.selectedExpressType===0?'10':'20'} })
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "../../scss/card.scss";
  .express-realtime-container {
    margin-top: 0;
    border-radius: 0 0 12px 12px;
    .caption-info {
      border-top: 1px solid #f1f1f5;
      border-bottom: none;
      padding-bottom: 0;
    }
    .content {
      padding-bottom: 2px;
      .top {
        display: flex;
        & > div:first-of-type {
          margin-right: 12px;
        }
        /deep/.el-select {
          width: 72px;
        }
      }
      .summary {
        width: calc(100% + 13px);
        height: 126px;
        margin-top: 12px;
        display: flex;
        position: relative;
        left: -13px;
        .total {
          box-sizing: border-box;
          border-radius: 16px;
          padding: 27px 0 0 35px;
          width: 20%;
          color: #ffffff;
          background-image: url("~@assets/image/client/express/express-total.png");
          background-size: 100% 100%;
          & > div:last-child {
            padding-top: 8px;
            font-size: 36px;
            font-weight: bold;
          }
        }
        .value-list {
          height: 100px;
          background: #f9faff;
          flex: 1;
          display: flex;
          justify-content: space-between;
          color: #8888ac;
          padding-right: 40px;
          margin-top: 8px;
          & > div {
            display: flex;
            padding-left: 40px;
            margin: 26px 0;
              cursor: pointer;
            &:not(:first-of-type) {
              border-left: 1px solid #ebebeb;
            }
            & > svg {
              width: 48px;
              height: 48px;
              margin-right: 12px;
            }
            .right {
              .label {
                white-space: nowrap;
                & > span {
                  &:last-of-type {
                    background: #e5e1ff;
                    border-radius: 2px;
                    font-size: 11px;
                    color: #383874;
                    margin-left: 6px;
                  }
                }
              }
              .value {
                padding-top: 3px;
                font-size: 26px;
                font-weight: bold;
                color: #8365f6;
                line-height: 34px;
              }
            }
          }
        }
      }
    }
  }
</style>