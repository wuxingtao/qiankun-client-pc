<!-- 用户权限详情查看，编辑 -->
<template>
  <div :class="['page-container', `page-type-${type}`]" v-loading="loading">
    <router-back
      userAuth
      :title="type === 2 ? '账户编辑' : '账户详情'"
      :routerParam="routerParam"
      :has-border="false"
      :triggerFun="type === 2 ? backTrigger : null"
    />
    <div :class="['page__content pd_20', `page-type--${type}`]">
      <!--  查看    -->
      <template v-if="type === 1">
        <div class="selection-box">
          <ky-ui-label class="fs_14" title="个人信息" />
          <div class="selection-box__content">
            <el-row :gutter="30" class="user-info user-info-view">
              <el-col :span="6" style="min-width: 310px; max-width: 320px">
                <div class="user-info-item">
                  <span class="label">手机号码：</span>
                  <span class="value">{{ userInfo.phoneFormat }}</span>
                  <div class="inline-block">
                    <div :class="[permission_tab_active === 'payment-auth' ? 'row-reverse' : '']">
                      <user-label
                        class="ml_8"
                        v-if="userInfo.userExternalType !== permissionLevel.NORMAL"
                      >
                        {{ uam_user_type(userInfo.userExternalType) }}
                      </user-label>
                      <user-label
                        class="ml_8"
                        type="yellow"
                        v-if="!uam_payment_isNormal(userInfo.authorizer)"
                        >{{ uam_payment_accountName(userInfo.authorizer) }}</user-label
                      >
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="4" v-show="userInfo.userName">
                <div class="user-info-item" v-show="userInfo.userName">
                  <span class="label">姓名：</span
                  ><span class="value">{{ userInfo.userName }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="user-info-item">
                  <span class="label">操作时间：</span>
                  <span class="value">{{ userInfo.updationDateAuth | dateTimeHMFormat }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="user-info-item flex_1">
                  <span class="label">备注：</span
                  ><span class="value ellipsis" style="width: calc(100% - 40px)">{{
                    userInfo.remark || '--'
                  }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="selection-box" v-if="checkFlag">
          <ky-ui-label class="fs_14" title="已开通权限" />
          <auth-view :data="data" />
        </div>
        <div class="edit-btn-group" v-if="has_edit_permission">
          <el-button size="small" type="primary" @click="handleEdit">编辑</el-button>
          <template v-if="permission_tab_active === 'permission-index'">
            <el-tooltip
              effect="light"
              :content="unbindToolTip"
              :open-delay="500"
              :disabled="!userRow.permission_btn.unbindDisabled"
              v-if="userRow.permission_btn.unbind"
            >
              <div class="inline-block">
                <el-button
                  size="small"
                  @click="handleUnBind"
                  :disabled="userRow.permission_btn.unbindDisabled"
                  >解绑</el-button
                >
              </div>
              >
            </el-tooltip>
          </template>
          <template v-else-if="permission_tab_active === 'payment-auth'">
            <el-tooltip
              effect="light"
              :content="unbindToolTip"
              :open-delay="500"
              :disabled="!userRow.permission_payment_btn.unbindDisabled"
              v-if="userRow.permission_payment_btn.unbind"
            >
              <div class="inline-block">
                <el-button
                  size="small"
                  @click="handleUnBind"
                  :disabled="userRow.permission_payment_btn.unbindDisabled"
                  >解绑</el-button
                >
              </div>
              >
            </el-tooltip>
          </template>
        </div>
      </template>
      <!--  编辑    -->
      <template v-else-if="type === 2">
        <div class="selection-box page-style1">
          <ky-ui-label class="fs_14" title="个人信息" :required="false" />
          <div class="selection-box__content">
            <el-form :model="userInfo" ref="formRef">
              <el-row :gutter="30" class="user-info-row flex">
                <el-col :span="8" style="max-width: 350px">
                  <el-form-item label="手机号码" prop="phone">
                    <el-input
                      size="small"
                      v-model="userInfo.phoneFormat"
                      :maxlength="11"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6" v-show="userInfo.userName">
                  <div class="user-info-item">
                    <el-form-item label="姓名">
                      <el-input
                        size="small"
                        v-model="userInfo.userName"
                        placeholder="请填写姓名"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </div>
                </el-col>
                <template v-if="permission_tab_active === 'permission-index'">
                  <el-col :span="4" style="max-width: 134px" v-if="isSuper">
                    <el-form-item label=" " class="label--hide mt_14">
                      <div class="user-info-item">
                        <el-tooltip
                          effect="light"
                          :content="UamAdminLimitTip"
                          :open-delay="500"
                          :disabled="admin_add_able"
                        >
                          <el-checkbox v-model="checkAdmin" :disabled="!admin_add_able"
                            >设为副管理员
                          </el-checkbox>
                        </el-tooltip>
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
                <template v-else-if="permission_tab_active === 'payment-auth'">
                  <el-col :span="4" style="max-width: 134px" v-if="isSuperPayment">
                    <el-form-item label=" " class="label--hide mt_14">
                      <div class="user-info-item">
                        <el-tooltip
                          effect="light"
                          :content="UamPaymentLimitTip"
                          :open-delay="500"
                          :disabled="payment_add_able"
                        >
                          <el-checkbox v-model="checkAdmin" :disabled="!payment_add_able"
                            >设为副授权号
                          </el-checkbox>
                        </el-tooltip>
                      </div>
                    </el-form-item>
                  </el-col>
                </template>
                <el-col :span="5" class="flex_1">
                  <el-form-item label="备注">
                    <el-input
                      v-model="userInfo.remark"
                      size="small"
                      placeholder="请填写"
                      show-word-limit
                      maxlength="40"
                      clearable
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>
        <div class="selection-box" v-if="checkFlag">
          <ky-ui-label class="fs_14" title="选择权限" :required="false" />
          <auth-edit
            :data="editData"
            :checkPayment="checkAdmin && permission_tab_active === 'payment-auth'"
          />
        </div>
      </template>
    </div>
    <div class="page__footer footer admin-footer" v-if="type === 2">
      <div class="btn-group">
        <el-button size="small" class="el-button--normal" @click="handleClose">取消</el-button>
        <el-button type="primary" size="small" class="el-button--normal" @click="handleSubmit"
          >确定
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  onMounted,
  watch,
  computed,
  onActivated
} from '@vue/composition-api'
import { KyUiLabel } from '@comps/ky-ui'
import useUam from '@views/permission-manage/hooks/useUam'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import { uam_api_userInfoByAdd, uam_permissionAuth } from '@api/permission'
import { paymentAccountType, permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import {
  dateTimeHM,
  base64Str,
  permissionServe,
  permissionIsEqual
} from '@views/permission-manage/permissionUtil'
import usePayment from '@views/permission-manage/hooks/usePayment'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'
import useUamUser from '@views/permission-manage/hooks/useUamUser'

export default defineComponent({
  name: 'user-auth',
  props: {},
  components: {
    'router-back': () => import('@views/permission-manage/components/router-back.vue'),
    'auth-view': () => import('@views/permission-manage/components/auth-view.vue'),
    'auth-edit': () => import('@views/permission-manage/components/auth-edit.vue'),
    'user-label': () => import('@views/permission-manage/components/user-label.vue'),
    KyUiLabel
  },
  setup(props, { root }) {
    const initialData = {
      routerParam: {
        needRefresh: false
      },
      data: [],
      editData: [],
      userInfo: {},
      userRow: {
        permission_btn: {},
        permission_payment_btn: {}
      }, //列表数据
      type: 1, // <1 view,2 edit>
      typeFirst: 1, // 初始进入类型
      checkAdmin: false, // 设为副管理员
      loading: false
    }
    const oldData = reactive({
      checkAdmin: false,
      permissionIds: [],
      remark: ''
    })
    const state = reactive(initialData)
    const vm = getCurrentInstance()
    const {
      uam_auth_edit,
      uam_admin_set,
      uam_is_normal,
      uam_current_owner,
      uam_current_user,
      uam_is_admin,
      uam_unbind,
      uam_user_type,
      uam_setAdmin
    } = useUam()
    const {
      get_auth_request,
      edit_auth_format,
      view_auth_filter,
      select_default_auth
    } = useUamUtil()

    const { checkFlag } = usePermissionStore(root)

    const { uam_payment_accountName, uam_payment_isNormal, uam_payment_isAdmin } = usePayment()

    const {
      admin_add_available,
      payment_add_available,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      uam_updateAdminVicesNumber
    } = useUamUser(root)

    const { disable_dynamic_update } = useUamUtil()

    const permission_tab_active = computed(() => {
      return root.$store.state.permission.permission_tab_active
    })

    // 监听是否勾选副副授权号
    watch(
      () => state.checkAdmin,
      val => {
        updateRoleDefaultSelect()
        updateDynamicDisable()
      }
    )

    onActivated(() => {
      state.routerParam.needRefresh = false

      pageInit()
    })

    onMounted(() => {
      pageInit()
    })

    const auth_user_info = computed(() => {
      return uam_current_user()
    })

    // 详情用户-普通用户
    const is_normal = computed(() => {
      if (permission_tab_active.value === 'payment-auth') {
        return uam_payment_isNormal(state.userInfo.authorizer)
      }
      return uam_is_normal(state.userInfo.userExternalType)
    })

    // 当前用户-超管
    const isSuper = computed(() => {
      return uam_current_owner()
    })
    const isSuperPayment = computed(() => {
      return root.$store.getters['permission/paymentIsSuper']
    })

    const has_edit_permission = computed(() => {
      if (permission_tab_active.value === 'payment-auth') {
        return (
          isSuperPayment.value ||
          (uam_payment_isAdmin(auth_user_info.value.authorizer) && is_normal.value)
        )
      }
      return (
        isSuper.value || (uam_is_admin(auth_user_info.value.userExternalType) && is_normal.value)
      )
    })

    const admin_add_able = computed(() => {
      return uam_is_admin(state.userInfo.userExternalType) || admin_add_available.value
    })

    const payment_add_able = computed(() => {
      return uam_payment_isAdmin(state.userInfo.authorizer) || payment_add_available.value
    })

    const unbindToolTip = computed(() => {
      if (permission_tab_active.value === 'payment-auth') {
        return (
          state.userRow.permission_payment_btn.unbindDisableTip ||
          permissionServe.uam_unbind_toolTip('10')
        )
      }
      return (
        state.userRow.permission_btn.unbindDisableTip || permissionServe.uam_unbind_toolTip('20')
      )
    })

    const initData = () => {
      Object.assign(state, initialData)
      uam_updateAdminVicesNumber()
    }

    function pageInit() {
      initData()
      const id = vm.proxy.$route?.query.id
      const type = vm.proxy.$route.query.detailType
      if (id) {
        getAuth(vm.proxy.$route.query.id, type)
      }
      state.typeFirst = Number(base64Str.atob(type))
      updateUserInfo()
    }

    // 更新动态禁用
    function updateDynamicDisable() {
      if (permission_tab_active.value === 'payment-auth') {
        state.editData = disable_dynamic_update(state.editData, !!!state.checkAdmin, state.userRow)
      }
    }
    // 更新角色默认选中 (只在手动勾选不勾选副授权号/副管理触发)
    function updateRoleDefaultSelect() {
      state.editData = select_default_auth(state.editData, state.checkAdmin)
    }

    // 获取权限详情 <参数已加密>
    async function getAuth(id, type = '') {
      state.loading = true
      try {
        id = Number(base64Str.atob(id))
        type = Number(base64Str.atob(type))
        let result = await uam_auth_edit(type, id)
        state.type = type
        switch (type) {
          case 1:
            state.data = view_auth_filter(result)
            break
          case 2:
            state.editData = edit_auth_format(result)
            if (permission_tab_active.value === 'payment-auth') {
              state.checkAdmin = uam_payment_isAdmin(state.userInfo.authorizer)
            } else {
              state.checkAdmin = uam_is_admin(state.userInfo.userExternalType)
            }
            // 初始化disableNotice 角色禁用
            updateDynamicDisable()
            // 旧数据选中
            oldData.permissionIds = getAuthCurrentSort()
            break
          default:
            state.data = result
            break
        }
      } finally {
        state.loading = false
      }
    }

    function getParams() {
      return vm.proxy.$route.params.hasOwnProperty('userInfo')
        ? vm.proxy.$route.params
        : JSON.parse(localStorage.getItem('UAM_SELECT_USER_INFO')) || {}
    }

    async function saveAuth() {
      let params = {
        userIds: [state.userInfo.id],
        authRequest: getAuthCurrent()
      }
      let res = await uam_permissionAuth(params)
      if (res.code === 0) {
        state.routerParam.needRefresh = true
      }
      return res
    }

    /**
     * 自动对账true 提交编辑接口
     * 自动对账为false 不提交编辑权限接口
     * @returns {Promise<void>}
     */
    async function modifyFn() {
      // let res = await Promise.all([setAdminConfirm(), saveAuth()])
      let setRes = await setAdminConfirm()
      if (setRes.code === 0) {
        if (checkFlag.value) {
          let res = await saveAuth()
          if (res.code === 0) {
            modifyFnCallback()
          }
        } else {
          modifyFnCallback()
        }
      }
    }
    function modifyFnCallback() {
      root.$message.success('保存成功')
      handleClose()
    }

    function getAuthCurrent() {
      return get_auth_request(state.editData)
    }

    function getAuthCurrentSort() {
      return getAuthCurrent()
        .map(item => item.permissionId)
        .sort()
    }

    const h = root.$createElement

    async function setAdminConfirm() {
      return new Promise(async (resolve, reject) => {
        const userExternalType = state.checkAdmin ? permissionLevel.ADMIN : permissionLevel.NORMAL
        const authorizer = state.checkAdmin
          ? paymentAccountType.SECOND
          : paymentAccountType.NORMAL_NEW
        const params = {
          row: { ...state.userInfo },
          remark: state.userInfo.remark
        }
        if (permission_tab_active.value === 'payment-auth') {
          params.authorizer = authorizer
        } else {
          params.userExternalType = userExternalType
        }
        await manager_set(params, resolve, reject)
      })
    }

    async function manager_set(
      { userExternalType, authorizer, row, remark, index },
      resolve,
      reject
    ) {
      await uam_setAdmin(root, {
        userExternalType,
        authorizer,
        row,
        remark,
        index,
        removeCallback: res => {
          state.routerParam.needRefresh = true
          resolve(res)
        },
        addCallback: res => {
          state.routerParam.needRefresh = true
          resolve(res)
        },
        catchCallback: () => {
          state.checkAdmin = true
          reject('err')
        }
      })
    }

    async function handleSubmit() {
      state.loading = true
      try {
        await modifyFn()
      } finally {
        state.loading = false
      }
    }

    function handleUnBind() {
      uam_unbind(root, state.userInfo, () => {
        state.routerParam.needRefresh = true
        handleClose()
      })
    }

    function handleEdit() {
      const type = base64Str.btoa(2)
      getAuth(vm.proxy.$route.query.id, type)
    }

    // TODO 返回上一页
    function handleClose() {
      // 从查看进入编辑，返回查看
      if (state.typeFirst === 1 && state.type === 2) {
        state.type = 1
      } else {
        root.$router.push({
          name: 'permission-manage',
          params: { ...state.routerParam, activeTabName: permission_tab_active.value }
        })
      }
    }

    async function updateUserInfo() {
      state.userRow = getParams().userInfo

      const phone = Number(base64Str.atob(vm.proxy.$route?.query.phone))
      let res = await uam_api_userInfoByAdd({ phone: phone, searchType: 10, hideErrMsg: true })
      if (res.code === 0 && res.data) {
        state.userInfo = {
          ...res.data,
          userId: res.data.id,
          phone,
          phoneFormat: state.userRow.phoneFormat,
          remark: ''
        }

        // 备注字段
        const { remarkPayAuth, remarkAuth } = res.data.uamUserRole || {}
        state.userInfo.remark =
          (permission_tab_active.value === 'payment-auth' ? remarkPayAuth : remarkAuth) || ''

        // 旧数据-备注
        oldData.remark = state.userInfo.remark
      } else {
        state.userInfo = {}
      }
    }

    // 返回事件
    function backTrigger() {
      return new Promise((resolve, reject) => {
        if (!!!this.isEqualCheck()) {
          root.$kye_message
            .$message({
              message: h('div', null, [
                h('span', { class: 'font-regular' }, '您有更改信息未保存，是否要保存？')
              ]),
              type: '',
              title: '温馨提示',
              confirmButtonText: '保存',
              cancelButtonText: '不保存',
              closeOnClickModal: false,
              closeOnPressEscape: false,
              customClass: 'message-box__info'
            })
            .then(async () => {
              await modifyFn()
              pageInit()
              reject(false)
            })
            .catch(res => {
              // 从查看进入处理
              if (state.typeFirst === 1) {
                reject(false)
                pageInit()
              } else {
                // 编辑页处理
                switch (typeof res) {
                  case 'string':
                    resolve(true)
                    break
                  case 'object':
                    if (!res.valid) {
                      reject(false)
                    } else {
                      reject(true)
                    }
                    break
                }
              }
            })
        } else {
          if (state.typeFirst === 1) {
            reject(false)
            pageInit()
          } else {
            resolve(true)
          }
        }
      })
    }

    const func = reactive({
      uam_user_type,
      uam_payment_accountName,
      uam_payment_isNormal,
      isEqualCheck() {
        const data = {
          permissionIds: getAuthCurrentSort(),
          remark: state.userInfo.remark,
          checkAdmin: state.checkAdmin
        }
        const old_data = {
          permissionIds: [...oldData.permissionIds],
          remark: oldData.remark,
          checkAdmin:
            (permission_tab_active.value === 'permission-index' &&
              permissionServe.uam_is_admin(state.userInfo.userExternalType)) ||
            (permission_tab_active.value === 'payment-auth' &&
              permissionServe.uam_payment_isAdmin(state.userInfo.authorizer))
        }
        return permissionIsEqual(data, old_data)
      }
    })

    return {
      ...toRefs(state),
      ...toRefs(func),
      is_normal,
      isSuper,
      isSuperPayment,
      has_edit_permission,
      permission_tab_active,
      permissionLevel,
      unbindToolTip,
      getAuth,
      getAuthCurrent,
      handleSubmit,
      handleClose,
      handleUnBind,
      handleEdit,
      backTrigger,
      admin_add_available,
      payment_add_available,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      admin_add_able,
      payment_add_able,
      checkFlag
    }
  },
  filters: {
    dateTimeHMFormat(val) {
      return dateTimeHM(val)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~@assets/scss/footer.scss';
@import './index.scss';
</style>
