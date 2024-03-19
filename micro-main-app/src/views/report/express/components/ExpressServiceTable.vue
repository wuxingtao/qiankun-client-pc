<template>
  <div class="express-service-table-container">
    <div class="search-condition">
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd" @change="loadData">
        </el-date-picker>
      </div>
    </div>
    <div class="links">
      <span :class="{'active':dataBy==='ticket'}" @click="setDataBy('ticket')">按票数</span>
      <i>/</i>
      <span :class="{'active':dataBy==='piece'}" @click="setDataBy('piece')">按件数</span>
    </div>
    <ky-table class="element-table" :data="tableData" style="width: 100%" :height="'calc(100vh - 409px)'" ref="kyTable">
      <el-table-column prop="serviceMode" label="服务方式"></el-table-column>
      <el-table-column prop="waybillCount" :label="`发货总${dataBy==='ticket'?'票':'件'}数`"></el-table-column>
      <el-table-column prop="waybillCountByPayShip" label="寄付"></el-table-column>
      <el-table-column prop="waybillCountByPayReceive" label="到付"></el-table-column>
      <el-table-column prop="waybillCountByPayOther" label="第三方付"></el-table-column>
      <el-table-column label="有回单服务">
        <template slot-scope="{row}">
          <el-tooltip content="Bottom center" placement="left" :open-delay="500">
            <div slot="content">
              <div>
                回单原件：{{row.waybillCountByReceiptOriginal}}
              </div>
              <div style="padding-top:8px">
                回单图片：{{row.waybillCountByReceiptPicture}}
              </div>
            </div>
            <div> {{row.waybillCountByReceipt}}</div>

          </el-tooltip>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="waybillCountByReceiptOriginal" label="回单原件份数"></el-table-column>
        <el-table-column prop="waybillCountByReceiptPicture" label="回单图片份数"></el-table-column> -->
      <el-table-column prop="errorWaybillCount" label="异常总数"></el-table-column>
    </ky-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { getExpressServiceWay } from '@/services/api/report'
export default {
  props: {
    expressType: {
      tyep: Number,//0:我发出的 1：我收到的
      require: true
    }
  },
  data () {
    return {
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      tableData: [],
      dataBy: 'ticket'
    }
  },
  activated () {
    const dateRange = this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.dateRange = dateRange
    }
    this.loadData()
  },
  methods: {
    doLayout(){
      this.$refs.kyTable.doLayout()
    },
    setDataBy (type) {
      this.dataBy = type
      this.loadData()
    },
    async loadData () {
      let res
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        expressType: this.expressType,
        statisticsUnit: this.dataBy === 'ticket' ? 0 : 1
      }
      res = await getExpressServiceWay(params)
      if (res.code === 0) {
        this.tableData = res.data.map(d=>Object.assign(d,{
          waybillCount:this.$formatNumber(d. waybillCount,0),
          waybillCountByPayShip:this.$formatNumber(d. waybillCountByPayShip,0),
          waybillCountByPayReceive:this.$formatNumber(d. waybillCountByPayReceive,0),
          waybillCountByPayOther:this.$formatNumber(d. waybillCountByPayOther,0),
          waybillCountByReceiptOriginal:this.$formatNumber(d. waybillCountByReceiptOriginal,0),
          waybillCountByReceiptPicture:this.$formatNumber(d. waybillCountByReceiptPicture,0),
          waybillCountByReceipt:this.$formatNumber(d. waybillCountByReceipt,0),
        }))
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .express-service-table-container {
    @import "../../scss/index.scss";
    .search-condition {
      border-bottom: 1px solid #f1f1f5;
      padding-bottom:  8px;
    }
    .links {
      margin: 20px 0;
      font-size: 14px;
      color: #999999;
      z-index: 2;
      & > span {
        cursor: pointer;
        &.active {
          color: #8365f6;
        }
      }
      & > i {
        padding: 0 8px;
      }
    }
    .element-table {
      margin-top: 20px;
    }
  }
</style>