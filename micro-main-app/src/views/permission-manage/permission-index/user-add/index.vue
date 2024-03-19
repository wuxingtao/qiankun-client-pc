<template>
  <div class="page-container" v-loading="loading">
    <router-back :title="title" :routerParam="routerParam" :triggerFun="backTrigger" />
    <div class="page__content ptb_16 plr_20">
      <ky-ui-tip type="plain" class="c_03050d mb_12 ptb_0--strict"
        >用于对未绑码用户进行客户编码绑定，授权成功将绑定生效。
      </ky-ui-tip>

      <div class="selection-box page-style1 mb_20">
        <ky-ui-label class="fs_14" title="账号信息" />
        <el-form :model="formData" ref="formRef">
          <el-row :gutter="30" class="user-info-row flex">
            <el-col :span="8" style="max-width: 350px">
              <el-form-item label="手机号码" prop="phone" :rules="phoneRule" :error="errorPhone">
                <el-input
                  v-model="formData.phone"
                  placeholder="请填写未绑定客户编码手机号"
                  @blur="handlePhoneBlur"
                  @focus="handlePhoneFocus"
                  :maxlength="11"
                  clearable
                  v-parseSpace
                ></el-input>
                <ky-ui-bubble
                  :msg="warningPhone"
                  v-if="!errorPhone && warningPhone"
                  ref="phoneTipRef"
                />
              </el-form-item>
            </el-col>
            <!-- 管理员/副授权号设置 start  -->
            <template v-if="permission_tab_active === 'permission-index'">
              <el-col
                v-if="permission_role_button('setRoleType')"
                :span="4"
                style="max-width: 134px"
              >
                <el-form-item label="设为副管理员" class="label--hide">
                  <div class="user-info-item">
                    <el-tooltip
                      effect="light"
                      :content="UamAdminLimitTip"
                      :open-delay="500"
                      :disabled="admin_add_able"
                    >
                      <el-checkbox v-model="checkAdmin" :disabled="!admin_add_able || !showAuth"
                        >设为副管理员
                      </el-checkbox>
                    </el-tooltip>
                  </div>
                </el-form-item>
              </el-col>
            </template>
            <template v-else-if="permission_tab_active === 'payment-auth'">
              <el-col
                v-if="permission_role_button('setRoleType')"
                :span="4"
                style="max-width: 134px"
              >
                <el-form-item label="设为副授权号" class="label--hide">
                  <div class="user-info-item">
                    <el-tooltip
                      effect="light"
                      :content="UamPaymentLimitTip"
                      :open-delay="500"
                      :disabled="payment_add_able"
                    >
                      <el-checkbox v-model="checkAdmin" :disabled="!payment_add_able || !showAuth"
                        >设为副授权号
                      </el-checkbox>
                    </el-tooltip>
                  </div>
                </el-form-item>
              </el-col>
            </template>

            <!-- 管理员/副授权号设置 end  -->
            <el-col :span="6" v-show="userInfo.userName">
              <el-form-item label="姓名">
                <el-input v-model="userInfo.userName" placeholder="请填写姓名" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="5" class="flex_1">
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remark"
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
      <div class="selection-box" v-if="showAuth && checkFlag">
        <ky-ui-label class="fs_14" title="分配权限" />
        <div class="form-item">
          <span class="label">选择权限</span>
          <auth-edit
            class="flex_1"
            :data="editData"
            :checkPayment="checkAdmin && permission_tab_active === 'payment-auth'"
          />
        </div>
      </div>
    </div>
    <div class="page__footer footer admin-footer">
      <div class="btn-group">
        <el-button size="small" class="el-button--normal" @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          size="small"
          class="el-button--normal"
          :disabled="!!errorPhone"
          @click="handleConfirm"
          >确定
        </el-button>
      </div>
    </div>
    <dialog-add-result @clearInput="clearInput" ref="resultRef" />
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  watch,
  ref,
  getCurrentInstance,
  onMounted,
  onActivated,
  nextTick
} from '@vue/composition-api'
import { KyUiLabel, KyUiTip, KyUiBubble } from '@comps/ky-ui'
import useUam from '@views/permission-manage/hooks/useUam'
import REGULAR from '@utils/regular'
import { uam_api_addUser, uam_api_userInfoByAdd, uam_permissionAuth } from '@api/permission'
import useUamUtil from '@views/permission-manage/hooks/useUamUtil'
import useUamUser from '@views/permission-manage/hooks/useUamUser'
import DialogAddResult from '@views/permission-manage/permission-index/user-add/dialog-add-result.vue'
import { permissionIsEqual } from '@views/permission-manage/permissionUtil'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'
import usePayment from '@views/permission-manage/hooks/usePayment'

