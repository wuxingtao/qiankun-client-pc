// <template>
//   <div class="address-list-container">
//     <div class="search-condition-wrapper">
//       操作时间
//       <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" style="width:calc(100% - 84px)" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" popper-class="data_picker">
//       </el-date-picker>
//       <el-button size="medium" type="primary" round @click="requeryData">查询</el-button>
//     </div>
//     <ky-table :data="tableData" class="element-table" :pagination="pagination" :paginationVisible="true" @pagination-change="queryData" :height="tableHeight" ref="kyTable" v-loading="loading" @selection-change="selectedRows=$event" @row-click="handleRowClick">
//       <el-table-column v-for="(col,index) in tableColumns.filter(f=>f.prop !== 'contact')" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
//         <template slot-scope="{row}">
//           <span>{{  row[col.prop]}}</span>
//         </template>
//       </el-table-column>
//     </ky-table>
//     <encrypt-field-view :visible.sync="encryptFiledVisible" :content="encryptContent" menuText="地址簿" ref="encryptFieldView" @on-confirm="handleEncryptResult" />
//   </div>
// </template>

// <script>
// import { mapGetters } from 'vuex'
// import { debounce } from 'lodash'
// import { getPhone, getCustomerCode } from '@/utils/storage'
// import { exportExcelByApi } from '@/utils/commonUtil'
// import { DialogAdd, DialogImport } from '@/views/address-book/components'
// import { queryAddressBook, updateCollectFlag, deleteAddressList, queryVipshopInfo } from '@/services/api/address'
// import dataMask from '@/utils/dataMask'
// import EncryptFieldView from '@/components/encrypt-field/encrypt-field-view'

// const encryptFileds = ['contact', 'address', 'contactPhone', 'telephone']

