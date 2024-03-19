<template>
  <div class="payment-query">
    <div class="operation-label">授权管理</div>
    <div class="operation-box">
      <el-form class="payment-query__form" label-position="right" :model="formData" ref="formRef">
        <div v-if="checkFlag" class="mr_12">
          <el-form-item label="权限类型" label-width="66px" prop="type" style="min-width: 292px">
            <el-cascader
              v-model="formData.type"
              size="small"
              placeholder="请选择权限类型"
              :options="authDetail"
              collapse-tags
              transfer
              popper-class="popper-permission-type"
              ref="authTypeRef"
              :props="typeProps"
              style="width: 100%"
            ></el-cascader>
          </el-form-item>
        </div>
        <div>
          <el-form-item label="账号信息" label-width="64px" prop="accountInfo">
            <el-input
              size="small"
              placeholder="搜索手机号或姓名"
              v-model.trim="formData.accountInfo"
              clearable
              v-parseSpace
            ></el-input>
          </el-form-item>
        </div>
        <div>
          <el-form-item class="ml_12">
            <div class="operation__button">
              <el-button size="small" type="primary" @click="handleQuery">查询</el-button>
              <el-button size="small" @click="handleReset">重置</el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div class="btn-group">
        <el-button
          v-if="permission_role_button('addUser')"
          class="btn-add-top btn-text-operation fs_12"
          type="text"
          size="mini"
          @click="handleAdd"
          ><i class="iconfont icon-tool-add mr_8"></i>新增账号
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, toRefs, getCurrentInstance } from '@vue/composition-api'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'payment-query',
  props: {
    authDetail: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      formData: {
        type: '',
        accountInfo: ''
      },
      typeProps: {
        multiple: true,
        label: 'authName',
        value: 'permissionId',
        children: 'authInfos'
      }
    })

    const formRef = ref(null)

    const { proxy } = getCurrentInstance()
    const { checkFlag, permission_role_button } = usePermissionStore()

    const func = reactive({
      handleQuery() {
        emit('query', state.formData)
      },
      handleReset() {
        formRef.value?.resetFields()
      },
      handleAdd() {
        proxy.$root.$router.push({ name: 'payment-user-add' })
      }
    })

    return { ...toRefs(state), formRef, ...toRefs(func), checkFlag, permission_role_button }
  }
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
