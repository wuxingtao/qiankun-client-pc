<template>
  <div :class="['address-list-container',isInDialog && 'address-list-dialog']"
       v-loading='loading'>
    <div class='flex flex_ai_c flex_jc_b mb_12'>
      <div class='search-condition-wrapper'
           v-if='showSearch'>
        <div class='flex-inline flex_ai_c'>
          <el-input class='k__input--search'
                    size='mini'
                    :placeholder='searchPlaceholder'
                    maxlength='100'
                    v-model='keyword'
                    clearable />
          <!--        <el-button class='ml_12 f_w_600 el-button&#45;&#45;normal' type='primary' @click='requeryData' size='mini'><i-->
          <!--          class='iconfont icon-search fs_12&#45;&#45;strict f_w_600 mr_6'></i>搜索-->
          <!--        </el-button>-->
          <!--        <el-button class='ml_12 f_w_600 el-button&#45;&#45;normal' size='mini' @click="keyword=''">清空</el-button>-->
        </div>
      </div>
      <el-button v-if='isInDialog&&!isVipshop'
                 @click='addAddress '
                 class='btn-add-top btn-text-operation fs_12'
                 type='text'
                 size='mini'><i class='iconfont icon-tool-add mr_8'></i>新增
      </el-button>
      <div class='page-operation flex flex_ai_c flex_jc_b'
           v-if='!isInDialog'>
        <template v-if='!isVipshop'>
          <div class='page-operation--right'>
            <el-button @click='addAddress '
                       class='btn-text-operation'
                       type='text'
                       size='mini'><i class='iconfont icon-tool-add mr_8'></i>新增
            </el-button>
            <el-button @click='dialogImport=true'
                       class='btn-text-operation'
                       type='text'
                       size='mini'><i class='iconfont icon-tool-export mr_8'></i>批量导入
            </el-button>
