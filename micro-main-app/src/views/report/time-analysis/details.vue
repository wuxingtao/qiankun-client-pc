<template>
  <div class="time-analysis-details">
    <return beforeRoutePath="/admin/report/time-analysis">返回</return>
    <!-- 查询条件 -->
    <div class="search-condition" ref="search">
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd">
        </el-date-picker>
      </div>
      <div>
        <span>服务方式</span>
        <el-select v-model="form.serviceMode" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.serviceModeList" :key="item.code" :label="item.name" :value="item.code">
          </el-option>
        </el-select>
      </div>
      <div class="delay-reason"> 
        <span>超时原因</span>
        <el-select v-model="form.unDeliveryReasonType" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.delayReasonList" :key="item.code" :label="item.label" :value="item.code">
          </el-option>
        </el-select>
      </div>
      <div class="delay-time"> 
        <span>超时时长</span>
        <el-select v-model="form.timeoutTimeLogicType" placeholder="请选择" clearable collapse-tags size="medium" @change="delayTimeChange">
          <el-option v-for="item in options.delayTimeList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-input v-model="form.timeoutTimeStart" maxlength="5" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
        <span v-show="form.timeoutTimeLogicType === 3">-</span>
        <el-input v-show="form.timeoutTimeLogicType === 3" v-model="form.timeoutTimeEnd" maxlength="5" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="search">查询</el-button>
      <el-button round size="medium" @click="exportData" :loading="isExport">导出数据</el-button>
    </div>
     <!-- 内容 -->
    <div class="content">
      <ky-table class="element-table" :data="dataList" style="width: 100%" :height="tableHeight" v-loading="isLoading" :pagination="pagination" :paginationVisible="true" @pagination-change="loadData">
        <el-table-column prop="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="waybillNumber" label="运单号" width="150"></el-table-column>
        <el-table-column prop="serviceType" label="服务方式"></el-table-column>
        <el-table-column prop="consumingPromiseDuration" label="承诺时长(h)" width="100"></el-table-column>
        <el-table-column prop="actualConsumingTime" label="实际耗时(h)" width="100"></el-table-column>
        <el-table-column prop="timeoutTime" label="超时时长(h)" width="100"></el-table-column>
        <el-table-column prop="delayReason" label="超时原因" width="150"></el-table-column>
        <el-table-column prop="customerPayName" label="付款公司" width="120"></el-table-column>
        <el-table-column prop="piece" label="件数"></el-table-column>
        <el-table-column prop="deliveryAreaCode" label="发货城市" width="120"></el-table-column>
        <el-table-column prop="pickupAreaCode" label="收货城市" width="120"></el-table-column>
        <el-table-column prop="deliveryTime" label="寄件时间" width="140"></el-table-column>
        <el-table-column prop="deliverySign" label="签到时间" width="140"></el-table-column>
        <el-table-column prop="agentDeliveryAging" label="承诺时间" width="140"></el-table-column>
        <el-table-column prop="goodsType" label="托寄物"></el-table-column>
      </ky-table>
    </div>
  </div>
</template>

<script>
import uiUtil from '@/utils/uiUtil'
import dayjs from 'dayjs'
import Return from '../components/Return'
import { SERVICE_MODE_LIST, DELAY_REASON_LIST, DELAY_LOGIC_TYPE_LIST, getCommonServiceType, getDelayReason} from './constants'
import TimeAnalysisService from '@/services/module/timeAnalysis'
import { exportDetailData } from './export'

export default {
  components: { 
    Return
  },
  activated() {
    if (this.$route.params.dateRange) {
      this.dateRange = this.$route.params.dateRange
    }
    if (this.$route.params.companyType) {
      this.companyType = this.$route.params.companyType
    }
    if (this.$route.params.form) {
      this.form = {...this.form, ...this.$route.params.form}
      this.form.unDeliveryReasonType = ''
      this.form.timeoutTimeLogicType = ''
      this.form.timeoutTimeStart = ''
      this.form.timeoutTimeEnd = ''
    }
    this.dataList = []
    this.loadData()
  },
  created() {
    window.addEventListener('resize', this.setTableHeight)
    this.$nextTick(() => {
      this.setTableHeight()
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.setTableHeight)
  },
  data() {
    return {
      isLoading: false,
      isExport: false,
      tableHeight: 0,
      // 寄件时间仅能选择一年内
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      // 时间范围
      dateRange: [],    
      // 快件类型: 2-我发出的、3-我收到的     
      companyType: 2,
      pagination: {
        pageIndex: 1,
        pageSize: 200,
        pageSizes: [200],
        totalCount: 0,
      },
      // 查询选项
      options: {
        serviceModeList: SERVICE_MODE_LIST,
        delayReasonList: DELAY_REASON_LIST,
        delayTimeList: DELAY_LOGIC_TYPE_LIST
      },
      form: {
        timeoutTimeLogicType: '',
        timeoutTimeStart: '',
        timeoutTimeEnd: '',
        signFlag: 10
      },
      dataList: []
    }
  },
  methods: {
    // 表格动态高度
    setTableHeight() {
      this.tableHeight = window.innerHeight - this.$refs.search.offsetHeight - 270
    },
    // 超时时长
    delayTimeChange() {
      this.form.timeoutTimeStart = ''
      this.form.timeoutTimeEnd = ''
    },
    // 查询
    search() {
      // 重置页码
      this.pagination.pageIndex = 1
      this.loadData()
    },
    loadData() {
      // 校验超时时长范围
      if (this.form.timeoutTimeLogicType === 3) {
        if (!this.form.timeoutTimeStart || !this.form.timeoutTimeEnd || (this.form.timeoutTimeStart >= this.form.timeoutTimeEnd)) {
          this.$message.warning('请输入正确的超时时长范围')
          return
        }
      }
      // 未输入数值则清空
      if (this.form.timeoutTimeLogicType && !this.form.timeoutTimeStart) {
        this.$message.warning('请输入超时时长')
        return
      }
      this.isLoading = true
      TimeAnalysisService.getDetailLsit(this.dateRange, this.companyType, this.form, this.pagination.pageIndex, this.pagination.pageSize).then(res => {
        this.dataList = res.data.rows
        this.pagination.totalCount = res.data.rowTotal
        for (let i = 0; i < this.dataList.length; i++) {
          let item = this.dataList[i]
          item.serviceType = getCommonServiceType(item.serviceMode)
          item.delayReason = getDelayReason(item.unDeliveryReasonType)
          item.index = this.pagination.pageSize * (this.pagination.pageIndex - 1) + i + 1
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    // 导出数据
    exportData() {
      this.isExport = true
      exportDetailData(this.dataList, `时效分析运单明细(${this.dateRange[0]}_${this.dateRange[1]})`)
      this.isExport = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/index.scss";
.time-analysis-details {
  .search-condition {
    padding: 20px 20px 5px 20px;
    border-bottom: 1px solid #f1f1f5;
    
    .delay-reason {
      /deep/ .el-input {
        width: 320px;
      }
    }
    .delay-time {
      /deep/ .el-input {
        width: 50px;
        margin: 0 5px;

        > .el-input__inner {
          border-radius: 10px;
          height: 35px;
        }
      }
      /deep/ .el-select > .el-input {
        width: 100px;
      }
    }
  }
  .content {
    padding: 0 20px;
    .signFlag {
      color: #999999;
      font-size: 14px;
      line-height: 50px;
      > span {
        padding: 0 5px;
        &:hover {
          cursor: pointer;
          color: #9378FA;
        }
      }
      .active {
        color: #9378FA;
      }
    }
  }
}
</style>