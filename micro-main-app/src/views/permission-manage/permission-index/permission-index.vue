<template>
  <div class="page__container" v-loading="loading">
    <div v-show="showUserPage">
      <user-box :data="userData" @pageRefresh="pageRefresh" />
      <el-tabs class="page__tabs" v-model="activeTabName" type="card">
        <el-tab-pane label="授权管理" name="tabAuth">
          <div :class="['page__card', isNormal ? 'page__card--normal' : 'page__card--lists']">
            <!--   管理员/副管理员  -->
            <template v-if="!isNormal">
              <permission-query :authDetail="authDetail" @query="handleQuery" />
              <permission-table
                :data="tableData"
                :userData="userData"
                :pagination="pagination"
                @pageChange="pageChange"
                @refreshCallback="handleListsRefresh"
                @setTableData="setTableData"
                :no-text="noText"
                ref="tableRef"
              />
            </template>
            <!--   普通用户     -->
            <template v-else>
              <my-auth class="home-auth" />
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane name="tabAudit" v-if="auditing_count >= 0">
          <el-badge
            slot="label"
            :value="auditing_count"
            :hidden="activeTabName === 'tabAudit' || auditing_count < 1"
            :max="99"
            class="audit-badge"
          >
            审批管理
          </el-badge>
          <audit ref="auditRef" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  onMounted,
  onActivated,
  watch,
  computed,
  getCurrentInstance,
  nextTick,
  inject
} from '@vue/composition-api'

