<template>
  <div class="page__container" v-loading="loading">
    <el-tabs
      v-model="activeTabName"
      :class="['permission__tabs', !uam_payment_isManager && 'permission__tabs--single']"
    >
      <el-tab-pane label="通用权限管理" name="permission-index" v-if="permissionIsManager">
      </el-tab-pane>
      <el-tab-pane
        label="付款授权管理"
        name="payment-auth"
        v-if="paymentIsManager && show_payment_entry"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="permission-header-btn">
      <el-button
        class="btn-add-top btn-text-operation fs_12"
        type="text"
        size="mini"
        @click="handlePermissionHelp"
        v-if="checkFlag"
        ><i class="iconfont iconhelp mr_8"></i>帮助指引</el-button
      >
    </div>
    <keep-alive>
      <!--  传参仅付款授权使用    -->
      <component
        :is="activeTabName"
        :userData="userData"
        @pageRefresh="paymentRefresh"
        ref="asyncCompRef"
      ></component>
    </keep-alive>
    <permission-help-dialog :type="activeTabName" ref="permissionHelpRef" />
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
  computed,
  provide,
  watch,
  getCurrentInstance
} from '@vue/composition-api'
import { mapState, mapGetters } from 'vuex'
import usePayment from '@views/permission-manage/hooks/usePayment'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'
import { debounce } from 'lodash'

export default defineComponent({
  name: 'permission-lists',
  props: {},
  components: {
    'payment-auth': () => import('./payment-auth'),
    'permission-index': () => import('./permission-index/permission-index'),
    'permission-help-dialog': () => import('./components/permission-help-dialog')
  },
  setup(props, { root }) {
    const state = reactive({
      activeTabName: '',
      userData: {}, // 用户数据
      loading: false
    })

    const vm = getCurrentInstance()

    const asyncCompRef = ref(null)

    const permissionHelpRef = ref(null)

    const { uam_payment_api_user, uam_payment_isManager } = usePayment()
    const { checkFlag, auth_user_info } = usePermissionStore()

    provide('updateActiveTab', updateActiveTab)

    watch(
      () => state.activeTabName,
      val => {
        root.$store.dispatch('permission/update_tab_active', val)
      },
      { immediate: true }
    )

    onMounted(async () => {
      pageInit()
    })

    onActivated(async () => {
      pageInit()
      // indexPageRefresh()
    })

    const pageInit = debounce(async function() {
      await handleUser()
      await handleAuthButtonList()
    }, 200)

    function indexPageRefresh() {
      asyncCompRef.value?.pageRefresh()
    }

    // 付款授权刷新页面
    async function paymentRefresh() {
      state.activeTabName = 'permission-index'
    }

    // 帮助指引弹窗
    function handlePermissionHelp() {
      permissionHelpRef.value.openDialog()
    }

    function updateActiveTab(name) {
      if (name) {
        state.activeTabName = name
      }
    }

    async function handleUser() {
      state.userData = await root.$store.dispatch('permission/get_common_user')
    }
    async function handleAuthButtonList() {
      await root.$store.dispatch('permission/update_button_list')
    }

    return {
      ...toRefs(state),
      asyncCompRef,
      permissionHelpRef,
      auth_user_info,
      uam_payment_isManager,
      checkFlag,
      paymentRefresh,
      handlePermissionHelp
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 刷新通用权限

      const activeTabNameCurrent =
        to.params.activeTabName ||
        vm.$store.state.permission.permission_tab_active ||
        'permission-index'
      const show_payment_entry = vm.$store.state.permission.show_payment_entry
      if (activeTabNameCurrent) {
        let activeName = ''
        switch (activeTabNameCurrent) {
          case 'permission-index':
            if (vm.permissionIsManager) {
              activeName = 'permission-index'
            } else if (vm.paymentIsManager && show_payment_entry) {
              activeName = 'payment-auth'
            } else {
              vm.$router.push('/admin/waybill-v3')
            }
            break
          case 'payment-auth':
            if (vm.paymentIsManager && show_payment_entry) {
              activeName = 'payment-auth'
            } else {
              if (vm.permissionIsManager) {
                activeName = 'permission-index'
              } else {
                vm.$router.push('/admin/waybill-v3')
                return
              }
            }
            break
        }
        vm.activeTabName = activeName
        vm.$store.dispatch('permission/update_tab_active', activeName)
      }
      if (to.params.pageRefresh) {
        vm.$refs.asyncCompRef?.pageRefresh && vm.$refs.asyncCompRef?.pageRefresh()
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    // 避免重复获取用户数据
    if (to.name === 'permission-user-auth') {
      localStorage.setItem('UAM_SELECT_USER_INFO', JSON.stringify(to.params))
    }
    next()
  },
  computed: {
    ...mapState('permission', ['show_payment_entry']),
    ...mapGetters('permission', ['permissionIsManager', 'paymentIsManager'])
  }
})
</script>

<style lang="scss" scoped>
@import './pageCard.scss';
@import './index.scss';
</style>
