<template>
  <section class="vts-list-home"
           ref="VTSLISTHOME">
    <div class="title">运单查询</div>
    <!-- 查询表单 -->
    <div class="query-form">
      <el-form :model="queryForm"
               ref="queryForm"
               label-width="70px">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item prop="demandOrderCode"
                          class="label-select">
              <el-select v-model="orderType"
                         size="medium"
                         class="no_border"
                         @change="selectChange('orderType',orderType)">
                <el-option label="订单编号"
                           value="0" />
                <el-option label="运单编号"
                           value="1" />
              </el-select>
              <el-input v-model="orderNumber"
                        placeholder="请填写编号"
                        clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="name"
                          class="label-select">
              <el-select v-model="sendReceivedTyle"
                         size="medium"
                         class="no_border"
                         @change="selectChange('sendReceivedTyle',sendReceivedTyle)">
                <el-option label="发货信息"
                           value="0" />
                <el-option label="收货信息"
                           value="1" />
              </el-select>
              <el-input v-model="nameInfo"
                        placeholder="请填写姓名/电话"
                        clearable
                        @clear="nameInfoClear"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4"
                  v-show="!isopen"
                  class="btns">
            <div class="open-btn frist-btn"
                 @click="openForm(true)">展开选项<i class="el-icon-d-arrow-left openIcon270"></i></div>
            <div class="query-btns">
              <el-button size="mini"
                         type="primary"
                         @click="searchQueryForm">查询</el-button>
              <el-button size="mini"
                         @click="resetForm('queryForm')">重置</el-button>
            </div>
          </el-col>
          <el-col :span="6"
                  v-show="isopen">
            <el-form-item label="发货地"
                          prop="name">
              <VtsAddress v-model="queryForm.startAddress"
                          ref="startAddress"
                          type="startAddress"
                          :clear="true"
                          :cascaderStyles="{ width: '100%' }"
                          @input="addressInput"></VtsAddress>
            </el-form-item>
          </el-col>
          <el-col :span="6"
                  v-show="isopen">
            <el-form-item label="收货地"
                          prop="name">
              <VtsAddress v-model="queryForm.endAddress"
                          ref="endAddress"
                          type="endAddress"
                          :clear="true"
                          :cascaderStyles="{ width: '100%' }"
                          @input="addressInput"></VtsAddress>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12"
                v-show="isopen">
          <el-col :span="6">
            <el-form-item class="label-select form-item-time"
                          prop="name">
              <el-select v-model="timeType"
                         size="medium"
                         class="no_border"
                         @change="selectChange('timeType',timeType)">
                <el-option label="创建时间"
                           value="0" />
                <el-option label="签收时间"
                           value="1" />
              </el-select>
              <el-date-picker v-model="timeInfo"
                              type="daterange"
                              size="medium"
                              align="center"
                              :editable="false"
                              :clearable="true"
                              style="width:100%"
                              range-separator="至"
                              format="yyyy/MM/dd"
                              value-format="yyyy-MM-dd"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车型车长"
                          prop="name"
                          class="label-input">
              <el-select v-model="carValue"
                         filterable
                         placeholder="请选择"
                         clearable>
                <el-option v-for="(item,index) in carTypeOptions"
                           :key="`${index}-${item.carTypeCode}`"
                           :label="item|ftCarInfo"
                           :value="`${item.carLength}|${item.carTypeCode}`">

                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4"
                  v-show="isopen"
                  class="btns">
            <div class="open-btn last-btn"
                 @click="openForm(false)">收起选项<i class="el-icon-d-arrow-left openIcon90"></i></div>
            <div class="query-btns">
              <el-button size="mini"
                         type="primary"
                         @click="searchQueryForm">查询</el-button>
              <el-button size="mini"
                         @click="resetForm('queryForm')">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- tab列表 -->
    <div class="tab-list">
      <div class="tab-box">
        <div class="el-tabs__active-bar"
             ref="activeBar"
             :style="{'width':activeBarWidth+'px','transform': `translateX(${translate}px)`}"></div>
        <div :class="['tab-item tabFrist',+activeIndex===0?'is_active':'']"
             @click="handleCheckTab(0)"
             ref="tab0">全部({{tabNum.rowTotal||'0'}})</div>
        <div :class="['tab-item',+activeIndex===1?'is_active':'']"
             @click="handleCheckTab(1)"
             ref="tab1">待下单({{tabNum.waitOrderSum||'0'}})</div>
        <div :class="['tab-item',+activeIndex===2?'is_active':'']"
             @click="handleCheckTab(2)"
             ref="tab2">运输中({{tabNum.underWaySum||'0'}})</div>
        <div :class="['tab-item',+activeIndex===3?'is_active':'']"
             @click="handleCheckTab(3)"
             ref="tab3">已完成({{tabNum.receiveSum||'0'}})</div>
        <div :class="['tab-item tabLast',+activeIndex===4?'is_active':'']"
             @click="handleCheckTab(4)"
             ref="tab4">已取消({{tabNum.cancelSum||'0'}})</div>
      </div>
      <div class="tab-content">
        <div class="export">
          <div class="is-select">已选：{{selectRowNum||0}}条</div>
          <div @click="exportOut">
            <svg-icon icon-class="waybill-batch-export-button" /><span class="exportText">导出</span>
          </div>
        </div>
        <VtsTable :data="tableData"
                  :selectionColumn="true"
                  :tableColumns="tableColumns"
                  :pagination="pagination"
                  :isEndRequest="isEndRequest"
                  @handlCurrentChange="handlCurrentChange"
                  @handleSizeChange="handleSizeChange"
                  @showColumnManager="showColumnManager"
                  @selectedRowNum="selectedRowNum"
                  @handlerSort="handlerSort"
                  @handleTableBtn="handleTableBtn"
                  ref="KyTable"
                  v-loading="loading"
                  :isPackUp="isopen"
                  :tooltip="tooltip">
        </VtsTable>
      </div>
    </div>
    <ColumnBatchFilter ref="columnManager"
                       @onSaveSuccess="modifyColums"
                       :allCheckColumns="allCheckColumns"></ColumnBatchFilter>

    <!-- 确认下单弹框 -->
    <confirmOrder ref="confirmOrder"
                  :detailInfo="rowDetailInfo"
                  @close="dialogClose"></confirmOrder>
    <!-- 联系销售弹框 -->
    <concatSales ref="concatSales"
                 :detailInfo="rowDetailInfo"></concatSales>
    <!-- 取消订单 -->
    <cancelOrder ref="cancelOrder"
                 :detailInfo="rowDetailInfo"
                 @close="dialogClose"></cancelOrder>
  </section>
