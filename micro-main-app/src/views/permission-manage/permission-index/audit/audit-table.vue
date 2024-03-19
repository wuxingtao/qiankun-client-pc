<template>
  <div>
    <ky-table :tableColumns="tableColumns" :data="tableData" :pagination="pagination" @pagination-change="pageChange" @sort-change='changeSort' height="calc(100vh - 397px)" class="audit-table__wrapper" noText="暂未查到符合条件的数据" ref="tableRef">
      <el-table-column fixed type="index" :index="handleIndexCount" width="50" label="序号" />
      <el-table-column fixed label="操作" width="190" v-if="auditStatus === 'auditing'">
        <template v-slot="{ row }">
          <el-button class="btn-text-border" type="text" size="small" @click="setAduitStatus(row, '10')">同意开通
          </el-button>
          <el-button class="btn-text-border" type="text" size="small" @click="setAduitStatus(row, '20')">拒绝开通
          </el-button>
        </template>
      </el-table-column>
      <template v-slot:column_reason="{ row, col }">
        <span>{{ row[col.prop] || '-' }}</span>
      </template>
      <template v-slot:column_apply="{ row, col }">
         <span>{{ formatMoblieName(row,'applyPhone',col.prop) }}</span>
      </template>
      <template v-slot:column_status="{ row }">
        <span :class="['col-status',row.status === '已同意'?'approval':'refuse']">{{ row.status }}</span>
      </template>
      <template v-slot:column_approvalUser='{ row, col }'>
        <span>{{ formatMoblieName(row,'approvalPhone',col.prop) }}</span>
      </template>
      <template v-slot:empty>
        <span>暂未查到符合条件的数据</span>
      </template>
    </ky-table>
    <audit-refuse-dialog ref="auditRefuseDialogRef" />
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, ref } from '@vue/composition-api'
import { debounce } from 'lodash'
import * as permissionApi from '@api/permission'
import Format from '@utils/format'
// import AuditRefuseDialog from './audit-refuse-dialog'
import dayjs from 'dayjs'

const tableColumns = [
  { prop: 'applyUser', text: '申请人/手机号', width: '160', defaultSlot: 'column_apply' },
  { prop: 'applyAuth', text: '申请权限', width: '120', },
  { prop: 'applyReason', text: '申请原因', minWidth: '240', defaultSlot: 'column_reason'},
  { prop: 'applyTime', text: '申请时间', width: '150', isSort: true },
  { prop: 'status', text: '审批状态', width: '90', visibleStatus: 'audited', defaultSlot: 'column_status' },
  { prop: 'approvalUser', text: '审批人/手机号', width: '100', visibleStatus: 'audited',defaultSlot:'column_approvalUser' },
  { prop: 'approvalOpinion', text: '拒绝原因', width: '140', visibleStatus: 'audited', defaultSlot: 'column_reason' },
  { prop: 'approvalDate', text: '审批时间', width: '150', isSort: true, visibleStatus: 'audited' },
]

