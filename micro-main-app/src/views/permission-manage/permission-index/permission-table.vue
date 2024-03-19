<template>
  <ky-table
    :tableColumns="tableColumns.filter(item => !item.hide)"
    :data="tableData"
    :pagination="pagination"
    @pagination-change="pageChange"
    @sort-change="sortChange"
    height="calc(100vh - 367px)"
    class="element-table"
    :noText="noText"
    ref="tableRef"
  >
    <el-table-column fixed type="index" :index="handleIndexCount" width="50" label="序号" />
    <!-- 通用权限操作   -->
    <el-table-column
      v-if="permission_tab_active === 'permission-index'"
      fixed
      label="操作"
      :width="isSuper ? '280' : '220'"
    >
      <template v-slot="{ row, $index }">
        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_btn.setAdmin && uam_is_admin(row.userExternalType)"
          @click="setAdmin(permissionLevel.NORMAL, row, $index)"
        >
          <span>移除副管理员</span>
        </el-button>
        <el-tooltip
          effect="light"
          :content="UamAdminLimitTip"
          :open-delay="500"
          :disabled="!(uam_is_normal(row.userExternalType) && !admin_add_available)"
          v-if="row.permission_btn.setAdmin && uam_is_normal(row.userExternalType)"
        >
          <div class="btn-text-border inline-block">
            <el-button
              class="btn-text-border"
              type="text"
              size="small"
              :disabled="uam_is_normal(row.userExternalType) && !admin_add_available"
              @click="setAdmin(permissionLevel.ADMIN, row, $index)"
            >
              <span>设为副管理员</span>
            </el-button>
          </div>
        </el-tooltip>

        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_btn.view"
          @click="toDetail(row, 1)"
          >查看
        </el-button>
        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_btn.edit"
          @click="toDetail(row, 2)"
          >编辑
        </el-button>
        <el-tooltip
          effect="light"
          :content="row.permission_btn.unbindDisableTip || unbindToolTip"
          :open-delay="500"
          :disabled="!row.permission_btn.unbindDisabled"
          v-if="row.permission_btn.unbind"
        >
          <div class="btn-text-border inline-block">
            <el-button
              class="btn-text-border"
              type="text"
              size="small"
              :disabled="row.permission_btn.unbindDisabled"
              @click="unBind(row)"
              >解绑
            </el-button>
          </div>
        </el-tooltip>
      </template>
    </el-table-column>
    <!-- 付款授权操作   -->
    <el-table-column
      v-else-if="permission_tab_active === 'payment-auth'"
      fixed
      label="操作"
      :width="paymentIsSuper ? '280' : '220'"
    >
      <template v-slot="{ row, $index }">
        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_payment_btn.setAdmin && uam_payment_isAdmin(row.authorizer)"
          @click="setAdminPayment(paymentAccountType.NORMAL_NEW, row, $index)"
        >
          <span>移除副授权号</span>
        </el-button>
        <el-tooltip
          effect="light"
          :content="UamPaymentLimitTip"
          :open-delay="500"
          :disabled="!(uam_payment_isNormal(row.authorizer) && !payment_add_available)"
          v-if="row.permission_payment_btn.setAdmin && uam_payment_isNormal(row.authorizer)"
        >
          <div class="btn-text-border inline-block">
            <el-button
              class="btn-text-border"
              type="text"
              size="small"
              :disabled="uam_payment_isNormal(row.authorizer) && !payment_add_available"
              @click="setAdminPayment(paymentAccountType.SECOND, row, $index)"
            >
              <span>设为副授权号</span>
            </el-button>
          </div>
        </el-tooltip>

        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_payment_btn.view"
          @click="toDetail(row, 1, 'payment-user-auth')"
          >查看
        </el-button>
        <el-button
          class="btn-text-border"
          type="text"
          size="small"
          v-if="row.permission_payment_btn.edit"
          @click="toDetail(row, 2, 'payment-user-auth')"
          >编辑
        </el-button>
        <el-tooltip
          effect="light"
          :content="row.permission_payment_btn.unbindDisableTip || unbindToolTipPayment"
          :open-delay="500"
          :disabled="!row.permission_payment_btn.unbindDisabled"
          v-if="row.permission_payment_btn.unbind"
        >
          <div class="btn-text-border inline-block">
            <el-button
              class="btn-text-border"
              type="text"
              size="small"
              :disabled="row.permission_payment_btn.unbindDisabled"
              @click="unBind(row)"
              >解绑
            </el-button>
          </div>
        </el-tooltip>
      </template>
    </el-table-column>
    <template v-slot:column_tel="{ row, col }">
      <span class="mr_4 theme-color cursor tel-number" @click="handleViewDetail(row)">{{
        row[col.prop]
      }}</span>
      <template v-if="permission_tab_active === 'permission-index'">
        <user-label
          v-if="row.userExternalType !== permissionLevel.NORMAL && row.userExternalTypeFormat"
          >{{ row['userExternalTypeFormat'] }}
        </user-label>
        <user-label type="yellow" v-if="row.authorizerFormat">{{
          row['authorizerFormat']
        }}</user-label>
      </template>
      <template v-else-if="permission_tab_active === 'payment-auth'">
        <user-label type="yellow" v-if="row.authorizerFormat">{{
          row['authorizerFormat']
        }}</user-label>
        <user-label v-if="row.userExternalTypeFormat"
          >{{ row['userExternalTypeFormat'] }}
        </user-label>
      </template>
    </template>
    <template v-slot:column_userName="{ row, col }">
      <span>{{ row[col.prop] || '-' }}</span>
    </template>
  </ky-table>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch, nextTick } from '@vue/composition-api'
