<template>
  <el-container class='total-list'>
  <el-header
    ref='header'
    style='padding: 0; border-radius: 0 0 12px 12px;'
    height='null'
  >
    <div class='total-list-form'>
      <ky-search-form
        :formData='formData'
        :componentData='formCompent'
        label-width='80px'
        label-position='left'
        formItemBottom='10px'
      >
        <template v-if='updateTime' #start>
          <div class='update-time'>
            <el-popover trigger='hover' placement='right-start'>
              <div class='time'>数据更新时间至：{{ updateTime }}</div>
              <i class='iconfont icon-help icon-right' slot='reference'></i>
            </el-popover>
          </div>
        </template>
        <template #end>
          <div
            class='form-col'
            style='display: inline-block; padding: 0 5px; margin-bottom: 10px'
          >
            <i
              class='iconfont icon-setting setting-icon'
              @click='showFormCloumn'
            ></i>
            <el-button
              :loading='loading'
              type='primary'
              size='small'
              @click='searchBut'
            >查询
            </el-button>
            <el-button
              size='small'
              @click='reset'
            >重置
            </el-button>
            <el-button type='text' @click='handlePackUp'>
              {{ isPackUp ? '展开' : '收起'
              }}<img :src='url' style='padding-left: 4px; width: 14px; height: 14px;' />
            </el-button>
          </div>
        </template>
      </ky-search-form>
    </div>
  </el-header>
  <el-main
    style='
        padding: 10px 20px 0 20px;
        margin-top: 10px;
        background: #fff;
        border-radius: 12px;
      '
    ref='totalListMain'
  >
    <tool-total
      style='min-width: 1000px'
      :data='totalData'
      :isExport='isExport'
      @exportData='exportData'
      @sortData='sortData'
      ref='totalListTool'
    ></tool-total>
    <div class='total-list-table' v-loading='loading'>
      <ky-table-list
        v-if='activeTableColumns.length > 0'
        ref='tableRef'
        :data='tableData'
        :tableColumns='activeTableColumns'
        :height='getHeight'
        :paginationVisible='true'
        :pagination='pagination'
        @sort-change='changeSort'
        @size-change='sizeChange'
        @page-change='currentChange'
        @header-dragend='headerDragend'
      >
        <el-table-column
          label='序号'
          fixed='left'
          prop='myIndex'
          min-width='60'
          width='60'
        >
          <template slot-scope='{ $index, row }'>
            <div style='width: 100%'>
              {{ row.myIndex * row.mySize + $index + 1 }}
            </div>
          </template>
        </el-table-column>
      </ky-table-list>
    </div>
    <none-data
      v-if='activeTableColumns.length === 0'
      style='width: 100%; height: 80%'
    ></none-data>
  </el-main>
  <ky-column-filter
    valueKey='label'
    title='自定义查询'
    :visible.sync='formVisible'
    :column='componentData'
    @select='selectFormSort'
  ></ky-column-filter>
  <ky-column-filter
    :visible.sync='tableVisible'
    :column='tableColumns'
    @select='selectColumnSort'
  ></ky-column-filter>
  <ky-export-progress
    fileName='明细报表'
    :text-inside='true'
    :visible.sync='visibleProgress'
    :exportUrl='exportUrl'
    :params='initParams'
  ></ky-export-progress>
  </el-container>
</template>
<script>
import dayjs from 'dayjs'

let open = require('@/assets/image/open.png')
let pack_up = require('@/assets/image/pack_up.png')
import ToolTotal from '../components/tool-total'
import KyColumnFilter from '@/components/ky-column-filter/index.vue'
import * as API from '@/services/api/total.js'
import {
  isChildLookUp,
  formData,
  isReturnLookUp,
  addedServicesLookUp,
  pickupCarModelsLookUp,
  shipingRegionLookUp,
  paymentPayTypeLookUp,
  payLookUp,
  customerLookUp,
  transportModeLookUp
} from './comfig'
import { cloneDeep } from 'lodash'
import {
  getLookUpValue,
  numberFixed,
  checkAuth,
  thousands,
  queeTimeMin
} from '@/utils/total.js'
import {
  serviceLookUp,
  tableColumns,
  payModeLookUp,
  timeoutTypeOptions
} from './comfig'
import NoneData from '../components/none-data'
import { getTime, initListParams } from '../../../services/api/total'
import KyExportProgress from '@/components/ky-export-progress/index.vue'

