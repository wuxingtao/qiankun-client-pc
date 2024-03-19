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
              <user-label class="f_w_b" type="yellow">{{ accountPlus.accountLevel }} </user-label>
              <user-label class="ml_8" v-if="permissionAccountName">{{
                permissionAccountName
              }}</user-label>
            </div>
          </div>
          <div class="mobile c_666">{{ data.userTel | phoneFormat }}</div>
        </div>
      </div>
      <div class="btn-lists">
        <el-button
          v-if="permission_role_button('getAuthDetail') && checkFlag"
          size="small"
          type="primary"
          @click="() => routerTo('payment-my-auth')"
          >查看我的权限</el-button
        >
        <el-button
          v-if="permission_role_button('transferPrima')"
          size="small"
          class="btn-theme-border"
          @click="handleTransfer"
          >主授权号转让</el-button
        >
        <el-button
          v-if="permission_role_button('uamUserPermissionLogSearch')"
          size="small"
          class="btn-theme-border"
          @click="() => routerTo('payment-operation-record')"
          >操作记录
        </el-button>
      </div>
    </div>
    <payment-transfer @callback="handleTransferCallback" ref="transferRef" />
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, computed } from '@vue/composition-api'
import usePayment from '@views/permission-manage/hooks/usePayment'
import Format from '@/utils/format'
import { mapGetters } from 'vuex'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'payment-user-box',
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const state = reactive({})
    const transferRef = ref(null)

    const { uam_payment_accountPlus } = usePayment()
    const { checkFlag, permission_role_button } = usePermissionStore()

    const accountPlus = computed(() => {
      return uam_payment_accountPlus(props.data?.authorizer) || {}
    })

    function handleTransfer() {
      transferRef.value?.openDialog()
    }

    function handleTransferCallback() {
      emit('pageRefresh')
    }

    const func = reactive({
      routerTo(name) {
        this.$router.push({ name })
      }
    })

    return {
      ...toRefs(state),
      ...toRefs(func),
      transferRef,
      accountPlus,
      checkFlag,
      permission_role_button,
      handleTransfer,
      handleTransferCallback
    }
  },
  components: {
    'user-label': () => import('@/views/permission-manage/components/user-label'),
    'payment-transfer': () => import('./payment-transfer')
  },
  filters: {
    phoneFormat(val) {
      return Format.formatMobliePhone(val)
    }
  },
  computed: {
    ...mapGetters('permission', ['permissionAccountName', 'paymentIsSuper'])
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
    margin-right: 26px;
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
