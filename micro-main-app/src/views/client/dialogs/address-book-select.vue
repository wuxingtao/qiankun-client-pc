// <template>
//   <div class="clientdialog" >
//     <el-dialog :title="isSender?'选择寄件人':'选择收件人'" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1030px" >
//       <div class="dialog-body"  v-loading="loading">
//         <div class="tabs" v-if="!isSender && isVipshopUser">
//           <div class="tab-item" :class="{active:selectedTab==='receiver'}" @click="selectedTab='receiver'">收方地址簿</div>
//           <div class="tab-item" :class="{active:selectedTab==='vipshop'}" @click="selectedTab='vipshop'">唯品会地址簿</div>
//         </div>
//         <el-form ref='form' :model="formData" class="form" label-position="left" label-width="54px">
//           <el-form-item label="关键字" prop="keyword">
//             <el-input v-model="formData.keyword" size="medium" clearable placeholder="请输入关键字搜索"></el-input>
//           </el-form-item>
//           <div>
//             <el-button type="primary" @click="loadListData">搜索</el-button>
//           </div>
//         </el-form>
//         <el-table ref="table" :data="tableData" class="client-common-table" border style="width:100%" :height="300"  @selection-change="handleSelectionChange"  @row-click="handleRowClick">
//           <div slot="empty" class="empty-wrap">
//             <svg-icon icon-class="none-data2" />
//             <div>未找到符合条件的数据<br />建议您调整筛选条件再试试</div>
//           </div>
//           <el-table-column v-if="multiSelect" type="selection" width="55">
//           </el-table-column>
//           <el-table-column v-else width="55">
//             <template slot-scope="scope">
//               <el-radio text-color="#606266" v-model="selectedRows[0]" :label="scope.row"><i></i></el-radio>
//             </template>
//           </el-table-column>
//           <el-table-column v-for="col in tableColumns " :key="col.prop" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
//           </el-table-column>
//         </el-table>
//         <div class="client-pagination">
//           <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pagination.currentPage" :page-size="pagination.pageSize" :page-sizes="[10, 30, 50]" layout="prev, pager, next,sizes,jumper" :total="pagination.totalRowCount">
//           </el-pagination>
//         </div>
//       </div>
//       <span slot="footer" class="dialog-footer">
//         <el-button @click="dialogVisible = false">取消</el-button>
//         <el-button type="primary" @click="saveData"> 确认选择</el-button>
//       </span>
//     </el-dialog>
//   </div>
// </template>

// <script>
// import { mapGetters } from "vuex"
// import { querySenderInfo, queryReceierInfo } from "@/services/api/address"
// import { pagination } from "@utils/clientUtil"
// const tableColumns = [
//   { prop: "userName", text: "联系人", width: "100" },
//   { prop: "companyName", text: "公司名称", width: "140" },
//   { prop: "address", text: "地址", width: "150" },
//   { prop: "contactMobile", text: "手机号码", width: "100" },
//   { prop: "telephone", text: "固定电话", width: "100" },
//   { prop: "remark", text: "备注", width: "100" },
// ]
// export default {
//   name: "AddressBookSelect", 
//   data () {
//     return {
//       loading: false,
//       dialogVisible: false,
//       isSender: true,
//       multiSelect:false,
//       tableColumns,
//       selectedRows: [],
//       selectedTab: "receiver",
//       pagination: {
//         currentPage: 1,
//         pageSize: 10,
//         totalRowCount: 0,
//       },
//       formData: { keyword: "" },
//       tableData: [],
//       callback: null,
//     }
//   },
//   methods: {
//     handleSelectionChange(val) {
//       this.selectedRows = val
//     },
//     handleRowClick($event){
//       if(this.multiSelect){
//         this.$refs.table.toggleRowSelection($event)
//       }else{
//         this.selectedRows=[$event]
//       }
            
