<template>
  <div class="weight-overview-container card-wrapper" >
    <div class="caption-info">
      <card-title title="货物重量"/> 
      <slot name="tip"></slot>
      <div class="detail" @click="$router.push({path:'report/weight', query: { dateRange: JSON.stringify(dateRange) }})">详情<i class="el-icon-arrow-right"></i></div>
    </div>
    <div class="content">
      <div class="top">
        <svg-icon icon-class="icon-report-weight" class="icon-report-weight" />
        <div class="weight-wrapper">
          <div>总重量(KG)</div>
          <div>{{weightAmount}}</div>
        </div>
      </div>
      <ky-table class="element-table" :data="tableData" style="width: 100%" height="363px">
        <el-table-column type="index" label="序号" width="55"/> 
        <el-table-column prop="shiping_city" label="发货城市"> </el-table-column>
        <el-table-column prop="receive_city" label="收件城市"></el-table-column>
        <el-table-column label="重量区间票数分布" class-name="text-center">
          <el-table-column prop="lessThirty" label="≤ 30KG"></el-table-column>
          <el-table-column prop="thirtyTofifty" label="(30,50KG]" width="120px"></el-table-column>
          <el-table-column prop="fiftyTohundred" label="(50,100KG]" width="120px"></el-table-column>
          <el-table-column prop="hundredTothree" label="(100,300KG]" width="120px"></el-table-column>
          <el-table-column prop="thanThree" label="＞300KG"></el-table-column>
        </el-table-column>
      </ky-table>
    </div>
  </div>
</template>

<script>
import CardTitle from '../../components/CardTitle.vue'
import overview from '../../mixins/overview'
import { getWeigthAmount, getWeigthStatistic } from '@/services/api/report'
export default {
  mixins:[overview],
  components:{CardTitle},
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data () {
    return {
      weightAmount: 0,
      tableData: []
    }
  },
  methods: {
    async loadData () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1]
      }
      const res = await getWeigthAmount(params)
      if (res.code === 0) {
        this.weightAmount = this.$formatNumber(res.data && (res.data[0] || {}).totalWeight)
      }
      const res2 = await getWeigthStatistic(params)
      if (res2.code === 0) {
        this.tableData = res2.data.map(d=>Object.assign(d,{
          lessThirty:this.$formatNumber(d.lessThirty,0),
          thirtyTofifty:this.$formatNumber(d.thirtyTofifty,0),
          fiftyTohundred:this.$formatNumber(d.fiftyTohundred,0),
          hundredTothree:this.$formatNumber(d.hundredTothree,0),
          thanThree:this.$formatNumber(d.thanThree,0),
        }))
      }
    },
  },
  // watch: {
  //   dateRange: {
  //     handler () {
  //       this.$nextTick(() => { this.loadData() })
  //     },
  //     immediate: true
  //   }
  // }
}
</script>

<style lang="scss" scoped>
  @import "../../scss/card.scss";
  .weight-overview-container {
    font-size: 14px;
    .content {
      .top {
        padding-bottom: 29px;
        .icon-report-weight {
          width: 50px;
          height: 50px;
          padding-right: 16px;
        }
        .weight-wrapper {
          display: inline-block;
          color: #999999;
          & > :last-child {
            padding-top: 8px;
            font-size: 24px;
            font-weight: bold;
            color: #383874;
          }
        }
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
        height: 27px;
      }
    }
  }
</style>