<!--            <el-button v-if="!isEncryptField&&authorityIds.includes('129')"-->
<!--                       @click='exportExcel'-->
<!--                       class='btn-text-operation'-->
<!--                       type='text'-->
<!--                       size='mini'><i class='iconfont icon-tool-export mr_8'></i>导出Excel-->
<!--            </el-button>-->
            <el-button v-if="!isEncryptField&&permissionCodes.includes('addressExport')"
                       @click='exportExcel'
                       class='btn-text-operation'
                       type='text'
                       size='mini'><i class='iconfont icon-tool-export mr_8'></i>导出Excel
            </el-button>
            <el-button type='text'
                       size='mini'
                       class='btn-text-operation'
                       @click='deleteAddress(null,true)'
                       :disabled='!selectedRows||selectedRows.length<1'>
              <i class='iconfont icon-delete mr_8'></i>删除
            </el-button>
          </div>
        </template>
        <div class='page-operation--right'
             v-else>
          <el-button @click='exportExcel'
                     class='btn-text-border'
                     type='text'
                     size='mini'><i class='iconfont icon-tool-export mr_8'></i>导出Excel
          </el-button>
        </div>
      </div>
    </div>
    <ky-table :data='tableData'
              class='element-table'
              :pagination='pagination'
              :paginationSlot='true'
              :paginationVisible='true'
              @pagination-change='pageChange'
              :height='tableHeight'
              :row-style="limitedRowStyle"
              :cell-style="handleCellStyle"
              :row-class-name="tableRowClassName"
              ref='kyTable'
              @selection-change='selectedRows=$event'
              @row-click='handleRowClick'
              v-bind='$attrs'>
      <el-table-column v-if='multiSelect'
                       type='selection'
                       :selectable='columnSelectable'
                       width='32'
                       class-name='col-selection' />
      <el-table-column v-else
                       width='32'
                       fixed
                       :resizable='false'
                       class-name='col-selection'>
        <template slot-scope='scope'>
          <el-radio text-color='#606266'
                    v-model='selectedRows[0]'
                    :disabled="scope.row.limitType === 10"
                    :label='scope.row'
                    class='radio-hack'><i></i>
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column fixed
                       label='操作'
                       class-name="handleColumn"
                       :width='optionsWidth'
                       :min-width="optionsWidth + 'px'">
        <template slot-scope='scope'>
          <!--          <template v-if="!isInDialog">-->
          <!--            <el-button type="text" @click.stop="updateCollectFlag(scope.row.id,false)" class="btn-text-border" v-if="scope.row.isCollect"> 取消常用</el-button>-->
          <!--            <el-button type="text" @click.stop="updateCollectFlag(scope.row.id,true)" class="btn-text-border" v-else> 设为常用 </el-button>-->
          <!--          </template>-->
          <el-button @click.stop='modifyAddress(scope.$index, scope.row)'
                     type='text'
                     class='btn-text-border'>编辑
          </el-button>
          <template v-if='!isVipshop'>
            <el-button @click.stop='deleteAddress(scope.row.id)'
                       type='text'
                       class='btn-text-border'>删除</el-button>
            <el-button v-if='scope.row.isEncrypt'
                       @click.stop='decrypt(scope.row)'
                       type='text'
                       class='btn-text-border'>
              解密
            </el-button>

          </template>
          <template v-if="addressType === '10'">
            <el-button type='text'
                       v-if='scope.row.isDefault'
                       @click.stop='setDefault(scope.row.id,false,scope.$index)'
                       class='btn-text-border'> 取消默认
            </el-button>
            <el-button type='text'
                       v-else
                       @click.stop='setDefault(scope.row.id,true,scope.$index)'
                       class='btn-text-border'> 设为默认
            </el-button>
          </template>

          <tooltip-affect-reason v-if='scope.row.limitType === 10' style="line-height: 20px;" :tipType="scope.row.limitType == 10 ? 'error' : 'warning'" :reasonCode="scope.row.limitReason">
            <template #tip-msg>
              {{scope.row.noticeMessage}}
            </template>
          </tooltip-affect-reason>
        </template>
      </el-table-column>
      <el-table-column min-width='120px'
                       :show-overflow-tooltip='true'
                       :label="addressType === '20' ?'收件联系人': '联系人'">
        <template slot-scope='{row}'>
          <div>
            <div class='flex'
                 style="align-items: center;">
              <span class='ellipsis column-contact'>{{
                row['isEncrypt'] ? maskField(row['contact'], 'contact') : row['contact']
                }}</span>
              <div v-if="row.isDefault && addressType === '10'"
                   class='label--default'><span>默认</span></div>
              <!--              <span v-if="row.isCollect" class="label&#45;&#45;collect">常用</span>-->
            </div>
            <div class='contact c_999 ellipsis mt_4'>
              <span v-if="row['isEncrypt']">{{ maskField(row['contactPhone'], 'contactPhone') || maskField(row['telephone'], 'telephone')
                }}</span>
              <span v-else>{{ row['contactPhoneFormat'] || row['telephone'] }}</span>
            </div>
          </div>

        </template>
      </el-table-column>

      <el-table-column label='地址'
                       min-width='250px'
                       :show-overflow-tooltip='true'>
        <template slot-scope='{row}'>
          <div v-if='!isVipshop'>
            <div class='address-prefix'>{{ row.districtStr }}</div>
            <div class='address ellipsis c_999 mt_4'>
              {{ row['isEncrypt'] ? maskField(row['detailAddress'], 'detailAddress') : row['detailAddress'] }}
            </div>
          </div>
          <div v-else
               class='ellipsis-2'>{{ row['address'] }}</div>
        </template>

      </el-table-column>
      <el-table-column v-if='isVipshop'
                       prop='customerCode'
                       label='客户编码' />
      <el-table-column v-for='(col,index) in tableColumns.filter(f=>(f.columnVisible))'
                       :key='col.prop + index'
                       :show-overflow-tooltip='true'
                       :prop='col.prop'
                       :label='col.text'
                       :min-width="col.width+'px'">
        <template slot-scope='{row}'>
          <span>{{ row['isEncrypt'] ? maskField(row[col.prop], col.prop) : row[col.prop] }}</span>
        </template>
      </el-table-column>
    </ky-table>
    <!--  新增修改  -->
    <dialog-add @refreshList='queryDelay'
                ref='dialogAddRef'
                :isVipshop="isVipshop"
                :addressType='addressType' />
    <!--  批量导入  -->
    <dialog-import :visible='dialogImport'
                   @close='dialogImport=false'
                   :addressType='addressType'
                   @refreshList='queryData' />
    <encrypt-field-view :visible.sync='encryptFiledVisible'
                        :content='encryptContent'
                        menuText='地址簿'
                        ref='encryptFieldView'
                        @on-confirm='handleEncryptResult' />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'
