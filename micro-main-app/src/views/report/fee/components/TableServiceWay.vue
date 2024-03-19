<template>
  <div class="fee-table-service-way-container">
    <div class="title">分布明细</div>
    <div class="content">
      <ky-table class="element-table" :data="tableData" style="width: 100%" height="360px">
        <el-table-column prop="serviceType" label="服务方式"></el-table-column>
        <el-table-column prop="totalVotes" label="总票数"><template></template> </el-table-column>
        <el-table-column prop="totalWeight" label="总重量"></el-table-column>
        <el-table-column prop="expressFeeAmount" label="应付费用"></el-table-column>
        <el-table-column prop="waybillAmount" label="运单运费"></el-table-column>
        <el-table-column prop="averagePrice" label="单票均价"></el-table-column>
        <el-table-column prop="discountAomunt" label="满减优惠"></el-table-column>
      </ky-table>
    </div>
  </div>
</template>

<script>
import { getFeeServiceWayDetail } from '@/services/api/report'
export default {
  props: {
    dateRange: {
      type: Array,
      require: true
    },
    payway: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      tableData: []
    }
  },
  mounted () {

  },
  methods: {
    async loadData () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        payMode: this.payway
      }
      const res = await getFeeServiceWayDetail(params)
      if (res.code === 0) {
        this.tableData = res.data.map(d=> Object.assign(d,{
          totalVotes:this.$formatNumber(d.totalVotes,0),
          totalWeight:this.$formatNumber(d.totalWeight),
          expressFeeAmount:this.$formatNumber(d.expressFeeAmount),
          waybillAmount:this.$formatNumber(d.waybillAmount),
          averagePrice:this.$formatNumber(d.averagePrice),
          discountAomunt:this.$formatNumber(d.discountAomunt)}))
      }
    }
  },
  watch: {
    dateRange: {
      handler () {
        this.$nextTick(() => { this.loadData() })
      },
      immediate: true
    },
    payway () {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .fee-table-service-way-container {
    overflow: auto;
    padding: 0 20px;
    .title {
      padding: 20px 0;
      font-size: 16px;
      font-weight: bold;
      color: #333333;
    }
    .content{
      padding: 0;
    }
  }
</style>