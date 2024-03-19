<template>
  <div class="permission-search">
    <el-form
      class="permission-search__form query-form"
      :model="formData"
      label-position="right"
      ref="formRef"
    >
      <el-row :gutter="20">
        <!--        <el-col :span="5">-->
        <!--          <el-form-item label="角色类型" label-width="60px" prop="userExternalType">-->
        <!--            <el-select v-model="formData.userExternalType" size="small">-->
        <!--              <el-option-->
        <!--                v-for="(item, index) in roleTypes"-->
        <!--                :key="index"-->
        <!--                :label="item.label"-->
        <!--                :value="item.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </el-form-item>-->
        <!--        </el-col>-->
        <el-col :span="5" style="min-width: 292px">
          <el-form-item label="权限类型" label-width="60px" prop="type">
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
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="账号信息" label-width="60px" prop="accountInfo">
            <el-input
              size="small"
              placeholder="搜索手机号或姓名"
              v-model.trim="formData.accountInfo"
              v-parseSpace
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <div class="operation__button">
              <el-button size="small" type="primary" @click="handleQuery">查询</el-button>
              <el-button size="small" @click="handleReset">重置</el-button>
            </div>
          </el-form-item>
        </el-col>
        <div class="btn-group fl_right">
          <el-button
            v-if="permission_role_button('addUser')"
            class="btn-add-top btn-text-operation fs_12"
            type="text"
            size="mini"
            @click="handleAdd"
            ><i class="iconfont icon-tool-add mr_8"></i>新增账号
          </el-button>
        </div>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, ref } from '@vue/composition-api'
import { permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'permission-query',
  props: {
    authDetail: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      formData: {
        // userExternalType: '',
        type: '',
        accountInfo: ''
      },
      roleTypes: [
        {
          label: '全部',
          value: permissionLevel.ALL
        },
        // {
        //   label: '主管理员',
        //   value: permissionLevel.OWNER
        // },
        {
          label: '副管理员',
          value: permissionLevel.ADMIN
        },
        {
          label: '普通用户',
          value: permissionLevel.NORMAL
        }
      ],
      typeProps: {
        multiple: true,
        label: 'authName',
        value: 'permissionId',
        children: 'authInfos'
      }
    })

    const formRef = ref(null)
    const { permission_role_button } = usePermissionStore()

    function handleQuery() {
      emit('query', state.formData)
    }

    function handleAdd() {
      this.$router.push({ name: 'permission-user-add' })
    }

    function handleReset() {
      formRef.value?.resetFields()
    }

    return {
      ...toRefs(state),
      formRef,
      handleQuery,
      handleAdd,
      handleReset,
      permission_role_button
    }
  }
})
</script>

<style lang="scss" scoped>
.permission-search {
  margin-top: 6px;
  overflow-x: auto;

  &__form {
    min-width: 1040px;

    .el-row {
      max-width: 100%;

      .el-col {
        .el-select,
        .el-input,
        .el-cascader {
          width: 100%;
        }
      }
    }

    /deep/ {
      .el-col-5 {
        min-width: 250px;
        max-width: 290px;
      }

      .el-form-item__label,
      .el-form-item__content {
        height: 32px;
        line-height: 32px;
      }

      .el-cascader__tags .el-tag {
        max-width: 65%;
      }
      .el-form-item__label {
        line-height: 32px;
        padding-right: 8px;
      }
    }

    .el-form-item {
      margin-bottom: 16px;
    }
  }

  .btn-group {
    margin-right: -10px;
  }
}
</style>
<style lang="scss">
.popper-permission-type {
  .el-cascader-node.is-active {
    color: inherit !important;
  }
}
</style>
