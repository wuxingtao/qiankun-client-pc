<template>
  <div class="flow-table-province-container" v-loading="loading">
    <div class="search-condition">
      <div>
        <span>发货{{category}}</span>
        <el-select v-model="sendAddress" placeholder="请选择" clearable size="medium" >
          <el-option v-for="(item,index) in sendAddressList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>收货{{category}}</span>
        <el-select v-model="receiveAddress" placeholder="请选择" clearable size="medium">
          <el-option v-for="(item,index) in receiveAddressList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" round size="medium" @click="loadData">查询</el-button>
    </div>
    <ky-table class="element-table" :data="tableData" style="width: 100%;min-height:200px" ref="kyTable">
     <el-table-column type="index" label="序号" width="60"/> 
      <el-table-column :prop="category==='省份'?'shipProvince':'shipCity'" :label="'发货'+category"> </el-table-column>
      <el-table-column :prop="category==='省份'?'receiveProvince':'receiveCity'" :label="'收件'+category"></el-table-column>
      <el-table-column prop="waybillCount" label="总票数"></el-table-column>
      <el-table-column prop="packetCount" label="总件量"></el-table-column>
      <el-table-column prop="actualWeight" label="总重量"></el-table-column>
    </ky-table>
  </div>
</template>

<script>
import { getSendProvinceList, getReceiveProvinceList, getSendCityList, 
  getReceiveCityList, getFlowDataByProvince, getFlowDataByCity } from '@/services/api/report'
export default {
  props: {
    category: {
      tyep: String,
      require: true
    },
    dateRange:{
      type:Array,
      require:true
    },
  },
  data () {
    return {
      loading:false,
      sendAddressList: [],
      sendAddress: '',
      receiveAddressList: [],
      receiveAddress: '',
      tableData: []
    }
  },
 
  methods: {
    doLayout(){
      this.$refs.kyTable.doLayout()
    },
    async handleDateChange () {
      await this.loadSendAddressSource()
      await this.loadReceiveAddressSource()
      this.loadData()
    },
    async loadData () {
      let res
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      try{
        this.loading=true
        if (this.category === '省份') {
          params.shipProvince = this.sendAddress
          params.receiveProvince = this.receiveAddress
          res = await getFlowDataByProvince(params)
        } else {
          params.shipCity = this.sendAddress
          params.receiveCity = this.receiveAddress
          res = await getFlowDataByCity(params)
        }
        if (res.code === 0) {
          this.tableData = res.data&&res.data.map(el => Object.assign(el, { actualWeight:this.$formatNumber(el.actualWeight),packetCount:this.$formatNumber(el.packetCount,0)}))
        }
      }finally{
        this.loading=false
      }
    },
    async loadSendAddressSource () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      if (this.category === '省份') {
        params.receiveProvince = ''
        let res = await getSendProvinceList(params)
        if (res.code === 0) {
          this.sendAddressList = res.data.map(d => d.shipProvince)
        }
      } else {
        params.receiveCity = ''
        let res = await getSendCityList(params)
        if (res.code === 0) {
          this.sendAddressList = res.data.map(d => d.shipCity)
        }
      }
    },
    async loadReceiveAddressSource () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      if (this.category === '省份') {
        params.shipProvince = ''
        let res = await getReceiveProvinceList(params)
        if (res.code === 0) {
          this.receiveAddressList = res.data.map(d => d.receiveProvince)
        }
      } else {
        params.shipCity = ''
        let res = await getReceiveCityList(params)
        if (res.code === 0) {
          this.receiveAddressList = res.data.map(d => d.receiveCity)
        }
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
    .search-condition{
      &>div{
       margin-top: 5px; 
      }
    }
    .element-table {
      margin-top: 8px;
    }
  }
</style>