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
        <el-select v-model="sendAddress" placeholder="请选择" clearable size="medium" >
          <el-option v-for="(item,index) in sendAddressList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>收货{{category}}</span>
        <el-select v-model="receiveAddress" placeholder="请选择" clearable size="medium" >
          <el-option v-for="(item,index) in receiveAddressList" :key="index" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" round size="medium" @click="loadData">查询</el-button>
    </div>
    <ky-table class="element-table" :data="tableData" style="width: 100%" :height="'calc(100vh - 334px)'">
      <el-table-column type="index" label="序号" width="60"/> 
      <el-table-column :prop="category==='省份'?'sendProvice':'sendCity'" :label="'发货'+category"> </el-table-column>
      <el-table-column :prop="category==='省份'?'receiveProvice':'receiveCity'" :label="'收件'+category"></el-table-column>
      <el-table-column label="重量区间票数分布" class-name="text-center">
        <el-table-column prop="lessThirty" label="≤ 30KG"></el-table-column>
        <el-table-column prop="thirtyTofifty" label="(30,50KG]"></el-table-column>
        <el-table-column prop="fiftyTohundred" label="(50,100KG]"></el-table-column>
        <el-table-column prop="hundredTothree" label="(100,300KG]"></el-table-column>
        <el-table-column prop="thanThree" label="＞300KG"></el-table-column>
      </el-table-column>
    </ky-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import {getSendProvinceList,getReceiveProvinceList,getSendCityList,getReceiveCityList, getWeigthStatisticOfProvince, getWeigthStatisticOfCity } from '@/services/api/report'
export default {
  props: {
    category: {
      tyep: String,
      require: true
    }
  },
  data () {
    return {
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      sendAddressList: [],
      sendAddress:'',
      receiveAddressList:[],
      receiveAddress: '',
      tableData: []
    }
  },
  activated() {
    const dateRange=this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.dateRange = dateRange
    }
    this.handleDateChange()
    this.loadData ()
  },
  methods: {
    async handleDateChange(){
      await  this.loadSendAddressSource()
      await this.loadReceiveAddressSource()
    },
    async loadData () {
      let res
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      }
      if (this.category === '省份') {
        params.sendProvice = this.sendAddress
        params.receiveProvice = this.receiveAddress
        res = await getWeigthStatisticOfProvince(params)
      } else {
        params.sendCity = this.sendAddress
        params.receiveCity = this.receiveAddress
        res = await getWeigthStatisticOfCity(params)
      }
      if (res.code === 0) {
        this.tableData = res.data.map(d=>Object.assign(d,{
          lessThirty:this.$formatNumber(d.lessThirty,0),
          thirtyTofifty:this.$formatNumber(d.thirtyTofifty,0),
          fiftyTohundred:this.$formatNumber(d.fiftyTohundred,0),
          hundredTothree:this.$formatNumber(d.hundredTothree,0),
          thanThree:this.$formatNumber(d.thanThree,0),
        }))
      }
    },
    async loadSendAddressSource(){
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      } 
      if(this.category==='省份'){
        params.receiveProvince=''
        let res= await  getSendProvinceList(params)
        if(res.code===0){
          this.sendAddressList=res.data.map(d=>d.shipProvince)
        }
      }else{
        params.receiveCity=''
        let res= await  getSendCityList(params)
        if(res.code===0){
          this.sendAddressList=res.data.map(d=>d.shipCity)
        }
      } 
    },
    async loadReceiveAddressSource(){
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
      } 
      if(this.category==='省份'){
        params.shipProvince=''
        let res= await  getReceiveProvinceList(params)
        if(res.code===0){
          this.receiveAddressList=res.data.map(d=>d.receiveProvince)
        }
      }else{
        params.shipCity=''
        let res= await  getReceiveCityList(params)
        if(res.code===0){
          this.receiveAddressList=res.data.map(d=>d.receiveCity)
        }
      }
      
    }
  },
  // watch: {
  //   dateRange: {
  //     handler () {
  //       this.$nextTick(() => {
  //         this.load() 
  //       })
  //     },
  //     // immediate: true
  //   }
  // }
}
</script>

<style lang="scss" scoped>
  .weight-table-container {
    @import "../../scss/index.scss";
    .element-table {
      margin-top: 8px; 
    }
  }
</style>