export default defineComponent({
  props: {
    //审核状态：待审批、已审批
    auditStatus: {
      type: String,
    },
    loading:{
      type:Boolean
    }
  },
  components: {
    // AuditRefuseDialog
    'audit-refuse-dialog': () => import('./audit-refuse-dialog'),
  },
  setup (props, { emit, root }) {
    const auditRefuseDialogRef = ref(null)
    const state = reactive({
      queryForm:null,
      tableColumns: tableColumns.filter(f => !f.visibleStatus || f.visibleStatus === props.auditStatus),
      tableData: [],
      sortField: props.auditStatus === 'auditing' ? 'applyTime' : 'approvalDate',//排序字段
      sortOrder: 'descending',//排序顺序
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
    })
    const changeSort = ({ prop, order }) => {
      state.sortField = prop
      state.sortOrder = order
      queryTableData(state.queryForm)
    }
    
    const queryTableData = async queryForm => {
      if(root.$store.state.permission.auditing_count < 0){
        return
      }
      state.queryForm = queryForm
      const status = props.auditStatus === 'auditing' ? '30' : queryForm.auditedStatus
      const params = {
        status,
        startTime: '',
        endTime: '',
        applyUserId: queryForm.applicant?.id,
        pageIndex: state.pagination.pageIndex,
        pageSize: state.pagination.pageSize,
        sort: state.sortOrder === 'descending' ? '10' : '20', //10：倒序，20:升序
        sortField: state.sortField === 'applyTime' ? '10' : '20',  //10：申请时间，20:审批时间
      }
      if(queryForm.timeRange?.length === 2){
        params.startTime = dayjs(queryForm.timeRange[0]).format('YYYY-MM-DD 00:00:00')
        params.endTime = dayjs(queryForm.timeRange[1]).format('YYYY-MM-DD 23:59:59')
      }
      if (props.auditStatus === 'audited') {
        params.approvalUserId = queryForm.auditor?.id
      }
      try{
        emit('update:loading',true)
        const res = await permissionApi.uam_getAuditList(params)
        if (res.code === 0 ) {
          state.tableData = res.data?.rows.map(r => ({
            ...r,
            applyPhoneFormat: Format.formatMobliePhone(r.applyPhone),
            applyTime:dayjs(r.applyTime).format('YYYY-MM-DD HH:mm'),
            approvalDate:dayjs(r.approvalDate).format('YYYY-MM-DD HH:mm'),
          }))
          state.pagination.totalCount = res.data?.rowTotal
        }else{
          state.tableData = []
          state.pagination.pageIndex = 1
          state.pagination.totalCount = 0
          root.$message.error(res.msg)
        }
      }finally{
        emit('update:loading',false)
      }
      const method = `permission/UPDATE_${props.auditStatus.toUpperCase()}_COUNT`
      root.$store.commit(method,state.pagination.totalCount)
    }

    const handleIndexCount = computed(() => {
      return state.pagination.pageSize * (state.pagination.pageIndex - 1) + 1
    })

    const pageChange = ()=>{
      queryTableData(state.queryForm)
    }

    /**
     * 审批前验证操作
     * @param row
     * @param status <20:拒绝开通,10:同意开通>
     */
    async function setAduitStatusCheck (row, status) {
      const params = {
        id: row.id,
        status: (status).toString(),
        type: '10' // <10 效验 20 审批>
      }
      const res = await permissionApi.uam_setAuditStatus(params)
      if(res.code !== 0){
        root.$message(res.msg)
        // 已审批
        if(res.code === 500030){
          setAduitStatusCallback()
        }
      }
      return res
    }
    /**
           * 审批操作
           * @param row
           * @param status <20:拒绝开通,10:同意开通>
           */
    async function setAduitStatus (row, status) {
      let checkRes = await setAduitStatusCheck(row,status)
      if(checkRes.code !== 0){
        return
      }
      const applyUserText = row.applyPhoneFormat + (row.applyUser ? `(${row.applyUser})` : '')
      if (status === '10') {
        await this.$confirm(`确定同意<span style="color: #FF8038;">${applyUserText}</span>的开通权限申请吗？`, '开通提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          dangerouslyUseHTMLString: true
        })
        const params = {
          id: row.id,
          status:'10',
          type: '20' // <10 效验 20 审批>
        }
        const res = await permissionApi.uam_setAuditStatus(params)
        if(res.code === 0){
          root.$message.success(res.msg)
        }else{
          root.$message(res.msg)
        }

        if (res.code !== 0 && res.code !== 500030) {
          return
        }
      } else {
        const flag = await auditRefuseDialogRef.value.showDialog(row.id, applyUserText)
        if(!flag){
          return
        }
      }
      setAduitStatusCallback()
    }

    function setAduitStatusCallback(){
      if(state.tableData.length === 1 && state.pagination.pageIndex > 1){
        state.pagination.pageIndex = state.pagination.pageIndex - 1
      }
      queryTableData(state.queryForm)
    }

    function formatMoblieName(row, mobileField, nameField) {
      const name = row[nameField]
      const mobile = row[mobileField]
      const formatMobile = Format.formatMobliePhone(mobile)
      return name ? `${name}/${formatMobile}` : formatMobile
    }

    return {
      auditRefuseDialogRef,
      ...toRefs(state),
      changeSort,
      queryTableData,
      pageChange,
      setAduitStatus,
      handleIndexCount,
      formatMoblieName
    }
  }
})
</script>

<style lang="scss" scoped>
  .audit-table__wrapper {
    margin-top: 12px;
    /deep/ .el-table .el-table__body {
      .el-table__cell {
        .col-status {
          padding: 3px 4px;
          border-radius: 2px;
          &.approval {
            color: #41c381;
            background: #d9f4e6;
          }
          &.refuse {
            color: #ff3a4d;
            background: #ffd8db;
          }
        }
      }
    }
  }
</style>