// export default {
//   props: {
//     addressType: { //地址薄类型：'10'(寄方),'20'(收方)
//       type: String,
//       require: true
//     },
//     isInDialog: {
//       type: Boolean,
//       default: false,
//     },
//     multiSelect: {
//       type: Boolean,
//       default: true
//     },
//     tableHeight: {
//       type: String,
//       default: 'calc(100vh - 320px)'
//     }
//   },
//   components: { DialogAdd, DialogImport, EncryptFieldView },
//   data () {
//     return {
//       tableColumns: [
//         { prop: 'name', text: '查看人姓名', width: '90', visible: true },
//         { prop: 'phone', text: '查看人手机', width: '90', visible: true },
//         { prop: 'address', text: '操作时间', width: '90', visible: true },
//         { prop: 'module', text: '查看模块', width: '90', visible: true },
//         { prop: 'cotent', text: '查看内容', width: '90', visible: true },
//       ],
//       tableData: [],
//       pagination: {
//         pageIndex: 1,
//         pageSize: 10,
//         totalCount: 0,
//       },
//       selectedRows: [],
//       loading: false,
//       keyword: '',
//       dialogImport: false,
//       encryptFiledVisible: false,
//       encryptContent: '',
//       currentID: '',
//     }
//   },
//   methods: {
//     reset () {
//       this.keyword = ''
//       this.selectedRows = []
//       this.pagination.pageIndex = 1
//     },
//     handleRowClick ($event) {
//       if (this.multiSelect) {
//         this.$refs.kyTable.toggleRowSelection($event)
//       } else {
//         this.selectedRows = [$event]
//       }
//     },
//     requeryData: debounce(function () {
//       this.pagination.pageIndex = 1
//       this.queryData()
//     }, 300),
//     async queryData () {
//       this.loading = true
//       try {
//         if (this.isVipshop) {
//           await this.queryVipshopData()
//           return
//         }
//         const params = this.getSenderOrReceiverRequestParams()
//         const res = await this.getSenderOrReceiverData(params)
//         if (res.code === 0) {
//           let arr = res.data.rows || []
//           if (this.$store.getters.isEncryptField) {
//             arr.map(item => {
//               item.isEncrypt = true
//             })
//           }
//           this.tableData = arr
//           this.pagination.totalCount = res.data.rowTotal
//         }
//       } finally {
//         this.loading = false
//       }
//     },
//     getSenderOrReceiverRequestParams () {
//       const params = {
//         phone: getPhone(),
//         customerCode: this.authorityIds.includes('031') ? getCustomerCode() : '',
//         addressType: this.addressType,
//         page: this.pagination.pageIndex,
//         pageSize: this.pagination.pageSize,
//         keyword: this.keyword
//       }
//       return params
//     },
//     async getSenderOrReceiverData (params) {
//       const res = await queryAddressBook(params)
//       if (res.code === 0) {
//         res.data.rows = res.data.rows.map(r =>
//           Object.assign(r, {
//             address: r.province + r.city + r.area + r.address,
//             detailAddress: r.address
//           })
//         )
//       }
//       return res
//     },
//     async queryVipshopData () {
//       const res = await queryVipshopInfo(this.keyword)
//       if (res.code == 0) {
//         this.tableData = res.data.result.map(r => ({
//           contact: r.Contacts,
//           company: r.customerName,
//           customerCode: r.customerCode,
//           address: r.address,
//           contactPhone: r.Mobile,
//           telephone: r.FixedTelephone,
//           remark: r.Remark
//         })
//         )
//       }
//     },
//     // 新增
//     addAddress () {
//       this.$refs.dialogAddRef.addForm()
//     },
//     // 修改
//     modifyAddress (index, row) {
//       this.$refs.dialogAddRef.modAddress({ index, row })
//     },
//     async deleteAddress (id, isBatchDelete) {
//       this.loading = true
//       let ids = [id]
//       if (isBatchDelete) {
//         ids = this.selectedRows.map(r => r.id)
//       }
//       try {
//         const res = await deleteAddressList(this.addressType, ids)
//         if (res.code === 0) {
//           this.$message.success('删除成功')
//           this.queryData()
//         }
//       } finally {
//         this.loading = false
//       }
//     },
//     async updateCollectFlag (id, flag) {
//       this.loading = true
//       try {
//         const res = await updateCollectFlag(this.addressType, id, flag)
//         if (res.code === 0) {
//           const msg = `${flag ? '设置' : '取消'}常用成功`
//           this.$message.success(msg)
//           this.queryData()
//         }
//       } finally {
//         this.loading = false
//       }
//     },
//     async exportExcel () {
//       try {
//         this.loading = true
//         if (this.isVipshop) {
//           await this.exportVipshopData()
//           return
//         }
//         await this.exportSenderOrReceiverData()
//       } finally {
//         this.loading = false
//       }
//     },
//     async exportSenderOrReceiverData () {
//       const addressTypeName = this.addressType === '20' ? '收方' : '寄方'
//       const params = {
//         requestFunc: this.getSenderOrReceiverData,
//         params: this.getSenderOrReceiverRequestParams(),
//         tableColumns: this.tableColumns,
//         filename: `${addressTypeName}地址薄`
//       }
//       await exportExcelByApi(params)
//     },
//     async exportVipshopData () {
//       const theadColumns = this.tableColumns.filter(c => c.visible).map(c => c)
//       const excel = await import('@utils/clientUtil')
//       excel.exportExcel({
//         theadColumns,
//         jsonData: this.tableData,
//         filename: '唯品会地址薄',
//       })
//     },
//     maskField (val, field) {
//       let newVal = val
//       switch (field) {
//         case 'contact':
//           newVal = dataMask.maskName(val)
//           break
//         case 'telephone':
//           newVal = dataMask.maskTelephone(val)
//           break
//         case 'contactPhone':
//           newVal = dataMask.maskMobile(val)
//           break
//         case 'address':
//           if (val && val.length > 9) {
//             newVal = val.substring(0, 9) + '***'
//           }
//           break

//       }
//       return newVal
//     },
//     decrypt (val) {
//       this.encryptFiledVisible = true
//       this.encryptContent = ''
//       encryptFileds.forEach(m => {
//         this.encryptContent += `${this.tableColumns.find(el => el.prop === m).text}：${val[m]},`
//       })

//       this.currentID = val.id
//     },
//     handleEncryptResult () {
//       this.tableData.forEach(el => {
//         if (el.id === this.currentID) {
//           el.isEncrypt = false
//         }
//       })
//     },
//   },
//   computed: {
//     ...mapGetters(['authorityIds', 'isEncryptField']),
//     isVipshop () {
//       return !this.addressType
//     },
//   },
//   watch: {
//     keyword: {
//       handler () {
//         this.requeryData()
//       },
//       immediate: true
//     }
//   }
// }
// </script>

// <style lang="scss" scoped>
//   .address-list-container {
//     .search-condition-wrapper {
//       padding-bottom: 20px;
//       border-bottom: 1px solid #f1f1f5;
//       font-size: 14px;
//       color: #333333;
//       .btn-add-top {
//         float: right;
//       }
//     }
//     .element-table {
//       .btn-text-border {
//         width: 30px;
//       }
//     }
//     .label--collect {
//       background: #f25050;
//       color: #ffffff;
//       font-size: 12px;
//       border-radius: 4px;
//       padding: 4px;
//       white-space: nowrap;
//       margin-left: 4px;
//       width: 28px;
//       height: 14px;
//       line-height: 14px;
//       text-align: center;
//     }
//     .page-operation--right {
//       margin-left: auto;
//     }
//   }
// </style>