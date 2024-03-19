<template>
  <div class='auth-table' v-loading='loading'>
    <div class='auth-seach'>
      <el-form :inline='true' class='demo-form-inline' ref='ruleForm' :model='formData' :rules="rules">
        <el-form-item label='搜索' prop="keyword">
          <el-input maxlength="20" v-model='formData.keyword' clearable size='small' placeholder='请输入关键字'></el-input>
        </el-form-item>
        <el-form-item :label="listType===50?'申请日期':'操作日期'">
          <el-date-picker v-model='formData.operationDate' popper-class='date_picker' size='small' type='daterange' style='width:242px;' :clearable='false'></el-date-picker>
        </el-form-item>
        <el-form-item label='付款方式'>
          <el-select size='small' v-model='formData.payWay' style='width:100px;'>
            <el-option label='全部' :value='99'></el-option>
            <el-option label='收方付' :value='10'></el-option>
            <el-option label='第三方付' :value='20'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label='授权状态' v-if='listType===40||listType===50'>
          <el-select size='small' v-model='formData.authStatus' style='width:100px;'>
            <el-option label='全部' :value='99'></el-option>
            <el-option label='待审批' :value='10' v-if="listType===50"></el-option>
            <el-option label='已授权' :value='20'></el-option>
            <el-option label='已拒绝' :value='30'></el-option>
            <el-option label='已解除' :value='40'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label='申请来源' v-if='listType===40||listType===50'>
          <el-select size='small' v-model='formData.applicationType' style='width:100px;'>
            <el-option label='全部' :value='99'></el-option>
            <el-option label='授权申请' :value='10'></el-option>
            <el-option label='运单申请' :value='20'></el-option>
            <el-option label='给他人授权' :value='30' v-if="listType===40"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type='primary' size='small' @click='search'>查询</el-button>
          <el-button size='small' @click='reset'>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <ky-table :tableColumns='tableColumns' :data='tableData' :pagination='pagination' @row-dblclick='dblclick' @size-change='sizeChange' @pagination-change='pageChange' ref='multipleTable' :height="tableHeight">
      <el-table-column fixed label='操作' width='150'>
        <template v-slot='{ row }'>
          <el-button v-if='listType===10' type='text' size='small' class='btn-text-border' @click='showAgreeRef(row)'>
            同意
          </el-button>
          <el-button v-if='listType===10' type='text' size='small' class='btn-text-border' @click='showRejectRef(row)'>
            拒绝
          </el-button>
          <el-button v-if="Number(row['authStatus'])===20&&listType!=50&&Number(row['authLevel']!==10)" type='text' size='small' class='btn-text-border' @click="relieveAuth(row['id'])">
            解除授权
          </el-button>
          <el-button v-if="(Number(row['authStatus'])===40||Number(row['authStatus'])===30)&&Number(row['applicationType'])===10&&listType===50" type='text' size='small' class='btn-text-border' @click="applyAgain(row)">
            再次申请
          </el-button>
          <el-button v-if="(Number(row['authStatus'])===40||Number(row['authStatus'])===30)&&Number(row['applicationType'])===30&&listType===40" type='text' size='small' class='btn-text-border' @click="authAgain(row.id)">
            再次授权
          </el-button>
        </template>
      </el-table-column>
      <template v-slot:column_applicationType='{ row, col }'>
        <span>{{ row[col.prop]|formatApplicationType }}</span>
        <span class="show-waybill-count" v-if="Number(row[col.prop])===20&&row['waybillCount']">共{{ row['waybillCount']
          }}票</span>
      </template>
      <template v-slot:column_authStatus='{ row, col }'>
        <span :class="setAuthStatusClass( row[col.prop])">{{ getAuthStatusName(row[col.prop]) }}</span>
      </template>
      <template v-slot:column_payType='{ row, col }'>
        <span>{{ row[col.prop] | formatPayType }}</span>
      </template>
    </ky-table>

    <agree-authorized ref='agreeRef' @success='search'></agree-authorized>
    <reject-authorized ref='rejectRef' @success='search'></reject-authorized>
    <authorized-detail ref='detailRef' @success='search'></authorized-detail>
    <authorized-apply-detail ref='applyDetailRef' @success='search'></authorized-apply-detail>
    <authorized-others-apply ref="authorizedRef" @success='search'></authorized-others-apply>
    <authorized-others-apply-detail ref="othersApplyDetailRef" @success='search'></authorized-others-apply-detail>
    <authorized-apply ref='applyRef' @success='search'></authorized-apply>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import tableConfigs from '../config/table'
