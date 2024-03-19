<template>
  <el-container class='total-list'>
  <!--        header-->
  <el-header
    ref='header'
    style='padding: 0; border-radius: 0 0 12px 12px;'
    height='null'
  >
    <div class='total-list-form total-totals-form'>
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
              <div class='time'>
                数据更新时间至：{{ updateTime }}
              </div>
              <i class='iconfont icon-help icon-right' slot='reference'></i>
            </el-popover>
          </div>
        </template>
        <template #end>
          <div class='form-col' style='display: inline-block; padding: 0 5px'>
            <el-button
              :loading='loading'
              type='primary'
              size='small'
              @click='searchBut'>
              查询
            </el-button>
            <el-button
              size='small'
              @click='reset'>
              重置
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
    ref='totalListMain'
    style='
        padding: 10px 20px 0 20px;
        margin-top: 10px;
        background: #fff;
        border-radius: 12px;
      '
  >
    <!--            表头汇总-->
    <tool-total
      ref='totalListTool'
      style='min-width: 1000px'
      :data='totalData'
      @exportData='exportData'
      :isExport='isExport'
      @sortData='sortData'
    ></tool-total>
    <!--            表格-->
    <div class='total-list-table' v-loading='loading'>
      <ky-table-list
        ref='tableRef'
        v-if='activeTableColumns.length > 0'
        @header-dragend='headerDragend'
        @sort-change='changeSort'
        :data='tableData'
        :tableColumns='activeTableColumns'
        :height='getHeight'
        @size-change='sizeChange'
        @page-change='pageChange'
        :paginationVisible='true'
        :pagination='pagination'
      >
        <el-table-column label='序号' width='60'>
          <template slot-scope='{ $index, row }'>
            <div>{{ row.myIndex * row.mySize + $index + 1 }}</div>
          </template>
        </el-table-column>
      </ky-table-list>
    </div>
    <!--      没有数据占位图-->
    <none-data
      v-if='activeTableColumns.length === 0'
      style='width: 100%; height: 80%'
    ></none-data>
    <!--    过滤table coloumn-->
    <ky-column-filter
      :visible.sync='visible'
      :column='tableColumns'
      @select='selectSort'
    ></ky-column-filter>
    <!--           导出功能-->
    <ky-export-progress
      fileName='汇总报表'
      :text-inside='true'
      :visible.sync='visibleProgress'
      :exportUrl='exportUrl'
      :params='initParams'
    ></ky-export-progress>
  </el-main>
  </el-container>
</template>
<script>
let open = require('@/assets/image/open.png')
let pack_up = require('@/assets/image/pack_up.png')
import ToolTotal from '../components/tool-total'
import KyColumnFilter from '@/components/ky-column-filter/index.vue'
import { serviceLookUp, customerLookUp } from '../total-list/comfig'
import { tableColumns, formData } from './comfig'
import * as API from '@/services/api/total.js'
import { numberFixed, checkAuth, thousands } from '@/utils/total.js'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'
import NoneData from '../components/none-data'
import KyExportProgress from '@/components/ky-export-progress/index.vue'
import { initSummaryParams } from '../../../services/api/total'

