<template>
  <div class="time-analysis-container">
    <return>时效分析报表</return>
    <!-- 查询条件 -->
    <div class="search-condition" ref="search">
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd">
        </el-date-picker>
      </div>
      <div>
        <span>发货城市</span>
        <el-select v-model="form.deliveryAreaCode" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.sendCityList" :key="item.areaCode" :label="item.cityName" :value="item.areaCode">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>收货城市</span>
        <el-select v-model="form.pickupAreaCode" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.receiveCityList" :key="item.areaCode" :label="item.cityName" :value="item.areaCode">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>服务方式</span>
        <el-select v-model="form.serviceMode" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.serviceModeList" :key="item.code" :label="item.name" :value="item.code">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>加工作日</span>
        <el-select v-model="form.addWorkday" placeholder="请选择" multiple clearable collapse-tags size="medium" >
          <el-option v-for="item in options.addWorkDays" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" round size="medium" @click="loadData">查询</el-button>
      <el-button round size="medium" @click="exportData" :loading="isExport">导出数据</el-button>
    </div>
    <!-- 内容 -->
    <div class="content">
      <div class="signFlag">
        <span :class="{active: form.signFlag === 10}" @click="setSignFlag(10)">按签到</span>
        <span>/</span>
        <span :class="{active: form.signFlag === 20}" @click="setSignFlag(20)">按签收</span>
      </div>
      <el-tabs class="tab-wrapper" v-model="activeTab">
        <el-tab-pane label="产品服务" name="service">
          <ky-table class="element-table" :data="serviceData" style="width: 100%" :height="tableHeight" v-loading="isLoading" :pagination="servicePagination" :paginationVisible="true" @pagination-change="getServiceData">
            <el-table-column prop="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="province" label="月趋势图" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="medium" @click="viewMonthTrend('service', scope.$index)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="province" label="线路趋势图" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="medium" @click="viewLineTrend(scope.$index)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="serviceModeName" label="服务方式"></el-table-column>
            <el-table-column label="总票数">
              <template slot-scope="scope">
                <el-button type="text" size="medium" @click="viewDetails('service', scope.$index)">{{scope.row.totalPollA}}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="取超时率">
              <template slot-scope="scope">{{scope.row.pickupTimeoutRatio}}%</template>
            </el-table-column>
            <el-table-column label="内部履约率" width="100">
              <template slot-scope="scope">{{scope.row.externalCauseRatio}}%</template>
            </el-table-column>
            <el-table-column label="外因超时率" width="100">
              <template slot-scope="scope">{{scope.row.innerEfficacyRatio}}%</template>
            </el-table-column>
            <el-table-column label="超时率">
              <template slot-scope="scope">{{scope.row.timeoutRatio}}%</template>
            </el-table-column>
            <el-table-column label="寄-签耗时（票占比）" header-align="center">
              <el-table-column label="(1-12h]">
                <template slot-scope="scope">{{scope.row.signAnalysis012Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(12-24h]">
                <template slot-scope="scope">{{scope.row.signAnalysis1224Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(24-48h]">
                <template slot-scope="scope">{{scope.row.signAnalysis2448Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(48-72h]">
                <template slot-scope="scope">{{scope.row.signAnalysis4872Ratio}}%</template>
              </el-table-column>
              <el-table-column label="72h以上">
                <template slot-scope="scope">{{scope.row.signAnalysis72Ratio}}%</template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="超时原因（票占比）" header-align="center">
              <el-table-column label="拉货">
                <template slot-scope="scope">{{scope.row.exceptionPollMissRatio}}%</template>
              </el-table-column>
              <el-table-column label="提货耗时长" width="100">
                <template slot-scope="scope">{{scope.row.deliveryTimelongPollRatio}}%</template>
              </el-table-column>
              <el-table-column label="派干耗时长" width="100">
                <template slot-scope="scope">{{scope.row.pickTimelongPollRatio}}%</template>
              </el-table-column>
            </el-table-column>
          </ky-table>
        </el-tab-pane>
        <el-tab-pane label="线路" name="line">
          <ky-table class="element-table" :data="lineData" style="width: 100%" :height="tableHeight" v-loading="isLoading" :pagination="linePagination" :paginationVisible="true" @pagination-change="getLineData">
            <el-table-column prop="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="province" label="月趋势图" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="medium" @click="viewMonthTrend('line', scope.$index)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="startCity" label="发货城市" width="120"></el-table-column>
            <el-table-column prop="endCity" label="收货城市" width="120"></el-table-column>
            <el-table-column label="总票数">
              <template slot-scope="scope">
                <el-button type="text" size="medium" @click="viewDetails('line', scope.$index)">{{scope.row.totalPollA}}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="取超时率">
              <template slot-scope="scope">{{scope.row.pickupTimeoutRatio}}%</template>
            </el-table-column>
            <el-table-column label="内部履约率" width="100">
              <template slot-scope="scope">{{scope.row.externalCauseRatio}}%</template>
            </el-table-column>
            <el-table-column label="外因超时率" width="100">
              <template slot-scope="scope">{{scope.row.innerEfficacyRatio}}%</template>
            </el-table-column>
            <el-table-column label="超时率">
              <template slot-scope="scope">{{scope.row.timeoutRatio}}%</template>
            </el-table-column>
            <el-table-column label="寄-签耗时（票占比）" header-align="center">
              <el-table-column label="(1-12h]">
                <template slot-scope="scope">{{scope.row.signAnalysis012Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(12-24h]">
                <template slot-scope="scope">{{scope.row.signAnalysis1224Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(24-48h]">
                <template slot-scope="scope">{{scope.row.signAnalysis2448Ratio}}%</template>
              </el-table-column>
              <el-table-column label="(48-72h]">
                <template slot-scope="scope">{{scope.row.signAnalysis4872Ratio}}%</template>
              </el-table-column>
              <el-table-column label="72h以上">
                <template slot-scope="scope">{{scope.row.signAnalysis72Ratio}}%</template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="超时原因（票占比）" header-align="center">
              <el-table-column label="拉货">
                <template slot-scope="scope">{{scope.row.exceptionPollMissRatio}}%</template>
              </el-table-column>
              <el-table-column label="提货耗时长" width="100">
                <template slot-scope="scope">{{scope.row.deliveryTimelongPollRatio}}%</template>
              </el-table-column>
              <el-table-column label="派干耗时长" width="100">
                <template slot-scope="scope">{{scope.row.pickTimelongPollRatio}}%</template>
              </el-table-column>
            </el-table-column>
          </ky-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 月趋势图弹窗 -->
    <el-dialog :visible.sync="isMonthTrendDialogVisible" :title="monthTrendTitle + '-月趋势图'" width="1040px">
      <month-trend :title="monthTrendTitle" :data="monthTrendData" :total="monthTrendTotal" @export="exportMonthData"></month-trend>
    </el-dialog>
    <!-- 线路趋势图弹窗 -->
    <el-dialog :visible.sync="isLineDialogVisible" title="线路趋势图" width="1040px">
      <line-trend :serviceMode="lineTrendServiceMode" :provinceList="lineTrendProvinceList" :cityList="lineTrendCityList" @dimtype-change="dimTypeChange"></line-trend>
    </el-dialog>
  </div>
</template>

<script>
import uiUtil from '@/utils/uiUtil'
import dayjs from 'dayjs'
import { ADD_WORD_DAYS, SERVICE_MODE_LIST, getServiceMode} from './constants'
import Return from '../components/Return'
import MonthTrend from './components/monthTrend'
import LineTrend from './components/lineTrend'
import { exportServiceData, exportLineData, exportMonthData } from './export'
import TimeAnalysisService from '@/services/module/timeAnalysis'

const CUSTOMER_DATA_TYPE = {
  SEND_CITY: 10,
  RECEIVE_CITY: 20,
  SERVICE_MODE: 30
}

export default {
  components: { 
    Return,
    MonthTrend,
    LineTrend
  },
  data() {
    return {
      isLoading: false,
      isExport: false,
      isMonthTrendDialogVisible: false,
      isLineDialogVisible: false,
      tableHeight: 0,
      // 产品服务
      serviceData: [],
      servicePagination: {
        pageIndex: 1,
        pageSize: 200,
        pageSizes: [200],
        totalCount: 0,
      },
      // 线路
      lineData: [],
      linePagination: {
        pageIndex: 1,
        pageSize: 200,
        pageSizes: [200],
        totalCount: 0,
      },
      // 月趋势图
      monthTrendData: [],
      monthTrendTotal: null,
      monthTrendTitle: '',
      // 线路趋势图
      lineTrendServiceMode: '',
      lineTrendProvinceList: [],
      lineTrendCityList: [],
      lineTrendDimType: 2,  // 1-始发地 2-目的地
      // 寄件时间仅能选择一年内
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      // Tab
      activeTab: 'service',
      // 查询选项
      options: {
        addWorkDays: ADD_WORD_DAYS,
        serviceModeList: SERVICE_MODE_LIST,
        sendCityList: [],
        receiveCityList: []
      },
      // 时间范围
      dateRange: [],    
      // 快件类型: 2-我发出的、3-我收到的     
      companyType: 2,
      // 查询表单
      form: {
        addWorkday: [],        // 加工作日
        signFlag: 10,          // 10-按签到 20-按签收
        deliveryAreaCode: [],  // 发货城市区号
        pickupAreaCode: [],    // 收货城市区号
        serviceMode: []        // 服务方式
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.setTableHeight)
  },
  created() {
    window.addEventListener('resize', this.setTableHeight)
    this.$nextTick(() => {
      this.setTableHeight()
    })
    // 初始化选项
    TimeAnalysisService.getCustomerInfo(CUSTOMER_DATA_TYPE.SEND_CITY).then(res => {
      this.options.sendCityList = res.data.filter(item => {
        return item.areaCode !== ''
      }).map(item => {
        item.areaCode = `'${item.areaCode}'`
        return item
      })
    })
    TimeAnalysisService.getCustomerInfo(CUSTOMER_DATA_TYPE.RECEIVE_CITY).then(res => {
      this.options.receiveCityList = res.data.filter(item => {
        return item.areaCode !== ''
      }).map(item => {
        item.areaCode = `'${item.areaCode}'`
        return item
      })
    })
  },
  activated() {
    // 获取首页选择的时间范围和公司类型
    if (this.$route.params.dateRange) {
      this.dateRange = this.$route.params.dateRange
    }
    if (this.$route.params.companyType) {
      this.companyType = this.$route.params.companyType
    }
    this.loadData()
  },
  methods: {
    setTableHeight() {
      this.tableHeight = window.innerHeight - this.$refs.search.offsetHeight - 340
    },
    // 切换签到/签收
    setSignFlag(signFlag) {
      this.form.signFlag = signFlag
      this.loadData()
    },
    // 加载数据
    loadData() {
      this.servicePagination.pageIndex = 1
      this.getServiceData()
      this.linePagination.pageIndex = 1
      this.getLineData()
    },
    // 获取产品服务数据
    getServiceData() {
      this.isLoading = true
      TimeAnalysisService.getServiceData(this.dateRange, this.companyType, this.form, this.servicePagination.pageIndex, this.servicePagination.pageSize).then(res => {
        this.serviceData = res.data
        this.servicePagination.totalCount = res.data.length
        for (let i = 0; i < this.serviceData.length; i++) {
          let item = this.serviceData[i]
          item.serviceModeName = getServiceMode(item.serviceMode)
          item.index = i + 1
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    // 获取线路数据
    getLineData() {
      this.isLoading = true
      TimeAnalysisService.getLineData(this.dateRange, this.companyType, this.form, this.linePagination.pageIndex, this.linePagination.pageSize).then(res => {
        this.lineData = res.data.rows
        this.linePagination.totalCount = res.data.rowTotal
        for (let i = 0; i < this.lineData.length; i++) {
          let item = this.lineData[i]
          item.index = i + 1
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    // 月趋势图
    viewMonthTrend(type, index) {
      // 初始化数据
      this.monthTrendData = []
      this.monthTrendTotal = null
      this.isMonthTrendDialogVisible = true
      let form = {...this.form}
      if (type === 'service') {
        form.serviceMode = [`'${this.serviceData[index].serviceMode}'`]
        this.monthTrendTitle = getServiceMode(this.serviceData[index].serviceMode)
        form.serviceModeFlag = 1
        form.lineCode = ''
        form.lineFlag = 2
      } else {
        let line = this.lineData[index]
        this.monthTrendTitle = `${line.startCity}至${line.endCity}`
        form.lineCode = line.lineCode
        form.lineFlag = 1
        form.serviceMode = this.form.serviceMode
        form.serviceModeFlag = 2
      }
      // 获取汇总
      TimeAnalysisService.getMonthTrend(this.dateRange, this.companyType, form, 1).then(res => {
        if (res.data && res.data.length > 0) {
          this.monthTrendTotal = res.data[0]
        }
      })
      // 获取月趋势
      TimeAnalysisService.getMonthTrend(this.dateRange, this.companyType, form).then(res => {
        let data = res.data
        // 查询条件的起始月份，默认显示近13个月数据，需填充不存在的月份(数据均为0)
        const currentMonth = this.dateRange[0]
        const displayMonthNum = 13
        for (let i = 0; i < displayMonthNum; i++) {
          let month = dayjs(currentMonth, 'YYYY-MM-DD').subtract(i, 'month').format('YYYY-MM')
          // 判断该月份是否存在
          let isExist = false
          for (let j = 0; j < data.length; j++) {
            let item = data[j]
            if (item.month == month) {
              isExist = true
              item.index = displayMonthNum - i
              this.monthTrendData.unshift(item)
              break
            }
          }
          // 不存在则填充
          if (!isExist) {
            let item = {
              index: displayMonthNum - i,   // 序号
              month,  // 月份
              totalPollA: '0',   // 总票数
              totalPollChainRatio: '0.0',   // 总票数环比
              totalLineA: '0',  // 线路
              totalLineChainRatio: '0.0',  // 线路环比
              pickupTimeoutRatio: '0.0',  // 取超时率
              pickupTimeoutChainRatio: '0.0',  // 取超时率涨幅
              externalCauseRatio: '0.0',  // 内部履约率
              externalCauseChainRatio: '0.0',  // 内部履约率涨幅
              innerEfficacyRatio: '0.0',  // 外因超时率
              innerEfficacyChainRatio: '0.0',  // 外因超时率涨幅
              timeoutRatio: '0.0',  // 超时率
              timeoutChainRatio: '0.0'  // 超时率涨幅
            }
            this.monthTrendData.unshift(item)
          }
        }
      })
    },
    // 线路趋势图
    viewLineTrend(index) {
      this.isLineDialogVisible = true
      this.lineTrendServiceMode = this.serviceData[index].serviceMode
      this.loadLineTrendData()
    },
    loadLineTrendData() {
      let form = {...this.form}
      form.serviceMode = [`'${this.lineTrendServiceMode}'`]
      form.serviceModeFlag = 1
      // 省数据
      TimeAnalysisService.totalLineTrend(this.dateRange, this.companyType, 1, this.lineTrendDimType, form).then(res => {
        this.lineTrendProvinceList = res.data.rows
        for (let i = 0; i < this.lineTrendProvinceList.length; i++) {
          this.lineTrendProvinceList[i].index = i + 1
        }
      })
      // 市数据
      TimeAnalysisService.totalLineTrend(this.dateRange, this.companyType, 2, this.lineTrendDimType, form).then(res => {
        this.lineTrendCityList = res.data.rows
        for (let i = 0; i < this.lineTrendCityList.length; i++) {
          this.lineTrendCityList[i].index = i + 1
        }
      })
    },
    // 监听线路趋势图，切换始发地/目的地
    dimTypeChange(trendDimType) {
      this.lineTrendDimType = trendDimType
      this.loadLineTrendData()
    },
    // 详情
    viewDetails(type, index) {
      let params = {
        dateRange: this.dateRange,
        companyType: this.companyType,
        form: {...this.form}
      }
      if (type === 'service') {
        params.form.serviceMode = [`'${this.serviceData[index].serviceMode}'`]
        params.form.serviceModeFlag = 1
        params.form.lineCode = ''
        params.form.lineFlag = 2
      } else {
        params.form.lineCode = this.lineData[index].lineCode
        params.form.lineFlag = 1
        params.form.serviceMode = this.form.serviceMode
        params.form.serviceModeFlag = 2
      }
      this.$router.push({
        name: 'time-analysis-details',
        params
      })
    },
    // 导出数据 
    exportData() {
      this.isExport = true
      // 产品服务-直接导出
      if (this.activeTab === 'service') {
        let serviceFileName = `各服务方式时效明细(${this.dateRange[0]}_${this.dateRange[1]})`
        if (this.servicePagination.totalCount > this.servicePagination.pageSize) {
          exportServiceData(this.lineData, serviceFileName)
          this.isExport = false
        } else {
          TimeAnalysisService.getServiceData(this.dateRange, this.companyType, this.form, 1, this.servicePagination.totalCount).then(res => {
            exportServiceData(res.data.rows, serviceFileName)
          }).finally(() => {
            this.isExport = false
          })
        }
      }
      // 线路-分页，需要请求后导出
      else if (this.activeTab === 'line') {
        let lineFileName = `各线路时效明细(${this.dateRange[0]}_${this.dateRange[1]})`
        if (this.linePagination.totalCount > this.linePagination.pageSize) {
          exportLineData(this.lineData, lineFileName)
          this.isExport = false
        } else {
          TimeAnalysisService.getLineData(this.dateRange, this.companyType, this.form, 1, this.linePagination.totalCount).then(res => {
            exportLineData(res.data.rows, lineFileName)
          }).finally(() => {
            this.isExport = false
          })
        }
      }
    },
    exportMonthData(fileName) {
      exportMonthData(this.monthTrendData, fileName)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/index.scss";
.time-analysis-container {
  .search-condition {
    padding: 20px 20px 5px 20px;
    border-bottom: 1px solid #f1f1f5;
  }
  .content {
    .signFlag {
      position: absolute;
      z-index: 99;
      right: 20px;
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