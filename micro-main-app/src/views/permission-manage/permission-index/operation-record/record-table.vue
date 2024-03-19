<template>
  <div class="record-table">
    <ky-table
      :tableColumns="tableColumns"
      :data="tableData"
      :pagination="pagination"
      :height="tableHeight"
      @pagination-change="pageChange"
      @sort-change="e => $emit('sort-change', e)"
    >
      <el-table-column fixed type="index" :index="handleIndexCount" width="50" label="序号" />
      <template v-slot:column_1="{ row, col }">
        <p class="item-content ellipsis">
          <span v-html="row[col.prop] || '--'"></span>
          <!--          <span class="theme-color cursor item-detail-btn" @click="openDetail(row)">详情</span>-->
        </p>
      </template>
      <template v-slot:column_userName='{ row, col }'>
        <span>{{ formatMoblieName(row,'userPhone',col.prop) || '--' }}</span>
      </template>
       <template v-slot:column_2='{ row, col }'>
        <span>{{ formatMoblieName(row, 'operatorNumber', col.prop) || '--' }}</span>
      </template>
      <!-- <template v-slot:column_space='{ row }'>
        <p class="theme-color cursor" @click="openDetail(row)" v-if="/10|20/.test(row['type'])">详情</p>
      </template> -->
    </ky-table>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed } from '@vue/composition-api'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import Format from '@utils/format'

const tableColumns = [
  { prop: 'typeStr', text: '操作类型', width: '100' },
  { prop: 'contentFormat', text: '操作内容', minWidth: '200', defaultSlot: 'column_1' },
  // { prop: 'goDetail', text: ' ', width: '50', defaultSlot: 'column_space' },
  { prop: 'userName', text: '操作对象/手机号', width: '120', defaultSlot: 'column_userName' },
  { prop: 'operatorName', text: '操作人/手机号', width: '120', defaultSlot: 'column_2' },
  { prop: 'updationDateFormat', text: '操作时间', width: '140', isSort: true }
]

export default defineComponent({
  name: 'record-table',
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
          pageSize: 10
        }
      }
    },
    tableHeight: {
      type: String,
      default: () => ''
    }
  },
  setup(props, { root, emit }) {
    const state = reactive({
      tableColumns
    })

    const tableData = computed(() => {
      return props.data.map(item => {
        return {
          ...item,
          updationDateFormat: dayjs(item.updationDate).format('YYYY-MM-DD HH:mm') || '--',
          contentFormat: !item.content
            ? '--'
            : item.content
              .replace(new RegExp('(开通)', 'ig'), '<span style=\'color:#41C381\'>$1</span>')
              .replace(new RegExp('(被取消|删除)', 'ig'), '<span style=\'color:#FF3A4D\'>$1</span>')
        }
      })
    })

    const handleIndexCount = computed(() => {
      return props.pagination?.pageSize * (props.pagination?.pageIndex - 1) + 1
    })

    function openDetail(row) {
      emit('openDetail', row)
    }

    const pageChange = debounce(function () {
      emit('pageChange')
    }, 300)

    const formatMoblieName = (row, mobileField, nameField) => {
      const name = row[nameField]
      const mobile = row[mobileField]
      const formatMobile = Format.formatMobliePhone(mobile)
      return name ? `${name}/${formatMobile}` : formatMobile
    }

    return {
      ...toRefs(state),
      tableData,
      openDetail,
      pageChange,
      handleIndexCount,
      formatMoblieName
    }
  }
})
</script>

<style lang="scss" scoped>
/deep/ .el-table__header {
  thead th {
  }
}

/deep/ {
  .el-table__body-wrapper {
    .item-content {
      //padding-right: 30px;
      padding-right: 0;
      position: relative;

      .item-detail-btn {
        position: absolute;
        right: 0;
      }
    }
  }
}
</style>
