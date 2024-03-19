<template>
  <div class='main-container waybill-container' v-loading='loading' v-overlay='overlay && !loading'>
  <waybill-batch :batch-no='batchNo'></waybill-batch>
  <tabbar size='large' :tabs='queryTypeConfig' :value.sync='queryType' @update:value='tabpageChange'>
    <div class='tabbar-inner'>
      <orderQuery v-if="queryType === '0'" ref='orderQuery' :steps='steps' :guide='overlay && !loading'
                  @query='numberQuery'></orderQuery>
      <template v-if='!overlay'>
        <div class='tabbar-find-material' @click='onFindAllMaterial'>
          <el-button type='primary'>
            <i class='iconfont iconfind-material'></i>
            查看运单资料
          </el-button>
        </div>
      </template>
      <!--        新手引导-->
      <template v-else-if='steps === 1'>
        <div class='guide_pic'></div>
        <div class='guide_text'>
          <p>查看所有运单的回单、运单联、签收联</p>
        </div>
      </template>
    </div>
  </tabbar>

  <!-- 运单查询 -->
  <template v-if="queryType === '0'">
    <waybillQuery ref='query' :fold='2' @query='handleQueryData' :isPackUp.sync='isPackUp'></waybillQuery>
    <tabbar :tabs='customerSource' :steps='steps' :value.sync='waybillCustomerSource'
            @update:value='tabChange'></tabbar>
    <waybillStatus ref='waybillStatus' :waybill-customer-source='waybillCustomerSource'
                   :waybill-status='waybillStatusCollection' :selectedRows='selectedRows' :guide='overlay && !loading'
                   :steps='steps' :loading='loading' @close-overlay='closeOverlay' @change='statusChange'
                   @handleQueryData='opereationFreshData' @updateLoading='updateLoading'></waybillStatus>
    <router-view />
  </template>
  <!-- 批次查询 -->
  <template v-else-if="queryType === '1'">
    <waybill-batch-query />
  </template>
  <div class='table-style'>
    <waybill-table :tableConfigName='tableConfigName' :data='tableData' :selectedRows.sync='selectedRows'
                   :waybill-customer-source='waybillCustomerSource' :waybill-status='waybillStatus'
                   :pagination='pagination' :isPackUp='isPackUp' @size-change='sizeChange' @page-change='pageChange'
                   @handleSortQuery='handleSortQuery' :sortInfo.sync='sortInfo' ref='waybillTable'
                   :tableColumnsSort='tableColumns'>
      <vxe-table-column fixed='left' title='操作' :width='handlerWidth'
                        v-if="waybillCustomerSource==='10' && waybillStatus!='40'">
        <template v-slot='{ row }'>
          <!--          国际件不展示任何按钮-->
          <template v-if='row.waybillBusinessRange !== 10'>
            <el-button
              v-if='row.waybillStatus===Number(statusEnum.CANCEL)'
              :class="row.limitType === affectTypeEnum.LIMIT ? 'gray' : ''"
              @click='noticeForPickup(row)' type='text' size='small' class='btn-text-border'>
              重新下单
            </el-button>
            <el-button
              v-if='row.waybillStatus===Number(statusEnum.INFORM)'
              :class="row.limitType === affectTypeEnum.LIMIT ? 'gray' : ''"
              @click='copyWaybill(row)' type='text' size='small' class='btn-text-border'>
              再来一单
            </el-button>
            <el-button v-if='row.waybillStatus===Number(statusEnum.PICKUP)' type='text' size='small'
                       @click='handleUrgeDelivery(row.waybillNumber)' class='el-button btn-text-border'>
              催取
            </el-button>
            <el-button v-if='row.waybillStatus===Number(statusEnum.PICKUP)' type='text' size='small'
                       class='btn-text-border' @click='handleUploadForwardingOrder(row.orderNumber)'>
              上传取货资料
            </el-button>
            <el-button v-if='row.waybillStatus === Number(statusEnum.UNSIGNED)' type='text' size='small'
                       class='el-button btn-text-border' @click.native='handleUrgeDelivery(row.waybillNumber)'>
              催派
            </el-button>
            <el-button v-if='row.waybillStatus === Number(statusEnum.UNSIGNED)' type='text' size='small'
                       class='btn-text-border' @click.native='handlePickupAppoint(row)'>
              上传派货资料
            </el-button>
            <!--            取派影响-->
            <tooltip-affect-reason v-if="getPopperType(row) === 'limit'"
                                   :tipType="row.limitType === affectTypeEnum.LIMIT ? 'error' : 'warning'"
                                   :reasonCode='row.limitReason' :tipMsg='row.noticeMessage'>
            </tooltip-affect-reason>
            <span v-else-if="getPopperType(row) === 'unfreeze'" class='unfreeze-label'>
                <i>解除管控</i>
              </span>
            <!--            报关限制-->
            <el-tooltip
              v-else-if="getPopperType(row) === 'storage'"
              popper-class='storage-error-popper'
              placement='bottom-start'
              effect='light'
              :open-delay='300'
              :content='row.adjustPriceTips'>
                    <span class='storage-error-label'>
      <!--              <span v-if='true' class='storage-error-label'>-->
                      <i>入仓异常</i>
                    </span>
            </el-tooltip>
          </template>
        </template>
      </vxe-table-column>
      <vxe-table-column fixed='left' title='操作' :width='handlerWidth'
                        v-if='waybillCustomerSource === customerSourceEnum.RECEIVED && waybillStatus === statusEnum.UNSIGNED'>
        <template v-slot='{ row }'>
          <el-button v-if='row.waybillStatus === Number(statusEnum.UNSIGNED)' type='text' size='small' class='el-button'
                     @click.native='handleUrgeDelivery(row.waybillNumber)'>
            催派
          </el-button>
        </template>
      </vxe-table-column>
      <vxe-table-column fixed='right' key='column-setting' width='40' class-name='drag-line--hide'>
        <template slot='header'>
          <div>
            <el-button type='text' @click='showColumnManager' style='padding:0;'>
              <svg-icon icon-class='waybill-setting' class='icon-tabs' />
            </el-button>
          </div>
        </template>
      </vxe-table-column>
    </waybill-table>
  </div>
  <!-- 灰度数据迁移 -->
  <migration-entry ref='migrationEntry' />
  <dialog-waybill-modify ref='dialogWaybillModifyRef' @save-success='waybillmodify' />
  <upload-order-file ref='uploadOrderFile' :can-preview='true' :can-download='true' />
  <perfect-order v-if='false' v-show='waybillStatus===statusEnum.INFORM' :count='perfectOrderCount'></perfect-order>
  <Upgrade ref='upgrade' @go-guide='showGuide' />
  <upload-pickup-file ref='UploadPickupFile' @save='handleSaveDeliveryData' />
  <online-service></online-service>
  <template v-if='overlay && steps === 1'>
    <div class='guide_button' @click.stop='guideNext'></div>
  </template>
  <template v-if='overlay && steps === 2'>
    <div class='guide_button close' @click.stop='closeOverlay'></div>
  </template>
  <DialogModule ref='dialogModule' />
  <notice-pickup ref='noticePickupRef' />
  </div>
