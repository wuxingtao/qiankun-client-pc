<!-- 已弃用-->
<template>
  <div class="payment-table">
    <ky-table
      :tableColumns="tableColumns"
      :data="tableData"
      :pagination="pagination"
      height="calc(100vh - 272px)"
    >
      <el-table-column fixed type="index" width="50" label="序号" />
      <el-table-column fixed label="操作" width="150px">
        <template v-slot="{ row }">
          <el-button class="btn-text-border" type="text" size="small" @click="handleDelete(row)"
            >删除
          </el-button>
          <el-button class="btn-text-border" type="text" size="small" @click="handleEdit(row)"
            >编辑
          </el-button>
        </template>
      </el-table-column>
      <template v-slot:column_1="{ row, col }">
        <p class="item-content flex flex_ai_c">
          <span class="mr_12 ellipsis">{{ row[col.prop] }}</span>
          <user-label type="theme" class="user-label f_w_b">{{
            row.bindFlag === 1 ? '已绑码' : '未绑码'
          }}</user-label>
        </p>
      </template>
      <template v-slot:column_2="{ row, col }">
        <span>{{ row[col.prop] | phoneFormat }}</span>
      </template>
      <template v-slot:column_space="{ row, col }"> </template>
      <template v-slot:empty>
        <span>暂未查到符合条件的数据</span>
      </template>
    </ky-table>
  </div>
</template>

<script>
import { computed, defineComponent, reactive, toRefs } from '@vue/composition-api'
import { debounce } from 'lodash'
import Format from '@/utils/format'
import usePayment from '@views/permission-manage/hooks/usePayment'
import paymentApi from '@api/payment'

const tableColumns = [
  { prop: 'userName', text: '用户名', minWidth: '140', defaultSlot: 'column_1' },
  { prop: 'userMobile', text: '手机号', width: '120', defaultSlot: 'column_2' },
  { prop: 'remarks', text: '备注', minWidth: '200' }
]

export default defineComponent({
  name: 'payment-auth-table',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 1
        }
      }
    }
  },
  setup(props, { root, emit }) {
    const state = reactive({
      tableColumns
    })

    const { uam_payment_bindFlagName } = usePayment()

    const tableData = computed(() => {
      return props.data
    })

    function handleEdit(row) {
      emit('edit', row)
    }

    function handleDelete(row) {
      const { userName, userMobile } = row
      root.$kye_message.confirm(`确定删除副授权号${userName}吗？`).then(async () => {
        let res = await paymentApi.uam_payment_removeViceAuth(userMobile)
        if (res.code === 0) {
          emit('tableRefresh')
        }
      })
    }

    return { ...toRefs(state), tableData, handleEdit, handleDelete, uam_payment_bindFlagName }
  },
  components: {
    'user-label': () => import('@/views/permission-manage/components/user-label')
  },
  filters: {
    phoneFormat(val) {
      return Format.formatMobliePhone(val)
    }
  }
})
</script>

<style lang="scss" scoped>
/deep/ {
  .item-content {
    position: relative;
  }

  .pagination-style {
    display: none;
  }
}
</style>
