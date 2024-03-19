<template>
  <div class="flow-overview-container card-wrapper">
    <div class="caption-info">
      <card-title title="流向分析"/> 
      <slot name="tip"></slot>
      <div class="detail" @click="$router.push({path: 'report/flow-analyse', query: { dateRange: JSON.stringify(dateRange) }})">详情<i class="el-icon-arrow-right"></i></div>
    </div>
    <div class="content">
      <div class="top">
        <svg-icon icon-class="icon-fee" class="icon-fee" />
        <div class="delivered-wrapper">
          <div>流向城市(个)</div>
          <div>
            {{count}}
          </div>
        </div>
      </div>
      <div class="detail-info">
        <el-tabs v-model="activeName" @tab-click="handleClick"> 
          <el-tab-pane label="收件公司TOP10">
            <el-table :data="tableDataReceiveCustomer" style="width: 100%">
              <div slot="empty">
                <none-data  style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">
                    {{ row.idx }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="receiveCustomer" label="收件公司名称" width="300" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="packetCount" label="总票数" width="80">
              </el-table-column>
              <el-table-column min-width="140">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' foreColor="linear-gradient(270deg,#a275ff, #8675ff)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="城市(票)TOP10">
            <el-table :data="tableDataCityByWaybill" style="width: 100%">
              <div slot="empty">
                <none-data  style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">
                    {{ row.idx }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="shipCity" label="寄件城市" width="150" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="receiveCity" label="收件城市" width="150" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="waybillCount" label="总票数" width="80">
              </el-table-column>
              <el-table-column min-width="140">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' foreColor="linear-gradient(270deg,#a275ff, #8675ff)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="城市(件)TOP10">
            <el-table :data="tableDataCityByWaybillCount" style="width: 100%">
              <div slot="empty">
                <none-data  style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">
                    {{ row.idx }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="shipCity" label="寄件城市" width="150" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="receiveCity" label="收件城市" width="150" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="packetCount" label="总件数" width="80">
              </el-table-column>
              <el-table-column min-width="140">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' foreColor="linear-gradient(270deg,#a275ff, #8675ff)" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import overview from '../../mixins/overview'
import CardTitle from '../../components/CardTitle.vue'
import percentage from '../../components/percentage'
import { topCityByWaybillCount, topCityByWaybill, topReceiveCustomer, getCityCount } from '@/services/api/report'
import NoneData from '@/components/ky-table/none-data.vue'

export default {
  mixins:[overview],
  components: {
    percentage,NoneData,CardTitle
  },
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data(){
    return{
      investmentRate: 0,
      comparePreRate: 0,
      activeName: 0,
      tableDataCityByWaybill: [],
      tableDataCityByWaybillCount: [],
      tableDataReceiveCustomer: [],
      index: 0,
      count: 0,
      waybillCount: 0,
      packetCount: 0
    }
  },
  methods:{
    loadData(){
      this.cityCount()
      this.loadTabData()
    },
    handleClick(tab) {
      this.index = Number(tab.index)
      this.loadTabData()
    },
    async loadTabData() {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1]
      }
      let arr = []
      try {
        if (this.index === 1) {
          let data = await topCityByWaybill(params)
          data.data.forEach((item, index) => {
            arr.push({
              ...item,
              idx: index + 1,
              investmentRate: item.waybillCount / this.waybillCount
            })  
          })
          this.tableDataCityByWaybill = arr
        } else if (this.index === 2) {
          let data = await topCityByWaybillCount(params)
          data.data.forEach((item, index) => {
            arr.push({
              ...item,
              idx: index + 1,
              investmentRate: item.packetCount / this.packetCount,
              packetCount:this.$formatNumber(item.packetCount,0)
            })
          })
          this.tableDataCityByWaybillCount = arr
        } else if (this.index === 0) {
          let data = await topReceiveCustomer(params)
          data.data.forEach((item, index) => {
            arr.push({
              ...item,
              idx: index + 1,
              investmentRate: item.packetCount / this.waybillCount
            })  
          })
          this.tableDataReceiveCustomer = arr
        }
      } catch (error) {
        console.log(error, 'error')
      }
    },
    async cityCount() {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1]
      }
      try {
        let data = await getCityCount(params)
        this.count = data.data && this.$formatNumber((data.data[0] || {}).cityCount,0)
        this.waybillCount = data.data && (data.data[0] || {}).waybillCount
        this.packetCount = data.data && (data.data[0] || {}).packetCount
      } catch(error) {
        console.log(error, 'error')
      }
    }
  },
  // watch: {
  //   dateRange: {
  //     handler () {
  //       this.$nextTick(async () => { 
  //         await this.cityCount()
  //         this.loadTabData()
  //       })
  //     },
  //     immediate: true
  //   }
  // }
}
</script>

<style lang="scss" scoped>
    @import "../../scss/card.scss";
  .flow-overview-container {
    @include scroll-bar;
    .content{
      .top{
        display: flex;
        padding-bottom: 19px;
        .icon-fee {
          width: 50px;
          height: 50px;
        }
        .delivered-wrapper {
          display: inline-block;
          color: #999999;
          padding-left: 16px;
          & > :last-child {
            padding-top: 8px;
            font-size: 24px;
            font-weight: bold;
            color: #383874;
          }
          .compare_perate {
            margin: 0 0 0 12px;
            background:#E9EFFE;
            border-radius: 2px;
            font-size: 10px;
            .compare_perate_text {
              opacity: 1;
              padding: 6px;
              font-family: PingFangSC, PingFangSC-Regular;
              font-weight: 400;
              text-align: left;
              color: #666;
              line-height: 10px;
              .arrow-top {
                width: 5px;
                height: 9px;
              }
            }
          }
          
        }

        /deep/.el-select{
           width: 72px;
        }
      }

      .detail-info {
        .serial {
          color: #999;
        }

        .detail-info-desc {
          font-size: 14px;
          color: #333;

          .arrow-right1 {
            width: 18px;
            height: 8px;
            margin-left: 18px;
          }
        }
      }

      /deep/ .el-table {
        color: #333;
      }

      /deep/ .el-table::before {
        //去掉最下面的那一条线
        height: 0px;
      }
      
      /deep/ .el-table th.is-leaf {
        border: none;
      }

      /deep/ .el-table td {
        border: none;
        padding: 2px 0;
      }
      /deep/ .el-tabs__nav-wrap::after {
        height: 1px;
      }
      /deep/ .el-tabs__nav-wrap{
        margin-bottom: 0 !important;
      }
       /deep/.el-table__body-wrapper {
         @include scroll-bar;
       }
    }
  }
</style>