</template>

<script>
import waybillQuery from './components/waybill-query.vue'
import tabbar from './components/tabbar'
import waybillStatus from './components/waybill-status.vue'
import waybillBatch from './components/waybill-batch.vue'
import orderQuery from './components/order-query'
import queryTypeConfig from './config/queryType'
import { KyIcon } from '@comps'
import customerSource from './config/customerSource'
import waybillTable from '@/views/waybill/components/waybill-table'
import WaybillBatchQuery from '@/views/waybill/pages/waybill-batch-query'
import DialogWaybillModify from '@views/delivery/components/dialog-waybill-modify'
import { mapGetters, mapState } from 'vuex'
import API from '@api/waybill'
import waybillApi from '@/services/api/waybill'
import { queryModeEnum, customerSourceEnum, statusEnum } from './enum/queryEnum'
import * as storageUtil from '@/utils/storage'
import md5 from 'md5'
import { uniqBy, cloneDeep } from 'lodash'
import dayjs from 'dayjs'
import { queryGridColumnConfig } from '@/services/api/waybillOld'
import UploadOrderFile from '@/views/waybill/components/detail/upload-order-file.vue'
import guide from './utils/guide'
import Upgrade from '../upgrade'
import userSetting from './utils/userSetting'
import PerfectOrder from './components/perfect-order/index.vue'
import MigrationEntry from './components/migration/migration-entry'
import tableColumnFilter from './config/tableColumnFilter'
import UploadPickupFile from '@/views/waybill/components/upload-pickup-file'
import OnlineService from '@/components/online-service'
import { tableConfigs, chargeColumns, routeDescription, updationDate } from './config/table'
import DialogModule from './components/dialogModule'
import NoticePickup from '@/views/waybill/components/notice-pickup'
import ExternalAffectServe from '@/views/waybill/utils/ExternalAffectServe'
import tooltipAffectReason from '@/views/delivery/batch/table-cell-template/tooltip-affect-reason'
import { affectTypeEnum, limitCancelFlagEnum, affectTextEnum, clearanceControlFlagEnum } from '@/views/waybill/enum/affectEnum'

const informColumns = ['waybillNumber', 'count', 'goodsType', 'pickupPerson', 'actualWeight', 'pickupCustomerName', 'pickupAddress']

const pickupColumns = ['waybillNumber', 'goodsTime', 'count', 'goodsType', 'pickupPerson', 'actualWeight', 'pickupCustomerName', 'pickupAddress']

const unsignedColumns = ['waybillNumber', 'count', 'goodsType', 'pickupPerson', 'actualWeight', 'pickupCustomerName', 'pickupAddress', 'deliveryTime']

const signedColumns = ['waybillNumber', 'count', 'goodsType', 'actualWeight', 'receiveTime', 'receiver', 'deliveryTime']


// 初始化搜索PICKUP数据
const queryData = {
  creationStartDate: dayjs().add(-59, 'd').format('YYYY-MM-DD 00:00:00'),
  creationEndDate: dayjs().format('YYYY-MM-DD 23:59:59'),
  storageFeeStatus: '',
  serviceMode: '',
  printStatus: '30',
  deliveryStartTime: '',
  deliveryEndTime: '',
  deliveryPerson: '',
  deliveryAddress: '',
  pickupPerson: '',
  pickupAddress: '',
  pickupCustomerName: '',
  customerCodes: [],
  hasReceipt: ''
}

