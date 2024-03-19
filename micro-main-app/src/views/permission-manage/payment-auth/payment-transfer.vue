<template>
  <ky-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="380px">
    <div class="page__content loading--normal" v-loading="loading">
      <div v-show="currentStep === 1">
        <ky-ui-tip type="warning" class="mb_24"
          >请慎重操作，一旦转让成功，您将失去所有控制权限
        </ky-ui-tip>
        <el-form
          :rules="formRules"
          :model="formData"
          class="page-style1 role-form pb_6"
          ref="formRef"
        >
          <el-form-item label="接收人手机" prop="userMobile" class="mb_10" :error="errorPhone">
            <el-autocomplete
              :fetch-suggestions="querySearch"
              @select="handleSelect"
              placeholder="请填写绑定相同客户编码的其他手机号"
              popper-class="role-user-suggestion"
              v-model="formData.userMobile"
              v-parseSpace:calback="handlePaste"
              :maxlength="11"
              ref="autoInputRef"
            >
              <template slot-scope="{ item }">
                <div class="role-info" v-if="item.userTel">
                  <div class="overflow_hidden">
                    <span class="phone f_w_b mr_8" v-html="item.userTelFormat"></span>
                    <span class="name mr_10" :title="item.userName">{{ item.userName }}</span>
                  </div>
                  <div class="inline-block">
                    <user-label type="yellow" v-show="item.uam_payment_accountName"
                      >{{ item.uam_payment_accountName }}
                    </user-label>
                    <user-label v-show="item.userLevelName">{{ item.userLevelName }}</user-label>
                  </div>
                </div>
                <div v-else class="no-data">未找到相关手机号</div>
              </template>
              <template slot="suffix">
                <div class="select-desc">
                  <user-label type="yellow" v-show="selectUser.uam_payment_accountName"
                    >{{ selectUser.uam_payment_accountName }}
                  </user-label>
                  <user-label v-show="selectUser.userLevelName"
                    >{{ selectUser.userLevelName }}
                  </user-label>
                </div>
              </template>
            </el-autocomplete>
            <!--            <el-input-->
            <!--              :maxlength="11"-->
            <!--              placeholder="请填写绑定相同客户编码的手机号"-->
            <!--              v-model="formData.userMobile"-->
            <!--              @change="handlePhoneChange"-->
            <!--              v-kyerestrict.positive-->
            <!--              clearable-->
            <!--            ></el-input>-->
          </el-form-item>
          <el-form-item label="接收人姓名" prop="userName" class="mb_10" v-if="formData.userName">
            <el-input
              placeholder="请填写姓名"
              :maxlength="20"
              v-model.trim="formData.userName"
              :disabled="true"
              clearable
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div v-show="currentStep === 2">
        <div class="verify-message c_03050d text-center">
          <p>确认是您本人操作</p>
          <p>验证码已发送到您尾号{{ telFilter }}的手机。</p>
        </div>
        <!--        <div class="verify-message c_03050d">-->
        <!--          <p class="fs_14 f_w_b">确认是您本人操作</p>-->
        <!--          <p class="desc">-->
        <!--            验证码已发送到您尾号<span style="color: #ff8038">{{ telFilter }}</span-->
        <!--            >的手机。-->
        <!--          </p>-->
        <!--        </div>-->
        <verify-code
          :callback="uam_payment_sendCode"
          @change="handleCodeChange"
          ref="codeRef"
        ></verify-code>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        size="medium"
        type="primary"
        v-if="currentStep === 1"
        @click="handleNext"
        :disabled="nextDisabled"
      >
        下一步
      </el-button>
      <el-button
        size="medium"
        type="primary"
        v-if="currentStep === 2"
        @click="handleSubmit"
        :disabled="submitDisabled"
      >
        确定
      </el-button>
    </div>
  </ky-dialog>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  watch,
  nextTick
} from '@vue/composition-api'
import { KyUiTip } from '@comps/ky-ui'
import REGULAR from '@utils/regular'
import paymentApi from '@api/payment'
import usePayment from '@views/permission-manage/hooks/usePayment'
import { permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import useUam from '@views/permission-manage/hooks/useUam'
import { uam_getPhoneType, uam_userList } from '@api/permission'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'payment-transfer',
  props: {},
  setup(props, { root, emit }) {
    const mobileCheck = async (rule, value, callback) => {
      if (value?.length === 11) {
        if (
          state.userListsAll.find(
            item => item.internalColleaguesFlag === '10' && item.userTel === value
          )
        ) {
          return callback(new Error('手机号为跨越内部手机号，不可转让'))
        }
        state.checking = true
        let errorValue = ''
        if (!state.userLists.find(item => item.userTel === value)) {
          errorValue = '该手机号未绑定当前客户编码，请绑定后再转让'
          try {
            const res = await uam_getPhoneType(value)

            if (res.code === 0) {
              switch (res.data) {
                case 0:
                case 1:
                  errorValue = '该手机号未绑定当前客户编码，请绑定后再转让'
                  break
                case 2:
                  if (!state.userLists.find(item => item.userTel === value)) {
                    errorValue = '该手机号未绑定当前客户编码，请绑定后再转让'
                  }
                  break
              }
            }
            if (errorValue) {
              return callback(new Error(errorValue))
            }
          } finally {
            state.checking = false
          }
        }
        state.checking = false
      }
      callback && callback()
    }
    const formRules = {
      userMobile: [
        { required: true, message: '接收人手机号不能为空', trigger: 'change' },
        { pattern: REGULAR.mobileNumber, message: '请填写正确的手机号', trigger: 'blur' },
        { validator: mobileCheck, trigger: 'blur' }
      ]
    }

    const initialData = {
      dialogTitle: '主授权号转让',
      dialogVisible: false,
      currentStep: 1,
      formRules: formRules,
      formData: {
        userMobile: '',
        userName: '',
        userId: '' // 选中用户id
      },
      userLists: [], // 用户列表
      userListsAll: [], // 用户列表(含内部10 非内部20)
      selectUser: {},
      userNameDisabled: false,
      errorPhone: '', //手机号错误提示
      loading: false,
      checking: false // 接口验证中
    }

    const state = reactive({
      ...initialData
    })

    const codeRef = ref(null)
    const formRef = ref(null)
    const autoInputRef = ref(null)

    watch(
      () => state.dialogVisible,
      val => {
        if (!val) {
          resetDialog()
        } else {
          handleUamUser()
        }
      }
    )

    watch(
      () => state.currentStep,
      (val, oldVal) => {
        state.dialogTitle = val === 1 ? '主授权号转让' : '短信验证'
        if (val === 2 && val !== oldVal) {
          nextTick(() => {
            codeRef.value?.compInit()
          })
        }
      }
    )

    watch(
      () => state.formData.userMobile,
      val => {
        if (val?.length !== 11) {
          state.selectUser = {}
          state.formData.userName = ''
        } else {
          let itemSelect = state.userLists.find(item => item.userTel === val)
          if (itemSelect) {
            handleSelect(itemSelect)
          } else {
            state.checking = true
          }
        }
      }
    )

    const { uam_user_type } = useUam()
    const { uam_payment_accountName } = usePayment()
    const { auth_user_info } = usePermissionStore()

    const telFilter = computed(() => {
      const userTel = auth_user_info.value?.userTel
      return userTel ? userTel.slice(userTel.length - 4) : ''
    })

    const nextDisabled = computed(() => {
      return (
        state.checking ||
        state.formData.userMobile?.length !== 11 ||
        !!formRef.value?.fields[0]?.validateMessage
      )
    })

    const submitDisabled = computed(() => {
      return codeRef.value?.getSmsCode().length !== 6 || state.loading
    })

    function resetDialog() {
      codeRef.value?.reset()
      Object.assign(state, initialData, {
        formData: {
          userMobile: '',
          userName: ''
        }
      })
      formRef.value.resetFields()
    }

    function openDialog() {
      state.dialogVisible = true
    }

    function handleNext() {
      formRef.value.validate(async valid => {
        if (valid) {
          let res = await paymentApi.uam_payment_checkTransferIsLegal(state.formData.userMobile)
          if (res.code === 0) {
            state.currentStep = 2
          }
        }
      })
    }

    // 监听接收人手机获取用户信息
    async function handlePhoneChange(val) {
      if (val && val.length === 11 && REGULAR.mobileNumber.test(val)) {
        state.errorPhone = ''
        state.userNameDisabled = false
        let res = await paymentApi.uam_payment_getAuthInfo({ phone: val, hideErrMsg: true })
        if (res.code === 0 && res.data) {
          if (res.data.userName) {
            state.formData.userName = res.data.userName
            state.userNameDisabled = true
          }
          state.errorPhone = ''
        } else {
          state.userNameDisabled = false
          state.formData.userName = ''
          if (res.code !== 30000 && res.msg) {
            state.errorPhone = res.msg
          }
        }
      }
    }

    function handleCodeChange(val) {
      // if (val?.length === 6) {
      //   handleSubmit()
      // }
    }

    function _createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.userTel?.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          restaurant.userName?.toLowerCase().indexOf(queryString.toLowerCase()) > -1
        )
      }
    }

    function querySearch(queryString, cb) {
      let restaurants = state.userLists
      let results = queryString ? restaurants.filter(_createFilter(queryString)) : restaurants
      results = results.map(item => {
        return {
          ...item,
          userTelFormat: item.userTel.replace(
            new RegExp(`(${queryString})`, 'ig'),
            "<span style='color:#8365f6'>$1</span>"
          )
        }
      })
      if (results?.length === 0) {
        results.push({})
      }
      cb(results)
    }

    function handleSelect(val) {
      const oldVal = state.formData.userMobile
      if (val) {
        state.formData.userMobile = val.userTel
        state.formData.userId = val.id
        state.formData.userName = val.userName
        state.selectUser = val
      }
    }

    function handleTransFerCallback() {
      state.dialogVisible = false
      emit('callback')
    }

    async function handleUamUser() {
      state.loading = true
      try {
        let res = await uam_userList({ owner: true })
        if (res.code === 0 && res.data) {
          state.userListsAll = res.data.map(item => {
            return {
              ...item,
              uam_payment_accountName: uam_payment_accountName(item.authorizer),
              userLevelName: uam_user_type(item.userExternalType)
            }
          })
          state.userLists = state.userListsAll.filter(item => item.internalColleaguesFlag !== '10')
        }
      } finally {
        state.loading = false
      }
    }

    async function handleSubmit() {
      state.loading = true
      try {
        const { userName, userMobile } = state.formData
        let res = await paymentApi.uam_payment_transferPrima({
          userName,
          userMobile,
          verificationCode: codeRef.value.getSmsCode()
        })

        if (res.code === 0) {
          root.$message.success('转让成功')
          codeRef.value.handleResetError()
          handleTransFerCallback()
        } else {
          codeRef.value.handleSetError(res.msg)
        }
      } finally {
        state.loading = false
      }
    }

    async function uam_payment_sendCode() {
      return await paymentApi.uam_payment_smsCode()
    }

    function handlePaste(e) {
      autoInputRef.value.activated = true
      autoInputRef.value.getData(state.formData.userMobile)
    }

    return {
      ...toRefs(state),
      codeRef,
      formRef,
      autoInputRef,
      telFilter,
      nextDisabled,
      submitDisabled,
      handlePhoneChange,
      handleCodeChange,
      handleNext,
      handleSubmit,
      uam_payment_sendCode,
      querySearch,
      handleSelect,
      openDialog,
      handlePaste
    }
  },
  components: {
    KyUiTip,
    'verify-code': () => import('../components/verify-code'),
    'user-label': () => import('@views/permission-manage/components/user-label.vue')
  }
})
</script>

<style lang="scss" scoped>
.page__content {
  padding: 0 10px;
}

.role-user-suggestion {
  .role-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .phone {
      color: #03050d;
    }

    .name {
      max-width: 50%;
      text-overflow: ellipsis;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      color: #666666;
    }
  }
}

.role-form {
  min-height: 100px;

  .el-form-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.verify-message {
  text-align: center;
  line-height: 2;
  margin: 8px 0 12px;
  padding: 0 10px;

  .desc {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 8px;
      width: 8px;
      height: 8px;
      background: #8365f6;
      border-radius: 50%;
    }
  }
}

.level + .level {
  margin-left: 10px;
}

.ky-ui-tip {
  i {
    padding-left: 12px;
  }
}

/deep/ {
  .el-dialog__body {
    margin: 16px 10px 0 !important;
  }
}
</style>
