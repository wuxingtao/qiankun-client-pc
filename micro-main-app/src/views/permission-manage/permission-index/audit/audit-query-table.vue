<template>
  <div class="audit-query-table__container" v-loading="loading">
    <audit-query :audit-status="auditStatus" ref="queryRef" @query="e=>handleQuery(e,true)"/>
    <audit-table :loading.sync="loading" :audit-status="auditStatus" ref="tableRef" />
  </div>
</template>

<script>
import { reactive, ref, toRefs } from '@vue/composition-api'
import AuditQuery from './audit-query'
import AuditTable from './audit-table'

export default {
  components:{
    AuditQuery,
    AuditTable
  },
  props:{
    //审核状态：待审批、已审批
    auditStatus:{
      type:String,
    }
  },
  setup () {
    const queryRef = ref(null)
    const tableRef = ref(null) 
    const state = reactive({
      loading:false
    })

    function init(){
      queryRef.value.loadAuditorList()
      handleQuery(queryRef.value.formDataCache)
    }

    async function handleQuery(queryForm,resetPage){
      if(resetPage){
        tableRef.value.pagination.pageIndex = 1
      }
      tableRef.value.queryTableData(queryForm)
    }

    return {
      queryRef,
      tableRef,
      ...toRefs(state),
      init,
      handleQuery
    }
  }
}
</script>

<style lang="scss" scoped>
</style>