export default {
  name: 'total-list',
  components: {
    ToolTotal,
    KyColumnFilter,
    NoneData,
    KyExportProgress
  },
  data() {
    return {
      url: open,
      isPackUp: true,
      oldCode: [],
      serviceDataCode: [],
      initParams: {},
      exportUrl: 'web.report.report.export',
      visibleProgress: false,
      totalInfo: {},
      exportParm: {},
      height: '100px',
      activeFormConfigId: '',
      activeCloumConfigId: '',
      loading: false,
      /*form 配置表*/
      activeComponent: [],
      componentData: [],
      serviceOption: [], // 服务方式
      formData: cloneDeep(formData),
      tableVisible: false,
      formVisible: false,
      activeTableColumns: [],
      tableHeight: 500,
      customerFlag: [],
      componentAuth: [], //保存所有key
      tableColumnsAuth: [],
      /*table*/
      tableColumns: [],
      pagination: {
        totalCount: 0,
        pageSize: 20,
        pageIndex: 1
      },
      tableData: [],
      prevProp: '',
      prevSort: 'descending',
      timeoutTypeOptions: timeoutTypeOptions,
      updateTime: ''
    }
  },
  watch: {
    //  处理表格在mac  电脑，滚动样式塌陷问题
    'activeTableColumns.length': {
      handler(n) {
        if (n > 0) {
          this.$nextTick(() => {
            this.$refs.tableRef.$refs.table.$el
              .querySelector('.el-table__body-wrapper')
              .addEventListener('scroll', () => {
                let scrollTop = this.$refs.tableRef.$refs.table.$el.querySelector(
                  '.el-table__body-wrapper'
                ).scrollTop
                let scrollHeight = this.$refs.tableRef.$refs.table.$el.querySelector(
                  '.el-table__body-wrapper'
                ).scrollHeight
                let height = this.$refs.tableRef.$refs.table.$el.querySelector(
                  '.el-table__body-wrapper'
                ).offsetHeight
                let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
                if (scrollTop + height >= scrollHeight) {
                  if (!isMac) return
                  this.$refs.tableRef.$refs.table.$el.querySelector(
                    '.el-table__body-wrapper'
                  ).scrollTop = scrollHeight - height
                  this.$refs.tableRef.$refs.table.$el.querySelector(
                    '.el-table__body-wrapper'
                  ).style.paddingBottom = '6px'
                } else {
                  if (!isMac) return
                  this.$refs.tableRef.$refs.table.$el.querySelector(
                    '.el-table__body-wrapper'
                  ).style.paddingBottom = '0px'
                }
              })
          })
        }
      },
      immediate: true
    }
  },
  computed: {
    // 修正寄件时间
    // formData() {
    //   const cache = cloneDeep(formData)
    //   if (this.updateTime) {
    //     cache.shipingTimeStart[1] = dayjs(this.updateTime).format(
    //       'YYYY-MM-DD HH:mm:ss'
    //     )
    //   }
    //   return cache
    // },
    //  获取对应的 数据权限
    detailReport() {
      if (
        this.$store.state.tatol &&
        this.$store.state.tatol.auth &&
        this.$store.state.tatol.auth.detailReport
      ) {
        return this.$store.state.tatol.auth.detailReport
        // return { ...this.$store.state.tatol.auth.detailReport, needSendTime: '20' }
      }
      return {}
    },
    //  展开收起
    formCompent() {
      if (this.isPackUp) {
        return this.activeComponent.slice(0, 3)
      } else {
        return this.activeComponent
      }
    },
    //  获取导出数据权限
    isExport() {
      for (let key in this.detailReport) {
        if (key === 'export' && +this.detailReport[key] === 10) {
          return true
        }
      }
      return false
    },
    // 获取表格高度
    getHeight() {
      return `calc(100vh - ${this.height})`
    },
    //  表头汇总数据
    totalData() {
      let isExceptionPoll =
        +this.detailReport['overtime'] === 10 ||
        +this.detailReport['timeoutType'] === 10 ||
        +this.detailReport['timeoutReason'] === 10
      let isRouteNums =
        +this.detailReport['deliveryCityCode'] === 10 ||
        +this.detailReport['receiveCityCode'] === 10
      let deliveredRate =
        this.totalInfo.deliveredRate > 0
          ? thousands(this.totalInfo.deliveredRate) + '%'
          : 0
      let agingAchievedRate =
        this.totalInfo.agingAchievedRate > 0
          ? thousands(this.totalInfo.agingAchievedRate) + '%'
          : 0
      let collectInTimeRate =
        this.totalInfo.collectInTimeRate > 0
          ? thousands(this.totalInfo.collectInTimeRate) + '%'
          : 0
      let deiveryInTimeRate =
        this.totalInfo.deiveryInTimeRate > 0
          ? thousands(this.totalInfo.deiveryInTimeRate) + '%'
          : 0
      return [
        {
          label: '总票数：',
          total: thousands(this.totalInfo.totalVotes, 0),
          visible: +this.detailReport['waybillNumber'] === 10
        },
        {
          label: '总件数：',
          total: thousands(this.totalInfo.totalUnit, 0),
          visible: +this.detailReport['number'] === 10
        },
        {
          label: '超时票数：',
          total: thousands(this.totalInfo.anomalousVotes, 0),
          visible: isExceptionPoll
        },
        {
          label: '总费用(元)：',
          total: thousands(this.totalInfo.sumAmounts),
          visible: +this.detailReport['totalCost'] === 10
        },
        {
          label: '计费重量(KG)：',
          total: thousands(this.totalInfo.sumWeights),
          visible: +this.detailReport['billWeight'] === 10
        },
        {
          label: '实际重量(KG)：',
          total: thousands(this.totalInfo.totalActualWeight),
          visible: +this.detailReport['realWeight'] === 10
        },
        {
          label: '未签收票数：',
          total: thousands(this.totalInfo.noSignVotes, 0),
          visible: +this.detailReport['signinTime'] === 10
        },
        {
          label: '超时未签票数：',
          total: thousands(this.totalInfo.timeOutNoSignVotes, 0),
          visible: +this.detailReport['signinTime'] === 10
        },
        {
          label: '妥投率：',
          total: deliveredRate,
          visible: +this.detailReport['signinTime'] === 10
        },
        {
          label: '时效达成率：',
          total: agingAchievedRate,
          visible: +this.detailReport['signinTime'] === 10
        },
        {
          label: '揽收及时率：',
          total: collectInTimeRate,
          visible: +this.detailReport['collectTime'] === 10
        },
        {
          label: '派签到及时率：',
          total: deiveryInTimeRate,
          visible: +this.detailReport['signTime'] === 10
        },
        {
          label: '线路：',
          total: this.totalInfo.routeNums || 0,
          visible: isRouteNums
        }
      ]
    },
    //  获取切换角色数据权限
    filCustomerLookUp() {
      let ary = customerLookUp.filter((item) => {
        if (item.auth) {
          if (+this.detailReport[item.auth] === 10) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      })
      return ary
    }
  },
  created() {
    this.initUpdateTime()
  },
  mounted() {
    this.computedHeight()
    this.$nextTick(() => {
      window.addEventListener('resize', this.computedHeight)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.computedHeight)
  },
  methods: {
    //  表头拖拽 重新计算高度： 可能有换行等因素影响
    headerDragend(newWidth, oldWidth, column, event) {
      let timer = setTimeout(() => {
        clearTimeout(timer)
        this.computedHeight()
      }, 300)
    },
    //  点击展开收起
    handlePackUp() {
      this.isPackUp = !this.isPackUp
      this.url = this.isPackUp ? open : pack_up
      this.computedHeight()
    },
    // 初始化获取 form component
    getFormInit(init = false) {
      let componentData = [
        {
          // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingTimeStart',
          label: '寄件时间',
          auth: 'sendTime',
          component: 'ky-date-picker',
          width: '400px',
          attrs: {
            popperClass: 'total-list__ky-date-picker',
            editable: false,
            clearable: false,
            placeholder: '选择日期',
            type: 'date',
            width: '150px',
            size: 'small',
            format: 'yyyy-MM-dd'
          }
        },
        {
          // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingTimeStart',
          auth: 'needSendTime',
          label: '',
          component: 'ky-select-date-picker',
          width: '350px',
          attrs: {
            editable: false,
            clearable: false,
            placeholder: '选择日期',
            type: 'date',
            width: '110px',
            size: 'small',
            dateTypeOption: [
              {
                label: '寄件时间',
                value: 'shipingTime'
              },
              {
                label: '需派时间',
                value: 'agentDeliveryAging'
              }
            ]
          },
          listeners: {
            dateTpyeChange: this.changeDateType
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'waybillNumber',
          auth: 'waybillNumber',
          label: '运单号',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入运单号'
          }
        },
        {
          //  服务方式(common_service_type
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'customerFlag',
          label: '切换角色',
          auth: 'customerFlag',
          width: '330px',
          component: 'el-select',
          attrs: {
            size: 'medium'
          },
          children: {
            prop: 'value',
            label: '',
            options: this.filCustomerLookUp,
            lableKey: '',
            valueKey: '',
            component: 'el-option',
            attrs: {},
            listeners: {}
          }
        },
        {
          //  服务方式(common_service_type
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'serviceType',
          label: '服务方式',
          auth: 'serviceModel',
          width: '330px',
          component: 'el-select',
          attrs: {
            multiple: true,
            collapseTags: true,
            clearable: true,
            size: 'medium'
          },
          listeners: {
            change: this.changeServiceType
          },
          children: {
            prop: 'value',
            label: '',
            options: this.serviceOption,
            lableKey: '',
            valueKey: '',
            component: 'el-option',
            attrs: {},
            listeners: {}
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingCompany',
          auth: 'deliveryCompanyName',
          label: '寄件公司',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入寄件公司全称'
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'pickupPerson',
          auth: 'receivePerson',
          label: '收件人',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入收件人名称'
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'pickupCustomerShortName',
          auth: 'receiveCompanyName',
          label: '收件公司',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入收件公司全称'
          }
        },
        {
          prop: 'payCustomerShortName',
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          label: '付款公司',
          auth: 'payCustomerShortName', //默认开启权限
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入付款公司全称'
          }
        },
        /*始发地(寄件区号 拼 寄件城市)*/
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'origin',
          auth: 'deliveryCityCode',
          label: '始发地',
          width: '330px',
          component: 'ky-city-name',
          /* component:'el-input',*/
          /*    component:'ky-city-address',*/
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入'
          },
          listeners: {
            select: this.originAddress
          }
        },
        {
          //destination	目的地(收件区号 收件城市)
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'destination',
          label: '目的地',
          auth: 'receiveCityCode',
          width: '330px',
          component: 'ky-city-name',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入'
          },
          listeners: {
            select: this.originAddress
          }
        },
        {
          //  服务方式(common_service_type
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'overtimeType',
          auth: 'timeoutType',
          label: '超时类型',
          width: '330px',
          component: 'el-select',
          attrs: {
            clearable: true,
            size: 'medium',
            multiple: true,
            collapseTags: true
          },
          listeners: {
            change: this.changeOvertimeType
          },
          children: {
            prop: 'value',
            label: '',
            options: this.timeoutTypeOptions,
            lableKey: '',
            valueKey: '',
            component: 'el-option',
            attrs: {},
            listeners: {}
          }
        },
        /*多的*/
        {
          prop: 'timeoutValue',
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          label: '超时时长',
          auth: 'overtime',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入超时时长（h）'
          }
        },
        {
          prop: 'mainProduct',
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          label: '托寄物',
          auth: 'goods',
          width: '330px',
          component: 'el-input',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入托寄物名称'
          }
        },
        {
          //付款方式（kyetree_pay_mode）
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'paymentPayType',
          auth: 'settleModel',
          label: '结算方式',
          width: '330px',
          component: 'el-select',
          attrs: {
            clearable: true,
            size: 'medium'
          },
          children: {
            prop: 'value',
            label: '',
            options: payLookUp,
            lableKey: '',
            valueKey: '',
            component: 'el-option',
            attrs: {},
            listeners: {}
          }
        }
      ]
      let data = []
      this.customerFlag = [
        {
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingTimeStart',
          label: '寄件时间',
          auth: 'sendTime',
          component: 'ky-date-picker',
          width: '400px',
          attrs: {
            editable: false,
            clearable: false,
            placeholder: '选择日期',
            type: 'datetime',
            width: '150px',
            size: 'small',
            format: 'yyyy-MM-dd'
          }
        },
        {
          //  服务方式(common_service_type
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'customerFlag',
          label: '切换角色',
          auth: 'customerFlag',
          width: '330px',
          component: 'el-select',
          attrs: {
            size: 'medium'
          },
          children: {
            prop: 'value',
            label: '',
            options: this.filCustomerLookUp,
            lableKey: '',
            valueKey: '',
            component: 'el-option',
            attrs: {},
            listeners: {}
          }
        }
      ]
      if (Object.keys(this.detailReport).length > 0) {
        let formCom = cloneDeep(componentData)
        formCom.forEach((item) => {
          item.checked = false
          item.sortIndex = ''
          if (
            this.detailReport[item.auth] &&
            +this.detailReport[item.auth] === 10
          ) {
            //
            /*
            * 处理datePicker展示类型问题
            * 如果同时带有sendTime和needSendTime那么展示可以选择的datePicker
            * 否则只展示普通datePicker
            * */
            if (item.auth !== 'sendTime') {
              this.componentAuth.push(item.auth)
              data.push(item)
            } else {
              if (Number(this.detailReport.needSendTime) !== 10) {
                this.componentAuth.push(item.auth)
                data.push(item)
              }
            }
          }
        })
      }
      if (init === true) {
        //  默认给十个
        if (data && data.length > 10) {
          let check = data
          check.forEach((item) => {
            item.checked = true
          })
          this.activeComponent = check
        } else {
          let check1 = data
          check1.forEach((item) => {
            item.checked = true
          })
          this.activeComponent = check1
        }
      }
      this.componentData = data
    },
    // 初始化获取table cloumn
    getColumnInit(init = false) {
      let data = []
      let columns = cloneDeep(tableColumns)
      columns.forEach((item) => {
        item.checked = false
        item.sortIndex = ''
        if (
          this.detailReport[item.auth] &&
          +this.detailReport[item.auth] === 10
        ) {
          data.push(item)
          this.tableColumnsAuth.push(item.auth)
        }
      })
      if (init === true) {
        data.forEach((item) => {
          item.checked = true
        })
        this.activeTableColumns = data
      }
      this.tableColumns = data
    },
    //  点击查询按钮
    searchBut() {
      this.pagination.pageIndex = 1
      this.search()
    },
    //  表格排序 高亮
    changeSort({ column, prop, order }) {
      if (order !== null && this.prevProp !== prop && this.$refs.tableRef) {
        let columns = this.$refs.tableRef.$refs.table.columns.find(
          (item) => item.property === this.prevProp
        )
        if (columns) {
          columns.order = null
        }
      }
      if (order === null) {
        if (this.prevProp === prop) {
          column.order = this.prevSort || 'descending'
          return
        } else {
          column.order =
            this.prevSort === 'descending' ? 'ascending' : 'descending'
        }
      }
      this.prevProp = prop
      this.prevSort = order || column.order
      order = order || column.order
      this.search(order, prop, false)
    },
    // 获取服务方式
    async getOverviewServiceType() {
      this.serviceOption = []
      let reg = await API.overviewServiceType()
      if (reg.code === 0) {
        let serviceTypes = reg.data.serviceTypes || []
        let types = []
        let service = []
        let all = {
          label: '全部',
          value: '1'
        }
        serviceTypes.forEach((type) => {
          types.push(type.type)
        })
        serviceLookUp.forEach((item) => {
          if (types.includes(item.value)) {
            service.push(item)
          }
        })
        if (service.length > 1) {
          service.unshift(all)
        }
        this.serviceOption = service
      }
    },
    originAddress() {
    },
    changeDateType(value) {
      this.formData.dateType = value
    },
    //  表格change page
    currentChange(pageIndex) {
      let page = pageIndex * this.pagination.pageSize || 0
      if (page > 10000) {
        this.pagination.pageIndex = 1
        this.$message({
          message: '最大数据查询量为一万条，请筛选条件后再次查询',
          type: 'warning'
        })
      } else {
        this.pagination.pageIndex = pageIndex || 1
      }
      this.search()
    },
    //  表格 change size
    sizeChange(pageSize) {
      this.pagination.pageIndex = 1
      this.pagination.pageSize = pageSize || 20
      this.search()
    },
    //  计算表格多余高度
    computedHeight() {
      this.$nextTick(() => {
        if (this.$refs.header && this.$refs.totalListTool) {
          let headerHeight = this.$refs.header.$el.offsetHeight
          let toolHeight = this.$refs.totalListTool.$el.offsetHeight
          this.height = headerHeight + toolHeight + 45 + 31 + 30 + 60 + 'px'
        }
        if (this.$refs.tableRef && this.$refs.tableRef.$refs.table) {
          this.$refs.tableRef.$refs.table.doLayout()
        }
      })
    },
    //  导出数据
    async exportData() {
      if (this.tableData.length === 0) {
        this.$message.error('没有导出的数据')
        return
      }
      this.$confirm('是否要导出数据？', '导出', {}).then(() => {
        let { page, orderByClauses, data } = this.exportParm
        let params = initListParams(data) || {}
        let exportFieldList = []
        if (this.activeTableColumns.length > 0) {
          this.activeTableColumns.forEach((item) => {
            if (item.prop) {
              exportFieldList.push(item.prop)
            }
          })
        }
        let exportParams = {
          ...params,
          exportFieldList: exportFieldList
        }
        
        this.initParams = {
          ...page,
          orderByClauses,
          params: exportParams
        }
        this.visibleProgress = true
      })
    },
    //  排序选中的表格 column
    selectColumnSort({ dragData, column }) {
      this.tableColumns = column
      if (this.activeCloumConfigId) {
        this.updateCloumConfig(dragData)
      } else {
        this.addCloumConfig(dragData)
      }
    },
    // 自定义排序tabel 添加
    async addCloumConfig(columns) {
      let reg = await API.addGridConfig({ name: '明细报表', columns })
      if (reg.code === 0) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.activeCloumConfigId = reg.data
        this.getColumnConfig()
      } else {
        this.$message.error('保存失败')
      }
    },
    // 自定义排序tabel 获取
    async getColumnConfig() {
      let reg = await API.queryGridColumnConfig({ name: '明细报表' })
      if (reg.code === 0) {
        if (reg.data && reg.data.gridAttribute) {
          let columns = JSON.parse(reg.data.gridAttribute) || []
          //  设置  table  item
          if (columns.length > 0) {
            this.filCloumConfig(columns)
          } else {
            this.activeTableColumns = []
          }
        } else {
          this.activeTableColumns = []
        }
        this.activeCloumConfigId = reg.data.id
      }
      if (reg.code === 30003) {
        this.getColumnInit(true)
      }
    },
    // 自定义排序tabel 更新
    async updateCloumConfig(columns) {
      let reg = await API.updateGridConfig({
        id: this.activeCloumConfigId,
        columns
      })
      if (reg.code === 0) {
        this.$message({
          message: '更新成功',
          type: 'success'
        })
        this.getColumnConfig()
      } else {
        this.$message.error('更新失败')
      }
    },
    //   过滤权限
    filCloumAuth(columns) {
      if (Object.keys(this.detailReport).length > 0) {
        let props = []
        let obj = {}
        let active = []
        columns.forEach((item) => {
          if (
            this.detailReport[item.auth] &&
            +this.detailReport[item.auth] === 10 &&
            item.checked === true &&
            this.tableColumnsAuth.includes(item.auth)
          ) {
            props.push(item.prop)
            obj[item.prop] = item
          }
        })
        this.tableColumns = this.tableColumns.map((it) => {
          if (props.includes(it.prop)) {
            let cur = obj[it.prop]
            it.checked = cur.checked
            it.sortIndex = cur.sortIndex
            active.push(it)
          }
          return it
        })
        active.sort(function(a, b) {
          return a.sortIndex - b.sortIndex
        })
        this.activeTableColumns = active
      } else {
        this.activeTableColumns = []
      }
    },
    // 过滤选中 table cloumn数据
    filCloumConfig(columns) {
      //  设置  table  item
      if (columns && columns.length > 0) {
        this.filCloumAuth(columns)
      } else {
        this.activeTableColumns = this.tableColumns
      }
      this.computedHeight()
    },
    // 选中 table cloumn数据
    selectFormSort({ dragData, column }) {
      this.componentData = column
      if (this.activeFormConfigId) {
        this.updateFormConfig(dragData)
      } else {
        this.addFormConfig(column)
      }
    },
    // 自定义排序form 添加
    async addFormConfig(columns) {
      let reg = await API.addGridConfig({
        name: '明细报表自定义表单',
        columns
      })
      if (reg.code === 0) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.activeFormConfigId = reg.data
        this.getFormConfig()
      } else {
        this.$message.error('保存失败')
      }
    },
    // 自定义排序form 获取
    async getFormConfig() {
      let reg = await API.queryGridColumnConfig({ name: '明细报表自定义表单' })
      if (reg.code === 0) {
        if (reg.data && reg.data.gridAttribute) {
          let columns = JSON.parse(reg.data.gridAttribute) || []
          //  设置  table  item
          if (columns.length > 0) {
            this.filActiveComponent(columns)
          } else {
            this.filActiveComponent(this.customerFlag)
          }
        } else {
          this.filActiveComponent(this.customerFlag)
        }
        this.activeFormConfigId = reg.data.id
      }
      if (reg.code === 30003) {
        this.getFormInit(true)
      }
    },
    // 自定义排序form 更新
    async updateFormConfig(columns) {
      let reg = await API.updateGridConfig({
        id: this.activeFormConfigId,
        columns
      })
      if (reg.code === 0) {
        this.$message({
          message: '更新成功',
          type: 'success'
        })
        this.getFormConfig()
      } else {
        this.$message.error('更新失败')
      }
    },
    // 初始化权限
    filFormAuth(columns = []) {
      if (Object.keys(this.detailReport).length > 0) {
        let props = [] // 权限控制
        let obj = {}
        let active = []
        columns.forEach((item) => {
          // 过滤数据
          if (
            this.detailReport[item.auth] &&
            +this.detailReport[item.auth] === 10 &&
            item.checked === true &&
            this.componentAuth.includes(item.auth)
          ) {
            props.push(item.prop)
            obj[item.prop] = item
          }
        })
        if (!props.includes('customerFlag')) {
          props.push('customerFlag')
          obj['customerFlag'] = this.customerFlag[0] || []
        }
        if (
          !props.includes('shipingTimeStart') &&
          this.detailReport['sendTime'] &&
          +this.detailReport['sendTime'] === 10
        ) {
          props.push('shipingTimeStart')
          obj['shipingTimeStart'] = this.customerFlag[1] || []
        }
        this.componentData = this.componentData.map((it) => {
          let cur = obj[it.prop]
          if (props.includes(it.prop)) {
            it.checked = cur.checked
            it.sortIndex = cur.sortIndex
            active.push(it)
          }
          return it
        })
        /*添加判断是否展示可选寄件时间的datePicker*/
        
        active.sort(function(a, b) {
          return a.sortIndex - b.sortIndex
        })
        this.activeComponent = active
      } else {
        this.activeComponent = this.customerFlag || []
      }
    },
    //  过滤选中的
    filActiveComponent(columns) {
      //  设置  table  item
      if (columns && columns.length > 0) {
        this.filFormAuth(columns)
      } else {
        this.activeComponent = this.componentData
      }
      this.computedHeight()
    },
    sortData() {
      this.tableVisible = true
    },
    //  获取有权限的参数
    getAuthParam(formData = {}) {
      let keys = []
      let param = {}
      if (this.activeComponent && this.activeComponent.length > 0) {
        this.activeComponent.forEach((item) => {
          keys.push(item.prop)
        })
      }
      for (let key in formData) {
        if (keys.includes(key)) {
          param[key] = formData[key]
        }
      }
      /*
      * 一个接口传参需要两个地方来处理？
      * */
      param.dateType = this.formData.dateType
      return param
    },
    // 区域列表 查询 (V1.0)
    async search(order = 0, prop = 'shiping_time', isSort = true) {
      if (
        dayjs(this.formData.shipingTimeStart[0]).isAfter(
          dayjs(this.formData.shipingTimeStart[1]),
          'minute'
        )
      ) {
        this.$message.warning('开始时间要小于结束时间')
        return true
      }
      if (isSort && this.$refs.tableRef && this.$refs.tableRef.$refs.table) {
        this.$refs.tableRef.$refs.table.columns.forEach((item) => {
          item.order = null
        })
        this.$refs.tableRef.$refs.table.clearSort()
      }
      let page = {
        page: this.pagination.pageIndex || 1, //	页索引	number	否
        pageSize: this.pagination.pageSize || 20 //	页大小	number	否
      }
      let orderByClauses = [
        {
          field: prop,
          orderByMode: order === 'ascending' ? 0 : 1
        }
      ]
      let param = this.getAuthParam(this.formData)
      this.exportParm = { page, orderByClauses, data: param }
      this.loading = true
      let reg = await API.reportSearch({ page, orderByClauses, data: param })
      this.loading = false
      if (reg.code === 0) {
        let data = reg.data || {}
        // 先用总票数
        this.pagination.totalCount = data.totalVotes || 0
        this.totalInfo = data
        this.getData(data)
      }
      this.loading = false
    },
    getData(data) {
      let detailReports = data.detailReports || []
      this.pagination.pageIndex = this.pagination.pageIndex || 1
      if (detailReports && detailReports.length > 0) {
        detailReports.forEach((item) => {
          item.shipingRegion = getLookUpValue(
            item.shipingRegion,
            shipingRegionLookUp
          )
          item.receiveArea = getLookUpValue(
            item.receiveArea,
            shipingRegionLookUp
          )
          item.pickupCarModels = getLookUpValue(
            item.pickupCarModels,
            pickupCarModelsLookUp
          )
          item.payMode = getLookUpValue(item.payMode, payModeLookUp)
          item.paymentPayType = getLookUpValue(
            item.paymentPayType,
            paymentPayTypeLookUp
          )
          item.isChildMother = getLookUpValue(
            item.isChildMother,
            isChildLookUp
          )
          item.isContraband = getLookUpValue(item.isContraband, isReturnLookUp)
          item.transportMode = getLookUpValue(
            item.transportMode,
            transportModeLookUp
          )
          item.isTailoredCar = getLookUpValue(
            item.isTailoredCar,
            isReturnLookUp
          )
          item.isForwardReturn = getLookUpValue(
            item.isForwardReturn,
            isReturnLookUp
          )
          item.addedServices = getLookUpValue(
            item.addedServices,
            addedServicesLookUp
          )
          item.discountRate = item.discountRate
            ? item.discountRate + '%'
            : item.discountRate === 0
              ? 0
              : '--'
          item.totalCost = item.totalCost
            ? numberFixed(item.totalCost)
            : item.totalCost === 0
              ? 0
              : '--'
          item.freightCharges = item.freightCharges
            ? numberFixed(item.freightCharges)
            : item.freightCharges === 0
              ? 0
              : '--'
          item.discountSalesAmount = item.discountSalesAmount
            ? numberFixed(item.discountSalesAmount)
            : item.discountSalesAmount === 0
              ? 0
              : '--'
          item.addedFee = item.addedFee
            ? numberFixed(item.addedFee)
            : item.addedFee === 0
              ? 0
              : '--'
          item.goodsSize = item.goodsSize
            ? item.goodsSize
            : item.goodsSize === 0
              ? 0
              : '--'
          item.shipingTime = queeTimeMin(item.shipingTime)
          item.signingTime = queeTimeMin(item.signingTime)
          item.expectedArrivalDate = queeTimeMin(item.expectedArrivalDate)
          item.takeTime = queeTimeMin(item.takeTime)
          item.deliverySignDate = queeTimeMin(item.deliverySignDate)
          item.returnCommitTime = queeTimeMin(item.returnCommitTime)
          item.returnSignTime = queeTimeMin(item.returnSignTime)
          // item.riseDecayTime=queeTimeMin(item.riseDecayTime)
          item.riseDecayTime = item.riseDecayTime ? item.riseDecayTime : '--'
          item.pickGoodsDate = queeTimeMin(item.pickGoodsDate)
          item.timeoutValue = item.timeoutValue <= 0 ? '--' : item.timeoutValue
          if (item.serviceType) {
            let serviceMode = item.serviceType.split(',')
            let str = ''
            serviceMode.forEach((it, index) => {
              let label = getLookUpValue(it, serviceLookUp)
              str += label
              if (index !== serviceMode.length - 1) {
                str += ','
              }
            })
            item.serviceType = str || '--'
          }
          Object.keys(item).forEach((key) => {
            if (!item[key] && item[key] !== 0) {
              item[key] = '--'
            }
          })
          item.myIndex = this.pagination.pageIndex - 1 || 0
          item.mySize = this.pagination.pageSize || 20
        })
      }
      this.tableData = detailReports || []
    },
    // 重置数据
    reset() {
      this.formData = cloneDeep(formData)
    },
    //  展示form dialong
    showFormCloumn() {
      this.formVisible = true
    },
    /*服务方式全选*/
    changeServiceType(value) {
      this.formData.serviceType = this.productTypeChange(
        value,
        this.serviceOption
      )
    },
    /* 超时类型 */
    changeOvertimeType(value) {
      this.formData.overtimeType = this.productTypeChange(
        value,
        this.timeoutTypeOptions
      )
    },
    productTypeChange(codes, looks) {
      const lookValues = looks.map((item) => item.value)
      const codesLength = codes.length
      const isAll = codes.some((item) => {
        if (item === '1') {
          return true
        }
      })
      if (isAll) {
        if (codes[codesLength - 1] === '1') {
          this.oldCode = lookValues
          return lookValues
        } else {
          let co = codes.filter((i) => i > 1)
          this.oldCode = co
          return co
        }
      } else {
        const productTypes = lookValues.filter((i) => i > 1).join(',')
        if (codes.join(',') === productTypes) {
          const is1 = this.oldCode.some((item) => {
            if (item === '1') {
              return true
            }
          })
          
          if (is1) {
            this.oldCode = []
            return []
          } else {
            this.oldCode = lookValues
            return lookValues
          }
        } else {
          if (codes.length === looks.length - 1) {
            this.oldCode = lookValues
            return lookValues
          }
        }
      }
      this.oldCode = codes
      return codes
    },
    async initUpdateTime() {
      const { data } = await API.updateTime()
      this.updateTime = data[0].updateTime
    }
  },
  //路由
  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      //  先到vuex 查看是否有数据权限，没有回获取一次
      vm.$store
        .dispatch('tatol/GET_TOTALS_AUTH', 'detailReport')
        .then(async (reg) => {
          let data = reg['detailReport'] || {}
          if (checkAuth(data)) {
            // 获取服务方式
            await vm.getOverviewServiceType()
            // 获取form组件
            vm.getFormInit()
            // 获取tabel组件
            vm.getColumnInit()
            await vm.getFormConfig()
            // 获取表格
            await vm.getColumnConfig()
            await vm.search()
          } else {
            vm.$message.error('请检查是否有权限')
            vm.$router.push('/admin/waybill')
          }
        })
        .catch((error) => {
          if (error && error.auth === true) {
            vm.$message.error(error.msg)
            vm.$router.push('/admin/waybill')
          }
        })
    })
  }
}
</script>

