
<template>
  <div class="jj-vts-table-container">
    <ky-table class="element-table"
              :data="data"
              :height="tableHeight"
              :pagination='copyPagination'
              @selection-change="handleSelectionChange"
              @sort-change="sortBy"
              @size-change='handleSizeChange'
              @pagination-change='handlCurrentChange'
              ref="vtstable">
      <template slot="empty">
        <none-data v-if="isEndRequest && !data.length" />
        <p v-else
           style="height:100%"></p>
      </template>
      <el-table-column v-if="selectionColumn"
                       type="selection"
                       width="32"
                       align="center"
                       class-name="col-selection" />
      <el-table-column label="操作"
                       width="100"
                       align="center"
                       fixed="left"
                       class-name="col-selection">
        <template slot-scope="{row}">
          <el-button type="text"
                     class="btn-text no-border"
                     v-for="(btn,index) in statusBtns[row.orderStatus]"
                     :key="index"
                     @click="handleTableBtn(btn.name,row)">{{btn.name}}</el-button>

        </template>
      </el-table-column>
      <slot></slot>
      <el-table-column v-for="(col,index) in columns"
                       v-bind="col.attr"
                       :fixed="col.fixed"
                       :key="col.prop + index"
                       :show-overflow-tooltip="true"
                       :prop="col.prop"
                       :label="col.text"
                       :sortable="col.sortable"
                       :min-width="col.width+'px'">
        <template slot-scope="{row}">
          <div v-if="col.prop==='demandOrderCode'"
               :style="{color:col.prop==='demandOrderCode'?'#9c84f8':'',cursor:'pointer'}">
            <span @click="goToDetail(row[col.prop])">{{row[col.prop]}}</span>
            <el-button type='text'
                       v-clipboard='row[col.prop]'
                       class="copy-btn">
              <svg-icon icon-class='copy'
                        class='icon-copy' />
            </el-button>
          </div>

          <span v-else-if="col.prop==='orderStatus'">
            <div class="orderStatusImgType">{{row.orderStatus|FTorderStatus}}</div>
            <div v-if="+row.orderStatus===100"
                 class="orderStatusImg"><img src="../../../../assets/image/vts/未报价@2x.png"
                   alt=""
                   style="width:100%"></div>
            <div v-if="+row.orderStatus===200"
                 class="orderStatusImg"><img src="../../../../assets/image/vts/已报价@2x.png"
                   alt=""
                   style="width:100%"></div>
          </span>
          <span v-else-if="col.prop==='needCarType'">{{row|FTcarType}}</span>
          <!-- <template v-else-if="col.prop==='startAddress'">
            <svg-icon icon-class="cy"
                      v-hover="row"
                      class="restrict-img"></svg-icon>
            <span>{{row|FTstartAddress}}</span>
          </template> -->
          <span v-else-if="col.prop==='startAddress'">{{row|FTstartAddress}}</span>
          <span v-else-if="col.prop==='endAddress'">{{row|FTendAddress}}</span>
          <span v-else-if="col.prop==='goodsWeight'">{{row.goodsWeight|FTgoodsWeight}}</span>
          <span v-else-if="col.prop==='goodsValueFee'">{{row.goodsValueFee|FTgoodsValueFee}}</span>
          <span v-else-if="col.prop==='loadService'">{{row.loadService|FTloadService}}</span>
          <span v-else-if="col.prop==='unloadService'">{{row.unloadService|FTloadService}}</span>
          <span v-else-if="col.prop==='whetherReceipt'">{{row|FTwhetherReceipt}}</span>
          <span v-else-if="col.prop==='referenceDistance'">{{row.referenceDistance|FTReferenceDistance}}</span>
          <span v-else-if="col.prop==='countFee'">
            <template v-if="String(row.orderPrice.countFee).includes('**')">
              <div class="permissions">
                <span>{{row.orderPrice.countFee}}</span>
                <el-tooltip class="item"
                            effect="dark"
                            :content="tooltip"
                            placement="top">
                  <i :class="['el-icon-question',mouseover&&mouseoverCode==row.demandOrderCode?'icon-permissions-dark':'icon-permissions']"
                     @mouseover="selectStyle(true,row.demandOrderCode)"
                     @mouseout="selectStyle(false,row.demandOrderCode)"></i>
                </el-tooltip>
              </div>
            </template>
            <template v-else>
              {{row.orderPrice.countFee}}
            </template>
          </span>
          <span v-else-if="col.prop==='creationDate'">{{row.creationDate|FTtime}}</span>
          <span v-else>{{row[col.prop]}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed='right'
                       align='center'
                       width='40'
                       class-name="drag-line--hide">
        <template slot='header'>
          <div style='width:100%;background-color:#f7f8fe'>
            <el-button type='text'
                       @click='showColumnManager'>
              <svg-icon icon-class='waybill-setting'
                        class='icon-tabs' />
            </el-button>
          </div>
        </template>
      </el-table-column>
    </ky-table>
  </div>
</template>

<script>
  import NoneData from './none-data'
  import Pagination from './pagination'
  import { exportExcel, carType } from '@/views/vts/utils'
  import exportServe from '@utils/export/ExportServe'
  import dayjs from 'dayjs'
  // import RestrictDialog from '../restrict-dialog'
  // import { confirmOrder, concatSales, cancelOrder } from '@/views/vts/operation-dialog'
  import {
    statusBtns,
    statusOptions
  } from '../../config/order.js'
  // import { setTimeout } from 'timers'
  export default {
    // eslint-disable-next-line vue/no-unused-components
    components: { NoneData, Pagination },
    props: {
      data: {
        type: Array, //表格数据
      },
      selectionColumn: { //是否显示复选框列
        type: Boolean,
        default: false,
      },
      pagination: {
        type: Object,
        default: () => ({
          totalCount: 0,
          pageSize: 10,
          pageIndex: 1,
        })
      },
      //表头列
      tableColumns: {
        required: false,
        type: Array,
        // validator: function(cols) {
        //   const flag = cols.some((col) => {

        //     const keys = Object.keys(col)
        //     console.log(keys, cols, '=9=9=9');

        //     if (!keys.includes("prop") || !keys.includes("text")) {
        //       console.log(col, '-0-0-0');

        //     }

        //     return !keys.includes("prop") || !keys.includes("text")
        //   })
        //   if (flag) {
        //     console.log("tableColumns中的所有列必须都包含prop和text属性")
        //     return false
        //   }
        //   return true
        // },
      },
      isEndRequest: {
        type: Boolean,
        default: false,
      },
      isPackUp: {
        type: Boolean,
        default: false,
      },
      tooltip: {
        type: String,
        default: '暂无查看权限，可进入详情页申请'
      }
    },
    inheritAttrs: false,
    data () {
      return {
        loading: true,
        copyPagination: {},
        multipleSelection: [],
        statusBtns: statusBtns,
        statusOptions: statusOptions, // 下拉：订单状态
        tableHeight: 600,
        detailInfo: {},
        mouseover: false,
        mouseoverCode: null,
        restrictModal: {
          show: false,
          type: '1'
        }
      }
    },
    filters: {
      FTcarType (val) {
        let { needCarLength, needCarType } = val
        let _status = {
          1001: '面包车',
          1003: '厢式车',
          1005: '平板车',
          1006: '高栏车',
          1008: '冷藏车',
          1009: '高低板',
          1010: '飞翼车',
          1011: '两轮车',
          1012: '三轮车',
        }
        return `${needCarLength}米${_status[+needCarType]}`
      },
      FTstartAddress (val) {
        return `${val.startProvince || ''}${val.startCity || ''}${val.startArea || ''}${val.startAddress || ''}`
      },
      FTendAddress (val) {
        return `${val.endProvince || ''}${val.endCity || ''}${val.endArea || ''}${val.endAddress || ''}`
      },
      FTgoodsWeight (val) {
        if (val) {
          return (val / 1000)
        } else {
          return ''
        }
      },
      FTgoodsValueFee (val) {
        if (val) {
          return (val / 10000).toFixed(1)
        } else {
          return ''
        }
      },
      FTloadService (val) {
        if (+val === 10) {
          return '是'
        } else {
          return '否'
        }
      },
      FTorderStatus (val) {
        let _status = {
          100: '待下单',
          200: '待下单',
          300: '已下单',
          400: '已中标',
          500: '运输中',
          600: '已完成',
          700: '已取消'
        }
        return _status[+val] || '--'
      },
      FTReferenceDistance (val) {
        if (val) {
          return Math.ceil(val)
        } else {
          return ''
        }
      },
      FTwhetherReceipt (val) {
        let { orderPrice } = val
        if (+orderPrice.receiptType === 10) {
          return '回单原件'
        }
        if (+orderPrice.receiptType === 20) {
          return '回单照片'
        }
        return '无'
      },
      FTtime (val) {
        if (val) {
          return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
        } else {
          return ''
        }
      }
    },
    watch: {
      isPackUp (val) {
        this.setTableHeight()
      },
      pagination: {
        handler (val) {
          this.copyPagination = JSON.parse(JSON.stringify(val))
        },
        deep: true,
        immediate: true
      }
    },
    mounted () {
      window.onresize = () => {
        return (() => {
          this.setTableHeight()
        })()
      }
      // 获取表格高度
      this.$nextTick(() => {
        this.setTableHeight()
      })
    },
    updated () {
      this.setTableHeight()
    },
    // directives: {
    //   hover: {
    //     bind: (el, binding, vNode) => {
    //       let throttleTime = 2000
    //       // el.showModal = params => {
    //       //   console.log('binding', binding)
    //       //   this.restrictModal = params
    //       //   console.log('restrictModal', this.restrictModal)

    //       // }
    //       // if (!throttleTime) throttleTime = 2000 // 设置默认防抖2s
    //       let cbFun
    //       let that = vNode.context
    //       console.log('el', el, binding)
    //       el.addEventListener('mouseenter', e => {
    //         console.log('e', e)
    //         if (!cbFun) {
    //           cbFun = setTimeout(() => {
    //             cbFun = null
    //           }, throttleTime)
    //         } else {
    //           console.log('this', that)
    //           that.showModal({
    //             show: true,
    //             left: e.pageX,
    //             top: e.pageY,
    //             value: binding.value
    //           })
    //           // el.showModal({

    //           // })
    //         }
    //       }, true)
    //     }
    //   }
    // },
    methods: {
      showModal (params) {
        this.restrictModal = params
      },
      selectStyle (type, index) {
        this.mouseover = type
        this.mouseoverCode = type ? index : null
      },
      // 处理排序参数
      sortBy (a) {
        this.$emit('handlerSort', a)
      },
      renderHeader (h, { column }) {
        return (
          <svg-icon icon-class="waybill-setting"
            class="icon-tabs" onClick={this.handleShowColumnManager} />
        )
      },
      // 点击设置事件
      showColumnManager () {
        this.$emit('showColumnManager')
      },

      handleSizeChange (val) {
        this.$emit('handleSizeChange', val)
      },
      handlCurrentChange (val) {
        this.$emit('handlCurrentChange', val)
      },

      // 选中列表
      handleSelectionChange (val) {
        this.multipleSelection = val
        this.$emit('selectedRowNum', val.length)
      },

      async exportWaybills (params) {
        this.progressShow = true
        let res = exportServe.startExport(params, this)
        console.log(res)
      },

      // 导出
      async exportVtsOrder (isSelected) {
        let rows = this.multipleSelection
        // 

        if (rows.length === 0) {
          this.$message('您未选中任何运单，请先勾选要导出的运单')
          return
        }
        console.log(rows, '导出rows')

        this.$confirm(`您已经选择${rows.length}条运单，确定导出吗?`, '批量导出').then(() => {
          let theadColumns = this.tableColumns.filter(c => c.visible)
          try {
            exportExcel({
              theadColumns: JSON.parse(JSON.stringify(theadColumns)).filter(m => m.text),
              jsonData: this.rowsInfo(JSON.parse(JSON.stringify(rows))),
              filename: '整车订单',
            })
          } catch (ex) {
            console.log('exportWaybills :>> ', ex)
          }
        })
      },
      // 导出对数据的处理
      rowsInfo (rows) {
        let _status = {
          100: '待下单',
          200: '待下单',
          300: '已下单',
          400: '已中标',
          500: '运输中',
          600: '已完成',
          700: '已取消'
        }
        let _carType = {
          1001: '面包车',
          1003: '厢式车',
          1005: '平板车',
          1006: '高栏车',
          1008: '冷藏车',
          1009: '高低板',
          1010: '飞翼车'
        }
        let _isYesNo = {
          10: '是',
          20: '否'
        }
        let _whetherReceipt = {
          10: '回单原件',
          20: '回单照片',
          30: '无'
        }
        rows.forEach(item => {
          item.orderStatus = _status[+item.orderStatus]
          item.needCarType = item.needCarLength + _carType[+item.needCarType]
          item.goodsWeight = (item.goodsWeight / 1000).toFixed(1)
          item.goodsValueFee = (item.goodsValueFee / 10000).toFixed(1)
          item.loadService = _isYesNo[+item.loadService]
          item.unloadService = _isYesNo[+item.unloadService]
          item.endAddress = `${item.endProvince || ''}${item.endCity || ''}${item.endArea || ''}${item.endAddress || ''}`
          item.startAddress = `${item.startProvince || ''}${item.startCity || ''}${item.startArea || ''}${item.startAddress || ''}`
          item.creationDate = `${dayjs(item.creationDate).format('YYYY-MM-DD HH:mm:ss')}`
          item.countFee = item.orderPrice.countFee || ''
          item.whetherReceipt = _whetherReceipt[item.orderPrice.receiptType]
        })
        return rows
      },

      // 点击操作按钮
      handleTableBtn (val, row) {
        this.$emit('handleTableBtn', val, row)
        // this.detailInfo = row
        // if (val === '联系销售') {
        //   this.$refs.concatSales.showConcatSaleVisible()
        // } else if (val === '取消订单') {
        //   this.$refs.cancelOrder.showCancelOrderVisible()
        // } else if (val === '确认下单') {
        //   this.$refs.confirmOrder.showConfirmOrderVisible()
        // } else {
        //   sessionStorage.setItem('AgainOrderDetailInfo', JSON.stringify(this.detailInfo))
        //   this.$router.push({ path: '/admin/vtsOrder', query: { demandOrderCode: this.detailInfo.demandOrderCode } })
        // }
      },
      // // 弹框关闭
      // dialogClose (val) {
      //   if (val === 'cancelOrder') {
      //     this.$refs.cancelOrder.colseCancelOrderVisible()
      //   } else if (val === 'configOrder') {
      //     this.$refs.confirmOrder.closeConfirmOrderVisible()
      //   }
      //   // this.getOrderDetail()
      // },
      // 查看回单照片
      openPic (val) {
        this.$emit('lookPic', val)
      },

      // 跳转详情
      goToDetail (val) {
        this.$router.push(`vtsWaybill-detail/${val}`)
      },

      setTableHeight () {
        const tempHeight = this.isPackUp ? 360 : 320
        this.$nextTick(() => {
          this.tableHeight = `calc(100vh - ${tempHeight}px)`
          this.$refs.vtstable.doLayout()
        })
      },
    },
    computed: {
      columns () {
        let _tableColumns = JSON.parse(JSON.stringify(this.tableColumns))
        if (!_tableColumns || _tableColumns.length < 1) {
          return []
        }
        //当表格列中存在有visible的列时，则只展示visible为true的列，否则默认展示全部列
        if (_tableColumns.find(c => c.visible)) {
          return _tableColumns.filter(c => c.text && c.visible)
        }
        return _tableColumns.filter(c => c.text)
      },
    },
  }
</script>

<style lang="scss">
  // 弹出框颜色
  $tooltipBg: rgba(0, 0, 0, 0.5);
  .el-tooltip__popper.is-dark {
    background-color: $tooltipBg;

    .popper__arrow,
    .popper__arrow::after {
      border-top-color: $tooltipBg;
    }
  }

  .jj-vts-table-container {
    // @import '@/assets/scss/element-table.scss';
    overflow: auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    .orderStatusImg {
      width: 44px;
      height: 14px;
    }
    .orderStatusImgType {
      line-height: 15px;
    }
    .pagination {
      // margin: 16px 0;
      height: 100px;
      padding-right: 10px;
      box-sizing: border-box;
    }
    .icon-tabs {
      cursor: pointer;
    }
    .btn-text {
      font-size: 12px;
    }
    .copy-btn {
      margin-left: 5px;
      font-size: 12px;
    }
    .drag-line--hide {
      /deep/ .cell {
        &::after {
          content: none;
          display: none;
        }
      }
    }
  }
  // /deep/.cell {
  //   height: 28px;
  //   line-height: 28px;
  // }
  .restrict-img {
    margin-right: 2px;
    font-size: 24px;
  }
  /deep/ .el-table__fixed-right {
    right: 0 !important;
    box-shadow: none !important;
  }

  .vts-list-home .tab-list .el-table td {
    padding: 0 !important;
  }
  .permissions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .icon-permissions {
    color: #cccccc;
  }
  .icon-permissions-dark {
    color: #999;
  }
</style>
