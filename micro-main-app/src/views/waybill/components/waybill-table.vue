<template>
  <div>
  <virtual-table
    ref='multipleTable'
    :row-class-name='rowClassName'
    :loading='loading'
    :data='tableData'
    :tableColumns='tableColumns'
    :pagination='pagination'
    :height='tableHeight'
    :selectedRowsCount='selectedRowsCount'
    total-count-unit='个运单'
    @sort-change='changeSort'
    @selection-change='handleSelectionChange'
    @size-change='sizeChange'
    @current-change='pageChange'
  >
  <template #customer-select>
    <vxe-column
      type='checkbox'
      width='38'
      fixed='left'
      class-name='col-selection'
      :resizable='false'
    >
    </vxe-column>
<!--    <vxe-column v-else width='38' fixed='left' :resizable='false' class-name='col-selection'>-->
<!--      <template v-slot='{ row }'>-->
<!--        <el-radio v-model='selectedRows[0]' :label='row'><i /></el-radio>-->
<!--      </template>-->
<!--    </vxe-column>-->
  </template>
  <slot></slot>
  <template v-slot:column_slot1='{ row, col }'>
    <el-link type='primary'>{{ row[col.prop] }}</el-link>
  </template>
  <template v-slot:column_slot2='{ row, col }'>
    <el-button type='text' size='small' class='btn-text-border'>{{ row[col.prop] }}</el-button>
  </template>
  <template v-slot:column_receiptFlag='{ row, col }'>
    <span>{{ row[col.prop] }}</span>
  </template>
  <template v-slot:column_hdCount='{ row, col }'>
    <span>{{ row[col.prop] | formatNumber }}</span>
  </template>
  <!--  运单-->
  <template v-slot:column_waybillNumber='{ row, col }'>
    <el-button type='text' size='small' @click='viewWaybillDetail(row)' class='el-button-text'>
      {{ row[col.prop] }}
    </el-button>
    <el-tooltip effect='light' placement='top-start' content='复制运单号' :visible-arrow='false'>
      <span class='copy-waybiNumber' @click='copyReport' v-clipboard="row['waybillNumber']">
        <svg-icon icon-class='copy' class='icon-copy' />
      </span>
    </el-tooltip>
    <span v-if="row['serviceModeDesc']"
          class='tag'>
      {{ row["serviceModeDesc"] }}
    </span>
    <!--    <el-tooltip v-if='showAffect(row)' effect='light' placement='top'-->
    <!--                :popper-class="'affect_'+getAffectStyle(row.limitCategory)+'_popper affect-popper'">-->
    <!--      <div slot='content' class='affect-wrapper' :class="'affect_'+getAffectStyle(row.limitCategory)">-->
    <!--        <img :src='getAffectUrl(row.limitCategory)' />-->
    <!--        <p>-->
    <!--          <span>{{ row.message }}</span>-->
    <!--        </p>-->
    <!--      </div>-->
    <!--      <span class='affect-icon' :class="'affect_'+getAffectStyle(row.limitCategory)+'_icon'"></span>-->
    <!--    </el-tooltip>-->
    
  </template>
  <!--  打印标识  -->
  <template v-slot:column_waybillStatus='{ row, col }'>
    {{ row[col.prop] }}
    <span v-if="row.printNumber > 0||row.printStatus+''==='10'" class='text-printed'
          style='background-color: #eaedff;  color: #999999; border-radius: 2px;  font-size: 12px;  padding: 2px 4px;'>
        已打印{{ Number(row["printNumber"]) || 1 }}次
      </span>
    <span v-else class='text-unprinted'
          style='background-color: #ffe7e7;  color: #f13e3e; border-radius: 2px;  font-size: 12px;  padding: 2px 4px;'>
        未打印
      </span>
  </template>
  <template v-slot:column_distance='{ row, col }'>
    <el-button
      v-if='isMap(row[col.prop])'
      type='text'
      size='small'
      @click="viewExpressDetail(row, '司机距离', row[col.prop])"
    >
      <el-image :src='map' v-if='isMap(row[col.prop])' class='map'></el-image>
      {{ row[col.prop] }}
    </el-button>
  </template>
  <template v-slot:column_sizeText='{ row }'>
    <el-button
      type='text'
      size='small'
      @click='viewSizeText(row.waybillNumber)'
    >
      查看
    </el-button>
  </template>
  <template v-slot:column_downloadReceipt='{ row }'>
    <el-button
      v-if='row.hasDownloadReceipt === Number(hasDownloadReceiptEnum.HAS_DOWNLOAD_RECEIPT)'
      type='text'
      size='small'
      @click='handleDownReceipt(row.waybillNumber)'
    >
      下载
    </el-button>
  </template>
  </virtual-table>
  <ky-custom-column-v3
    :visible.sync='visbileOfCustomColum'
    :tableConfigName='tableConfigName'
    :tableColumns.sync='tableColumns'
    @change='handleColumnChange'
  />
  <waybill-size-view ref='waybillSizeViewRef' />
  
  </div>
