<template>
  <div class="audit-query__container">
    <el-form class="search-conditon--form" :model="formData" label-position="right" ref="formRef">
      <el-form-item label="申请时间" label-width="64px">
        <el-date-picker v-model="formData.timeRange" type="daterange" span="4" popper-class="date_picker" size="small" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" :editable="false" :clearable="auditStatus === 'auditing'">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-show="auditStatus === 'audited'" label="审批状态" label-width="64px" prop="auditStatus">
        <el-select v-model="formData.auditedStatus" size="small">
          <el-option v-for="(item, index) in auditedStatuList" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请人" label-width="51px" prop="applicant">
        <!-- <el-input size="small" placeholder="搜索手机号或姓名" v-model.trim="formData.applicant" clearable></el-input> -->
        <el-select v-model="formData.applicant" filterable clearable remote placeholder="搜索手机号或姓名" :remote-method="e=>queryUserList(e,'10')" size="small" value-key="id">
          <el-option v-for="(item,index) in applicantOptions" :key="index" :label="item.label" :value="item">
            <div class="text" v-html="item.text"> </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="auditStatus === 'audited'" label="审批人" label-width="51px" prop="auditor">
        <!-- <el-input size="small" placeholder="搜索手机号或姓名" v-model.trim="formData.auditor" clearable></el-input> -->
        <el-select v-model="formData.auditor" filterable clearable remote placeholder="搜索手机号或姓名" :remote-method="e=>queryUserList(e,'20')" size="small" value-key="id">
          <el-option v-for="(item,index) in auditorOptions" :key="index" :label="item.label" :value="item">
            <div class="text" v-html="item.text"> </div>
          </el-option>
        </el-select>
      </el-form-item>
      <div class="conditon-form--btns">
        <el-button size="small" type="primary" @click="query">查询</el-button>
        <el-button size="small" @click="reset">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { reactive, toRefs, ref, onMounted } from '@vue/composition-api'
import dayjs from 'dayjs'
import * as permissionApi from '@api/permission'
import useUam from '../../hooks/useUam'

export default {
  props: {
    //审核状态：待审批、已审批
    auditStatus: {
      type: String,
      default: 'auditing'
    }
  },
  setup (props, { emit }) {
    const formRef = ref(null)
    const state = reactive({
      auditedStatuList: [
        { label: '全部', value: '100' },
        { label: '已同意', value: '10' },
        { label: '已拒绝', value: '20' }],
      allApplicants: [],
      allAuditors: [],
      applicantOptions: [],
      auditorOptions: [],
      formDataCache:{},
      formData: {
        timeRange: [],
        auditedStatus: '100',
        applicant: '',
        auditor: '',
      }
    })
    const { uam_formatUsers } = useUam()

    onMounted(async () => {
      resetFormData()
    })

    async function loadAuditorList(){
      let res = await permissionApi.uam_userList({ owner: false, history:true })
      if (res.code === 0 && res.data) {
        state.allAuditors = state.auditorOptions = uam_formatUsers(res.data)
        state.allApplicants = state.applicantOptions = state.allAuditors
      }
    }

    async function queryUserList (queryString, type) {
      if (type === '10') {
        state.applicantOptions = uam_formatUsers(state.allApplicants, queryString)
      } else if (type === '20') {
        state.auditorOptions = uam_formatUsers(state.allAuditors, queryString)
      }
    }
    function resetFormData () {
      let timeRange = []
      if(props.auditStatus === 'audited'){
        timeRange = [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      }
      state.formData.timeRange = timeRange
      state.formData.auditedStatus = '100'
      Object.assign(state.formDataCache,state.formData)
    }

    function reset () {
      resetFormData()
      formRef.value?.resetFields()
    }
    function query () {
      Object.assign(state.formDataCache,state.formData)
      emit('query', state.formData)
    }
    return {
      formRef,
      ...toRefs(state),
      reset,
      query,
      loadAuditorList,
      queryUserList
    }
  }
}
</script>

<style lang="scss" scoped>
  .audit-query__container {
    margin-top: 12px;
    .search-conditon--form {
      display: flex;
      /deep/ .el-form-item {
        &:not(:first-child) {
          margin-left: 12px;
        }
        margin-bottom: 0;
        .el-form-item__label {
          line-height: 33px;
        }
        .el-date-editor {
          width: 222px;
        }
        .el-select,
        .el-input {
          width: 154px;
        }
      }

      .conditon-form--btns {
        display: flex;
        margin-left: 12px;
      }
    }
  }
</style>
