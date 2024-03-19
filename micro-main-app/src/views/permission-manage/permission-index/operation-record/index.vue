<template>
  <div class="page__container" v-loading="loading">
    <router-back :title="title" :hasBorder="false" />
    <div class="page__content page__card flex flex_jc_b">
      <div class="right-side">
        <el-form :model="formData" label-position="right" class="query-form" ref="formRef">
          <el-row :gutter="16" type="flex">
            <el-col :span="7">
              <el-form-item label="操作日期" label-width="60px">
                <el-date-picker
                  v-model="formData.timeRange"
                  type="daterange"
                  span="4"
                  popper-class="date_picker"
                  size="small"
                  value-format="yyyy-MM-dd"
                  range-separator="至"
                  placeholder="选择日期时间"
                  :editable="false"
                  :clearable="false"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="操作人" label-width="50px">
                <!-- <el-input placeholder="搜索手机号或姓名" v-model.trim="formData.operatorName" size="small" clearable></el-input> -->
                <el-select
                  v-model="formData.operator"
                  filterable
                  clearable
                  remote
                  placeholder="搜索手机号或姓名"
                  :remote-method="e => queryUserList(e, '10')"
                  size="small"
                  value-key="id"
                >
                  <el-option
                    v-for="(item, index) in operatorOptions"
                    :key="index"
                    :label="item.label"
                    :value="item"
                  >
                    <div class="text" v-html="item.text"></div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="操作对象" label-width="60px">
                <!-- <el-autocomplete
                  popper-class="user-autocomplete"
                  v-model.trim="formData.userName"
                  :fetch-suggestions="queryUserList"
                  placeholder="搜索手机号或姓名"
                  size="small"
                  @select="handleSelectUser">
                  <template slot-scope="{ item }">
                    <div class="text" v-html="item.text"> </div>
                  </template>
                </el-autocomplete> -->
                <el-select
                  v-model="formData.operatedUser"
                  filterable
                  clearable
                  remote
                  placeholder="搜索手机号或姓名"
                  :remote-method="e => queryUserList(e, '20')"
                  size="small"
                  value-key="id"
                >
                  <el-option
                    v-for="(item, index) in operatedUserOptions"
                    :key="index"
                    :label="item.label"
                    :value="item"
                  >
                    <div class="text" v-html="item.text"></div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4" class="col-logType">
              <el-form-item label="操作类型" label-width="60px" prop="type">
                <el-cascader
                  v-model="formData.logType"
                  size="small"
                  placeholder="请选择操作类型"
                  :options="logTypeLists"
                  collapse-tags
                  transfer
                  ref="authTypeRef"
                  :props="typeProps"
                ></el-cascader>
              </el-form-item>
            </el-col>
            <div class="el-col">
              <el-form-item class="btn-group ml_10">
                <el-button type="primary" @click="handleSearch" size="small">查询</el-button>
                <el-button @click="resetSearchCondition" size="small">重置</el-button>
              </el-form-item>
            </div>
          </el-row>
        </el-form>
        <record-table
          :data="tableData"
          :pagination="pagination"
          tableHeight="calc(100vh - 246px)"
          @openDetail="openDetail"
          @pageChange="handleTableList"
          @sort-change="changeSort"
        />
      </div>
    </div>
    <record-detail ref="detailRef"></record-detail>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  watch,
  onMounted,
  onActivated
} from '@vue/composition-api'
import { uam_getLogTypes, uam_permissionLog, uam_userList } from '@api/permission'
import dayjs from 'dayjs'
import * as storageUtil from '@/utils/storage'
import useUam from '../../hooks/useUam'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'

export default defineComponent({
  name: 'permission-record',
  props: {},
  components: {
    'router-back': () => import('@views/permission-manage/components/router-back.vue'),
    'record-table': () => import('./record-table'),
    'record-detail': () => import('./record-detail')
  },
  setup() {
    const { uam_formatUsers } = useUam()
    const { get_search_type } = useUamUtil()
    const state = reactive({
      title: '操作记录',
      allUsers: [], //所有被操作人
      operatedUserOptions: [], //被操作人选项
      operatorOptions: [], //操作人选项
      formData: {
        timeRange: [
          dayjs()
            .subtract(30, 'day')
            .format('YYYY-MM-DD'),
          dayjs().format('YYYY-MM-DD')
        ],
        startTime: '',
        endTime: '',
        operatedUser: '',
        operator: '',
        logType: ''
      },
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
      tableData: [],
      sortOrder: 'descending',
      detailVisible: false,
      loading: false,
      // 操作类型列表
      logTypeLists: [],
      // 操作类型配置
      typeProps: {
        multiple: true,
        label: 'value',
        value: 'code',
        children: 'authInfos'
      }
    })

    const detailRef = ref(null)
    const { permission_tab_active } = usePermissionStore()

    onMounted(async () => {
      let res = await uam_userList({ owner: false, history: true })
      if (res.code === 0 && res.data) {
        state.allUsers = uam_formatUsers(res.data)
        state.operatedUserOptions = state.operatorOptions = state.allUsers
        state.formData.operator = state.allUsers.find(f => f.userTel === storageUtil.getPhone())
      }
      handleSearch()
      await handleLogTypeGet()
    })

    watch(
      () => state.formData.timeRange,
      val => {
        state.formData.startTime = val[0]
        state.formData.endTime = val[1]
      },
      { immediate: true }
    )

    function resetSearchCondition() {
      state.formData.timeRange = [
        dayjs()
          .subtract(30, 'day')
          .format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD')
      ]
      state.formData.operator = state.allUsers.find(f => f.userTel === storageUtil.getPhone())
      state.formData.operatedUser = ''
      state.formData.logType = ''
    }

    async function queryUserList(queryString, type) {
      let list = uam_formatUsers(state.allUsers, queryString)
      if (type === '10') {
        state.operatorOptions = list
      } else if (type === '20') {
        state.operatedUserOptions = list
      }
    }

    async function handleTableList() {
      state.loading = true
      try {
        const { pageIndex, pageSize } = state.pagination
        const { startTime, endTime, logType } = state.formData
        let params = {
          userId: state.formData.operatedUser?.id,
          operatorUserId: state.formData.operator?.id,
          startTime,
          endTime,
          page: pageIndex,
          pageSize,
          logType: get_search_type(logType) || [],
          orderByClauses: [
            {
              filedId: 'id',
              orderByMode: state.sortOrder === 'descending' ? 1 : 2
            }
          ]
        }
        let res = await uam_permissionLog(params)
        if (res.code === 0 && res.data) {
          state.tableData = res.data.rows
          Object.assign(state.pagination, {
            totalCount: res.data.rowTotal,
            pageIndex: res.data.page,
            pageSize: res.data.pageSize
          })
        }
      } finally {
        state.loading = false
      }
    }

    const changeSort = ({ order }) => {
      state.sortOrder = order
      handleTableList()
    }

    function handleSearch() {
      state.pagination.pageIndex = 1
      handleTableList()
    }

    // 打开详情
    function openDetail(row) {
      detailRef.value.openDrawer(row)
    }

    // 操作类型列表
    async function handleLogTypeGet() {
      state.formData.logType = []
      let res = await uam_getLogTypes()
      if (res.code === 0 && res.data) {
        const { authLogList, payAuthLogList } = res.data
        state.logTypeLists =
          permission_tab_active.value === 'payment-auth' ? payAuthLogList : authLogList
      }
    }

    return {
      ...toRefs(state),
      detailRef,
      handleSearch,
      handleTableList,
      openDetail,
      resetSearchCondition,
      queryUserList,
      changeSort
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'index';
</style>
