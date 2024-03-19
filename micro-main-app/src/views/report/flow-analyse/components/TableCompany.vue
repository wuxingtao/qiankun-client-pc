<template>
  <div class="flow-table-province-container">
    <div class="search-condition">
      <div>
        <span>收件公司</span>
        <el-select v-model="company" placeholder="请选择" clearable size="medium" @change="loadData">
          <el-option v-for="(item,index) in companyList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
    </div>
    <ky-table class="element-table" :data="tableData" style="width: 100%;min-height:200px;" ref="kyTable">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="receiveCustomer" label="收件公司"></el-table-column>
      <el-table-column prop="waybillCount" label="总票数"></el-table-column>
      <el-table-column prop="packetCount" label="总件量"></el-table-column>
      <el-table-column prop="actualWeight" label="总重量"></el-table-column>
    </ky-table>
  </div>
</template>

<script>
import { getReceiveCompanyList, getFlowDataByReceiveCompany } from '@/services/api/report'
export default {
  props: {
    dateRange: {
      type: Array,
      require: true
    },
  },
  data () {
    return {
      companyList: [],
      company: '',
      tableData: []
    }
  },

  methods: {
    doLayout(){
      this.$refs.kyTable.doLayout()
    },
    async handleDateChange () {
      await this.loadReceiveCompany()
      this.loadData()
    },
    async loadData () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        receiveCustomer: this.company
      }
      let res = await getFlowDataByReceiveCompany(params)
      if (res.code === 0) {
        this.tableData = res.data&&res.data.map(el => Object.assign(el, { actualWeight:this.$formatNumber(el.actualWeight),packetCount:this.$formatNumber(el.packetCount,0)}))
      }
    },

    async loadReceiveCompany () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      let res = await getReceiveCompanyList(params)
      if (res.code === 0) {
        this.companyList = res.data.map(d => d.receiveCustomer)
      }

    }
  },
  watch: {
    dateRange: {
      handler () {
        this.$nextTick(() => {
          this.handleDateChange()
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .flow-table-province-container {
    @import "../../scss/index.scss";
    .search-condition {
      & > div {
        margin-top: 5px; 
      }
    }
    .element-table {
      margin-top: 8px;
    }
  }
</style>