<template>
  <div class="whole-overview-container container card-wrapper">
    <div class="caption-info">
      <card-title title="整体妥投分析" />
      <slot name="tip"></slot>
      <div class="detail" @click="$router.push({path:'report/delivered',query: { dateRange: JSON.stringify(dateRange) }})">详情<i class="el-icon-arrow-right"></i></div>
    </div>
    <div class="content">
      <div class="top">
        <svg-icon icon-class="icon-delivered" class="icon-delivered" />
        <div class="delivered-wrapper">
          <div>整体妥投率(总)</div>
          <div>
            {{investmentRate||'0%'}}
            <!-- <span class="compare_perate"><span class="compare_perate_text">较上一期<svg-icon icon-class="arrow-top" class="arrow-top" />{{comparePreRate||0}}</span></span> -->
          </div>
        </div>
      </div>
      <div class="detail-info">
        <el-tabs v-model="activeName" @tab-click="loadTabData">
          <el-tab-pane label="产品服务TOP10" name="first">
            <el-table :data="tableData" style="width: 100%" ref='serviceModelTable'>
              <div slot="empty">
                <none-data style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">{{ row.idx }}</div>
                </template>
              </el-table-column>
                   <el-table-column prop="serviceName" label="服务方式" width="120">
              </el-table-column>
              <el-table-column prop="totalVotes" label="总票数" width="100"></el-table-column>
              <el-table-column prop="investmentAverage" label="平均妥投时长" width="140">
              </el-table-column>
              <el-table-column prop="investmentRateShow" label="妥投率" width="100" >
              </el-table-column>
              <el-table-column  min-width="120">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' />
                </template>
              </el-table-column>

            </el-table>
          </el-tab-pane>
          <el-tab-pane label="省份TOP10" name="second">
            <el-table :data="tableDataProvice" style="width: 100%">
              <div slot="empty">
                <none-data style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">{{ row.idx }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="sendAddress" label="寄件省份" width="100" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="receiveAddress" label="收件省份" width="100" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="totalVotes" label="总票数" width="80"></el-table-column>
              <el-table-column prop="investmentAverage" label="平均妥投时长" width="120">
              </el-table-column>
              <el-table-column prop="investmentRateShow" label="妥投率" width="80">
              </el-table-column>
              <el-table-column min-width="140">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' />
                </template>
              </el-table-column>

            </el-table>
          </el-tab-pane>
          <el-tab-pane label="城市TOP10" name="third" class="city_table">
            <el-table :data="tableDataCity" style="width: 100%">
              <div slot="empty">
                <none-data style="padding-top:8%" />
              </div>
              <el-table-column prop="idx" label="排名" width="50">
                <template slot-scope="{ row }">
                  <div class="serial">{{ row.idx }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="sendAddress" label="寄件城市" width="100" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="receiveAddress" label="收件城市" width="100" :show-overflow-tooltip="true">
              </el-table-column>
              <el-table-column prop="totalVotes" label="总票数" width="80"></el-table-column>
              <el-table-column prop="investmentAverage" label="平均妥投时长" width="120">
              </el-table-column>
              <el-table-column prop="investmentRateShow" label="妥投率" width="80">
              </el-table-column>
              <el-table-column min-width="140">
                <template slot-scope="scope">
                  <percentage :percentageValue='scope.row.investmentRate' />
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
import CardTitle from '../../components/CardTitle.vue'
import overview from '../../mixins/overview'
import percentage from '../../components/percentage'
import { getInvestmentSummary, getInvestmentByServiceModeList, getInvestmentByAddressList } from '@/services/api/report'
import NoneData from '@/components/ky-table/none-data.vue'

export default {
  mixins:[overview],
  components: {
    percentage, NoneData, CardTitle
  },
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data () {
    return {
      activeName: 'first',
      investmentRate: 0,
      comparePreRate: 0,
      tableData: [],
      tableDataProvice: [],
      tableDataCity: []
    }
  },
  methods: {
    async loadData () {
      this.loadTabData()
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        search: '20'
      }
      const res = await getInvestmentSummary(params)
      if (res.code === 0) {
        this.investmentRate = res.data &&(this.$formatNumber((res.data[0] || {}).investmentRate* 100,2) + '%')
      }
    },
    loadTabData(){
      if (this.activeName === 'first') {
        this.getInvestmentByServiceModeList()
      }
      else if (this.activeName === 'second') {
        this.getInvestmentProviceOrCityList('10', '20')
      }
      else   if (this.activeName === 'third') {
        this.getInvestmentProviceOrCityList('20', '20')
      }
    },
    async getInvestmentByServiceModeList(){
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        search: '20'
      }
      let arr = []
      const res2 = await getInvestmentByServiceModeList(params)
      if (res2.code === 0) {
        res2.data.forEach((item, index) => {
          arr.push({
            ...item,
            idx: index + 1
          })
        })
        this.tableData = arr && this.handleData(arr)
      }
    },
    async getInvestmentProviceOrCityList (type, search) {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        type: type,
        search: search,
        receiveAddress: '',
        sendAddress: ''
      }
      let arr = []
      const res = await getInvestmentByAddressList(params)
      if (res.code === 0) {
        res.data.forEach((item, index) => {
          arr.push({
            ...item,
            idx: index + 1
          })
        })
        if (type === '10') {
          this.tableDataProvice = arr && this.handleData(arr)
        }
        else {
          this.tableDataCity = arr &&this.handleData(arr)
        }

      }
    },
    handleData(arr){
      return arr.map(el => Object.assign(el, { investmentRateShow: (this.$formatNumber(el.investmentRate*100,2)) + '%' ,investmentAverage:this.$formatNumber(el.investmentAverage)}))
    }

  },
  beforeUpdate() {
    this.$nextTick(() => {
      this.$refs['serviceModelTable'].doLayout()
    })
  },
  // watch: {
  //   dateRange: {
  //     handler () {
  //       this.$nextTick(() => { 
  //         this.loadData() 
  //         if (this.activeName === 'second') {
  //           this.getInvestmentProviceOrCityList('10', '20')
  //         }
  //         if (this.activeName === 'third') {
  //           this.getInvestmentProviceOrCityList('20', '20')
  //         }
  //       })
  //     },
  //     immediate: true
  //   }
  // }
}
</script>

<style lang="scss" scoped>
  @import "../../scss/card.scss";
  .container {
    font-size: 14px;

    .content {
      .top {
        padding-bottom: 19px;
        .icon-delivered {
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
            background: #e9effe;
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
            }
          }
        }
      }

      .detail-info {
        .serial {
          color: #999;
        }
      }

      .investmentrate {
        display: flex;
      }

      .el-table__row > td {
        border: none;
      }
      .el-table::before {
        //去掉最下面的那一条线
        height: 0px;
      }

      /deep/ .el-table {
        color: #333;
      }

      /deep/ .el-table th.is-leaf,
      .el-table td {
        /* 去除上边框 */
        border: none;
      }
      /deep/.el-table td {
        border: none;
        padding: 2px 0;
      }
      /deep/ .el-tabs__nav-wrap::after {
        height: 1px;
      }
      //表格滚动条样式
      /deep/.el-table__body-wrapper {
        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #dedce3;
          border-radius: 3px;
        }
      }
    }
  }
</style>