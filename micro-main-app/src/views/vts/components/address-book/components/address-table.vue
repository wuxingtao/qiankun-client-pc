<template>
  <div class="address-list-container">
    <div class="search-condition-wrapper">
      <div class="search-box">
        <el-input class="k__input--searchreset mr_16 "
                  size="medium"
                  placeholder="输入姓名或电话进行搜索"
                  v-model="keyword"
                  clearable />
        <el-button size="medium"
                   type="primary"
                   class="search-btn"
                   icon="el-icon-search"
                   round
                   @click="requeryData">搜索</el-button>
      </div>
      <el-button v-if="isInDialog"
                 @click="addAddress "
                 class="btn-add-top"
                 type="text"
                 size="medium"><i class="iconfont icon-tool-add mr_8"></i>新增地址
      </el-button>
    </div>
    <div class="page-operation mtb_12 flex flex_ai_c flex_jc_b"
         v-if="!isInDialog">
      <!-- <template v-if="!isVipshop">
        <el-button type="small"
                   round
                   @click="deleteAddress(null,true)"
                   :disabled="!selectedRows||selectedRows.length<1">批量删除
        </el-button>
        <div class="page-operation--right">
          <el-button @click="addAddress "
                     class="btn-text-border"
                     type="text"
                     size="medium"><i class="iconfont icon-tool-add mr_8"></i>新增
          </el-button>
          <el-button @click="dialogImport=true"
                     class="btn-text-border"
                     type="text"
                     size="medium"><i class="iconfont icon-tool-export mr_8"></i>批量导入
          </el-button>
          <el-button v-if="!isEncryptField&&authorityIds.includes('129')"
                     @click="exportExcel"
                     class="btn-text-border"
                     type="text"
                     size="medium"><i class="iconfont icon-tool-export mr_8"></i>导出Excel
          </el-button>
        </div>
      </template> -->
      <!-- <div class="page-operation--right"
           v-else>
        <el-button @click="exportExcel"
                   class="btn-text-border"
                   type="text"
                   size="medium"><i class="iconfont icon-tool-export mr_8"></i>导出Excel
        </el-button>
      </div> -->
    </div>
    <ky-table :data="tableData"
              class="element-table"
              :pagination="pagination"
              :paginationVisible="true"
              @pagination-change="queryData"
              :height="tableHeight"
              ref="kyTable"
              v-loading="loading"
              @selection-change="selectedRows=$event"
              @row-click="handleRowClick">
      <el-table-column v-if="multiSelect"
                       type="selection"
                       width="32" />
      <el-table-column v-else
                       width="32"
                       fixed
                       :resizable="false">
        <template slot-scope="scope">
          <el-radio text-color="#606266"
                    v-model="selectedRows[0]"
                    :label="scope.row"><i></i></el-radio>
        </template>
      </el-table-column>
      <el-table-column fixed
                       label="操作"
                       :width="isInDialog?(!isEncryptField?200:200):240">
        <template slot-scope="scope">

          <el-button type="text"
                     @click.stop="updateCollectFlag(scope.row.id,false)"
                     class="btn-text-border"
                     v-if="scope.row.isCollect"> 取消常用</el-button>
          <el-button type="text"
                     @click.stop="updateCollectFlag(scope.row.id,true)"
                     class="btn-text-border"
                     v-else> 设为常用 </el-button>
          <el-button @click.stop="modifyAddress(scope.$index, scope.row)"
                     type="text"
                     class="btn-text-border">编辑</el-button>
          <el-button @click.stop="deleteAddress(scope.row.id)"
                     type="text"
                     class="btn-text-border">删除 </el-button>

          <template v-if="!isVipshop">
            <el-button v-if="scope.row.isEncrypt"
                       @click.stop="decrypt(scope.row)"
                       type="text"
                       class="btn-text-border">解密</el-button>
          </template>

        </template>
      </el-table-column>
      <el-table-column width="145"
                       min-width="10%"
                       :show-overflow-tooltip="true"
                       label="联系人">
        <template slot-scope="{row}">
          <div>
            <span class="ellipsis">{{row.contact}}</span>
            <span v-if="row.isCollect"
                  class="label--collect">常用</span>
          </div>
          <div>{{row.contactPhone}}</div>
        </template>
      </el-table-column>
      <el-table-column v-if="isVipshop"
                       prop="customerCode"
                       label="客户编码" />
      <el-table-column v-for="(col,index) in tableColumns.filter(f=>f.prop !== 'contact')"
                       :key="col.prop + index"
                       :show-overflow-tooltip="true"
                       :prop="col.prop"
                       :label="col.text"
                       :min-width="col.width+'px'">
        <template slot-scope="{row}">
          <!-- <span>{{ row['isEncrypt']? maskField(row[col.prop],col.prop): row[col.prop]}}</span> -->
          <div class="ellipsis">{{row.province||''}}{{row.city||''}}{{row.area||''}}</div>
          <div>{{row.detailAddress||'--'}}</div>
        </template>
      </el-table-column>
    </ky-table>
    <!--  新增修改  -->
    <dialog-add @refreshList="queryData"
                ref="dialogAddRef"
                :addressType="addressType" />
    <!--  批量导入  -->
    <dialog-import :visible="dialogImport"
                   @close="dialogImport=false"
                   :addressType="addressType"
                   @refreshList="queryData" />
    <encrypt-field-view :visible.sync="encryptFiledVisible"
                        :content="encryptContent"
                        menuText="地址簿"
                        ref="encryptFieldView"
                        @on-comfirm="handleEncryptResult" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { debounce } from 'lodash'
  import { getPhone, getCustomerCode, exportExcelByApi } from '@/views/vts/utils'
  import DialogAdd from "./dialog-add"
  import DialogImport from "./dialog-import"
  import { queryAddressBook, updateCollectFlag, deleteAddressList, queryVipshopInfo } from "@/services/api/vts"
  import dataMask from "@/views/vts/utils/dataMask"
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
        default: false,
      },
      multiSelect: {
        type: Boolean,
        default: true
      },
      tableHeight: {
        type: String,
        default: 'calc(100vh - 320px)'
      }
    },
    components: { DialogAdd, DialogImport, EncryptFieldView },
    data () {
      return {
        tableColumns: [
          { prop: "contact", text: "联系人", width: "90", visible: true },
          // { prop: "company", text: "公司名称", width: "90", visible: true },
          { prop: "address", text: "联系地址", width: "90", visible: true },
          // { prop: "contactPhone", text: "手机号", width: "90", visible: true },
          // { prop: "telephone", text: "固定电话", width: "90", visible: true },
          // { prop: "remark", text: "备注", width: "90", visible: true },
        ],
        tableData: [],
        pagination: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0,
        },
        selectedRows: [],
        loading: false,
        keyword: '',
        dialogImport: false,
        encryptFiledVisible: false,
        encryptContent: '',
        currentID: '',
      }
    },
    methods: {
      reset () {
        this.keyword = ''
        this.selectedRows = []
        this.pagination.pageIndex = 1
      },
      handleRowClick ($event) {
        if (this.multiSelect) {
          this.$refs.kyTable.toggleRowSelection($event)
        } else {
          this.selectedRows = [$event]
        }
      },
      requeryData: debounce(function() {
        this.pagination.pageIndex = 1
        this.queryData()
      }, 300),
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
        }
      },
      getSenderOrReceiverRequestParams () {
        const params = {
          phone: getPhone(),
          customerCode: this.authorityIds.includes('031') ? getCustomerCode() : "",
          addressType: this.addressType,
          page: this.pagination.pageIndex,
          pageSize: this.pagination.pageSize,
          keyword: this.keyword
        }
        return params
      },
      async getSenderOrReceiverData (params) {
        const res = await queryAddressBook(params)
        if (res.code === 0) {
          res.data.rows = res.data.rows.map(r =>
            Object.assign(r, {
              address: r.province + r.city + r.area + r.address,
              detailAddress: r.address
            })
          )
        }
        return res
      },
      async queryVipshopData () {
        const res = await queryVipshopInfo(this.keyword)
        if (res.code == 0) {
          this.tableData = res.data.result.map(r => ({
            contact: r.Contacts,
            company: r.customerName,
            customerCode: r.customerCode,
            address: r.address,
            contactPhone: r.Mobile,
            telephone: r.FixedTelephone,
            remark: r.Remark
          })
          )
        }
      },
      // 新增
      addAddress () {
        this.$refs.dialogAddRef.addForm()
      },
      // 修改
      modifyAddress (index, row) {
        this.$refs.dialogAddRef.modAddress({ index, row })
      },
      async deleteAddress (id, isBatchDelete) {
        this.loading = true
        let ids = [id]
        if (isBatchDelete) {
          ids = this.selectedRows.map(r => r.id)
        }
        try {
          const res = await deleteAddressList(this.addressType, ids)
          if (res.code === 0) {
            this.$message.success('删除成功')
            this.queryData()
          }
        } finally {
          this.loading = false
        }
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
        const addressTypeName = this.addressType === "20" ? '收方' : '寄方'
        const params = {
          requestFunc: this.getSenderOrReceiverData,
          params: this.getSenderOrReceiverRequestParams(),
          tableColumns: this.tableColumns,
          filename: `${addressTypeName}地址薄`
        }
        await exportExcelByApi(params)
      },
      async exportVipshopData () {
        const theadColumns = this.tableColumns.filter(c => c.visible).map((c) => c)
        const excel = await import('@utils/clientUtil')
        excel.exportExcel({
          theadColumns,
          jsonData: this.tableData,
          filename: '唯品会地址薄',
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

        }
        return newVal
      },
      decrypt (val) {
        this.encryptFiledVisible = true
        this.encryptContent = ''
        encryptFileds.forEach((m) => {
          this.encryptContent += `${this.tableColumns.find(el => el.prop === m).text}：${val[m]},`
        })

        this.currentID = val.id
      },
      handleEncryptResult () {
        this.tableData.forEach((el) => {
          if (el.id === this.currentID) {
            el.isEncrypt = false
          }
        })
      },
    },
    computed: {
      ...mapGetters(['authorityIds', 'isEncryptField']),
      isVipshop () {
        return !this.addressType
      },
    },
    watch: {
      keyword: {
        handler () {
          this.requeryData()
        },
        immediate: true
      }
    }
  }
</script>

<style lang="scss" scoped>
  .address-list-container {
    .search-condition-wrapper {
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f1f5;
      font-size: 14px;
      color: #333333;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .btn-add-top {
        float: right;
      }
      .search-box {
        display: flex;
        align-items: center;
        .k__input--searchreset {
          width: 264px;
          /deep/ .el-input__inner {
            background-color: #fff !important;
            border: 1px solid #d9d9d9 !important;
            height: 32px;
            padding-left: 10px !important;
            box-sizing: border-box;
          }
        }
        .search-btn {
          height: 32px;
          border-radius: 4px;
          padding: 7px 15px;
        }
      }
    }
    .label--collect {
      background: #fff1e9;
      color: #ff7f38;
      font-size: 9px;
      border-radius: 4px;
      padding: 2px 4px;
      margin-left: 4px;
      height: 14px;
      line-height: 14px;
      text-align: center;
    }
    .page-operation--right {
      margin-left: auto;
    }
    .ellipsis {
      font-weight: bold;
      color: #333333;
    }
    .btn-text-border {
      font-size: 14px;
    }
    /deep/ .el-tooltip {
      font-size: 14px;
      line-height: 18px;
      color: #666666;
    }
  }
</style>