export default {
  name: 'total-totals',
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
      exportUrl: 'web.report.waybillsummary.export',
      visibleProgress: false,
      pickerOptions: {
        tempSelectedDate: '',
        onPick: ({ maxDate, minDate }) => {
          this.pickerOptions.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.pickerOptions.tempSelectedDate = ''
          }
        },
        disabledDate: (time) => {
          const endTime = dayjs()
            .add(-1, 'd')
            .format('YYYY-MM-DD')
          if (time.getTime() > new Date(endTime).getTime()) {
            return true
          }
        }
        // shortcuts: [
        //   {
        //     text: '近7天',
        //     onClick(picker) {
        //       const start = dayjs()
        //         .add(-7, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       const end = dayjs()
        //         .add(-1, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       picker.$emit('pick', [start, end])
        //     }
        //   },
        //   {
        //     text: '近30天',
        //     onClick(picker) {
        //       const start = dayjs()
        //         .add(-30, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       const end = dayjs()
        //         .add(-1, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       picker.$emit('pick', [start, end])
        //     }
        //   },
        //   {
        //     text: '近90天',
        //     onClick(picker) {
        //       const start = dayjs()
        //         .add(-90, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       const end = dayjs()
        //         .add(-1, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       picker.$emit('pick', [start, end])
        //     }
        //   },
        //   {
        //     text: '近180天',
        //     onClick(picker) {
        //       const start = dayjs()
        //         .add(-180, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       const end = dayjs()
        //         .add(-1, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       picker.$emit('pick', [start, end])
        //     }
        //   },
        //   {
        //     text: '近365天',
        //     onClick(picker) {
        //       const start = dayjs()
        //         .add(-365, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       const end = dayjs()
        //         .add(-1, 'd')
        //         .format('YYYY-MM-DD HH:mm:ss')
        //       picker.$emit('pick', [start, end])
        //     }
        //   }
        // ]
      },
      exportParm: {},
      activeCloumConfigId: '',
      loading: false,
      serviceOption: [],
      tableData: [],
      formData: cloneDeep(formData),
      activeComponent: [],
      componentData: [],
      visible: false,
      pagination: {
        totalCount: 0,
        pageSize: 20,
        pageIndex: 1
      },
      tableHeight: 500,
      tableColumns: [],
      activeTableColumns: [],
      totalInfo: {},
      prevProp: '',
      prevSort: 'descending',
      updateTime: ''
    }
  },
  computed: {
    //  获取对应权限数据 summaryReport
    summaryReport() {
      if (
        this.$store.state.tatol &&
        this.$store.state.tatol.auth &&
        this.$store.state.tatol.auth.summaryReport
      ) {
        return this.$store.state.tatol.auth.summaryReport || {}
        // return { ...this.$store.state.tatol.auth.summaryReport, needSendTime: '20' }
      }
      return {}
    },
    //  表格 height
    getHeight() {
      return `calc(100vh - ${this.tableHeight})`
    },
    //  判断form 展开，收起
    formCompent() {
      if (this.isPackUp) {
        return this.activeComponent.slice(0, 3)
      } else {
        return this.activeComponent
      }
    },
    //  获取导出的权限
    isExport() {
      for (let key in this.summaryReport) {
        if (key === 'export' && +this.summaryReport[key] === 10) {
          return true
        }
      }
      return false
    },
    //  表头汇总数据
    totalData() {
      let isTotalRoads =
        +this.summaryReport['endPlace'] === 10 ||
        +this.summaryReport['startPlace'] === 10
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
          visible: +this.summaryReport['totalNumber'] === 10
        },
        {
          label: '总件数：',
          total: thousands(this.totalInfo.totalUnit, 0),
          visible: +this.summaryReport['totalPackage'] === 10
        },
        {
          label: '总费用(元)：',
          total: thousands(this.totalInfo.sumAmounts),
          visible: +this.summaryReport['totalCost'] === 10
        },
        {
          label: '计费重量(KG)：',
          total: thousands(this.totalInfo.sumWeights),
          visible: +this.summaryReport['totalBillWeight'] === 10
        },
        {
          label: '实际重量(KG)：',
          total: thousands(this.totalInfo.totalActualWeight),
          visible: +this.summaryReport['realTotalWeight'] === 10
        },
        {
          label: '未签收票数：',
          total: thousands(this.totalInfo.noSignVotes, 0),
          visible: +this.summaryReport['notSignNumber'] === 10
        },
        {
          label: '超时未签票数：',
          total: thousands(this.totalInfo.timeOutNoSignVotes, 0),
          visible: +this.summaryReport['timeoutNotSignNumber'] === 10
        },
        {
          label: '妥投率：',
          total: deliveredRate,
          visible: +this.summaryReport['delivereRate'] === 10
        },
        {
          label: '时效达成率：',
          total: agingAchievedRate,
          visible: +this.summaryReport['timeReachRate'] === 10
        },
        {
          label: '揽收及时率：',
          total: collectInTimeRate,
          visible: +this.summaryReport['collectTimelyRate'] === 10
        },
        {
          label: '派签到及时率：',
          total: deiveryInTimeRate,
          visible: +this.summaryReport['dispatchTimelyRate'] === 10
        },
        {
          label: '线路：',
          total: this.totalInfo.totalRoads || 0,
          visible: isTotalRoads
        }
      ]
      /* return [
        {label:'总票数：',total: thousands(this.totalInfo.totalVotes,0) ,visible: +this.summaryReport['summaryTotalNumber']===10},
        {label:'总件数：',total: thousands(this.totalInfo.totalUnit,0),visible: +this.summaryReport['totalPackage']===10},
        {label:'总费用(元)：',total: thousands(this.totalInfo.sumAmounts),visible: +this.summaryReport['totalCost']===10},
        {label:'计费重量(KG)：',total: thousands(this.totalInfo.sumWeights),visible: +this.summaryReport['totalBillWeight']===10},
        {label:'实际重量(KG)：',total: thousands(this.totalInfo.totalActualWeight),visible: +this.summaryReport['realTotalWeight']===10},
        {label:'线路：',total: this.totalInfo.totalRoads || 0,visible: +this.summaryReport['route']===10},
      ]*/
    },
    //  获取切换角色的权限
    filCustomerLookUp() {
      let ary = customerLookUp.filter((item) => {
        if (item.auth) {
          if (+this.summaryReport[item.auth] === 10) {
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
    //  获取打开 关闭按钮
    handlePackUp() {
      this.isPackUp = !this.isPackUp
      this.url = this.isPackUp ? open : pack_up
      this.computedHeight()
    },
    // 初始化 columnInt
    getColumnInit(init = false) {
      let data = []
      let columns = cloneDeep(tableColumns)
      columns.forEach((item) => {
        item.checked = false
        item.sortIndex = ''
        if (
          this.summaryReport[item.auth] &&
          +this.summaryReport[item.auth] === 10
        ) {
          data.push(item)
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
    // 自定义排序tabel 添加
    async addCloumConfig(columns) {
      let reg = await API.addGridConfig({ name: '汇总报表', columns })
      if (reg.code === 0) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.activeCloumConfigId = reg.data
        this.getColumnConfig()
        // this.filCloumConfig(columns)
      } else {
        this.$message.error('保存失败')
      }
    },
    //  自定义排序tabel 获取
    async getColumnConfig() {
      let reg = await API.queryGridColumnConfig({ name: '汇总报表' })
      if (reg.code === 0) {
        if (reg.data && reg.data.gridAttribute) {
          let columns = JSON.parse(reg.data.gridAttribute) || []
          //  设置  table  item
          if (columns.length > 0) {
            this.filCloumConfig(columns)
          } else {
            this.activeTableColumns = []
            // this.visible= true
            // this.getColumnInit(true)
          }
        } else {
          this.activeTableColumns = []
          // this.getColumnInit()
        }
        this.activeCloumConfigId = reg.data.id
      }
      if (reg.code === 30003) {
        this.getColumnInit(true)
      }
      this.search() //点击搜索
    },
    //  自定义排序tabel 更新
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
    //   自定义排序tabel 过滤权限
    /*
    * 根据后端返回的列表字段展示权限，反向过滤筛选的展示权限
    * */
    filCloumAuth(columns) {
      if (Object.keys(this.summaryReport).length > 0) {
        let props = []
        let obj = {}
        let active = []
        columns.forEach((item) => {
          if (
            this.summaryReport[item.auth] &&
            +this.summaryReport[item.auth] === 10 &&
            item.checked === true
          ) {
            props.push(item.prop)
            obj[item.prop] = item
          }
        })
        this.tableColumns = this.tableColumns.map((it) => {
          let cur = obj[it.prop]
          if (props.includes(it.prop)) {
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
    // 过滤选中tabel
    filCloumConfig(columns) {
      //  设置  table  item
      if (columns && columns.length > 0) {
        this.filCloumAuth(columns)
      } else {
        this.activeTableColumns = this.tableColumns
      }
      this.computedHeight()
    },
    //  点击搜索按钮
    searchBut() {
      this.pagination.pageIndex = 1
      this.search()
    },
    //  表头拖拽
    headerDragend() {
      let timer = setTimeout(() => {
        clearTimeout(timer)
        this.computedHeight()
      }, 300)
    },
    //  表格排序 重置高亮
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
          column.order = this.prevSort
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
    //  初始化form 组件数据
    getComponentData() {
      let baiMingDan = ['shipingTimeStart', 'customerFlag']
      this.componentData = [
        /*        {  // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingTimeStart',
          "auth": 'shipingTimeStart',
          label:'寄件时间',
          component:'el-date-picker',
          width: '330px',
          attrs:{
            size:"medium",
            editable:false,
            clearable:false,
            type:"daterange",
            popperClass:'total-list-shiping-time20210713',
            rangeSeparator:"",
            startPlaceholder:"开始日期",
            endPlaceholder:"结束日期",
            pickerOptions: cloneDeep(this.pickerOptions),
            format:"yyyy/MM/dd",
          }
        },
         {  // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'signingTimeStart',
          auth: 'signDate',
          label:'签收时间',
          component:'el-date-picker',
          width: '330px',
          attrs:{
            size:"medium",
            editable:false,
            clearable:true,
            popperClass:'total-list-shiping-time20210713',
            type:"daterange",
            rangeSeparator:"",
            startPlaceholder:"开始日期",
            endPlaceholder:"结束日期",
            pickerOptions: cloneDeep(this.pickerOptions),
            format:"yyyy/MM/dd",
          }
        },

        */
        {
          // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: true, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'shipingTimeStart',
          auth: 'shipingTimeStart',
          label: '寄件时间',
          component: 'ky-date-picker',
          width: '330px',
          attrs: {
            editable: false,
            clearable: false,
            placeholder: '选择日期',
            type: 'date',
            width: '110px',
            size: 'small'
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
          // shipingTimeStart shipingTimeEnd 寄件时间开始 寄件时间结束
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'signingTimeStart',
          auth: 'signDate',
          label: '签收时间',
          component: 'ky-date-picker',
          width: '350px',
          attrs: {
            editable: false,
            clearable: true,
            type: 'date',
            placeholder: '选择日期',
            width: '125px',
            size: 'small'
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'customerFlag',
          auth: 'customerFlag',
          label: '切换角色',
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
          auth: 'serviceModel',
          label: '服务方式',
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
          prop: 'beginCity',
          auth: 'startPlace',
          label: '始发地',
          width: '330px',
          component: 'ky-city-name',
          /* component:'el-input',*/
          /*   component:'ky-city-address',*/
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入'
          }
        },
        {
          disabled: false, // 是否禁用
          checked: true, // 是否选中
          visible: true, // 是否显示
          prop: 'endCity',
          auth: 'endPlace',
          label: '目的地',
          width: '330px',
          /*   component:'ky-city-address',*/
          /*  component:'el-input',*/
          component: 'ky-city-name',
          attrs: {
            size: 'medium',
            clearable: true,
            placeholder: '请输入'
          }
        }
      ]
      if (this.componentData && this.componentData.length > 0) {
        this.activeComponent = this.componentData.filter((item) => {
          if (item.component === 'el-date-picker') {
            item.attrs.pickerOptions = cloneDeep(this.pickerOptions)
          }
          if (baiMingDan.includes(item.auth)) {
            /*
            * 命名都不会？
            * 添加需派时间展示特殊逻辑
            * shipingTimeStart和needSendTime同时存在时展示可选择datePicker
            * 只有shipingTimeStart时展示普通datePicker
            * */
            if (item.auth === 'shipingTimeStart') {
              return Number(this.summaryReport.needSendTime) !== 10
            } else {
              return true
            }
          }
          if (item.auth !== 'shipingTimeStart') {
            return (
              item.checked === true &&
              this.summaryReport[item.auth] &&
              +this.summaryReport[item.auth] === 10
            )
          } else {
            return (
              item.checked === true &&
              this.summaryReport[item.auth] &&
              +this.summaryReport[item.auth] === 10 &&
              +this.summaryReport.needSendTime !== 10
            )
          }
        })
      }
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
      //  设置  form  item
      this.getComponentData()
    },
    //  计算表格多余高度
    computedHeight() {
      this.$nextTick(() => {
        if (this.$refs.header && this.$refs.totalListTool) {
          let headerHeight = this.$refs.header.$el.offsetHeight
          let toolHeight = this.$refs.totalListTool.$el.offsetHeight
          this.tableHeight =
            headerHeight + toolHeight + 45 + 40 + 30 + 60 + 'px'
        }
        if (this.$refs.tableRef && this.$refs.tableRef.$refs.table) {
          this.$refs.tableRef.$refs.table.doLayout()
        }
      })
    },
    //  傻B钟立军定义的
    getGroupFlag() {
      // groupFlag	分组标识	string	否	1.含服务方式含始发目的地址，2.含服务方式不含始发目的地，3.不含服务方式和始发目的地
      if (this.activeTableColumns && this.activeTableColumns.length > 0) {
        let obj = {}
        this.activeTableColumns.forEach((item) => {
          if (item.prop === 'serviceMode') {
            obj.serviceMode = 1
          }
          if (item.prop === 'beginCity') {
            obj.beginCity = 2
          }
          if (item.prop === 'endCity') {
            obj.beginCity = 3
          }
        })
        if (obj.serviceMode && obj.beginCity && obj.beginCity) {
          return 1
        }
        if (obj.serviceMode) {
          return 2
        }
        return 3
      }
      return 1
    },
    //  搜索获取数据
    async search(order = 0, prop = '', isSort = true) {
      if (isSort && this.$refs.tableRef && this.$refs.tableRef.$refs.table) {
        this.$refs.tableRef.$refs.table.columns.forEach((item) => {
          item.order = null
        })
        this.$refs.tableRef.$refs.table.clearSort()
      }
      let page = {
        page: this.pagination.pageIndex || 1, //	页索引	number	否
        pageSize: this.pagination.pageSize || 20 //	页大小	number	否
        /* sortField: prop,//	排序字段	string	否
        asc: order === 'ascending' ? 1 : 0,//	是否升序，默认升序	boolean	否*/
      }
      let orderByClauses = [
        {
          field: prop,
          orderByMode: order === 'ascending' ? 0 : 1
        }
      ]
      this.formData.groupFlag = this.getGroupFlag() || '1'
      this.exportParm = { page, orderByClauses, data: this.formData }
      this.loading = true
      let reg = await API.waybillsummarySearch({
        page,
        orderByClauses,
        data: this.formData
      })
      this.loading = false
      if (reg.code === 0) {
        let data = reg.data || {}
        let info = data.waybillSummaryList || []
        this.totalInfo = data
        this.pagination.totalCount = data.rowTotal || 0
        this.pagination.pageIndex = this.pagination.pageIndex || 1
        info.forEach((item) => {
          item.sumDevliveredRate = item.sumDevliveredRate
            ? item.sumDevliveredRate + '%'
            : item.sumDevliveredRate === 0
              ? 0
              : '--'
          item.sendDeliveredRate = item.sendDeliveredRate
            ? item.sendDeliveredRate + '%'
            : item.sendDeliveredRate === 0
              ? 0
              : '--'
          item.agingAchievedRate = item.agingAchievedRate
            ? item.agingAchievedRate + '%'
            : item.agingAchievedRate === 0
              ? 0
              : '--'
          item.collectTimeoutRate = item.collectTimeoutRate
            ? item.collectTimeoutRate + '%'
            : item.collectTimeoutRate === 0
              ? 0
              : '--'
          item.sumWeight = item.sumWeight ? numberFixed(item.sumWeight) : '--'
          item.totalCost = item.totalCost ? numberFixed(item.totalCost) : '--'
          item.totalActualWeight = item.totalActualWeight
            ? numberFixed(item.totalActualWeight)
            : '--'
          Object.keys(item).forEach((key) => {
            if (!item[key] && item[key] !== 0) {
              item[key] = '--'
            }
          })
          item.myIndex = this.pagination.pageIndex - 1 || 0
          item.mySize = this.pagination.pageSize || 20
        })
        this.tableData = info || []
      } else {
        this.tableData = []
      }
      this.loading = false
    },
    //  重置from 数据
    reset() {
      this.formData = cloneDeep(formData)
    },
    //  change page
    pageChange(pageIndex) {
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
    //  change size
    sizeChange(pageSize) {
      this.pagination.pageIndex = 1
      this.pagination.pageSize = pageSize || 20
      this.search()
    },
    //  导出
    async exportData() {
      if (this.tableData.length === 0) {
        this.$message.error('没有导出的数据')
        return
      }
      this.$confirm('是否要导出数据？', '导出', {}).then(() => {
        let { page, orderByClauses, data } = this.exportParm
        let exportFieldList = []
        let params = initSummaryParams(data) || {}
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
    //  点击排序弹层按钮
    sortData() {
      this.visible = true
    },
    //  选中排序
    selectSort({ dragData, column }) {
      this.tableColumns = column
      if (this.activeCloumConfigId) {
        this.updateCloumConfig(dragData)
      } else {
        this.addCloumConfig(dragData)
      }
    },
    /*
    时间类型处理
    前任写的代码不具备可维护性，故借用listener做兼容处理
    写的什么狗屎玩意
    */
    changeDateType(value) {
      this.formData.dateType = value
    },
    /*服务方式全选*/
    changeServiceType(value) {
      this.formData.serviceType = this.productTypeChange(
        value,
        this.serviceOption
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
    // 添加更新时间
    async initUpdateTime() {
      const { data } = await API.updateTime()
      this.updateTime = data[0].updateTime
    }
  },
  //路由
  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      //  进入前会判断是否有权限，没有权限会重新请求
      vm.$store
        .dispatch('tatol/GET_TOTALS_AUTH', 'summaryReport')
        .then(async (reg) => {
          let data = reg['summaryReport'] || {}
          if (checkAuth(data)) {
            vm.getColumnInit()
            await vm.getOverviewServiceType()
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

<style scoped lang='scss'>
.update-time {
  width: 14px;
  display: inline-block;
  
  i {
    font-size: 1.4rem;
    color: #ccc;
    cursor: pointer;
  }
}

.total-list {
  height: 100%;
  background: #f5f6fb;
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
    width: 24px;
    height: 24px;
    font-size: 20px;
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
  .total-totals-form {
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

::v-deep .ky-date-picker {
  min-width: 240px;
}
</style>
