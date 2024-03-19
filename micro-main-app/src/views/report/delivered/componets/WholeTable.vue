<template>
  <div class="weight-table-container">
    <div class="search-condition">
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd" @change="handleDateChange">
        </el-date-picker>
      </div>
      <div>
        <span>发货{{category}}</span>
        <el-select v-model="sendAddress" placeholder="请选择" size="medium" clearable>
          <el-option v-for="(item,index) in sendProvinceList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>收货{{category}}</span>
        <el-select v-model="receiveAddress" placeholder="请选择" size="medium" clearable>
          <el-option v-for="(item,index) in receiveProvinceList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" round size="medium" @click="loadData">查询</el-button>
    </div>
    <ky-table class="element-table" :data="tableData" style="width: 100%" :height="'calc(100vh - 344px)'" v-loading="loading" ref="table" :key="tableKey">
      <el-table-column prop="idx" label="序号"></el-table-column>
      <el-table-column prop="sendAddress" :label="'发货'+category"> </el-table-column>
      <el-table-column prop="receiveAddress" :label="'收货'+category"></el-table-column>
      <el-table-column prop="totalVotes" label="总票数"></el-table-column>
      <el-table-column prop="investmentAverage" label="平均妥投时长"></el-table-column>
      <el-table-column prop="investmentRate" label="妥投率"></el-table-column>
    </ky-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { getSendProvinceList, getReceiveProvinceList, getSendCityList, getReceiveCityList, getInvestmentByAddressList, getPrescriptionByAddressList } from '@/services/api/report'
export default {
  props: {
    category: {
      tyep: String,
      require: true
    },
    datatype: {
      tyep: String,
      require: true
    },
  },
  data () {
    return {
      // pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      pickerOptions:{
        disabledDate(v) {
          return v.getTime() >dayjs().add(1,'day') - 86400000
        }
      },
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      sendProvinceList: [],
      receiveProvinceList: [],
      sendAddress: '',
      receiveAddress: '',
      tableData: [],
      loading: false,
      tableKey: Date.parse(new Date()),
    }
  },
  async activated () {
    const dateRange = this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.dateRange = dateRange
    }
    await this.handleDateChange()
    this.loadData()
  },
  methods: {
    async handleDateChange () {
      await this.loadSendProvinceOrCity()
      await this.loadReceiveProvinceOrCity()
    },
    async loadData () {
      this.loading = true
      let res
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        search: '10',
        type: this.category === '省份' ? '10' : '20',
        receiveAddress: this.receiveAddress,
        sendAddress: this.sendAddress
      }
      switch (this.datatype) {
        case '0':
          res = await getInvestmentByAddressList(params)
          break
        case '1':
          res = await getPrescriptionByAddressList(params)
          break
      }
      let arr = []
      if (res.code === 0) {
        res.data.forEach((item, index) => {
          arr.push({
            ...item,
            idx: index + 1
          })
        })
        this.tableData = arr && arr.map(el => Object.assign(el, { investmentRate: (this.$formatNumber(el.investmentRate*100,2)) + '%' ,investmentAverage:this.$formatNumber(el.investmentAverage)}))
      } else {
        this.tableData = []
      }
      this.loading = false
    },
    async loadSendProvinceOrCity () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      if (this.category === '省份') {
        params.receiveProvince = ''
        let res = await getSendProvinceList(params)
        if (res.code === 0) {
          this.sendProvinceList = res.data.map(d => d.shipProvince)
        }
      } else {
        params.receiveCity = ''
        let res = await getSendCityList(params)
        if (res.code === 0) {
          this.sendProvinceList = res.data.map(d => d.shipCity)
        }
      }
    },
    async loadReceiveProvinceOrCity () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      if (this.category === '省份') {
        params.shipProvince = ''
        let res = await getReceiveProvinceList(params)
        if (res.code === 0) {
          this.receiveProvinceList = res.data.map(d => d.receiveProvince)
        }
      } else {
        params.shipCity = ''
        let res = await getReceiveCityList(params)
        if (res.code === 0) {
          this.receiveProvinceList = res.data.map(d => d.receiveCity)
        }
      }

    },
    doLayout(){
      this.$refs['table'].doLayout()
    }
  },
 
}
</script>

<style lang="scss" scoped>
  .weight-table-container {
    @import "../../scss/index.scss";
    .search-condition {
      height: 56px;
      border-bottom: solid 2px #f1f1f5;
    }
    .element-table {
      margin-top: 20px;
    }
    /deep/ .el-table .cell {
      line-height: 23px !important;
    }
  }
</style>