import { debounce } from 'lodash'
import { mapState, mapGetters } from 'vuex'

import useUam from '@views/permission-manage/hooks/useUam'
import Format from '@utils/format'
import dayjs from 'dayjs'
import { permissionLevel, paymentAccountType } from '@views/permission-manage/enum/permissionEnum'
import { base64Str, permissionServe } from '@views/permission-manage/permissionUtil'
import usePayment from '@views/permission-manage/hooks/usePayment'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'
import useUamUser from '@views/permission-manage/hooks/useUamUser'

const tableColumns = [
  { prop: 'phoneFormat', text: '手机号', width: '260', defaultSlot: 'column_tel' },
  { prop: 'userName', text: '姓名', width: '120', defaultSlot: 'column_userName' },
  { prop: 'existPermissionsFormat', text: '权限详情', minWidth: '240' },
  {
    prop: 'updationDateAuthFormat',
    text: '操作时间',
    width: '140',
    timeStampFormatter: true,
    isSort: true
  }
]

export default defineComponent({
  name: 'permission-table',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    userData: {
      type: Object,
      default: () => {}
    },
    noText: {
      type: String,
      default: () => '暂未查到符合条件的数据'
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          pageIndex: 1,
          pageSize: 10
        }
      }
    }
  },
  components: {
    'user-label': () => import('../components/user-label')
  },
  setup(props, { emit, root }) {
    const state = reactive({
      tableColumns: tableColumns,
      loading: false
    })

    const {
      uam_user_type,
      uam_is_normal,
      uam_operation_btn,
      uam_payment_operation_btn,
      uam_is_owner,
      uam_is_admin,
      uam_unbind,
      uam_setAdmin
    } = useUam()

    const { uam_admin_add, uam_admin_reduce, uam_payment_add, uam_payment_reduce } = useUamUtil()

    const {
      admin_add_available,
      payment_add_available,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      uam_checkManager,
      uam_updateAdminVicesNumber
    } = useUamUser(root)

    const { uam_payment_accountName, uam_payment_isNormal, uam_payment_isAdmin } = usePayment()
    const { permission_tab_active } = usePermissionStore()
    const { checkFlag } = usePermissionStore()

    const isSuper = computed(() => {
      return uam_is_owner(props.userData?.userExternalType)
    })

    const tableData = computed(() => {
      return props.data.map(item => {
        return {
          ...item,
          phoneFormat: Format.formatMobliePhone(item.phone),
          userExternalTypeFormat: uam_user_type(item.userExternalType),
          authorizerFormat: uam_payment_accountName(item.authorizer),
          updationDateAuthFormat: item.updationDateAuth
            ? dayjs(item.updationDateAuth).format('YYYY-MM-DD HH:mm')
            : '',
          existPermissionsFormat: item.existPermissions ? item.existPermissions : '- -',
          permission_btn: uam_operation_btn(item),
          permission_payment_btn: uam_payment_operation_btn(item)
        }
      })
    })

    const handleIndexCount = computed(() => {
      return props.pagination?.pageSize * (props.pagination?.pageIndex - 1) + 1
    })

    const unbindToolTip = computed(() => {
      return permissionServe.uam_unbind_toolTip('20')
    })
    const unbindToolTipPayment = computed(() => {
      return permissionServe.uam_unbind_toolTip('10')
    })

    watch(
      () => checkFlag.value,
      val => {
        const columnIndex = state.tableColumns.findIndex(
          item => item.prop === 'existPermissionsFormat'
        )
        state.tableColumns[columnIndex].hide = !val
      },
      { immediate: true }
    )

    watch(
      () => tableData.value,
      () => {
        // 刷新管理员账户
        uam_checkManager()
      }
    )

    const pageChange = debounce(function() {
      emit('pageChange')
    }, 300)

    /**
     * 用户权限详情
     * @param row
     * @param type <1:view,2:edit>
     * @param routerName 路由名称
     */
    function toDetail(row, type, routerName) {
      const id = base64Str.btoa(row.id)
      const detailType = base64Str.btoa(type)
      const phone = base64Str.btoa(row.phone)

      root.$router.push({
        name: routerName || 'permission-user-auth',
        query: { id: id, detailType, phone },
        params: { userInfo: row }
      })
    }

    async function unBind(row) {
      await uam_unbind(root, row, () => {
        emit('refreshCallback')
      })
    }

    // 查看
    function handleViewDetail(row) {
      const routerName =
        permission_tab_active.value === 'permission-index'
          ? 'permission-user-auth'
          : 'payment-user-auth'
      toDetail(row, 1, routerName)
    }

    const h = root.$createElement

    async function setAdmin(userExternalType, row, index) {
      await uam_setAdmin(root, {
        userExternalType,
        row,
        index,
        removeCallback: async res => {
          if (res.code === 0) {
            // uam_admin_reduce(1)
            root.$message.success('移除成功')
            emit('setTableData', { row: { ...row, userExternalType }, index })
            await uam_updateAdminVicesNumber()
          }
        },
        addCallback: async res => {
          if (res.code === 0) {
            // uam_admin_add(1)
            root.$message.success('设置成功')
            emit('setTableData', { row: { ...row, userExternalType }, index })
            await uam_updateAdminVicesNumber()
          }
        }
      })
    }

    // 授权号设置
    async function setAdminPayment(authorizer, row, index) {
      await uam_setAdmin(root, {
        authorizer,
        row,
        index,
        removeCallback: async res => {
          if (res.code === 0) {
            // uam_payment_reduce(1)
            root.$message.success('移除成功')
            emit('setTableData', { row: { ...row, authorizer }, index })
            await uam_updateAdminVicesNumber()
          }
        },
        addCallback: async res => {
          if (res.code === 0) {
            // uam_payment_add(1)
            root.$message.success('设置成功')
            emit('setTableData', { row: { ...row, authorizer }, index })
            await uam_updateAdminVicesNumber()
          }
        }
      })
    }

    const func = reactive({
      sortChange(column) {
        const orderByClauses = []
        if (column.order) {
          orderByClauses.push({
            filedId: column.prop.replace(/Format/g, ''),
            orderByMode: column.order === 'ascending' ? 1 : 2
          })
        }

        emit('refreshCallback', {
          query: null,
          orderByClauses
        })
      }
    })

    return {
      ...toRefs(state),
      ...toRefs(func),
      permissionLevel,
      paymentAccountType,
      isSuper,
      tableData,
      pageChange,
      toDetail,
      handleViewDetail,
      setAdmin,
      setAdminPayment,
      unBind,
      handleIndexCount,
      admin_add_available,
      payment_add_available,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      unbindToolTip,
      unbindToolTipPayment,
      uam_is_normal,
      uam_is_admin,
      uam_payment_isNormal,
      uam_payment_isAdmin
    }
  },
  computed: {
    ...mapState('permission', ['permission_tab_active']),
    ...mapGetters('permission', ['paymentIsSuper'])
  }
})
</script>
<style lang="scss" scoped>
.tel-number {
  width: 90px;
  display: inline-block;
}
/deep/ {
  .el-table__cell {
    .level + .level {
      margin-left: 4px;
    }
  }
}
</style>