import useUam from '../hooks/useUam'
import { uam_userSearch } from '@api/permission'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import usePayment from '@views/permission-manage/hooks/usePayment'
import { debounce } from 'lodash'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'permission-lists',
  props: {
    userData: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    'permission-query': () => import('./permission-query'),
    'permission-table': () => import('./permission-table'),
    'user-box': () => import('./user-box'),
    'my-auth': () => import('./my-auth'),
    audit: () => import('./audit/index')
  },
  setup(props, { root }) {
    const state = reactive({
      tableData: [],
      authDetail: [], // 用户权限详情
      // 筛选条件
      queryParams: {
        accountInfo: '',
        permissionIds: []
      },
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
      activeTabName: 'tabAuth',
      loading: false,
      showUserPage: false // 渲染展示用户列表/详情
    })
    const tableRef = ref(null)
    const auditRef = ref(null)

    const { uam_is_normal, uam_auth_edit } = useUam()
    const { get_search_type, uam_admin_update_num } = useUamUtil()
    const { uam_payment_isManager } = usePayment()
    const { auth_user_info } = usePermissionStore()

    const vm = getCurrentInstance()

    const updateActiveTab = inject('updateActiveTab')

    // 不再需要手动刷新，每次加载即刷新
    // watch(
    //   () => vm.proxy.$route.params,
    //   () => {
    //     if (vm.proxy.$route.name === 'permission-manage' && vm.proxy.$route?.params.needRefresh) {
    //       nextTick(() => {
    //         handleLists()
    //       })
    //     }
    //   },
    //   { immediate: true }
    // )

    // 普通用户
    const isNormal = computed(() => {
      return uam_is_normal(auth_user_info.value?.userExternalType)
    })
    const auditing_count = computed(() => root.$store.state.permission.auditing_count)
    const noText = computed(() => {
      const { accountInfo, permissionIds } = state.queryParams
      return accountInfo || permissionIds?.length > 0 ? '暂未查到符合条件的数据' : '暂无数据'
    })
    watch(
      () => props.userData?.id,
      val => {
        if (val) {
          nextTick(() => {
            setTimeout(() => {
              state.showUserPage = true
            }, 10)
          })
        }
      },
      { immediate: true }
    )
    watch(
      () => state.activeTabName,
      tab => {
        if (tab === 'tabAuth') {
          handleLists()
        } else {
          let auditTableRef = auditRef.value.auditingQueryTableRef
          if (auditRef.value.status === 'audited') {
            auditTableRef = auditRef.value.auditedQueryTableRef
          }
          auditTableRef.init()
        }
      }
    )

    watch(
      () => auditing_count.value,
      val => {
        // 不存在审批列表,返回授权管理
        if (val === -1 && state.activeTabName === 'tabAudit') {
          state.activeTabName = 'tabAuth'
        }
      }
    )

    // onMounted(async () => {
    //   await pageRefresh()
    // })

    // 刷新用于鉴权检查
    onActivated(async () => {
      await pageRefresh()
    })

    // 页面刷新
    async function pageRefresh() {
      state.loading = true
      try {
        if (!isNormal.value) {
          await handleLists()
          await handleAuth()
        } else if (uam_payment_isManager(props.userData.authorizer)) {
          updateActiveTab('payment-auth')
        } else {
          root.$router.push({ path: '/admin/waybill-v3' })
        }
      } finally {
        state.loading = false
      }
    }

    function handleQuery(query) {
      state.queryParams = Object.assign(state.queryParams, {
        ...query,
        permissionIds: get_search_type(query.type)
      })
      state.pagination.pageIndex = 1
      handleLists(state.queryParams)
    }

    function pageChange() {
      handleLists()
    }

    function handleListsRefresh(payload = {}) {
      const { query, orderByClauses } = payload
      state.queryParams.orderByClauses = orderByClauses
      nextTick(() => {
        handleLists()
      })
    }

    /**
     * query 查询条件
     * orderByClauses 排序条件
     * @type {DebouncedFunc<(function(*=, *=): Promise<void>)|*>}
     */
    const handleLists = debounce(async query => {
      console.log('1 :>> ', 1)
      const { pageIndex, pageSize } = state.pagination
      const { userExternalType = '', permissionIds = [], accountInfo = '', orderByClauses } =
        query || state.queryParams || {}
      const params = {
        userExternalType,
        permissionIds,
        page: pageIndex,
        pageSize,
        accountInfo,
        orderByClauses
      }
      if (!state.loading) {
        state.loading = true
      }
      try {
        let res = await uam_userSearch(params)
        if (res.code === 0 && res.data) {
          state.tableData = res.data.rows
          state.pagination = {
            pageIndex: res.data.page,
            pageSize: res.data.pageSize,
            totalCount: res.data.rowTotal
          }
          uam_admin_update_num(res.data.adminNumber)
        }
      } finally {
        state.loading = false
      }
    }, 200)

    // 获取用户可分配权限 3新增
    async function handleAuth() {
      state.authDetail = await uam_auth_edit(3, props.userData.id)
    }

    function setTableData({ row, index }) {
      Object.assign(state.tableData[index], row)
    }

    return {
      ...toRefs(state),
      auditing_count,
      tableRef,
      auditRef,
      isNormal,
      noText,
      handleQuery,
      handleLists,
      handleListsRefresh,
      pageChange,
      pageRefresh,
      setTableData
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../pageCard';
.page__card {
  padding-bottom: 0;
}
/* 首页普通用户 */
.home-auth {
  /deep/ {
    .router-back {
      pointer-events: none;
      margin-left: 0;

      .svg-icon {
        display: none;
      }
    }

    .page__content {
      padding: 20px 0 0 0;
    }
  }
}

.page__container {
  min-height: calc(100vh - 130px);
  .page__tabs {
    background-color: #fff;
    padding: 6px 20px;
    /deep/ {
      .el-tabs__header {
        margin-bottom: 12px;
      }
      .el-tabs__nav {
        border: unset;
        .el-tabs__item {
          height: 34px;
          line-height: 34px;
          background: #fafafa;
          border: 1px solid #e9e9e9;
          border-radius: 4px 4px 0px 0px;
          padding: 0 25px;
          &.is-active {
            font-weight: bold;
            background: unset;
            border-bottom-color: #fff;
          }
          .audit-badge {
            .el-badge__content {
              transform: scale(0.5);
              font-size: 22px;
              padding: 3px;
              top: -4px;
              right: -24px;
              min-width: 20px;
              border-radius: 50%;
            }
          }
        }
      }
    }
    .page__card {
      padding: 0;
    }
  }
}

.page__card--normal {
  min-height: calc(100vh - 236px);
}

.page__card--lists {
  padding-bottom: 4px;
}
</style>
