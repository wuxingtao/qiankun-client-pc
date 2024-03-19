<template>
  <div class="audit__container">
    <div class="status__wrapper">
      <el-button :class="{'active':status==='auditing'}" size="mini" @click="status='auditing'">待审批{{formatCount(auditingCount)}}</el-button>
      <el-button :class="{'active':status==='audited'}" size="mini" @click="status='audited'">已审批{{formatCount(auditedCount)}}</el-button>
    </div>
    <audit-query-table v-show="status === 'auditing'" ref="auditingQueryTableRef" audit-status="auditing" />
    <audit-query-table v-show="status === 'audited'" ref="auditedQueryTableRef" audit-status="audited" />
  </div>
</template>

<script>
import { onMounted, watch, reactive, ref, toRefs, computed } from '@vue/composition-api'
import AuditQueryTable from './audit-query-table'
import * as permissionApi from '@api/permission'

export default {
  components:{
    AuditQueryTable
  },
  setup (props,{root}) {
    const auditingQueryTableRef = ref(null)
    const auditedQueryTableRef = ref(null)
    const state = reactive({
      status: 'auditing',
    })
    
    onMounted( async ()=>{
      await queryCounts()
      if(auditingCount.value < 0){
        return
      }
      auditingQueryTableRef.value?.init()
      auditedQueryTableRef.value?.init()
    })

    const auditingCount = computed(() => root.$store.state.permission.auditing_count)
    const auditedCount = computed(() => root.$store.state.permission.audited_count)

    watch(()=>state.status,val=>{
      const ref = val === 'auditing' ? auditingQueryTableRef : auditedQueryTableRef
      ref.value?.init()
    })

    async function queryCounts (){
      const res = await permissionApi.uam_getAuditCounts()
      if(res.code === 0){
        const parseCount = count => Number(count) || 0
        const {approvalPendingCount} = res.data
        root.$store.commit('permission/UPDATE_AUDITING_COUNT', parseCount(approvalPendingCount))
      }
    }

    const formatCount = count => count > 0 ? `(${count})` : ''

    return {
      ...toRefs(state),
      auditingQueryTableRef,
      auditedQueryTableRef,
      formatCount,
      auditingCount,
      auditedCount
    }
  }
}
</script>

<style lang="scss" scoped>
  .audit__container {
    .status__wrapper {
      .el-button {
        margin: 0;
        min-width: 90px;
        border-radius: 0;
        border-right: unset;

        &:first-child {
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
        &:last-child {
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          border-right: 1px solid #dcdfe6;
          &.active {
            border-right: 1px solid #9378fa;
          }
        }
        &.active {
          background: #8365f6;
          border-color: #9378fa;
          color: white;
          border-right: 1px solid #9378fa;
        }
        /deep/ span {
          font-weight: bold;
        }
      }
    }
  }
</style>