</template>
<script>
import API from "@api/waybill"
import { hasDownloadReceiptEnum, statusEnum } from "../enum/queryEnum"
import VirtualTable from "@/components/ky-table/virtual-table"
import KyCustomColumnV3 from "@/components/ky-custom-column-v3"
import WaybillSizeView from "./waybill-size-view"
import { cloneDeep, debounce } from "lodash"
import dayjs from "dayjs"
import { downloadFileByUrls } from "@/utils/commonUtil"
import { getAffectStyle, getAffectUrl } from "../utils/methods"
import customerSource from "@/views/waybill/config/customerSource"
import { affectTypeEnum, limitCancelFlagEnum } from '@/views/waybill/enum/affectEnum'


export default {
  name: "waybill-table",
  props: {
    tableConfigName: {
      type: String,
      require: true
    },
    data: {
      type: Array,
      require: true
    },
    loading: {
      type: Boolean
    },
    waybillCustomerSource: {
      type: String
    },
    waybillStatus: {
      type: String
    },
    isPackUp: {
      //查询条件是否收起
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0,
          pageSizes: [10, 30, 50, 100]
        }
      }
    },
    sortInfo: {
      type: Array
    },
    tableColumnsSort: {
      type: Array
    }
  },
  components: {
    VirtualTable,
    KyCustomColumnV3,
    WaybillSizeView,
  },
  data() {
    return {
      visbileOfCustomColum: false,
      tableColumns: [...this.tableColumnsSort],
      selectedRowsCount: 0,
      hasDownloadReceiptEnum,
      viewHeight: (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight,
      // 行样式处理
      rowClassName ({ row }) {
        if (row.limitType === affectTypeEnum.LIMIT
          && [statusEnum.INFORM, statusEnum.CANCEL].includes(String(row.waybillStatus))) {
          return 'disable_class'
        }
      }
    }
  },
  mounted() {
    window.onresize = () => {
      this.viewHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
    }
  },
  computed: {
    tableData() {
      const arr = this.tableColumnsSort.filter(i => !!i.timeStampFormatter)
      const data = cloneDeep(this.data)
      data.forEach((item, index) => {
        arr.forEach((_item, _index) => {
          data[index][arr[_index].prop] = data[index][arr[_index].prop] ? dayjs(Number(data[index][arr[_index].prop])).format("YYYY-MM-DD HH:mm:ss") : ""
        })
      })
      return data
    },
    tableHeight() {
      const tempHeight = this.isPackUp ? 353 : 398
      // this.tableHeight = `calc(100vh - ${tempHeight}px)`
      return this.viewHeight - tempHeight
    }
  },
  watch: {
    tableColumnsSort(val) {
      this.tableColumns = [...val]
    }
  },
  methods: {
    sizeChange(pageSize) {
      this.$emit("size-change", pageSize)
    },
    pageChange(pageIndex) {
      this.$emit("page-change", pageIndex)
    },
    handleColumnChange() {
      this.$nextTick(() => {
        this.$emit("update:tableColumns", this.tableColumns)
        this.$parent.updateTableColumnsCache(this.tableColumns)
      })
    },
    showColumnManager() {
      this.visbileOfCustomColum = true
    },
    mockData(size) {
      const list = []
      for (let index = 0; index < size; index++) {
        const item = this.tableColumns.reduce((init, cur) => {
          cur.prop && (init[cur.prop] = cur.text + index)
          return init
        }, {})
        
        list.push(item)
      }
      return list
    },
    viewWaybillDetail(row) {
      this.orderListReport("查看运单资料")
      let path = ""
      if (row.waybillBusinessRange === 10) {
        path = "/admin/waybill-international-detail"
      } else {
        path = "/admin/waybill-v3-detail"
      }
      /** 已签收 */
      if (row.waybillBusinessRange !== 10 && row.waybillStatus === 40) {
        this.handleViewImage(row)
      }
      this.$router.push({
        path,
        query: { ydNo: row.waybillNumber }
      })
    },
    /** 单票查询回单信息 */
    async handleViewImage(row) {
      const data = {
        type: null,
        ydNoList: [row.waybillNumber]
      }
      window.sessionStorage.setItem("YDNO_LIST", JSON.stringify(data))
    },
    /** 跳转查看运单资料页面 */
    goMaterialRoute(data) {
      if (!data.ydNoList || data.ydNoList.length <= 0) {
        return this.$message.warning("查询资料的运单号列表为空")
      }
      window.sessionStorage.setItem("YDNO_LIST", JSON.stringify(data))
      this.$router.push("/admin/waybill-detail-material")
    },
    handleSelectionChange(val) {
      this.$emit("update:selectedRows", val)
      this.selectedRowsCount = val.length
    },
    // 从后台获取数据,重新排序
    changeSort({ sortList }) {
      const info = sortList.map(i => {
        return {
          field: this.handleSortField(i.column.property),
          orderByMode: i.order === "desc" ? 1 : 0
        }
      })
      this.$emit("update:sortInfo", info)
      this.$emit("handleSortQuery", true)
    },
    handleSortField(val) {
      // 处理带有Desc字符串结尾的field
      if (val.endsWith("Desc")) {
        return val.replace("Desc", "")
      }
      return val
    },
    handleEncryptResult() {
      this.currentDecryptRow.isEncrypt = false
    },
    isMap(num) {
      if (/\d/.test(num)) return true
      return false
    },
    viewExpressDetail({ ydNo, orderNumber, ydStatus }, title = "", distance) {
      let visible = title !== "司机距离" ? true : /\d/.test(distance)
      this.expressDialog = {
        ydCode: ydNo,
        orderNumber: orderNumber || "",
        goodsStatus:
          this.queryFormData.waybillStatus === 3 || this.queryFormData.waybillStatus === 4 ? 1 : 0,
        waybillStatus: ydStatus,
        visible,
        title,
        layout: title === "司机距离" ? "city,ydCode,distance" : "city,ydCode,distance,detail"
      }
    },
    clearSort() {
      this.$refs.multipleTable.clearSort()
    },
    async viewSizeText(waybillNumber) {
      this.orderListReport("查看")
      let params = {
        waybillNumber: waybillNumber
      }
      let res = await API.getGoodSize(params)
      if (res.code === 0 && res.data?.waybillGoodsSizeList?.length > 0) {
        this.$refs.waybillSizeViewRef.showDialog(res.data.waybillGoodsSizeList)
      } else {
        this.$message.warning("无尺寸数据")
      }
    },
    async handleDownReceipt(waybillNo) {
      const params = {
        bizCode: "waybill_upload_image_receipt",
        bizIds: [waybillNo]
      }
      const res = await API.getByBizCodeAndBizIds(params)
      if (res.data) {
        const { files } = res.data[0]
        const fileUrl = files.reduce((total, cur) => {
          total.push(cur.visit)
          return total
        }, [])
        if (this.isClientMode) {
          if (this.$native.existsNativeFunc("net_downLoadFileByBatch_New")) {
            const newFunctionUrl = files.map((f, index) => {
              return {
                visit: f.visit,
                bizId: waybillNo + (index > 0 ? "_" + index : "")
              }
            })
            await this.$native.downLoadFileByBatchNew(JSON.stringify(newFunctionUrl), ".jpg")
          } else {
            this.$native.downLoadFileByBatch(JSON.stringify(fileUrl), ".jpg")
          }
        } else {
          downloadFileByUrls(fileUrl)
        }
      }
    },
    orderListReport(btnText) {
      const obj = customerSource.find(i => i.value === this.waybillCustomerSource)
      let waybillStatusText = ""
      switch (this.waybillStatus) {
        case "10":
          waybillStatusText = "待通知取货"
          break
        case "20":
          waybillStatusText = "待揽件"
          break
        case"30":
          waybillStatusText = "待签收"
          break
        case"40":
          waybillStatusText = "已签收"
          break
        case "50":
          waybillStatusText = "已取消"
          break
        case"":
          waybillStatusText = "全部"
          break
      }
      this.$reportUtils.clkSearchOrderList({
        first_module: obj.label,
        second_module: waybillStatusText,
        button_name: btnText
      })
    },
    copyReport() {
      this.orderListReport('复制运单号')
    },
    getAffectStyle,
    getAffectUrl,
    showAffect({ limitCategory, message, waybillStatus }) {
      if (!limitCategory || !message) return false
      return limitCategory && waybillStatus !== statusEnum.CANCEL && waybillStatus !== statusEnum.SIGNED
    }
  },
  filters: {
    formatNumber(val) {
      if (val == "0") {
        return ""
      }
      return val
    }
  }
}
</script>
<style lang='scss' scoped>
@import "../style/common";