import Format from '@/utils/format'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { exportExcelByApi, exportFileWithData } from '@/utils/commonUtil'
import { DialogAdd, DialogImport } from '@/views/address-book/components'
import TooltipAffectReason from '@views/delivery/batch/table-cell-template/tooltip-affect-reason.vue'
import {
  queryAddressBook,
  updateCollectFlag,
  deleteAddressList,
  queryVipshopInfo,
  addressSetDefault
} from '@/services/api/address'
import dataMask from '@/utils/dataMask'
import EncryptFieldView from '@/components/encrypt-field/encrypt-field-view'

const encryptFileds = ['contact', 'address', 'contactPhone', 'telephone']

export default {
  props: {
    addressType: { //地址薄类型：'10'(寄方),'20'(收方)
      type: String,
      require: true
    },
    isInDialog: {
      type: Boolean,
      default: false
    },
    multiSelect: {
      type: Boolean,
      default: true
    },
    tableHeight: {
      type: String,
      // default: 'calc(100vh - 234px)'
    },
    // 搜索关键词
    searchValue: {
      type: String,
      require: true
    },
    // 是否显示内部搜索框
    showSearch: {
      type: Boolean,
      default: true
    }
  },
  components: { DialogAdd, DialogImport, EncryptFieldView, TooltipAffectReason },
  data () {
    return {
      tableColumns: [
        { prop: 'contact', text: '联系人', width: '90', visible: true },
        { prop: 'address', text: '地址', width: '250', visible: true },
        { prop: 'company', text: '公司名称', width: '110', minWidth: '110', visible: true, columnVisible: true },
        { prop: 'contactPhone', text: '手机号', width: '90', visible: true },
        { prop: 'telephone', text: '固定电话', width: '90', visible: true },
        { prop: 'remark', text: '备注', width: '90', minWidth: '90', visible: true, columnVisible: true }
      ],
      exportColumns: [
        { prop: 'company', text: '公司名称', minWidth: '110', visible: true, columnVisible: true },
        { prop: 'contact', text: '联系人', visible: true },
        { prop: 'contactPhone', text: '手机号码', visible: true },
        { prop: 'telephone', text: '固定电话', visible: true },
        { prop: 'fullAddress', text: '详细地址', visible: true },
        { prop: 'remark', text: '备注', minWidth: '90', visible: true, columnVisible: true }
      ],
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
      selectedRows: [],
      loading: false,
      keyword: '',
      dialogImport: false,
      encryptFiledVisible: false,
      encryptContent: '',
      currentID: ''
    }
  },
  created () {
    if (this.$attrs.isVts) {
      this.tableColumns = []
    }
  },
  mounted(){
    this.$refs.kyTable.doLayout()
  },
  methods: {
    reset () {
      this.keyword = ''
      this.selectedRows = []
      this.pagination.pageIndex = 1
      this.tableData = []
    },
    handleRowClick ($event) {
      if ($event.limitReason) return false
      if (this.multiSelect) {
        this.$refs.kyTable.toggleRowSelection($event)
      } else {
        this.selectedRows = [$event]
      }
    },
    columnSelectable (row) {
      if (row.limitType === 10) return false
      return true
    },
    limitedRowStyle ({row}) {
      if (row.limitType === 10) {
        return {
          'background-color': '#f7f7f7'
        }
      }
    },
    tableRowClassName({row}){
      return row.limitType === 10 ? 'limit-row':'normal-row'
    },
    handleCellStyle ({columnIndex}) {
      if (columnIndex === 0 || columnIndex === 1) {
        return {
          'background-color': '#fff'
        }
      }
    },
    requeryData: debounce(function() {
      this.pagination.pageIndex = 1
      this.queryData()
    }, 300),
    // 延迟刷新数据
    queryDelay () {
      setTimeout(() => {
        this.queryData()
      }, 1500)
    },
    async queryData () {
      this.loading = true
      try {
        if (this.isVipshop) {
          await this.queryVipshopData()
          return
        }
        const params = this.getSenderOrReceiverRequestParams()
        const res = await this.getSenderOrReceiverData(params)
        if (res.code === 0) {
          let arr = res.data.rows || []
          if (this.$store.getters.isEncryptField) {
            arr.map(item => {
              item.isEncrypt = true
            })
          }
          this.tableData = arr
          this.pagination.totalCount = res.data.rowTotal
        }
      } finally {
        this.loading = false
        this.$nextTick(()=>this.$refs.kyTable.doLayout())
      }
    },
    getSenderOrReceiverRequestParams () {
      const params = {
        phone: getPhone(),
        customerCode: this.authorityIds.includes('031') ? getCustomerCode() : '',
        addressType: this.addressType,
        page: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
        keyword: this.keyword,
        requestSource: '30'
      }
      return params
    },
    // 查询列表
    async getSenderOrReceiverData (params) {
      const res = await queryAddressBook(params)
      if (res.code === 0) {
        res.data.rows = res.data.rows.map(r => {
          const address = r.address.replace(/null/g, '')
          const { province = '', city = '', area = '' } = r
          const districtStr = (province || '') + (city || '') + (area || '')
          return Object.assign(r, {
            fullAddress: districtStr + address,
            detailAddress: address,
            districtStr,
            contactPhoneFormat: Format.formatMobliePhone(r.contactPhone) // 格式化联系手机号
          })
        }
        )
      }
      return res
    },
    async queryVipshopData () {
      const res = await queryVipshopInfo(this.keyword)
      if (res.code == 0) {
        this.tableData = (res.data || []).map(r => ({
          contact: r.contacts,
          company: r.customerName,
          customerCode: r.customerCode,
          address: r.address,
          fullAddress: r.address,
          contactPhone: r.mobile,
          telephone: r.fixedTelephone,
          remark: r.remark
        })
        )
      }
    },
    // 新增
    addAddress () {
      if (this.$attrs.isVts) {
        this.$refs.dialogAddRef.addForm('vts')
      } else {
        this.$refs.dialogAddRef.addForm()
      }
      // this.$refs.dialogAddRef.addForm()
    },
    // 修改
    modifyAddress (index, row) {
      if (this.$attrs.isVts) {
        this.$refs.dialogAddRef.modAddress({ index, row }, 'vts')
      } else {
        this.$refs.dialogAddRef.modAddress({ index, row })
      }
      // this.$refs.dialogAddRef.modAddress({ index, row })
    },

    /**
       *  设为默认
       * @param id
       * @param flag <true 设置 false 取消>
       * @param index 上标
       * @returns {Promise<void>}
       */
    async setDefault (id, flag, index) {
      this.loading = true
      try {
        // type <寄件'10'><收件：'1'>
        const res = await addressSetDefault({ id, type: this.addressType === '10' ? '10' : '1' })
        if (res.code === 0) {
          const msg = `${flag ? '设置' : '取消'}默认成功`
          this.$message.success(msg)
          const oldIndex = this.tableData.findIndex(item => item.isDefault)
          this.$set(this.tableData, oldIndex, { ...this.tableData[oldIndex], isDefault: false })
          if (flag) {
            this.$set(this.tableData, index, { ...this.tableData[index], isDefault: true })
          }
        }
      } finally {
        this.loading = false
      }
    },
    async deleteAddress (id, isBatchDelete) {
      let tipText = ''
      if (id) {
        const { contact, contactPhone, telephone } = this.tableData.find(item => item.id === id)
        tipText = `${contact}(${contactPhone || telephone})`
      } else {
        tipText = '选中地址'
      }
      // this.$kye_message.confirm(`确定删除${tipText}?`, { type: 'warning' })
      const h = this.$createElement
      this.$kye_message.$message({
        message: h('p', null, [
          h('span', null, '确定删除'),
          h('span', { style: 'color: #fe8151' }, tipText),
          h('span', null, '这个地址吗？ ')
        ]),
        type: 'warning'
      }).then(async () => {
        this.loading = true
        let ids = [id]
        if (isBatchDelete) {
          ids = this.selectedRows.map(r => r.id)
        }
        try {
          const res = await deleteAddressList(this.addressType, ids)
          if (res.code === 0) {
            this.$message.success('删除成功')
            const { pageSize, pageIndex, totalCount } = this.pagination
            this.pagination.totalCount = totalCount >= ids.length ? totalCount - ids.length : 0
            this.pagination.pageCount = Math.ceil(this.pagination.totalCount / pageSize)
            this.pagination.pageIndex = (pageIndex > this.pagination.pageCount ? this.pagination.pageCount : pageIndex) || 1
            this.queryData()
          }
        } finally {
          this.loading = false
        }
      })

    },
    async updateCollectFlag (id, flag) {
      this.loading = true
      try {
        const res = await updateCollectFlag(this.addressType, id, flag)
        if (res.code === 0) {
          const msg = `${flag ? '设置' : '取消'}常用成功`
          this.$message.success(msg)
          this.queryData()
        }
      } finally {
        this.loading = false
      }
    },
    async exportExcel () {
      try {
        this.loading = true
        if (this.isVipshop) {
          await this.exportVipshopData()
          return
        }
        await this.exportSenderOrReceiverData()
      } finally {
        this.loading = false
      }
    },
    async exportSenderOrReceiverData () {
      const addressTypeName = this.addressType === '20' ? '收方' : '寄方'
      const params = {
        requestFunc: this.getSenderOrReceiverData,
        params: this.getSenderOrReceiverRequestParams(),
        tableColumns: this.exportColumns,
        filename: `${addressTypeName}地址薄`,
        canDataEmpty: true
      }
      if (this.selectedRows.length > 0) {
        await exportFileWithData({
          theadColumns: this.exportColumns.filter(c => c.visible).map(c => c),
          jsonData: this.selectedRows,
          filename: `${addressTypeName}地址薄`,
          canDataEmpty: true
        })
      } else {
        await exportExcelByApi(params)
      }
    },
    async exportVipshopData () {
      const theadColumns = this.exportColumns.filter(c => c.visible).map(c => c)
      const excel = await import('@utils/clientUtil')
      excel.exportExcel({
        theadColumns,
        jsonData: this.selectedRows.length > 0 ? this.selectedRows : this.tableData,
        filename: '唯品会地址薄',
        canDataEmpty: true
      })
    },
    maskField (val, field) {
      let newVal = val
      switch (field) {
        case 'contact':
          newVal = dataMask.maskName(val)
          break
        case 'telephone':
          newVal = dataMask.maskTelephone(val)
          break
        case 'contactPhone':
          newVal = dataMask.maskMobile(val)
          break
        case 'address':
          if (val && val.length > 9) {
            newVal = val.substring(0, 9) + '***'
          }
          break
        case 'detailAddress':
          if (val && val.length > 1) {
            newVal = val.substring(0, 1) + '***'
          }
          break
      }
      return newVal
    },
    decrypt (val) {
      this.encryptFiledVisible = true
      this.encryptContent = ''
      encryptFileds.forEach(m => {
        this.encryptContent += `${this.tableColumns.find(el => el.prop === m) ?.text}：${val[m]},`
      })

      this.currentID = val.id
    },
    handleEncryptResult () {
      this.tableData.forEach(el => {
        if (el.id === this.currentID) {
          el.isEncrypt = false
        }
      })
    },
    // 更新搜索关键词
    updateKeyword (val) {
      this.keyword = val
    },
    pageChange: debounce(function(pagination) {
      // 防抖解决翻页时如果页码不为1会触发两次相同事件
      this.queryData()
    }, 300)
  },
  computed: {
    ...mapGetters(['authorityIds', 'isEncryptField', 'permissionCodes']),
    isVipshop () {
      return !this.addressType
    },
    optionsWidth () {
      let width = this.addressType === '10' ? 210 : 140
      let isLimited = this.tableData.some(val => !!val.limitReason)
      if (this.isEncryptField) {
        width = width + 60
      }
      if (isLimited) (width = width + 90)
      return width
    },
    searchPlaceholder () {
      if(this.isVipshop){
        return '请输入地址/公司名称搜索'
      }
      if (this.$attrs.isVts) {
        return '请输入姓名/地址/手机号搜索'
      } else {
        return '请输入姓名/地址/手机号/公司名称搜索'
      }
    }
  },
  watch: {
    keyword: {
      handler () {
        this.requeryData()
      },
      immediate: true
    },
    searchValue: {
      handler (val) {
        this.keyword = val
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
  .address-list-container {
    margin-top: 2px;
    .search-condition-wrapper {
      font-size: 14px;
      color: #333333;

      .btn-add-top {
        float: right;
      }
    }
    .icon-tool-add {
      top: 1px;
      left: 2px;
      position: relative;
      transform: scale(0.9);
      display: inline-block;
    }
    .element-table {
      color: #333333;
      margin-top: 12px;
      .btn-text-border {
        min-width: 30px;
        font-size: 12px;
        &:not(:last-child):after {
          width: 0px;
        }
        &:not(:last-of-type):after {
          content: '';
          position: absolute;
          width: 1px;
          height: 12px;
          top: 0;
          bottom: 0;
          right: -12px;
          margin: auto;
          background: #e9e9e9;
        }
      }
    }

    .label--default {
      width: 32px;
      height: 18px;
      background: #fff1e9;
      border-radius: 2px;
      color: #fe743c;
      transform: scale(0.8);
      padding: 2px 4px;
      margin-top: 0;
      display: flex;
      align-items: center;

      span {
        font-size: 12px;
      }
    }

    .label--collect {
      background: #f25050;
      color: #ffffff;
      font-size: 12px;
      border-radius: 4px;
      padding: 4px;
      white-space: nowrap;
      margin-left: 4px;
      width: 28px;
      height: 14px;
      line-height: 14px;
      text-align: center;
    }

    .page-operation--right {
      margin-left: auto;
    }

    &.address-list-dialog {
      .column-contact,
      .address-prefix {
        font-weight: bold;
      }
    }
  }

  .ky-table-container {
    /deep/ .el-table__body-wrapper,
    /deep/ .el-table__fixed,
    /deep/ .el-table__fixed-right {
      tr {
        td {
          height: 48px;
        }
      }
    }

    /deep/ .column-contact {
      //width: 80px;
    }
  }

  .el-table td div {
    line-height: 1;
  }

  .radio-hack {
    /deep/ {
      .el-radio__label {
        display: none;
      }

      input {
        height: auto;
      }
    }
  }

  .el-button--normal {
    font-size: 12px;
    padding: 8px 15px;
  }

  .k__input--search {
    /deep/ .el-input__suffix {
      right: 12px;
    }
  }
  /deep/ {
    .limit-row{
      :not(.handleColumn *) {
        color: #999999 !important;
      }
    }
  }
</style>