</template>

<script>
  import { fetchOrderList, geiGolbalCarInfo, queryGridColumnConfig, fetchCheckApply } from '@/services/api/vts'
  import { formatGenericParams, formatAggregationsParams, Regular, setVtsTabKye, getVtsTabKye, setSession } from '@/views/vts/utils'
  import VtsAddress from '@/views/vts/components/vts-address'
  import VtsTable from '@/views/vts/components/vts-table'
  import ColumnBatchFilter from '@/views/vts/components/column-batch-filter'
  import { confirmOrder, concatSales, cancelOrder } from '@/views/vts/operation-dialog'
  import { Promise } from 'q';
  import { setTimeout, clearTimeout } from 'timers';
  const defaultColumns = [
    { prop: 'demandOrderCode', text: '订单编号', width: '150', visible: true, prohibitHide: true, sortable: true, fixed: true },
    { prop: 'orderStatus', text: '订单状态', width: '90', visible: true, sortable: true },
    { prop: 'needCarType', text: '车长车型(米)', width: '120', visible: true, sortable: true },
    { prop: 'startAddress', text: '始发地', width: '350', visible: true, sortable: true },
    { prop: 'endAddress', text: '目的地', width: '350', visible: true, sortable: true },
    { prop: 'orderAddresserName', text: '寄件人', width: '90', visible: false, sortable: true },
    { prop: 'orderAddresserPhone', text: '寄件人手机号', width: '120', visible: false, sortable: true },
    { prop: 'orderContactName', text: '收件人', width: '80', visible: true, sortable: true },
    { prop: 'orderContactPhone', text: '收件人手机号', width: '120', visible: true, sortable: true },
    { prop: 'countFee', text: '总运费(元)', width: '92', visible: true, sortable: true },
    { prop: 'loadingTime', text: '装货时间', width: '160', visible: false, sortable: true },
    { prop: 'createdByName', text: '创建人', width: '90', visible: false, sortable: true },
    { prop: 'creationDate', text: '创建时间', width: '160', visible: true, sortable: true },
    { prop: 'goodsWeight', text: '总重量(吨)', width: '80', visible: false, sortable: true },
    { prop: 'goodsVolume', text: '总体积(方)', width: '80', visible: false, sortable: true },
    { prop: 'goodsName', text: '托寄物', width: '100', visible: false, sortable: true },
    { prop: 'goodsValueFee', text: '货物价值(万)', width: '90', visible: false, sortable: true },
    { prop: 'referenceDistance', text: '运输距离(KM)', width: '90', visible: false, sortable: true },
    { prop: 'loadService', text: '装货服务', width: '90', visible: false, sortable: true },
    { prop: 'unloadService', text: '卸货服务', width: '90', visible: false, sortable: true },
    { prop: 'whetherReceipt', text: '回单服务', width: '100', visible: true, sortable: true },
    { prop: 'customerRemark', text: '司机备注', width: '200', visible: false, sortable: false },
    { prop: 'waybillCode', text: '运单号', width: '150', visible: false, sortable: true },
  ]
  export default {
    name: 'vtsWaybill',
    components: { VtsAddress, VtsTable, ColumnBatchFilter, confirmOrder, concatSales, cancelOrder },
    data () {
      return {
        loading: false,
        isopen: false, // 展开查询
        orderType: '0', // 订单编号类型
        sendReceivedTyle: '0', // 发货收货信息类型
        timeType: '0', // 时间类型
        carValue: '', // 车型信息
        nameInfo: '', // 收货  发货信息
        timeInfo: [], // 时间信息
        orderNumber: '', // 订单编号
        queryForm: {
          endAddress: [], // 收货地
          startAddress: [], // 发货地
          demandOrderCode: '', // 订单编号
          waybillCode: '', // 运单编号
          orderAddresserName: '',// 发货人姓名
          orderAddresserPhone: '', // 发货人手机号
          orderContactName: '', // 收货人姓名
          orderContactPhone: '',//收货人手机号
          creationDate: [], // 货好时间
          signTime: [],//创建时间
          needCarType: '',
          needCarLength: '',
          orderStatistical: {
            waitOrderFlag: '',
            underWayFlag: '',
            receiveFlag: '',
            cancelFlag: ''
          }
        },
        carTypeOptions: [], // 车型信息
        tableData: [], // 列表数据
        tableColumns: [], // 列表列
        allCheckColumns: [], // 自定义排序列表列
        gridName: 'vts-order0', // 获取自定义列表名
        gridConfigId: '', // 获取自定义列id
        gridVersion: '1.0.0', // 获取自定义列版本号
        // 列表排序
        sort: {
          field: 'demandOrderDetails.creationDate',
          sort: 1
        },
        // 自定义列弹框
        dialogVisible: false,
        // 列表分页参数
        pageObj: {
          page: 1,
          pageSize: 50
        },
        // 列表总数数据
        pagination: {
          totalCount: 0,
          pageSize: 100,
          pageIndex: 1,
        },
        // tab index
        activeIndex: '0',
        // tab 底部横线宽度
        activeBarWidth: 30,
        // tab 横线滑动距离
        translate: 0,
        // 已选择条数
        selectRowNum: 0,
        isEndRequest: false,
        // tab数量值
        tabNum: {
          rowTotal: '',
          waitOrderSum: '',
          underWaySum: '',
          receiveSum: '',
          cancelSum: ''
        },
        rowDetailInfo: {},
        timeOut: null,
        a: 0,
        tooltip: '暂无查看权限，可进入详情页申请'
      }
    },
    filters: {
      // 车长车型 过滤
      ftCarInfo (opt) {
        return `${opt.carLength || '--'}米${opt.carTypeName || '--'}`
      },
    },
    mounted () {
      this.activeIndex = '0'
      this.getCarInfo()
      this.mergeGetInfo()
      this.applyCheck()
    },
    methods: {
      // 查询表格配置数据
      async getGridConfig () {
        try {
          this.allCheckColumns = this.tableColumns = defaultColumns
          const res = await queryGridColumnConfig(this.gridName)
          if (res.code === 0 && res.data && res.data.gridAttribute) {
            this.gridConfigId = res.data.id
            let tempColumns = JSON.parse(res.data.gridAttribute)
            console.log(tempColumns.columns, '查询表格配置数据');
            if (Array.isArray(tempColumns.columns) && tempColumns.columns.length > 0 && this.gridVersion === tempColumns._version) {
              this.allCheckColumns = this.tableColumns = tempColumns.columns
            } else {
              this.gridConfigId = ''
              this.tableColumns = this.allCheckColumns = defaultColumns
            }
          } else {
            this.gridConfigId = ''
            this.tableColumns = this.allCheckColumns = defaultColumns
          }
        } catch (e) {
          this.gridConfigId = ''
          this.tableColumns = this.allCheckColumns = defaultColumns
        }

      },

      // 获取订单列表数据信息
      async getOrderList () {
        this.loading = true
        this.isEndRequest = false
        this.selectChange()
        if (this.queryForm.demandOrderCode) {
          this.a = 1
        } else {
          this.a = 2
        }
        let params = {
          generic: formatGenericParams(this.queryForm, this.a),
          aggregations: formatAggregationsParams(this.activeIndex),
          orderByClauses: [{
            field: this.sort.field,
            orderByMode: this.sort.sort
          }],
          page: this.pageObj.page,
          pageSize: this.pageObj.pageSize
        }
        try {
          let _res = await fetchOrderList(params)
          this.tableData = _res.data.rows || []
          this.pagination.totalCount = _res.data.rowTotal
          this.pagination.pageSize = _res.data.pageSize
          // tab  值
          if (+this.activeIndex === 0) {
            this.tabNum.rowTotal = _res.data.rowTotal
            this.tabNum.waitOrderSum = _res.data.aggregations[3].resultVal
            this.tabNum.underWaySum = _res.data.aggregations[4].resultVal
            this.tabNum.receiveSum = _res.data.aggregations[5].resultVal
            this.tabNum.cancelSum = _res.data.aggregations[6].resultVal
          }
          if (+this.activeIndex === 1) {
            this.tabNum.waitOrderSum = _res.data.aggregations[3].resultVal
            // this.tabNum.underWaySum = _res.data.aggregations[1].resultVal
            // this.tabNum.receiveSum = _res.data.aggregations[2].resultVal
          }
          if (+this.activeIndex === 2) {
            // this.tabNum.waitOrderSum = _res.data.aggregations[0].resultVal
            this.tabNum.underWaySum = _res.data.aggregations[4].resultVal
            // this.tabNum.receiveSum = _res.data.aggregations[2].resultVal
          }
          if (+this.activeIndex === 3) {
            // this.tabNum.waitOrderSum = _res.data.aggregations[0].resultVal
            // this.tabNum.underWaySum = _res.data.aggregations[1].resultVal
            this.tabNum.receiveSum = _res.data.aggregations[5].resultVal
          }
          if (+this.activeIndex === 4) {
            // this.tabNum.waitOrderSum = _res.data.aggregations[0].resultVal
            // this.tabNum.underWaySum = _res.data.aggregations[1].resultVal
            this.tabNum.cancelSum = _res.data.aggregations[6].resultVal
          }



          // 每次请求get到当前tab宽度
          this.$nextTick(() => {
            this.activeBarWidth = this.$refs[`tab${this.activeIndex}`].clientWidth
            // this.activeIndex = getVtsTabKye().activeIndex || '0'
            // this.translate = 0
            if (this.activeIndex === 0) {
              this.translate = 0
            }
            if (this.activeIndex === 1) {
              this.translate = this.$refs[`tab${0}`].clientWidth + 40
            }
            if (this.activeIndex === 2) {
              this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + 80
            }
            if (this.activeIndex === 3) {
              this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + this.$refs[`tab${2}`].clientWidth + 120
            }
            if (this.activeIndex === 4) {
              this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + this.$refs[`tab${2}`].clientWidth + this.$refs[`tab${3}`].clientWidth + 160
            }

          })
          this.loading = false
        } catch (error) {
          this.tableData = []
          this.loading = false
        }
      },

      // 合并表格 列表请求
      async mergeGetInfo () {
        try {
          this.loading = true
          await Promise.all([this.getGridConfig(), this.getOrderList()])
          this.loading = false
          this.isEndRequest = true
        } catch (error) {
          console.log(error, '====请求catch');

          this.loading = false
        }
      },

      // 展开收起
      openForm (val) {
        this.isopen = val
      },

      // 列表排序
      handlerSort (val) {
        console.log(val, '排序');
        if (val.prop === 'referenceDistance') {
          val.prop = 'demandOrderDetails.referenceDistance'
        }
        if (val.prop === 'countFee') {
          val.prop = 'orderPrice.countFee'
        }
        if (val.prop === 'whetherReceipt') {
          val.prop = 'orderPrice.whetherReceipt'
        }
        if (val.prop === 'customerRemark') {
          val.prop = 'customerRemark.keyword'
        }
        this.sort.field = val.prop
        this.sort.sort = val.order === 'descending' ? 1 : 2
        this.getOrderList()
      },

      // 切换tab
      handleCheckTab (val) {
        this.activeIndex = val
        this.queryForm.orderStatistical.waitOrderFlag = ''
        this.queryForm.orderStatistical.underWayFlag = ''
        this.queryForm.orderStatistical.receiveFlag = ''
        this.queryForm.orderStatistical.cancelFlag = ''
        this.$nextTick(() => {
          this.activeBarWidth = this.$refs[`tab${val}`].clientWidth
          this.gridName = `vts-order${val}`
          this.gridVersion = `1.0.${val}`
          if (val === 0) {
            this.translate = 0
          }
          if (val === 1) {
            this.translate = this.$refs[`tab${0}`].clientWidth + 40
            this.queryForm.orderStatistical.waitOrderFlag = 1
          }
          if (val === 2) {
            this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + 80
            this.queryForm.orderStatistical.underWayFlag = 1
          }
          if (val === 3) {
            this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + this.$refs[`tab${2}`].clientWidth + 120
            this.queryForm.orderStatistical.receiveFlag = 1
          }
          if (val === 4) {
            this.translate = this.$refs[`tab${0}`].clientWidth + this.$refs[`tab${1}`].clientWidth + this.$refs[`tab${2}`].clientWidth + this.$refs[`tab${3}`].clientWidth + 160
            this.queryForm.orderStatistical.cancelFlag = 1
          }
          setVtsTabKye({ activeIndex: val })
          this.mergeGetInfo()
        })
      },

      // 搜索查询
      async searchQueryForm () {
        console.log(this.queryForm, 'this.queryForm');
        this.handleCheckTab(0)
        await this.getOrderList()
        this.isEndRequest = true
      },

      // 重置
      resetForm (formName) {
        this.carValue = ''// 车型信息
        this.nameInfo = '' // 收货  发货信息
        this.timeInfo = [] // 时间信息
        this.orderNumber = '' // 订单编号
        this.queryForm.startAddress = [] // 发货地
        this.queryForm.endAddress = [] // 收货地
        this.$refs.startAddress.value = [] // 发货地
        this.$refs.endAddress.value = [] // 发货地
        this.queryForm.needCarType = ''
        this.queryForm.needCarLength = ''
        this.queryForm.orderContactPhone = this.queryForm.orderContactName = this.queryForm.orderAddresserPhone = this.queryForm.orderAddresserName = ''
      },

      // 获取车型车长数据
      async getCarInfo () {
        // let _res = await geiGolbalCarInfo({})
        // this.carTypeOptions = _res.data
        this.carTypeOptions = JSON.parse(sessionStorage.getItem('CarInfo'))
      },

      // 已选
      selectedRowNum (val) {
        this.selectRowNum = val
      },

      // 切换搜索select选项
      selectChange () {
        // 订单信息
        if (this.orderType === '0') {
          this.queryForm.demandOrderCode = this.orderNumber
          this.queryForm.waybillCode = ''
        } else {
          this.queryForm.waybillCode = this.orderNumber
          this.queryForm.demandOrderCode = ''
        }
        // 车型信息
        if (this.carValue) {
          console.log(this.carValue);
          this.queryForm.needCarLength = this.carValue.split('|')[0]
          this.queryForm.needCarType = this.carValue.split('|')[1]
        } else {
          this.queryForm.needCarLength = this.queryForm.needCarType = ''
        }
        // 收件人信息 / 发货人信息
        if (this.sendReceivedTyle === '1') {
          // 是手机号（整数）
          if (Regular.positiveOrZero.test(this.nameInfo)) {
            this.queryForm.orderContactPhone = this.nameInfo
          } else {
            this.queryForm.orderContactName = this.nameInfo
          }
        } else {
          // 是手机号（整数）
          if (Regular.positiveOrZero.test(this.nameInfo)) {
            this.queryForm.orderAddresserPhone = this.nameInfo
          } else {
            this.queryForm.orderAddresserName = this.nameInfo
          }
        }
        // 时间信息
        console.log(this.timeType);

        if (this.timeType === '0') {
          this.queryForm.creationDate = this.timeInfo
          this.queryForm.signTime = []
        } else {
          this.queryForm.signTime = this.timeInfo
          this.queryForm.creationDate = []
        }
      },

      // 分页
      handlCurrentChange (val) {
        console.log('执行分页', val);

        this.pageObj.page = val.pageIndex
        this.pageObj.pageSize = val.pageSize
        this.getOrderList()
      },
      // 分页
      handleSizeChange (val) {
        console.log('执行分页跳转', val);
        this.pageObj.pageSize = val
        this.getOrderList()
      },

      // 自定义排序弹框
      showColumnManager () {
        let arrCheckColumn = JSON.parse(JSON.stringify(this.tableColumns))
        const params = {
          version: this.gridVersion,
          gridConfigId: this.gridConfigId,
          gridName: this.gridName,
          checkedColumns: arrCheckColumn,
        }
        this.$refs.columnManager.showDialog(params)
      },

      // 自定义排序保存
      modifyColums (columns, gridConfigId) {
        this.tableColumns = columns
        this.gridConfigId = gridConfigId
      },

      // 导出
      async exportOut (isSelected) {
        try {
          await this.$refs.KyTable.exportVtsOrder(isSelected)
        } finally {
          // this.loadingOfexportWaybills = false
        }
      },

      // 操作列
      handleTableBtn (val, row) {
        console.log(val, row, '操作列');
        this.rowDetailInfo = row
        this.loading = true
        this.timeOuttack(val, this.rowDetailInfo)
        this.loading = false
      },

      async timeOuttack (val, rowDetailInfo) {
        if (val === '联系销售') {
          this.$refs.concatSales.showConcatSaleVisible(rowDetailInfo)
        } else if (val === '取消订单') {
          this.$refs.cancelOrder.showCancelOrderVisible(rowDetailInfo)
        } else if (val === '确认下单') {
          this.$refs.confirmOrder.showConfirmOrderVisible(rowDetailInfo)
        } else {
          console.log(this.rowDetailInfo, '再来一单保存的值');

          await setSession(this.rowDetailInfo)
          //  sessionStorage.setItem('AgainOrderDetailInfo', JSON.stringify(this.rowDetailInfo))
          this.$router.push({ path: '/admin/vtsOrder', query: { demandOrderCode: this.rowDetailInfo.demandOrderCode } })
        }
      },

      // 弹框关闭
      dialogClose (val) {
        if (val === 'cancelOrder') {
          this.$refs.cancelOrder.colseCancelOrderVisible()
        } else if (val === 'configOrder') {
          this.$refs.confirmOrder.closeConfirmOrderVisible()
        }
        this.loading = true
        // 延迟2秒刷新列表
        this.timeOut = setTimeout(() => {
          this.getOrderList()
        }, 3000)
      },

      // 地址查询input
      addressInput (val, type) {
        console.log(val, 'val')
        if (!val) {
          if (type === 'startAddress') {
            this.queryForm.startAddress = [] // 发货地
            this.$refs.startAddress.value = [] // 发货地
          } else {
            this.queryForm.endAddress = [] // 收货地
            this.$refs.endAddress.value = [] // 收货地
          }
        }
      },

      // 清空发货信息查询
      nameInfoClear () {
        this.queryForm.orderContactPhone = this.queryForm.orderContactName = this.queryForm.orderAddresserPhone = this.queryForm.orderAddresserName = ''
      },

      // 判断权限申请状态
      async applyCheck () {
        const { data } = await fetchCheckApply({ authCodes: ["freightLookAuthFlag"] })
        console.log(data, '权限判断');
        if (data.status == 0) {
          this.tooltip = '暂无查看权限，可进入详情页申请'
          return
        }
        if (data.status == 1) {
          this.tooltip = '查看权限申请中'
          return
        }
        if (data.status == 2) {
          this.tooltip = '权限申请失败，可联系商务咨询'
          return
        }
      }
    },
    beforeDestroy () {
      clearTimeout(this.timeOut)
    }
  }
</script>

<style lang="scss" scoped>
  @import 'index.scss';
  @import 'common.scss';
</style>