<style lang='scss'>
.total-list__ky-date-picker .el-picker-panel__footer {
  button:first-of-type {
    display: none !important;
  }
}
</style>
<style scoped lang='scss'>
.total-list {
  height: 100%;
  background: #f5f6fb;
  
  .update-time {
    width: 14px;
    display: inline-block;
    
    i {
      font-size: 1.4rem;
      color: #ccc;
      cursor: pointer;
    }
  }
}

.total-list-form {
  padding: 10px 10px 0 10px;
  border-radius: 0 0 12px 12px;
  background: #fff;
  display: flex;
  align-items: center;
  /*设置按钮*/
  .setting-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    font-size: 14px;
    color: #7556ed;
    margin: 0 10px;
    cursor: pointer;
  }
}

.total-list-table {
  margin-top: 10px;
}

/deep/ .el-table__empty-block {
  margin: 0 auto;
}

/deep/ {
  .total-list-form {
    .el-form-item {
      
      .el-form-item__label {
        font-size: 12px;
        padding-left: 10px;
        text-align: right;
      }
      
      .el-input {
        font-size: 12px;
      }
    }
    
    .el-button {
      height: 32px;
      padding: 0 20px;
      line-height: 32px;
      font-size: 12px;
    }
  }
  
}

/deep/ .el-table .warning-row {
  background: #fbfcff;
}

/deep/ .ky-date-picker {
  min-width: 250px;
}
</style>
