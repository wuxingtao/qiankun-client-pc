<template>
  <div class="bill-summary--container">
    <div v-show="billStatus" class="status--wrapper" :style="{backgroundImage:`url(${billStatusImg})`}">
      {{billStatus}}
    </div>
    <div class="month--wrapper">
      <el-select class="month-select" v-model="selectedMonth" @change="handleMonthChange">
        <el-option v-for="(item, index) in months" :key="index" :label="item" :value="item">{{item}}</el-option>
      </el-select>
      <span class="month-info" v-show="summaryData.monthInfo"><i class="iconfont icon-info" />{{summaryData.monthInfo}}</span>
    </div>
    <div class="summary-info">
      <div class="summary-data">
        <div class="data-item">
          <svg-icon icon-class="icon-money2" />
          <span>
            <div>总费用</div>
            <div>{{summaryData.totalCost}}</div>
          </span>
        </div>
        <div class="symbol-item">=</div>
        <div class="data-item">
          <svg-icon icon-class="icon-money" />
          <span>
            <div>公司实收</div>
            <div>{{summaryData.totalCost}}</div>
          </span>
        </div>
        <div class="symbol-item"> +</div>
        <div class="data-item">
          <svg-icon icon-class="icon-tax" />
          <span>
            <div>另补税金</div>
            <div>{{summaryData.additionalTax}}</div>
          </span>
        </div>
        <div class="symbol-item"> +</div>
        <div class="data-item">
          <svg-icon icon-class="icon-fee2" />
          <span>
            <div>回单费用</div>
            <div>{{summaryData.receiptFee}}</div>
          </span>
        </div>
      </div>
      <div class="summary-button">
        <el-button v-if="billStatus === '未对账'" size="small" type="primary" @click="confirmTheBill">确认对账</el-button>
        <el-link :underline="false" type="primary" icon="iconfont icon-tel" @click="contactFinancial">联系财务</el-link>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { contactFinancial, confirmBillsApi } from '@/services/api/bill'
export default {
  name: 'bill-summary',
  props: {
    summaryData: {
      type: Object,
      required: true
    },
    billStatus:{
      type: String,
      required: true
    }
  },
  data () {
    return {
      months: [],
      selectedMonth: '',
    }
  },
  mounted () {
    this.initMonths()
  },
  methods: {
    initMonths () {
      for (let i = 0; i > -6; i--) {
        let month = dayjs().add(i, "M").format("YYYY-MM")
        this.months.push(month)
      }
      this.selectedMonth = this.months[0]
    },
    handleMonthChange () {
      this.$emit('on-month-change', this.selectedMonth)
    },
    async contactFinancial () {
      const res = await contactFinancial()
      if (res.code === 0) {
        this.$alert(res.data, '联系财务', {
          confirmButtonText: '我知道了'
        })
      }
    },
    async confirmTheBill () {
      await this.$confirm("是否确认账单信息？", "确认账单")
      let params = {
        month: this.selectedMonth,
        mobile: getPhone(),
        companyNo: getCustomerCode(),
        isHasAccount: "有"
      }
      const res = await confirmBillsApi(params)
      if (res.code === 0) {
        this.$emit('update:billStatus','已对账')
        this.$message({
          message: "账单确认成功",
          type: "success"
        })
      }
    },
  },
  computed:{
    billStatusImg(){
      if(this.billStatus === '已对账'){
        return require('@assets/image/bill/status-confirm.png')
      }
      return require('@assets/image/bill/status-unconfirm.png')
    }
  }
}
</script>

<style lang="scss" scoped>
  .bill-summary--container {
    box-sizing: border-box;
    padding-left: 20px;
    // margin-top: 2px;
    margin-bottom: 8px;
    position: relative;
    height: 142px;
    background: url("~@assets/image/bill/bg-summary.png") no-repeat;
    background-position-x: right;
    background-color: #fff;
    .status--wrapper {
      width: 84px;
      height: 36px;
      padding-top: 8px;
      position: absolute;
      top: -2px;
      right: 20px;
      background-repeat: no-repeat;
      font-size: 16px;
        font-weight: bold;
        color: #ffffff;
        text-align: center;
    }
    .month--wrapper {
      position: absolute;
      top: 12px;
      display: flex;
      align-items: center;
      .month-select {
        /deep/ {
          .el-input input {
            width: 122px;
            height: 32px;
            border: 1px solid #dcdae2;
            border-radius: 18px;
          }
          .el-input__suffix {
            background: url("~@/assets/image/bill/date.png") no-repeat center;
            .el-input__suffix-inner {
              visibility: hidden;
            }
          }
        }
      }
      .month-info {
        padding-left: 16px;
        font-size: 14px;
        color: #ffa40d;
        .icon-info {
          padding-right: 8px;
          font-size: 14px;
        }
      }
    }
    .summary-info {
      padding-top: 69px;
      display: flex;
      .summary-data {
        flex: 1;
        display: flex;
        .data-item {
          display: flex;
          align-items: center;
          .svg-icon {
            font-size: 52px;
            color: skyblue;
            padding-right: 16px;
          }
          & > span {
            display: inline-block;
            font-size: 16px;
            color: rgba(51, 51, 51, 0.93);
            line-height: 16px;
            & > div:last-of-type {
              padding-top: 12px;
              font-size: 24px;
              font-weight: bold;
            }
          }
        }
        .symbol-item {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #999999;
          font-size: 24px;
        }
      }
      .summary-button {
        margin-left: 32px;
        padding: 0 20px 0 32px;
        background: url("~@assets/image/bill/split-line.png") no-repeat;
        display: flex;
        align-items: center;
        button {
          border-radius: 18px;
        }
        .el-link {
          margin-left: 24px;
          /deep/ .icon-tel {
            margin-right: 8px;
          }
        }
      }
    }
  }
</style>