<!-- 权限管理-付款授权 -->
<template>
  <div class="page__container" v-loading="loading">
    <payment-user-box :data="userData" @pageRefresh="pageRefresh"></payment-user-box>
    <div class="page__card">
      <payment-query :authDetail="authDetail" @query="handleQuery" />
      <permission-table
        :data="tableData"
        :pagination="pagination"
        @pageChange="pageChange"
        @refreshCallback="handleListsRefresh"
        @setTableData="setTableData"
        :no-text="noText"
        ref="tableRef"
      />
    </div>
    <!--    <dialog-payment-add ref="paymentAddRef" @tableRefresh="handleTableList"></dialog-payment-add>-->
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  onActivated,
  computed,
  watch,
  nextTick
} from '@vue/composition-api'
import paymentApi from '@api/payment'
import useUam from '@views/permission-manage/hooks/useUam'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import { debounce } from 'lodash'

export default defineComponent({
  name: 'payment-auth',
  props: {
    userData: {
      type: Object,
      default: () => {}
    }
  },
  setup(props, { emit, root }) {
    const state = reactive({
      tableData: [],
      authDetail: [], // 用户权限详情
      queryParams: {
        accountInfo:'',
        permissionIds:[]
      }, // 筛选条件
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
      loading: false
    })

    const userRef = ref(null)
    const tableRef = ref(null)
    const paymentAddRef = ref(null)

    const { uam_auth_edit, uam_list_query } = useUam()
    const { get_search_type, uam_payment_update_num } = useUamUtil()

    const noText = computed(() => {
      const { accountInfo, permissionIds } = state.queryParams
      return accountInfo || permissionIds?.length > 0 ? '暂未查到符合条件的数据' : '暂无数据'
    })

    onActivated(async () => {
      await pageInit()
    })

    watch(
      () => props.userData?.id,
      () => {
        handleCustomerCheck()
      }
    )

    const h = root.$createElement

    function handleCustomerCheck() {
      if (!props.userData?.id) {
        return
      }
      if (!props.userData?.customerCode) {
        root.$kye_message
          .$message({
            message: h('div', null, [
              h('span', null, '该功能需绑定客户编码后才可操作，请先绑定客户编码，如有疑问请拨打'),
              h('span', { style: 'color: #FF8038' }, '95324')
            ]),
            confirmButtonText: '去绑定',
            showCancelButton: false,
            closeOnClickModal: false,
            type: 'warning'
          })
          .then(async () => {
            root.$router.push({ path: '/admin/user/cusCode' })
          })
      }
    }

    function pageChange() {
      handleLists()
    }

    function setTableData({ row, index }) {
      Object.assign(state.tableData[index], row)
    }

    const handleLists = debounce(async queryInfo => {
      if (!state.loading) {
        state.loading = true
      }
      try {
        const query = queryInfo || state.queryParams || {}
        let res = await uam_list_query(query, state.pagination)
        if (res.code === 0 && res.data) {
          state.tableData = res.data.rows
          state.pagination = {
            pageIndex: res.data.page,
            pageSize: res.data.pageSize,
            totalCount: res.data.rowTotal
          }
          uam_payment_update_num(res.data.vicesNumber)
        }
      } finally {
        state.loading = false
      }
    }, 200)

    // 新增副授权号
    function handleAdd() {
      paymentAddRef.value?.openDialog()
    }

    function handleEdit(row) {
      paymentAddRef.value?.openDialog(row)
    }

    async function pageInit() {
      await handleLists()
      await handleAuth()
    }

    async function handleAuth() {
      const id = root.$store.state.permission.auth_user_info.id
      state.authDetail = await uam_auth_edit(3, id)
    }

    function pageRefresh() {
      emit('pageRefresh')
    }

    function handleQuery(query) {
      state.queryParams = Object.assign(state.queryParams, {
        ...query,
        permissionIds: get_search_type(query.type)
      })
      state.pagination.pageIndex = 1
      handleLists(state.queryParams)
    }

    function handleListsRefresh(payload = {}) {
      const { query, orderByClauses } = payload
      state.queryParams.orderByClauses = orderByClauses
      nextTick(() => {
        handleLists()
      })
    }

    const func = reactive({})

    return {
      ...toRefs(state),
      ...toRefs(func),
      userRef,
      tableRef,
      paymentAddRef,
      noText,
      handleAdd,
      handleEdit,
      pageRefresh,
      handleQuery,
      pageChange,
      setTableData,
      handleListsRefresh
    }
  },
  components: {
    'payment-query': () => import('./components/payment-query/index'),
    'payment-user-box': () => import('./payment-user-box'),
    'permission-table': () => import('../permission-index/permission-table'),
    'dialog-payment-add': () => import('./dialog-payment-add')
  }
})
</script>

<style lang="scss" scoped>
@import '../pageCard.scss';
@import './index.scss';
.page__card {
  padding-bottom: 0;
}
</style>