export default {
  name: 'Waybill',
  components: {
    tabbar,
    KyIcon,
    waybillQuery,
    waybillStatus,
    waybillTable,
    waybillBatch,
    orderQuery,
    WaybillBatchQuery,
    DialogWaybillModify,
    UploadOrderFile,
    PerfectOrder,
    MigrationEntry,
    Upgrade,
    UploadPickupFile,
    OnlineService,
    DialogModule,
    NoticePickup,
    tooltipAffectReason
  },
  data() {
    return {
      queryTypeConfig,
      queryType: '0',
      customerSource,
      orderNoCache: [], // 订单号搜索缓存
      batchNo: '', // 批次号回跳查询
      queryData: cloneDeep(queryData), // 搜索信息
      selectedRows: [],
      // 表格参数
      tableData: [], // 表格展示数据
      waybillStatusCollection: {
        allCount: 0,
        signCount: 0,
        stayInformedCount: 0,
        staySignCount: 0,
        stayTookCount: 0
      },
      countSummary: {
        noticepickup: 0,
        pickup: 0,
        unsigned: 0,
        signed: 0
      },
      countReceiveSummary: {
        noticepickup: 0,
        pickup: 0,
        unsigned: 0,
        signed: 0
      },
      waybillStatus: statusEnum.INFORM,
      waybillCustomerSource: customerSourceEnum.SENDED,
      isQueryPage: false,
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        pageSizes: [10, 30, 50, 100]
      },
      loading: false,
      isPackUp: true, //是否收起
      sortInfo: [],
      statusEnum,
      customerSourceEnum,
      tableColumnFilter, // 列表字段展示配置
      hasChargesPermission: false, // 是否展示列表费用
      // tableConfigName:this.waybillCustomerSource+'-'+this.waybillStatus,
      tableColumns: tableConfigs,
      AllColumns: {},//全部列
      defaultColumns: [],
      overlay: false, // 引导蒙层
      steps: 1, // 引导步骤
      perfectOrderCount: 0,
      affectTypeEnum,
      limitCancelFlagEnum,
      clearanceControlFlagEnum
    }
  },
  created() {
    this.getTableColumns()//获取列
    this.getUserPageSize()
  },
  async mounted() {
    // 处理返回时tab的展示问题
    this.$store.dispatch('client/setPayCustomerCodeListAction')
    this.$store.dispatch('client/setCustomerProjectInfoAction')
    this.refreshData()
    // 新手引导展示判断
    const showDialog = !(await guide.showOverlay())
    if (showDialog) {
      this.$refs.upgrade.showDialog()
    }
    this.$refs.dialogModule.getQuestionData()
  },
  computed: {
    ...mapGetters(['goodsBatchTimes', 'isEncryptField']),
    ...mapState(['userInfo']),
    tableConfigName() {
      return 'waybill-v3-35' + '-' + this.waybillCustomerSource + '-' + this.waybillStatus
    },
    // 处理待揽件和全部操作列宽度
    handlerWidth() {
      switch (this.waybillStatus) {
        case statusEnum.INFORM:
        case statusEnum.CANCEL:
          return 200
        case statusEnum.PICKUP:
        case statusEnum.SIGNED:
        case statusEnum.UNSIGNED:
        case statusEnum.ALL:
          return 300
      }
      return ''
    }
  },
  methods: {
    /** 查看所有运单资料 */
    async onFindAllMaterial() {
      this.$reportUtils.clkSearchOrderButton({ button_name: '查看运单资料' })
      const queryData = cloneDeep(this.$refs.query.getQueryFormData())
      const waybillStatus = this.waybillStatus === statusEnum.ALL
        ? this.waybillCustomerSource === customerSourceEnum.SENDED
          ? [statusEnum.INFORM, statusEnum.PICKUP, statusEnum.UNSIGNED, statusEnum.SIGNED, statusEnum.CANCEL]
          : [statusEnum.UNSIGNED, statusEnum.SIGNED]
        : [this.waybillStatus]
      const params = {
        generalQuery: queryData,
        smallQuery: [],
        waybillCustomerSource: [this.waybillCustomerSource],
        waybillStatus,
        queryMode: queryModeEnum.GENERAL,
        page: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize
      }
      await this.$store.dispatch('material/SET_QUERY_CODES_PARAMS', cloneDeep(params))
      await this.$router.push('/admin/waybill-v3-material')
    },
    async numberQuery(list) {
      // 提单号查询
      this.$refs.query.resetHandler(false)
      this.$refs.waybillTable.clearSort()
      if (list) {
        this.orderNoCache = list
        this.initPagination()
        this.refreshData()
      }
    },
    handleQueryData(query) {
      // 运单内容查询
      this.$refs.orderQuery.clear()
      this.$refs.waybillTable.clearSort()
      this.orderNoCache = []
      this.queryData = Object.assign({}, queryData, query)
      this.initPagination()
      this.refreshData()
    },
    tabpageChange(value) {
      this.queryType = value
    },
    tabChange(customSource) {
      // 客户来源tab切换
      const obj = this.customerSource.find(i => i.value === customSource)
      this.$reportUtils.clkSearchOrderCardFirst({ button_name: obj.label })
      this.waybillCustomerSource = customSource
    },
    statusChange(value) {
      // 货物转态切换
      this.waybillStatus = value
      this.initPagination()
      this.refreshData()
      // this.waybillDataQuery()
    },
    async waybillStatusQuery() {
      // 获取货物状态统计信息
      let fn = null
      const queryData = cloneDeep(this.queryData)

      const orderNoCache = cloneDeep(this.orderNoCache)
      const waybillStatus = this.waybillCustomerSource === customerSourceEnum.SENDED
        ? [statusEnum.CANCEL, statusEnum.INFORM, statusEnum.PICKUP, statusEnum.UNSIGNED, statusEnum.SIGNED]
        : [statusEnum.UNSIGNED, statusEnum.SIGNED]
      if (!this.orderNoCache.length) {
        fn = API.getWaybillStatusCounts(
          queryData,
          [],
          [this.waybillCustomerSource],
          waybillStatus,
          queryModeEnum.GENERAL
        )
      } else {
        fn = API.getWaybillStatusCounts(
          {},
          orderNoCache,
          [this.waybillCustomerSource],
          waybillStatus,
          queryModeEnum.SMALL,
          this.page,
          this.pageSize
        )
      }
      const { data } = await fn
      this.waybillStatusCollection = data
    },
    async waybillDataQuery(isSort = false) {
      const queryData = cloneDeep(this.queryData)
      const orderNoCache = cloneDeep(this.orderNoCache)
      try {
        if (!this.loading) this.loading = true
        // 获取货物列表
        let fn = null
        let params = {}
        const waybillStatus = this.waybillStatus === statusEnum.ALL ?
          this.waybillCustomerSource === customerSourceEnum.SENDED
            ? [statusEnum.CANCEL, statusEnum.INFORM, statusEnum.PICKUP, statusEnum.UNSIGNED, statusEnum.SIGNED]
            : [statusEnum.UNSIGNED, statusEnum.SIGNED]
          : [this.waybillStatus]

        if (!this.orderNoCache.length) {
          params = {
            generalQuery: queryData,
            smallQuery: [],
            waybillCustomerSource: [this.waybillCustomerSource],
            waybillStatus,
            queryMode: queryModeEnum.GENERAL,
            page: this.pagination.pageIndex,
            pageSize: this.pagination.pageSize,
            orderByClauses: isSort ? this.sortInfo : []
          }
        } else {
          params = {
            generalQuery: {},
            smallQuery: orderNoCache,
            waybillCustomerSource: [this.waybillCustomerSource],
            waybillStatus,
            queryMode: queryModeEnum.SMALL,
            page: this.pagination.pageIndex,
            pageSize: this.pagination.pageSize
          }
        }
        fn = API.getWaybillData(params, async paramsData => {
          // 存储传参数据
          await this.$store.dispatch('waybill/update_small_query', paramsData)
        })
        const { data } = await fn
        this.tableData = data?.rows || []
        // 判断列表中是否存在展示费用权限
        if (this.tableData.length) {
          this.hasChargesPermission = !!this.tableData.find(item => item.hasPermission)
        }

        /** 处理自定义编码字段内容 */
        this.tableData = this.tableData.map(item => {
          const list = item.waybillCustomerWaybillList
          if (list.length > 0) {
            list.forEach(val => {
              const key = `array_waybillCustomerWaybillList_customerWaybillType[${val.customerWaybillType}]_customerWaybillNumber`
              item[key] = val.customerWaybillNumber || ''
            })
          }
          return item
        })

        this.handleTableColumns()
        if (this.orderNoCache.length) {
          setTimeout(() => this.$refs.orderQuery.getHistory(), 2000)
        }
        this.pagination = {
          pageIndex: data?.page || 1,
          pageSize: data?.pageSize || 10,
          totalCount: data?.rowTotal || 0,
          pageSizes: [10, 30, 50, 100]
        }
      } finally {
        // this.getExternalAffectData()
        this.loading = false
      }
    },
    // 取派外显数据获取
    async getExternalAffectData() {
      // 没有数据，取消发货，已签收不展示
      if (!this.tableData.length) return
      if (this.waybillStatus === statusEnum.CANCEL || this.waybillStatus === statusEnum.SIGNED) return
      const params = this.tableData.map(({
        waybillNumber,
        waybillStatus,
        deliveryAddress,
        pickupAddress,
        goodsTime,
        creationDate
      }) => {
        return {
          waybillNumber,
          waybillStatus,
          deliveryAddress,
          pickupAddress,
          deliveryTime: goodsTime || creationDate
        }
      })
      const { asyData } = await ExternalAffectServe.startQuery({ externalEffectRequestList: params }, this)
      if (!asyData.length) return
      const arr = cloneDeep(this.tableData)
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < asyData.length; j++) {
          if (asyData[j]?.waybillNumber === arr[i]?.waybillNumber) {
            // this.tableData[i] = Object.assign(this.tableData[i], asyData[j])
            // this.$set(this.tableData[i], "limitCategory", asyData[j].limitCategory)
            // this.$set(this.tableData[i], "message", asyData[j].message)
            arr[i].limitCategory = asyData[j].limitCategory
            arr[i].message = asyData[j].message
          }
        }
      }
      this.tableData = arr
    },
    // 排序查询运单
    handleSortQuery(isSort = true) {
      this.orderNoCache = []
      this.waybillDataQuery(isSort)
      this.waybillStatusQuery()
    },
    modify(row) {
      this.$refs.dialogWaybillModifyRef.showDialog(row.waybillNumber)
    },
    //催取
    handleUrgeCollection(ydNo, orderNumber) {
      this.$kye_message.confirm('即将为您催促司机上门取货，请确认是否催取？', {
        type: 'warning'
      }).then(async () => {
        let prams = {
          waybillNumber: ydNo,
          orderNumber: orderNumber,
          source: 40,
          remark: '优先安排司机取货'
        }
        let res = await waybillApi.waybillUrge(prams)
        if (res.code === 0) {
          // this.$message.success('已为您催收，我们将尽快上门取货，请耐心等候')
          this.$message.success('催取后将为您优先安排司机取货')
        }
      })
    },
    //催派
    handleUrgeDelivery(waybillNumber, btnText) {
      this.orderListReport(btnText)
      const url = this.getOnlineServiceUrl(waybillNumber)
      let iWidth = 1145
      let iHeight = 780
      let iTop = (window.screen.availHeight - 30 - iHeight) / 2
      //获得窗口的水平位置
      let iLeft = (window.screen.availWidth - 10 - iWidth) / 2

      let param = `height=${iHeight}, top=${iTop}, width=${iWidth}, left=${iLeft}, toolbar='no', menubar='no', scrollbars='no', resizable='no', location='no', status='no'`
      window.open(url, '_blank', param)
    },
    getOnlineServiceUrl(waybillNumber) {
      //let url = 'https://kuasheng-h5.kye-erp.com/ccms-online-web/'
      let url = 'https://kuasheng-h5.kye-erp.com/ccms-online-web/'
      if (
        ['uc-uat.ky-express.com', 'uc-dev.ky-express.com', 'localhost'].includes(
          window.location.hostname
        )
      ) {
        url = 'http://erp-kuasheng-h5-uat.kye-erp.com/ccms-online-web/'
      }
      const params = {
        name: storageUtil.getLoginData().marketer,
        source: 'WEB',
        phone: storageUtil.getPhone()
      }
      const keys = Object.keys(params)
        .filter(k => params[k])
        .sort()
      let rawString = keys.reduce((str, cur) => {
        str += cur + params[cur]
        return str
      }, '')
      rawString += 'imcloudMethod'
      params.sign = md5(rawString).toUpperCase()
      params.type = 'reminder'
      params.paramsNum = waybillNumber

      const paramsString = Object.keys(params)
        .filter(k => params[k])
        .map(k => `${k}=${params[k]}`)
        .join('&')
      return `${url}?${paramsString}`
    },
    /** 跳转查看运单资料页面 */
    goMaterialRoute(data) {
      if (!data.ydNoList || data.ydNoList.length <= 0) {
        return this.$message.warning('查询资料的运单号列表为空')
      }
      window.sessionStorage.setItem('YDNO_LIST', JSON.stringify(data))
      this.$router.push('/admin/waybill-v3-detail-material')
    },
    pageChange(pageIndex) {
      /*
          *翻页
          *如果超出5w条数据，阻止搜索并停留在这一页
          * */
      // const newTotal = pageIndex * this.pagination.pageSize
      // if (newTotal > 50000) {
      if ((50000 / this.pagination.pageSize) < pageIndex) {
        this.$message.warning('查询数据量过大，请筛选条件后查询')
        return
      }
      this.pagination.pageIndex = pageIndex
      this.refreshData()
    },
    sizeChange(pageSize) {
      /*
          * 页面条数变化处理
          * 由于waybill-table直接对pagination做了修改，因此无法判断pageSize是否发生变化，
          * 只能每一次翻页都更新
          * */
      this.pagination.pageSize = pageSize
      this.pagination.pageIndex = 1 //页码改变，重置为第一页
      userSetting.setUserPageSize(pageSize)
      this.refreshData()
    },
    showColumnManager() {
      this.$refs.waybillTable.showColumnManager()
    },
    handleUploadForwardingOrder(ydNo, freshData) {
      this.orderListReport('上传取货资料')
      this.$refs.uploadOrderFile.showDialog(ydNo, freshData)
    },
    getTitle(materialFlag) {
      let title = '派货资料'
      switch (materialFlag) {
        case 1:
          title = '上传派货资料'
          break
        case 2:
          title = '查看派货资料'
          break
        case 3:
          title = '上传预约号'
          break
        case 4:
          title = '查看预约号'
          break
      }
      return title
    },
    async handlePickupAppoint(rowInfo) {
      this.orderListReport('上传派货资料')
      const { waybillNumber, pickupAddress, pickupCustomerName } = rowInfo
      const data = await API.getUploadMaterialInfo({ waybillNumber })
      let params = [{
        address: pickupAddress,
        addressType: 20,
        no: waybillNumber
      }]
      let res = await waybillApi.getWarehouseType(params)
      let warehouseType = '40'
      let reserveInfo = ['4010']
      if (res.code === 0 && res.data && res.data[0].info) {
        warehouseType = res.data[0].info[0].warehouseType
        reserveInfo = res.data[0].info[0].reserveInfo
      }
      const { appointNumber, appointDate, purchaseNumber, materialFlag, preArriveTime } = data.data
      this.$refs.UploadPickupFile.showDialog({
        //type: res.data[0].info.reserveInfo, // 类型 '4010': 仅显示上传资料、'4020': 仅显示预约时间、'4030': 仅显示预约号、['4010', '4020', '4030']: 显示上传资料、预约号、预约时间
        reserveInfo: reserveInfo,
        warehouseType: warehouseType,
        waybillNo: waybillNumber, // 运单号
        address: pickupAddress, // 详细地址
        company: pickupCustomerName, // 收件公司
        appointDate: appointDate || '', //预约时间
        appointNumber, //预约单号
        purchaseNumber, //采购单号
        title: this.getTitle(materialFlag),
        materialFlag,
        preArriveTime //预计下单时间
      })
    },
    getDefaultColumns(arr) {
      switch (this.waybillStatus) {
        case statusEnum.INFORM:
        case statusEnum.CANCEL:
        case statusEnum.ALL:
          this.defaultColumns = informColumns
          break
        case statusEnum.PICKUP:
          this.defaultColumns = pickupColumns
          break
        case statusEnum.UNSIGNED:
          this.defaultColumns = unsignedColumns
          break
        case statusEnum.SIGNED:
          this.defaultColumns = signedColumns
          break
      }
      arr.forEach(el => {
        el.visible = this.defaultColumns.includes(el.prop) ? true : false
      })
      return arr
    },
    async getTableColumns() {
      let columns = this.AllColumns[this.tableConfigName]
      if (!columns) {//查询
        const res = await queryGridColumnConfig(this.tableConfigName)
        if (res.code === 0 && res.data && res.data.gridAttribute) {
          let tempColumns = JSON.parse(res.data.gridAttribute)
          this.AllColumns[this.tableConfigName] = this.tableColumns = tempColumns
        } else {
          this.tableColumns = this.getDefaultColumns(tableConfigs)
        }
      } else {
        this.tableColumns = columns
      }

      const fieldColumns = this.$store.getters.customFields.map(item => {
        const obj = {
          prop: `array_waybillCustomerWaybillList_customerWaybillType[${item.code}]_customerWaybillNumber`,
          text: item.label,
          width: '150',
          minWidth: '140',
          visible: true,
        }
        return obj
      })
      this.tableColumns = uniqBy([...this.tableColumns, ...fieldColumns], 'text')
    },
    waybillmodify({ isParentWaybill }) {
      isParentWaybill ? this.refreshData(1500) : this.refreshData()
    },
    opereationFreshData() {
      // 校验操作：如果选择某页所有内容，需要修正pagination
      if (this.selectedRows.length === this.tableData.length) {
        this.pagination.pageIndex = this.pagination.pageIndex - 1 <= 1 ? 1 : this.pagination.pageIndex - 1
      }
      this.refreshData(2000)
    },
    refreshData(time = 0) {
      if (!this.loading) this.loading = true
      setTimeout(() => {
        this.removeSelectedRows()
        this.waybillStatusQuery()
        this.waybillDataQuery()
      }, time)
    },
    initPagination() {
      this.pagination.pageIndex = 1
      this.pagination.totalCount = 0
      this.pagination.pageSizes = [10, 30, 50, 100]
    },
    handleTableColumns() {
      let arr = [...this.tableColumns]
      // 特殊处理费用相关字段
      if (this.hasChargesPermission && [statusEnum.UNSIGNED, statusEnum.SIGNED].includes(this.waybillStatus)) {
        const index = arr.findIndex(item => item.prop === 'totalAmount' || item.prop === 'freightAmount' || item.prop === 'extraAmount')
        if (index < 0) {
          arr = arr.concat(chargeColumns)
        }
      } else {
        const charges = ['totalAmount', 'freightAmount', 'extraAmount']
        charges.forEach(item => {
          const ind = arr.findIndex(ite => ite.prop === item)
          ind > -1 && arr.splice(ind, 1)
        })
      }
      // 路由节点字段处理
      if (this.waybillStatus !== statusEnum.INFORM && this.waybillStatus !== statusEnum.CANCEL) {
        const flag = arr.some(item => item.prop === 'routeDescription')
        if (!flag) {
          arr = arr.concat(routeDescription)
        }
      } else {
        const ind = arr.findIndex(item => item.prop === 'routeDescription')
        ind > -1 && arr.splice(ind, 1)
      }

      if (this.waybillStatus === statusEnum.CANCEL || this.waybillStatus === statusEnum.ALL) {
        const flag = arr.some(item => item.prop === 'updationDate')
        if (!flag) {
          arr = arr.concat(updationDate)
        }
      } else {
        const ind = arr.findIndex(item => item.prop === 'updationDate')
        ind > -1 && arr.splice(ind, 1)
      }

      this.tableColumnFilter.forEach(item => {
        const strInd = arr.findIndex(ite => ite.prop === item.field)
        if (item.waybillStatus) {
          if (!item.waybillStatus.includes(this.waybillStatus)) {
            strInd > -1 && arr.splice(strInd, 1)
          }
        }
        if (item.getters) {
          if (!this.$store.getters[item.getters]) {
            strInd > -1 && arr.splice(strInd, 1)
          }
        }
      })
      this.tableColumns = arr
    },
    clickListener() {
      if (this.overlay) {
        if (this.steps === 1) {
          this.guideNext()
        } else if (this.steps === 2) {
          this.closeOverlay()
        }
      }
    },
    showGuide() {
      this.overlay = true
      addEventListener('click', this.clickListener)
    },
    guideNext() {
      // 新手引导逻辑
      this.steps = 2
    },
    closeOverlay() {
      // 新手指引关闭
      this.overlay = false
      guide.closeOverlay()
      this.steps = 3
      removeEventListener('click', this.clickListener)
    },
    async getUserPageSize() {
      // 获取用户页面条数展示
      const pageSize = await userSetting.getUserPageSize()
      this.pagination.pageSize = Number(pageSize) || this.pagination.pageSizes[0]
    },
    copyWaybill({ limitType, limitReason, waybillNumber }) {
      this.orderListReport('再来一单')
      if(limitType === affectTypeEnum.LIMIT) {
        const text = affectTextEnum[limitReason]
        return this.$message.warning(`当前运单因${text}不可抗因素不可重新下单`)
      }
      const params = { isCopy: true, ydNo: waybillNumber }
      this.$router.push({ name: 'delivery', params })
    },
    updateTableColumnsCache(tableColumns) {
      this.tableColumns = this.AllColumns[this.tableConfigName] = tableColumns
      this.AllColumns[this.tableConfigName] = tableColumns
    },
    //更改loading状态
    updateLoading(val) {
      this.loading = val
    },
    /** 清空选中的checked */
    removeSelectedRows() {
      this.selectedRows = []
    },
    async handleSaveDeliveryData(formData, fn) {
      if (formData) {
        /*
            * 更新数据
            * 如果有预约号和预约时间才调接口保存
            * 否则直接刷新
            * */
        const { appointNumber, purchaseNumber, appointDate, waybillNo, preOrderFlag } = formData
        if (!appointNumber && !purchaseNumber && !appointDate) {
          setTimeout(() => {
            this.$message.success('成功')
            this.freshData()
          }, 1500)
          return
        }
        let params = {
          waybillNumber: waybillNo,
          appointNumber: appointNumber + '',
          purchaseNumber: purchaseNumber + '',
          appointDate: appointDate ? dayjs(appointDate + ':00').format('YYYY-MM-DD HH:mm:ss') : '',
          operateSource: '210', // 操作来源，移动端-260 客户端-210
          preOrderFlag
        }
        let res = await waybillApi.updatePickupAppoint(params)
        if (res.code === 0) {
          setTimeout(() => {
            this.$message.success('成功')
            this.refreshData()
          }, 1500)
          if (fn && typeof (fn) === 'function') {
            fn()
          }
        }
      } else {
        setTimeout(() => {
          this.$message.success('成功')
          this.refreshData()
        }, 1500)
      }
    },
    orderListReport(btnText) {
      const obj = this.customerSource.find(i => i.value === this.waybillCustomerSource)
      let waybillStatusText = ''
      switch (this.waybillStatus) {
        case '10':
          waybillStatusText = '待通知取货'
          break
        case '20':
          waybillStatusText = '待揽件'
          break
        case '30':
          waybillStatusText = '待签收'
          break
        case '40':
          waybillStatusText = '已签收'
          break
        case '50':
          waybillStatusText = '已取消'
          break
        case '':
          waybillStatusText = '全部'
          break
      }
      this.$reportUtils.clkSearchOrderList({
        first_module: obj.label,
        second_module: waybillStatusText,
        button_name: btnText
      })
    },
    //通知取货
    async noticeForPickup(waybill) {
      this.$reportUtils.clkSearchOrderFunction({
        first_module: '我寄的',
        second_module: '已取消',
        button_name: '重新下单'
      })
      if(waybill.limitType === affectTypeEnum.LIMIT) {
        const text = affectTextEnum[waybill.limitReason]
        return this.$message.warning(`当前运单因${text}不可抗因素不可重新下单`)
      }
      const flag = await this.$refs.noticePickupRef.showDialog([waybill])
      if (flag) {
        this.handleQueryData()
      }
    },
    getPopperType(row) {
      // 处理解除限制、入仓异常、管控8大类展示逻辑
      // 展示顺序由高到低：
      // 限制、入仓异常、解封、提醒
      if (row.limitType === affectTypeEnum.LIMIT && row.limitReason) {
        return 'limit'
      } else if (row.clearanceControlFlag === clearanceControlFlagEnum.EXIST) {
        return 'storage'
      } else if (row.limitCancelFlag === limitCancelFlagEnum.UNFREEZE) {
        return 'unfreeze'
      } else if (row.limitReason && row.limitType === affectTypeEnum.WARNING) {
        return 'limit'
      }
      return ''
    }
  },
  watch: {
    tableConfigName: function(newVal, oldVal) {
      this.getTableColumns()
      this.removeSelectedRows()
    },
    '$store.getters.customFields': function() {
      this.getTableColumns()
    },
  },
  //路由
  beforeRouteEnter: (to, from, next) => {
    next(vm => {
      // 批次号query
      vm.queryType = to.params.queryType || '0'
      vm.batchNo = to.query.batchNo || ''
      const { operationType, waybillCustomerSource, waybillStatus, refreshData } = to.params
      // 判断路由参数中是否带有扭转标签转态的值
      switch (operationType) {
        case 'noticePickup':
          vm.$refs.waybillStatus.changeWaybillStatus('send', statusEnum.PICKUP)
          vm.waybillCustomerSource = customerSourceEnum.SENDED
          vm.waybillStatus = statusEnum.PICKUP
          break
      }
      // 修改客户源及tab标签
      let tab = ''
      switch (waybillCustomerSource) {
        case customerSourceEnum.SENDED:
          tab = 'send'
          break
        case customerSourceEnum.RECEIVED:
          tab = 'received'
          break
        case customerSourceEnum.PAIED:
          tab = 'paied'
          break
      }
      if (tab) {
        vm.$refs.waybillStatus.changeWaybillStatus(tab, waybillStatus)
        vm.waybillCustomerSource = waybillCustomerSource
        vm.waybillStatus = waybillStatus.toString()
      }

      vm.$nextTick(() => {
        if (refreshData) {
          vm.refreshData()
        }
      })

      vm.$refs.migrationEntry.getUpgradeFaildWaybillInfo()
      if (from.fullPath === '/admin/waybill-v3-migration') {
        vm.refreshData()
      }
    })
  },
}
</script>