const { permissionServe } = require('@views/permission-manage/permissionUtil')

export default defineComponent({
  name: 'user-add',
  props: {},
  setup(props, { root }) {
    const initialData = {
      title: '新增账号',
      routerParam: {
        needRefresh: false
      },
      loading: false,
      formData: {
        phone: '',
        remark: ''
      },
      userInfo: {},
      checkAdmin: false, // 设为副管理员
      editData: [],
      errorPhone: '', // 手机号码错误提示
      warningPhone: '', // 手机号码警告
      showAuth: true, // 是否显示权限可编辑权限
      phoneRule: [
        { pattern: REGULAR.mobileNumber, message: '请填写正确的手机号' },
        { required: true, message: '请填写11位手机号' }
      ],
      oldSubmitData: Object.freeze({
        checkAdmin: false,
        phone: '',
        remark: '',
        userName: undefined,
        permissionIds: []
      })
    }

    const state = reactive({
      ...initialData,
      formData: { phone: '', remark: '' }
    })

    const vm = getCurrentInstance()
    const { uam_current_owner, uam_is_admin, uam_auth_edit } = useUam()
    const { uam_payment_isAdmin } = usePayment()
    const {
      isSuperPayment,
      permission_tab_active,
      admin_add_available,
      payment_add_available,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      uam_updateAdminVicesNumber
    } = useUamUser(root)
    const {
      add_auth_format,
      get_auth_request,
      select_default_auth,
      edit_auth_format,
      disable_dynamic_update
    } = useUamUtil()
    const { checkFlag, permission_role_button } = usePermissionStore()

    const formRef = ref(null)
    const resultRef = ref(null)
    const phoneTipRef = ref(null)

    onActivated(() => {
      state.routerParam.needRefresh = false
      initData()
      getAuth()
    })
    onMounted(() => {
      initData()
      getAuth()
    })

    const h = root.$createElement

    const isSuper = computed(() => {
      return uam_current_owner()
    })

    const initData = () => {
      Object.assign(state, initialData)
      uam_updateAdminVicesNumber()
    }

    // 已是管理员不禁用
    const admin_add_able = computed(() => {
      return uam_is_admin(state.userInfo.userExternalType) || admin_add_available.value
    })

    const payment_add_able = computed(() => {
      return uam_payment_isAdmin(state.userInfo.authorizer) || payment_add_available.value
    })

    watch(
      () => state.formData.phone,
      val => {
        handlePhoneChange(val)
      }
    )

    // 监听是否勾选副副授权号
    watch(
      () => state.checkAdmin,
      val => {
        updateRoleDefaultSelect()
        updateDynamicDisable()
      }
    )

    // 更新动态禁用
    function updateDynamicDisable() {
      if (permission_tab_active.value === 'payment-auth') {
        state.editData = disable_dynamic_update(state.editData, !!!state.checkAdmin, state.userInfo)
      }
    }

    // 更新角色默认选中 (只在手动勾选不勾选副授权号/副管理触发)
    function updateRoleDefaultSelect() {
      state.editData = select_default_auth(state.editData, state.checkAdmin)
    }

    // 获取当前用户权限列表 <type 3:新增 2:编辑>
    async function getAuth(type = 3, id) {
      state.showAuth = true
      state.loading = true
      let result = await uam_auth_edit(type, id)
      state.loading = false
      switch (type) {
        case 3:
          state.editData = add_auth_format(result)
          updateDynamicDisable()
          break
        case 2:
          // 有权限的数据
          if (result?.length > 0 && permission_tab_active.value === 'permission-index') {
            // 新增级别比自己低的用户
            if (permissionServe.uam_level_smaller(permission_tab_active.value, state.userInfo)) {
              state.warningPhone = '该手机号已有以下权限'
              state.editData = edit_auth_format(result)
              if (state.checkAdmin) {
                updateRoleDefaultSelect()
              }
              updateDynamicDisable()
            }
          }

          break
      }
    }
    function checkIsOldManager() {
      // 新增级别同级或比自己高，无论是否有权限
      if (!permissionServe.uam_level_smaller(permission_tab_active.value, state.userInfo)) {
        state.showAuth = false
        state.checkAdmin = false // 还原管理员选中
        const roleName = permission_tab_active.value === 'payment-auth' ? '授权号' : '管理员'
        state.warningPhone = `该手机号为${roleName}，您仅能新增账户`
      }
    }

    function getAuthCurrent() {
      return get_auth_request(state.editData) || []
    }

    function getAuthCurrentSort() {
      return getAuthCurrent()
        .map(item => item.permissionId)
        .sort()
    }

    function handleClose() {
      root.$router.push({
        name: 'permission-manage',
        params: { ...state.routerParam, activeTabName: permission_tab_active.value }
      })
    }

    function handleAdminCheckChange() {
      if (permission_tab_active.value === 'payment-auth') {
        state.checkAdmin = uam_payment_isAdmin(state.userInfo.authorizer)
      } else {
        state.checkAdmin = uam_is_admin(state.userInfo.userExternalType)
      }
    }

    // 监听手机获取用户信息
    async function handlePhoneChange(val) {
      if (val && val.length === 11 && REGULAR.mobileNumber.test(val)) {
        await handlePhoneInit()
        let res = await uam_api_userInfoByAdd({ phone: val, hideErrMsg: true })
        if (res.code === 0 && res.data) {
          state.userInfo = { ...res.data }
          state.errorPhone = ''
          state.warningPhone = ''

          // 备注字段
          const { remarkPayAuth, remarkAuth } = res.data.uamUserRole || {}
          state.formData.remark =
            (permission_tab_active.value === 'payment-auth' ? remarkPayAuth : remarkAuth) || ''

          handleAdminCheckChange()
          // 补充标识确认有权限且手机号可注册, 获取已有数据
          if (res.data.existPermission) {
            await getAuth(2, res.data.id)
          }
          checkIsOldManager()
        } else {
          state.userInfo = {}
        }
        switch (res.code) {
          case 700015:
            if (res.msg) {
              state.errorPhone = ''
              state.warningPhone = res.msg
            }
            break
          case 700016:
          case 700011:
          case 70020:
          case 70024: // 手机号已绑定客户编码超过限制
          case 70025: // 重复新增关联绑定
            if (res.msg) {
              state.warningPhone = ''
              state.errorPhone = res.msg
            }
            break
        }
        checkPhone()
      } else {
        state.userInfo = {}
        state.warningPhone = ''
      }
    }

    function handlePhoneBlur() {
      checkPhone()
    }

    function handlePhoneFocus() {
      phoneTipRef.value?.updateHide(false)
    }

    function checkPhone() {
      if (state.errorPhone && state.formData.phone?.length === 11) {
        let oldError = state.errorPhone
        state.errorPhone = state.errorPhone + ' '
        nextTick(() => {
          state.errorPhone = oldError
        })
      }
    }

    // 清楚输入重新录入数据
    async function clearInput() {
      state.formData.phone = ''
      state.formData.remark = ''
      state.checkAdmin = false
      state.errorPhone = ''
      await uam_updateAdminVicesNumber()
      await getAuth()
      // state.editData = add_auth_format(state.editData)
      nextTick(() => {
        formRef.value.clearValidate()
      })
    }
    // 手机号变更初始化
    async function handlePhoneInit() {
      state.formData.remark = ''
      state.checkAdmin = false
      await uam_updateAdminVicesNumber()
      await getAuth()
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
              await this.handleSave()
              reject(false)
            })
            .catch(res => {
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
            })
        } else {
          resolve(true)
        }
      })
    }

    function handleConfirm() {
      this.handleSave()
    }

    const func = reactive({
      getSubmitParams() {
        // permissionIds 禁选权限 传[],<1.自动对账为否，2.存在老用户数据 3.新增级别比自己高或同级的用户>
        let result = {
          phone: state.formData.phone,
          userName: state.userInfo?.userName,
          remark: state.formData?.remark,
          permissionIds:
            !state.showAuth || state.userInfo.userTel || !checkFlag.value
              ? []
              : getAuthCurrentSort()
        }

        if (permission_tab_active.value === 'payment-auth') {
          result.vices = state.checkAdmin // 是否是副授权人
        } else if (permission_tab_active.value === 'permission-index') {
          result.main = state.checkAdmin // 是否是副管理员
        }
        return result
      },
      isEqualCheck() {
        const data = { ...this.getSubmitParams(), checkAdmin: state.checkAdmin }
        delete data.main
        delete data.vices
        const old_data = { ...state.oldSubmitData }
        return permissionIsEqual(data, old_data)
      },
      async saveAuth() {
        let params = {
          userIds: [state.userInfo.id],
          authRequest: getAuthCurrent()
        }
        let res = await uam_permissionAuth(params)
        return res
      },
      async handleSubmit() {
        let params = this.getSubmitParams()
        state.loading = true
        try {
          let res = await uam_api_addUser(params)
          if (res.code === 0) {
            // 存在旧数据手机号,增加编辑权限详情接口
            if (checkFlag.value && state.showAuth && state.userInfo?.userTel) {
              let resAuth = await this.saveAuth()
              if (resAuth.code === 0) {
                state.routerParam.needRefresh = true
                resultRef.value?.openDialog()
              }
            } else {
              state.routerParam.needRefresh = true
              resultRef.value?.openDialog()
            }
          } else {
            switch (res.code) {
              case 700011:
                if (res.msg) {
                  state.errorPhone = res.msg
                  checkPhone()
                }
                break
              default:
                root.$message.error(res.msg || '用户新增错误')
                break
            }
          }
        } finally {
          state.loading = false
        }
      },

      handleSave(options = { callback: null }) {
        return new Promise((resolve, reject) => {
          if (state.errorPhone) {
            reject({ valid: false })
            return
          }
          formRef.value.validate(async valid => {
            if (!valid) {
              options.callback && options.callback(false)
              reject({ valid: false })
              return
            }
            await this.handleSubmit()
            resolve({ valid: true })
          })
        })
      }
    })

    return {
      ...toRefs(state),
      ...toRefs(func),
      formRef,
      resultRef,
      phoneTipRef,
      isSuper,
      isSuperPayment,
      permission_tab_active,
      UamAdminLimitTip,
      UamPaymentLimitTip,
      checkFlag,
      admin_add_able,
      payment_add_able,
      permission_role_button,
      handleConfirm,
      clearInput,
      handleClose,
      getAuthCurrent,
      handlePhoneChange,
      handlePhoneBlur,
      handlePhoneFocus,
      backTrigger
    }
  },
  components: {
    DialogAddResult,
    'router-back': () => import('@views/permission-manage/components/router-back.vue'),
    'auth-edit': () => import('@views/permission-manage/components/auth-edit.vue'),
    'user-label': () => import('@views/permission-manage/components/user-label.vue'),
    KyUiLabel,
    KyUiTip,
    KyUiBubble
  }
})
</script>