.text-printtimes {
  border-radius: 2px;
  font-size: 12px;
  padding: 2px 4px;
}

.text-printed {
  @extend .text-printtimes;
}

.text-unprinted {
  @extend .text-printtimes;
}

.copy-waybiNumber {
  padding: 0 6px;
}

.tag {
  background-color: #FFF1E9;
  color: #FE743C;
  padding: 0 4px;
  font-size: 9px;
  text-align: center;
}

/deep/ .el-button-text {
  user-select: text;
  font-size: 12px;
}

/deep/ .el-table__empty-block {
  width: 100% !important;
  height: 100%;
  //overflow: hidden;
  
  .el-table__empty-text {
    display: flex;
    align-items: center;
    //height: 180px;
    //overflow: hidden;
    
    .empty-wrap {
      //position: fixed;
      //left: 0;
      height: 100%;
      margin: 10px auto;
      line-height: 20px;
      
      .svg-icon {
        width: 150px;
        height: 150px;
        margin-bottom: 24px;
      }
    }
  }
}

/deep/ .ky-table-container .element-table .el-table__body-wrapper::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.affect-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-left: 8px;
  border-radius: 2px;
  position: relative;
  top: 4px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.affect-popper {
  border-radius: 4px;
  
  .affect-wrapper {
    width: 353px;
    display: flex;
    align-items: center;
    //height: 36px;
    min-height: 25px;
    border: 1px solid #ffffff;
    border-radius: 4px;
    padding-right: 12px;
    background-position: bottom right;
    background-size: 34px;
    background-repeat: no-repeat;
    
    > img {
      display: block;
      border-radius: 4px 0 0 4px;
      width: 36px;
      min-height: 25px;
      max-height: 42px;
      //min-height: 28px;
      //max-height: 46px;
      margin-right: 4px;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }
    
    > p {
      display: inline;
      //min-width: calc(100% - 52px);
      //max-width: calc(100% - 34px);
      padding: 6px 0;
      
      > span {
        font-size: 12px;
        text-align: left;
        line-height: 17px;
        //overflow: hidden;
        //text-overflow: ellipsis;
        //display: -webkit-box;
        //-webkit-line-clamp: 2;
        //-webkit-box-orient: vertical;
      }
    }
  }
}

/deep/ {
  .vxe-table--main-wrapper{
    .vxe-table--body {
      .disable_class {
        >td:not(.fixed--hidden){
          background-image: linear-gradient(#e8eaec, #e8eaec);
          background-color: #f5f7fb;
          
          .el-button, .copy-waybiNumber, .icon-copy, .tag  {
            color: #999999;
          }
          
          .tag {
            background-color: #f5f7fb;
          }
        }
        }
      }
    }
  }
</style>
<style lang='scss'>
.popover-copy {
  padding: 5px 0;
  border: 0;
}

.affect-popper {
  padding: 0 !important;
}
</style>