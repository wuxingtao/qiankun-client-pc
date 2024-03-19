<template>
  <div class="page__card page__card--top mb_8">
    <div class="user__box flex flex_ai_c">
      <div class="user__box-content flex flex_ai_c">
        <div class="user__avatar mr_14">
          <i class="iconfont iconavatar fs_18--strict" style="color: #9a8cd0"></i>
        </div>
        <div :class="['user__info', { 'user__info-noname': !!!data.userName }]">
          <div class="text mb_4">
            <div class="fs_16 c_666 f_w_b flex flex_ai_c">
              <span class="name mr_8 text-color-primary" v-show="data.userName">{{
                data.userName
              }}</span>
              <user-label v-if="adminLevel">{{ adminLevel }}</user-label>
              <user-label type="yellow" class="ml_8" v-if="paymentAccountName">{{
                paymentAccountName
              }}</user-label>
            </div>
          </div>
          <div class="mobile c_666">{{ phoneFormat }}</div>
        </div>
      </div>
      <div class="btn-lists">
        <el-button
          v-if="permission_role_button('getAuthDetail')"
          size="small"
          type="primary"
          @click="() => routerTo('permission-my-auth')"
          >查看我的权限</el-button
        >
        <el-button
          v-if="permission_role_button('mainTransfer')"
          size="small"
          class="btn-theme-border"
          @click="handleRoleTransfer"
          >主管理员转让</el-button
        >
        <el-button
          v-if="permission_role_button('uamUserPermissionLogSearch')"
          size="small"
          class="btn-theme-border"
          @click="() => routerTo('permission-operation-record')"
          >操作记录
        </el-button>
        <el-button
          v-if="permission_role_button('changeCustomerPassword')"
          size="small"
          class="btn-theme-border"
          @click="() => routerTo('permission-customer-pass')"
          >客户编码密码
        </el-button>
      </div>
    </div>
    <role-transfer ref="roleRef" @callback="roleTransferCallback" />
  </div>
</template>

<script>
import { defineComponent, reactive, ref, toRefs, computed, onMounted } from '@vue/composition-api'
import Format from '@utils/format'
import useUam from '@views/permission-manage/hooks/useUam'
import { mapGetters } from 'vuex'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'user-box',
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    'role-transfer': () => import('./role-transfer'),
    'user-label': () => import('../components/user-label')
  },
  setup(props, { emit }) {
    const state = reactive({})
    const roleRef = ref(null)
    const { uam_user_type, uam_is_normal, uam_is_owner } = useUam()
    const { permission_role_button } = usePermissionStore()

    // 普通用户
    const isNormal = computed(() => {
      return uam_is_normal(props.data.userExternalType)
    })

    const isSuper = computed(() => {
      return uam_is_owner(props.data.userExternalType)
    })

    const adminLevel = computed(() => {
      return uam_user_type(props.data.userExternalType)
    })

    const phoneFormat = computed(() => {
      return Format.formatMobliePhone(props.data.userTel)
    })

    /* 角色转让 */
    function handleRoleTransfer() {
      roleRef.value?.openDialog()
    }

    function roleTransferCallback() {
      emit('pageRefresh')
    }

    function routerTo(name) {
      this.$router.push({ name })
    }

    return {
      ...toRefs(state),
      roleRef,
      phoneFormat,
      adminLevel,
      isNormal,
      isSuper,
      routerTo,
      handleRoleTransfer,
      roleTransferCallback,
      permission_role_button
    }
  },
  computed: {
    ...mapGetters('permission', ['paymentAccountName'])
  }
})
</script>

<style lang="scss" scoped>
.page__card--top {
  padding: 20px;
}

.user__box {
  .user__avatar {
    background: #f1f0ff;
    border-radius: 8px;
    padding: 9px;
  }

  .user__info {
    margin-right: 36px;
    min-height: 36px;
    &-noname {
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      .text {
        margin-bottom: 0;
        margin-left: 10px;
      }
    }
  }

  .name {
    font-weight: bold;
  }
}
</style>