<style lang='scss' scoped>
.waybill-container {
  min-width: 1100px;

  /deep/ {
    @include loading;

    //.col--last {
    //  position: absolute;
    //  top: 0;
    //  right: 0;
    //  z-index: 5;
    //  overflow: hidden;
    //  background-color: inherit;
    //}
  }

  //  /deep/ .el-table__header-wrapper thead tr > th {
  //     padding: 0 !important;
  //   }

  height: 100%;

  .tabbar-inner {
    width: 100%;
    display: flex;
    font-size: 14px;
    color: #8365f6;
    align-items: center;
    justify-content: space-between;
    position: relative;

    .tabbar-find-material {
      position: absolute;
      right: 0;
      display: flex;
      font-size: 12px;
      color: #8365f6;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .iconfont {
        display: inline-block;
        width: 12px;
        height: 12px;
        color: #fff;
        font-size: 12px;
        line-height: 16px;
        padding-right: 5px;
      }

      .el-button {
        // width: 110px;
        height: 32px;
        font-size: 12px;
        line-height: 32px;
        padding: 0 11px;
      }
    }

    .guide_pic {
      width: 170px;
      height: 51px;
      position: absolute;
      top: 0px;
      right: 8px;
      z-index: 2000;
      background-image: url('~@assets/image/waybill/find-material-bg.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }

    .guide_text {
      width: 360px;
      height: 114px;
      position: absolute;
      top: 20px;
      right: 8px;
      z-index: 2000;
      background-image: url('~@assets/image/waybill/find-material-text-bg.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      padding: 68px 0 0 17px;
      box-sizing: border-box;

      p {
        font-size: 16px;
        text-align: left;
        color: #ffffff;
        line-height: 25px;
      }
    }
  }

  .table-style {
    padding: 0 20px;
  }
  
  .gray {
    color: #999999;
  }
  
  .custodyfee {
    position: absolute;
    top: 4px;
    left: 20px;
    right: 20px;
    z-index: 99;

    .notice-container {
      opacity: 0.9;
      background: #fff6f6;
      border: 1px solid #f13e3e;
      color: #f13e3e;

      .el-icon-warning {
        color: red;
      }
    }

    .el-icon-warning[data-v-05f7128a] {
      color: red;
    }
  }

  .guide_button {
    width: 124px;
    height: 55px;
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    background-image: url('~@assets/image/waybill/guide-next.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .close {
    background-image: url('~@assets/image/waybill/guide-close-overlay.png');
  }
}

/deep/ .ky-table-container .el-table__fixed-right {
  box-shadow: none;
}

/deep/ {
  .tabs-container {
    background: url('~@/assets/image/global/dialog-header-bg.png') no-repeat;
    background-position-x: right;
  }

  // .tooltip-affect-reason-label__wrapper {
  //   line-height: 36px;
  //   vertical-align: sub;
  // }
}

.unfreeze-label {
  height: 20px;
  line-height: 20px;
  display: inline-flex;
  margin-left: 12px;
  border-radius: 4px;
  color: white;
  width: 73px;
  background-image: url('~@/assets/image/delivery/affect-reason/temp/unfreeze.png');
  //background-color: ;
  background-repeat: no-repeat;
  background-size: 22px 20px;
  padding-left: 18px;

  i {
    display: inline-block;
    background-color: #50C88B;
    color: #fff;
    font-size: 12px;
    padding: 0 3px;
    font-style: normal;
    border-radius: 4px;
    border-bottom-left-radius: 0;
  }
}

.storage-error-label {
  height: 20px;
  line-height: 20px;
  display: inline-flex;
  margin-left: 12px;
  border-radius: 4px;
  color: white;
  width: 73px;
  background-image: url('~@/assets/image/delivery/affect-reason/temp/storage-error.png');
  //background-color: ;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  padding-left: 18px;
  
  i {
    display: inline-block;
    background-color: #FF7677;
    color: #fff;
    font-size: 12px;
    padding: 0 3px;
    font-style: normal;
    border-radius: 4px;
    border-bottom-left-radius: 0;
  }
}
</style>
<style lang='scss'>
.storage-error-popper {
  border: none;
}
</style>