//     },
//     showDialog (isSender, callback,multiSelect) { 
//       this.isSender = isSender
//       this.callback = callback
//       this.multiSelect=multiSelect
//       this.dialogVisible = true
//       this.$nextTick(() => {
//         this.$refs.form.resetFields()
//         this.pagination.currentPage=1
//         this.loadListData()
//       })
//     },
//     async loadListData () {
//       this.loading = true
//       if (!this.vipshopInfoList || this.vipshopInfoList.length < 1) {
//         this.$store.dispatch("client/setVipshopInfoListAction")
//       }
//       try { 
//         if (this.isSender) {
//           await this.querySenderData()
//         } else {
//           if (this.selectedTab === 'vipshop') {
//             const list = this.vipshopInfoList.filter(f => f.userName.includes(this.keyword) || f.companyName.includes(this.keyword) || f.address.includes(this.keyword))
//             this.tableData = pagination(list, this.pagination.currentPage, this.pagination.pageSize)
//             this.pagination.totalRowCount = list.length
//           } else {
//             await this.queryReceiverData()
//           }
//         }
//         this.loading = false
//       } catch (ex) {
//         this.loading = false
//         this.tableData =[]
//         this.pagination.totalRowCount =0
//         console.log('loadListData :>> ', ex)
//       }
//     },
//     async querySenderData () {
//       const res = await querySenderInfo(
//         this.pagination.currentPage,
//         this.pagination.pageSize,
//         this.formData.keyword
//       )
//       if (res.code === 0) {
//         this.tableData = res.data.dataList.map((d) => ({
//           userName: d.sendMan,
//           companyName: d.sendCompany,
//           address: d.address,
//           contactMobile: d.sendMobile,
//           telephone: this.$trim(
//             `${d.sendPhoneArea}-${d.sendPhone}-${d.sendPhoneNo}`,
//             "-"
//           ),
//           remark: d.remark,
//           province:d.province,
//           city:d.city,
//           zone:d.zone
//         }))
//         this.pagination.totalRowCount = res.data.dataCount
//       }
//     },
//     async queryReceiverData () {
//       const res = await queryReceierInfo(
//         this.pagination.currentPage,
//         this.pagination.pageSize,
//         this.formData.keyword
//       )
//       if (res.code === 0) {
//         this.tableData = res.data.dataList
//         this.pagination.totalRowCount = res.data.dataCount
//       }
//     },
//     saveData () { 
//       if (!this.selectedRows||this.selectedRows.length<1) {
//         this.$message.warning(`请选择${this.multiSelect?'至少':''}一条数据进行确认`)
//         return
//       } 
//       this.dialogVisible = false 
//       this.callback && this.callback( this.multiSelect?this.selectedRows:this.selectedRows[0]) 
//     },
//     handleSizeChange (val) {
//       this.pagination.pageSize = val
//       this.loadListData(false, true)
//     },
//     handleCurrentChange (val) {
//       this.pagination.currentPage = val
//       this.loadListData()
//     },
//   },
//   watch: {
//     selectedTab () {
//       this.keyword = ''
//       this.pagination.currentPage = 1
//       this.loadListData()
//     }
//   },
//   computed: {
//     ...mapGetters(["vipshopInfoList", "isVipshopUser"]),
//   },
// }
// </script>

// <style lang="scss" scoped>
//  /deep/ .el-dialog__body {
//     padding: 0 !important;
//     .tabs {
//       display: flex;
//       height: 40px;
//       line-height: 40px;
//       border-bottom: 1px solid #f1f1f5;
//       margin: -12px auto 12px;
//       .tab-item {
//         margin-right: 40px;
//         font-size: 16px;
//         font-family: PingFangSC, PingFangSC-Regular;
//         font-weight: 400;
//         color: rgba(51, 51, 51, 0.93);
//         height: 100%;
//         user-select: none;
//         cursor: pointer;
//         &.active {
//           font-weight: 500;
//           color: #7c57df;
//           position: relative;
//           &::after {
//             content: "";
//             display: block;
//             position: absolute;
//             bottom: 0;
//             height: 3px;
//             width: 100%;
//             background: #7c57df;
//             border-radius: 2px;
//           }
//         }
//       }
//     }
//     .form {
//       display: flex;
//       button {
//         margin-left: 16px;
//       }
//     }
//     .client-common-table {
//       .el-table__empty-text {
//         display: flex;
//         align-items: center;
//         .empty-wrap {
//           margin: 10px auto;
//           line-height: 20px;
//           .svg-icon {
//             width: 150px;
//             height: 150px;
//             margin-bottom: 24px;
//           }
//         }
//       }
//     }
//     // /deep/ {
//     //   .el-form-item {
//     //     .el-form-item__label,
//     //     .el-form-item__content {
//     //       line-height: 20px;
//     //       padding-bottom: 4px;
//     //     }
//     //   }
//     // }
//   }
// </style>