import paymentApi from '@/services/api/payment-authorization'
import AgreeAuthorized from './agree-authorized'
import RejectAuthorized from './reject-authorized'
import AuthorizedDetail from './authorized-detail'
import AuthorizedApplyDetail from './authorized-apply-detail'
import AuthorizedOthersApply from './authorized-others-apply'
import AuthorizedOthersApplyDetail from './authorized-others-apply-detail'
import AuthorizedApply from './authorized-apply'
import { cloneDeep } from 'lodash'

export default {
  name: 'authorized-table',
  props: {
    listType: {
      type: Number,
      require: true
    },
  },
  components: {
    AgreeAuthorized,
    RejectAuthorized,
    AuthorizedDetail,
    AuthorizedApplyDetail,
    AuthorizedOthersApply,
    AuthorizedOthersApplyDetail,
    AuthorizedApply
  },
  data () {
    return {
      formData: {
        payWay: 99,
        operationDate: [dayjs().add(-1, 'M'), dayjs()],
        keyword: '',
        applicationType: 99,
        authStatus: 99
      },
      // tableColumns: tableConfigs,
      loading: false,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        pageSizes: [10, 30, 50]
      },
      rules: {
        keyword: [
          { min: 2, max: 20, message: '请输入2到20个字进行搜索', trigger: 'blur' }
        ],
      },
      viewHeight: (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    tableColumns () {
      const arr = cloneDeep(tableConfigs)
      arr.forEach(el => {
        if (el.prop === 'examineDate') {
          el.visible = this.listType === 40
        }
      })

      return arr
    },
    tableHeight () {
      const tempHeight = this.listType === 50 ? 246 : 288
      // this.tableHeight = `calc(100vh - ${tempHeight}px)`
      return this.viewHeight - tempHeight
    }
  },
  created () {
    this.$nextTick(() => {
      this.search()
    })
  },
  mounted () {
    window.onresize = () => {
      this.viewHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
    }
  },
  methods: {
    reset () {
      this.formData.keyword = '',
      this.formData.operationDate = [dayjs().add(-1, 'M'), dayjs()],
      this.formData.payWay = 99,
      this.formData.applicationType = 99,
      this.formData.authStatus = 99
    },
    search (iSTurnPages) {
      console.log(iSTurnPages, 'iSTurnPages')
      this.$refs['ruleForm'].validate(async valid => {
        if (valid) {
          try {
            this.loading = true
            let searchInfo = {
              keyword: this.formData.keyword,
              startDate: dayjs(this.formData.operationDate[0]).format(
                'YYYY-MM-DD 00:00:00'
              ),
              endDate: dayjs(this.formData.operationDate[1]).format(
                'YYYY-MM-DD 23:59:59'
              ),
              payTypeList: this.getPayTypeList()
            }
            if (this.listType === 40 || this.listType === 50) {
              let tempInfo = {
                applicationTypeList: this.getApplicationTypeList(),
                authStatusList: this.getAuthStatusList()
              }
              searchInfo = Object.assign(searchInfo, tempInfo)
            }
            this.pagination.pageIndex = iSTurnPages === 'turnPages' ? this.pagination.pageIndex : 1
            let params = {
              page: this.pagination.pageIndex,
              pageSize: this.pagination.pageSize,
              listType: this.listType,
              searchInfo: searchInfo
            }

            let res = await paymentApi.getPayAuthorizeList(params)
            if (res.code === 0 && res.data) {
              this.tableData = res.data.rows || []
              this.pagination.totalCount = res.data.rowTotal
            }

          } finally {
            this.loading = false
            this.$refs.multipleTable.doLayout()
          }
        }
      })
    },
    getPayTypeList () {
      let payTypeList = [this.formData.payWay]
      if (this.formData.payWay === 99) {
        payTypeList = [10, 20]
      }
      return payTypeList
    },
    getApplicationTypeList () {
      let tempList = [this.formData.applicationType]
      if (this.formData.applicationType === 99) {
        if (this.listType === 50) {
          tempList = [10, 20]
        } else {
          tempList = [10, 20, 30]
        }

      }
      return tempList
    },
    getAuthStatusList () {
      let tempList = [this.formData.authStatus]
      if (this.formData.authStatus === 99) {
        tempList = [40, 20, 30]
        if (this.listType === 50) {
          tempList.push(10)
        }
      }
      return tempList
    },
    async showAgreeRef (row) {
      let model = await this.getDetailInfo(row)
      this.$nextTick(() => {
        this.$refs.agreeRef.showDrawer(row, model)
      })

    },
    showRejectRef (row) {
      this.$refs.rejectRef.showDialog(row)
    },
    relieveAuth (id) {
      this.$kye_message.confirm('解除付款授权后，客户将无法使用您的账号付款，您确定要继续解除吗？', '', {
        type: 'warning'
      }).then(async () => {
        let params = {
          authId: id
        }
        let res = await paymentApi.cancelAuth(params)
        if (res.code === 0) {
          this.$message.success('解除成功')
          this.search()
        }
      })
    },
    async dblclick (row) { 
      try{
        this.loading=true
        let model = await this.getDetailInfo(row)
        if (this.listType === 50) {
          this.$refs.applyDetailRef.showDrawer(row,model)
        } else if (row.applicationType === 30) { //
          this.$refs.othersApplyDetailRef.showDrawer(row,model)
        } else {
          this.$refs.detailRef.showDrawer(row,model)
        }
      }finally{
        this.loading=false
      }
     

    },
    authAgain (id) {
      console.log(id, 'id')
      this.$refs.authorizedRef.showDrawer(id)
    },
    pageChange (pagination) {
      // 翻页
      console.log(pagination, 'pagination')
      this.pagination.pageIndex = pagination.pageIndex
      this.search('turnPages')
    },
    sizeChange (pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.pageIndex = 1 //页码改变，重置为第一页
      this.search()
    },
    applyAgain (row) {
      this.$refs.applyRef.showDrawer(row)
    },
    setAuthStatusClass (val) {
      let class_name = ''
      switch (val) {
        case 10:
          class_name = 'column_authStatus_10'
          break
        case 20:
          class_name = 'column_authStatus_20'
          break
        case 30:
          class_name = 'column_authStatus_30'
          break
        case 40:
          class_name = 'column_authStatus_40'
          break
      }
      return class_name
    },
    getAuthStatusName (val) {
      let name = ''
      switch (val) {
        case 10:
          name = this.listType === 50 ? '待审批' : '待授权'
          break
        case 20:
          name = '已授权'
          break
        case 30:
          name = '已拒绝'
          break
        case 40:
          name = '已解除'
          break
      }
      return name
    },
    async getDetailInfo (row) {
      try {
        this.loading = true
        let params = {
          authId: row.id
        }
        if (row.authStatus === 10) {
          params.type = 1
        }
        let res = await paymentApi.getPayAuthDetail(params)
        if (res.code === 0 && res.data) {
          return res.data
          // if (this.model.authStatus === 10) {
          //   this.applicationRange = this.model.authLeveleDetailList[0].authLevel
          // }

        } else {
          return {}
        }
      } finally {
        this.loading = false
      }

    },
  },
  filters: {
    formatAuthStatus: val => {
      let name = ''
      console.log(this, '1111')
      switch (val) {
        case 10:
          name = this.listType === 50 ? '待审批' : '待授权'
          break
        case 20:
          name = '已授权'
          break
        case 30:
          name = '已拒绝'
          break
        case 40:
          name = '已解除'
          break
      }
      return name
    },
    formatApplicationType (val) {
      let name = ''
      switch (val) {
        case 10:
          name = '授权申请'
          break
        case 20:
          name = '运单申请'
          break
        case 30:
          name = '给他人授权'
          break
      }
      return name
    },
    formatPayType (val) {
      let name = ''
      switch (val) {
        case 10:
          name = '收方付'
          break
        case 20:
          name = '第三方付'
          break
      }
      return name
    }
  }
}
</script>

<style lang='scss' scoped>
  /deep/ {
    @include loading;
  }

  .column_authStatus_10 {
    background: #f0edff;
    color: #8365f6;
    height: 20px;
    border-radius: 2px;
    padding: 4px 8px;
  }

  .column_authStatus_20 {
    background: #d9f4e6;
    color: #41c381;
    height: 20px;
    border-radius: 2px;
    padding: 4px 8px;
  }

  .column_authStatus_30 {
    background: #ffe6e3;
    color: #ff7374;
    height: 20px;
    border-radius: 2px;
    padding: 4px 8px;
  }

  .column_authStatus_40 {
    background: #d5daed;
    color: #697394;
    height: 20px;
    border-radius: 2px;
    padding: 4px 8px;
  }

  .show-waybill-count {
    padding: 0 6px;
    margin-left: 16px;
    height: 14px;
    font-size: 9px;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: 500;
    text-align: left;
    color: #fe743c;
    line-height: 14px;
    background: #fff1e9;
    border-radius: 2px;
  }
</style>