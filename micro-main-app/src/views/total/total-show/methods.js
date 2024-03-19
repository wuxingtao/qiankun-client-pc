import * as API from '@/services/api/total.js'
import { getCustomerId } from '@/utils/storage'
import { cloneDeep } from 'lodash'
import { checkParams } from '@/utils/total.js'
import { Message } from 'element-ui'
import { getAuth, pushData, checkTime, checkSaveTime } from '@/utils/total'

export default {
  isAuth(keys) {
    let isAuth = false
    if (
      this.$store.state &&
      this.$store.state.tatol &&
      this.$store.state.tatol.auth &&
      this.$store.state.tatol.auth.dataBoard
    ) {
      let dataBoard = this.$store.state.tatol.auth.dataBoard
      keys.forEach(key => {
        if (+dataBoard[key] === 10) {
          isAuth = true
        }
      })
    }
    return isAuth
  },
  // header 搜索
  searchHeader() {
    // 判断时间是否超过2个月
    if (!checkSaveTime(this.formData)) {
      let isTwo = checkTime(this.formData)
      if (isTwo) {
        return
      }
    }
    this.$nextTick(() => {
      this.search(this.formData)
      this.leftPanel(this.formData)
    })
  },
  // 点击侧面导航
  searchAside() {
    this.search(this.copyFormData)
  },
  // 左边aside leftPanel
  leftPanel(formData) {
    let isChange = checkParams(formData, this.oldParams['leftPanel'])
    if (
      isChange &&
      this.oldParams['leftPanel'] &&
      Object.keys(this.oldParams['leftPanel']).length > 0
    ) {
      return
    }
    this.oldParams['leftPanel'] = cloneDeep(formData)
    this.getOverviewLeftPanel(formData)
  },

  // 排序
  async changeSort(val) {
    let orderByMode = val.order === 'ascending' ? 0 : 1
    this.service.isSortAgingTop5 = true
    this.top5({
      ...this.copyFormData,
      topSize: 5,
      orderByClauses: [
        {
          field: val.prop,
          orderByMode: orderByMode,
        },
      ],
    })
  },
  // 搜索
  async search(params) {
    this.copyFormData = cloneDeep(params)
    if (Array.isArray(params.startDate)) {
      if (this.copyFormData.dateType === 'shipingTime') {
        this.copyFormData = {
          ...this.copyFormData,
          startDate: params.startDate[0],
          endDate: params.startDate[1],
          agentDeliveryAgingStart: '',
          agentDeliveryAgingEnd: '',
        }
      } else {
        this.copyFormData = {
          ...this.copyFormData,
          startDate: '',
          endDate: '',
          agentDeliveryAgingStart: params.startDate[0],
          agentDeliveryAgingEnd: params.startDate[1],
        }
      }
    }
    delete this.copyFormData.dateType
    if (this.asideType === 'business') {
      //  业务概况
      if (getAuth(this, 'totalBillWeight')) {
        this.getBusinessRation(this.copyFormData)
      }
      if (getAuth(this, 'realTotalWeight')) {
        this.getBusinessActualRation(this.copyFormData)
      }
      if (getAuth(this, 'totalPoll') || getAuth(this, 'totalNumber')) {
        this.getBusinessTrendList(this.copyFormData)
      }
      if (getAuth(this, 'totalCost')) {
        this.getBusinessCostRation(this.copyFormData)
      }
      // await this.getBusinessCostTrendList( this.copyFormData)
      return
    }
    if (this.asideType === 'service') {
      //  服务质量
      await this.getQualityAreaList(this.copyFormData)
      if (this.formData.shipingCity) {
        await this.getQualityAgingFlow(this.copyFormData)
      } else {
        this.service.agingFlow = {}
      }
      this.getQualityAgingTop5(this.copyFormData)
      if (getAuth(this, 'deliveredPoll') || getAuth(this, 'delivereRate')) {
        this.getQualityDelivered(this.copyFormData)
      }
      if (getAuth(this, 'reachNumber') || getAuth(this, 'reachRate')) {
        this.getQualityAgingAchieved(this.copyFormData)
      }
    }
    if (this.asideType === 'error') {
      // 异常分析
      if (getAuth(this, 'collectedTimeoutRate') || getAuth(this, 'collectedTimeoutNumber')) {
        this.getCollectTimeout(this.copyFormData || this.formData || {})
      }
      if (getAuth(this, 'delayRate') || getAuth(this, 'delayNumber')) {
        this.getUnAgingAchieved(this.copyFormData)
      }
      if (getAuth(this, 'delayCheckInRate') || getAuth(this, 'delayCheckInNumber')) {
        this.getDeliveryOuttimes(this.copyFormData)
      }
      if (getAuth(this, 'wornLoseNumber') || getAuth(this, 'returnNumber')) {
        this.getAnalysis(this.copyFormData || this.formData || {})
      }
    }
  },

  // 区域列表 查询 (V1.0)
  async getQualityAreaList(param) {
    let isLoad = this.checkSuccess(param, 'qualityAreaList', this.service.qualityAreaList)
    if (isLoad) {
      return
    }
    this.service.qualityAreaListLoading = true
    await API.qualityAreaList(param)
      .then(reg => {
        this.service.qualityAreaListLoading = false
        if (reg.code === 0) {
          this.service.qualityAreaList = reg.data || []
          let qualityAreaList = this.service.qualityAreaList[0] || {}
          this.copyFormData.shipingCity = qualityAreaList.areaCityName || ''
          this.formData.shipingCity = qualityAreaList.areaCityName || ''
          return
        }
        this.service.qualityAreaList = []
        this.copyFormData.shipingCity = ''
        this.formData.shipingCity = ''
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.service.qualityAreaListLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 破损丢失、退货、转寄 查询 (V1.0)
  async getAnalysis(param) {
    let isLoad = this.checkSuccess(param, 'analysis', this.error.analysis)
    if (isLoad) {
      return
    }
    this.error.analysisLoading = true
    await API.analysis(param)
      .then(reg => {
        this.error.analysisLoading = false
        if (reg.code === 0) {
          this.error.analysis = reg.data || {}
          return
        }
        this.error.analysis = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.error.analysisLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 时效延误 查询 (V1.0)
  async getUnAgingAchieved(param) {
    let isLoad = this.checkSuccess(param, 'unAgingAchieved', this.error.unAgingAchieved)
    if (isLoad) {
      return
    }
    this.error.unAgingAchievedLoading = true
    await API.unAgingAchieved(param)
      .then(reg => {
        this.error.unAgingAchievedLoading = false
        if (reg.code === 0) {
          this.error.unAgingAchieved = reg.data || {}
          return
        }
        this.error.unAgingAchieved = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.error.unAgingAchievedLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 派签到延误 查询 (V1.0)
  async getDeliveryOuttimes(param) {
    let isLoad = this.checkSuccess(param, 'deliveryOuttimes', this.error.deliveryOuttimes)
    if (isLoad) return
    this.error.deliveryOuttimesLoading = true
    await API.deliveryOuttimes(param)
      .then(res => {
        this.error.deliveryOuttimesLoading = false
        if (res.code === 0) {
          this.error.deliveryOuttimes = res.data || {}
          return
        }
        this.error.deliveryOuttimes = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.error.deliveryOuttimesLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 揽收超时 查询 (V1.0)
  async getCollectTimeout(param) {
    let isLoad = this.checkSuccess(param, 'collectTimeout', this.error.collectTimeout)
    if (isLoad) {
      return
    }
    this.error.collectTimeoutLoading = true
    await API.collectTimeout(param)
      .then(reg => {
        this.error.collectTimeoutLoading = false
        if (reg.code === 0) {
          this.error.collectTimeout = reg.data || {}
          return
        }
        this.error.collectTimeout = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.error.collectTimeoutLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  //  时效流向分析 查询
  async getQualityAgingFlow(param) {
    let isLoad = this.checkSuccess(param, 'agingFlow', this.service.agingFlow)
    if (isLoad) {
      return
    }
    this.service.agingFlowLoading = true
    await API.qualityAgingFlow({
      ...param,
      topSize: 20,
    })
      .then(reg => {
        this.service.agingFlowLoading = false
        if (reg.code === 0) {
          this.service.agingFlow = reg.data || {}
          return
        }
        this.service.agingFlow = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.service.agingFlowLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },
  //  业务概况-票数趋势图
  async getOverviewLeftPanel(param) {
    this.asideMenu = {
      overview: {},
      serviceQuality: {},
      anomalous: {},
    }
    await API.overviewLeftPanel(param)
      .then(reg => {
        if (reg.code === 0) {
          this.asideMenu = reg.data || {}
        }
      })
      .catch(() => {})
    // 修正数据时间
    await API.updateTime()
      .then(res => {
        this.updateTime = res.data[0].updateTime
      })
      .catch(err => console.log('err', err))
  },

  //  业务概况-票数趋势图
  async getBusinessTrendList(param) {
    let isLoad = this.checkSuccess(param, 'ticketData', this.business.ticketData)
    if (isLoad) {
      return
    }
    this.business.ticketDataLoading = true
    await API.overviewVotesTrendList(param)
      .then(reg => {
        this.business.ticketDataLoading = false
        if (reg.code === 0) {
          this.business.ticketData = reg.data || {}
          return
        }
        this.business.ticketData = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.business.ticketDataLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 业务概况-实际重量
  async getBusinessActualRation(param) {
    let isLoad = this.checkSuccess(param, 'actualWeightRation', this.business.actualWeightRation)
    if (isLoad) return
    this.business.actualWeightRationLoading = true
    await API.overviewActualWeightsRation(param)
      .then(reg => {
        this.business.actualWeightRationLoading = false
        if (reg.code === 0) {
          let data = reg.data || {}
          let overviewWeightRatioList = pushData(data.overviewWeightRatioList)
          let overviewWeightRatioMonthList = pushData(data.overviewWeightRatioMonthList)
          data.overviewWeightRatioList = overviewWeightRatioList
          data.overviewWeightRatioMonthList = overviewWeightRatioMonthList
          this.business.actualWeightRation = data
          return
        }
        this.business.actualWeightRation = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.business.actualWeightRationLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  //  业务概况-重量区间占比(饼图)
  async getBusinessRation(param) {
    let isLoad = this.checkSuccess(param, 'weightRation', this.business.weightRation)
    if (isLoad) {
      return
    }
    this.business.weightRationLoading = true
    await API.overviewWeightRation(param)
      .then(reg => {
        this.business.weightRationLoading = false
        if (reg.code === 0) {
          let data = reg.data || {}
          let overviewWeightRatioList = pushData(data.overviewWeightRatioList)
          let overviewWeightRatioMonthList = pushData(data.overviewWeightRatioMonthList)
          data.overviewWeightRatioList = overviewWeightRatioList
          data.overviewWeightRatioMonthList = overviewWeightRatioMonthList
          this.business.weightRation = data
          return
        }
        this.business.weightRation = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.business.weightRationLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  //  业务概况-客户报表-业务概况-费用组成(饼图/增值费趋势图)
  async getBusinessCostRation(param) {
    let isLoad = this.checkSuccess(param, 'costRation', this.business.costRation)
    if (isLoad) {
      return
    }
    this.business.costRationLoading = true
    await API.overviewCostRation(param)
      .then(reg => {
        this.business.costRationLoading = false
        if (reg.code === 0) {
          this.business.costRation = reg.data || {}
          return
        }
        this.business.costRation = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.business.costRationLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  //  业务概况-客户报表-业务概况-费用组成(饼图/增值费趋势图)
  async getBusinessCostTrendList(param) {
    this.business.costTrendList = {}
    await API.overviewCostTrendList(param)
      .then(reg => {
        if (reg.code === 0) {
          this.business.costTrendList = reg.data
        }
      })
      .catch(() => {})
  },

  // 物流实时状态
  async getNavigateQueryRealTime() {
    let param = {
      customerId: getCustomerId(),
      dataType: this.formData.customerFlag,
    }
    await API.navigateQueryRealTime(param)
      .then(reg => {
        if (reg.code === 0) {
          return (this.realData = reg.data || {})
        }
        this.realData = {}
      })
      .catch(() => {})
  },
  // 寄件城市-TOP5 (V1.0))
  async getQualityAgingTop5(param) {
    let isLoad = this.checkSuccess(param, 'agingTop5', this.service.agingTop5)
    if (isLoad) {
      return
    }
    this.service.isSortAgingTop5 = false
    this.top5(param)
  },
  top5(param) {
    this.service.agingTop5Loading = true
    API.qualityAgingTop5({
      ...param,
      topSize: 5,
    })
      .then(reg => {
        this.service.agingTop5Loading = false
        if (reg.code === 0) {
          this.service.agingTop5 = reg.data || []
          return
        }
        this.service.agingTop5 = []
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.service.agingTop5Loading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },

  // 妥投率
  async getQualityDelivered(param) {
    let isLoad = this.checkSuccess(param, 'delivered', this.service.delivered)
    if (isLoad) {
      return
    }
    this.service.deliveredLoading = true
    await API.qualityDelivered(param)
      .then(reg => {
        this.service.deliveredLoading = false
        if (reg.code === 0) {
          this.service.delivered = reg.data || {}
          return
        }
        this.service.delivered = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.service.deliveredLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },
  // 时效达成趋势图 查询 (V1.0)
  async getQualityAgingAchieved(param) {
    let isLoad = this.checkSuccess(param, 'agingAchieved', this.service.agingAchieved)
    if (isLoad) {
      return
    }
    this.service.agingAchievedLoading = true
    await API.qualityAgingAchieved(param)
      .then(reg => {
        this.service.agingAchievedLoading = false
        if (reg.code === 0) {
          this.service.agingAchieved = reg.data || {}
          return
        }
        this.service.agingAchieved = {}
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
      .catch(() => {
        this.service.agingAchievedLoading = false
        let doms = document.getElementsByClassName('el-message')[0]
        if (!doms) {
          Message({
            message: '页面异常，请刷新重试',
            type: 'error',
            duration: 2000,
          })
        }
      })
  },
  // 校验数据是否回来
  checkSuccess(param, key, oldOption = {}) {
    let isChange = checkParams(param, this.oldParams[key])
    if (
      isChange &&
      this.oldParams[key] &&
      Object.keys(this.oldParams[key]).length > 0 &&
      Object.keys(oldOption || {}).length > 0
    ) {
      return true
    }
    this.oldParams[key] = cloneDeep(param)
    return false
  },
}