<style lang="scss" scoped>
@import '~@assets/scss/footer.scss';

$textColor: #03050d;

.page-container {
  height: 100%;
  background-color: #f7f9fa;
}

.page__content {
  background-color: #ffffff;
  //height: calc(100% - 148px) !important;
  height: calc(100% - 136px) !important;
  overflow-y: auto;

  &.page-type--1 {
    .user-info-item {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .user-info-item {
    /deep/ .el-checkbox__label {
      vertical-align: middle;
    }
  }

  .user-info-row {
    .el-col-6 {
      width: 246px;
    }

    .el-col-4 {
      width: 166px;
    }
    /deep/ {
      .el-form-item__label{
        line-height: 16px !important;
      }
      .el-input__suffix{
        right: -5px;
      }
    }
  }
}

.page__footer {
  .btn-group {
    margin-right: 20px;
    margin-left: auto;
    white-space: nowrap;

    .el-button {
      padding: 12px 28px;
      min-width: initial;
    }
  }
}

.el-form {
  .label--hide {
    /deep/ .el-form-item__label {
      visibility: hidden;
    }
  }

  /deep/ {
    .el-form-item__error {
      width: 500px;
      font-family: 'iconfont';

      &::before {
        content: '\e940';
      }
    }
  }

  .form-error-warning {
    /deep/ .el-form-item__error {
      color: orange;
    }
  }
}

.selection-box {
  .form-item {
    display: flex;

    .label {
      position: relative;
      width: 80px;
      white-space: nowrap;

      &.is-required {
        &::after {
          content: '*';
          position: absolute;
          top: 4px;
          left: 50px;
          color: #f56c6c;
        }
      }
    }
  }
}

.selection-box__content {
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 234, 1);
  padding: 16px;
  margin-bottom: 24px;
}

/deep/ .el-input--suffix{
  top: -6px;
  right: 0 !important;
}
</style>
