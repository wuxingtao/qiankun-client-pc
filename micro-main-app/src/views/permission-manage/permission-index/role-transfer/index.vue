<template>
  <ky-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="380px"
    :close-on-press-escape="false"
  >
    <div class="page__content loading--normal" v-loading="loading">
      <div v-show="currentStep === 1">
        <ky-ui-tip type="warning" class="mb_38"
          >请慎重操作，一旦转让成功，您将失去所有控制权限</ky-ui-tip
        >
        <el-form :rules="rules" :model="formData" class="page-style1 role-form pb_6" ref="formRef">
          <el-form-item label="接收人手机" prop="userMobile" class="mb_10">
            <el-autocomplete
              :fetch-suggestions="querySearch"
              @select="handleSelect"
              placeholder="请填写手机号或姓名"
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
                    <user-label v-show="item.userLevelName">{{ item.userLevelName }} </user-label>
                    <user-label type="yellow" v-show="item.uam_payment_accountName"
                      >{{ item.uam_payment_accountName }}
                    </user-label>
                  </div>
                </div>
                <div v-else class="no-data">未找到相关手机号</div>
              </template>
              <template slot="suffix">
                <div class="select-desc">
                  <user-label v-show="selectUser.userLevelName"
                    >{{ selectUser.userLevelName }}
                  </user-label>
                  <user-label type="yellow" v-show="selectUser.uam_payment_accountName"
                    >{{ selectUser.uam_payment_accountName }}
                  </user-label>
                </div>
              </template>
            </el-autocomplete>
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
        <div class="verify-message c_03050d">
          <p>确认是您本人操作</p>
          <p>验证码已发送到您尾号{{ telFilter }}的手机。</p>
        </div>
        <verify-code :callback="uam_sendCode" @change="handleCodeChange" ref="codeRef" />
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
  watch,
  computed,
  onMounted,
  onActivated,
  nextTick
} from '@vue/composition-api'
import { KyUiTip } from '@comps/ky-ui'
import { uam_getPhoneType, uam_smsSend, uam_userList } from '@api/permission'
import Format from '@utils/format'
import useUam from '@views/permission-manage/hooks/useUam'
import usePayment from '@views/permission-manage/hooks/usePayment'
import { permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import REGULAR from '@utils/regular'
import { uam_userTransfer } from '@api/permission'

export default defineComponent({
  name: 'role-transfer',
  props: {},
  components: {
    KyUiTip,
    'verify-code': () => import('../../components/verify-code'),
    'user-label': () => import('@views/permission-manage/components/user-label.vue')
  },
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
    const rules = {
      userMobile: [
        { required: true, message: '接收人手机号不能为空', trigger: 'change' },
        { pattern: REGULAR.mobileNumber, message: '请填写正确的手机号', trigger: 'blur' },
        { validator: mobileCheck, trigger: 'blur' }
      ]
    }

    const initialData = {
      dialogTitle: '主管理员转让',
      dialogVisible: false,
      currentStep: 1,
      rules: rules,
      userLists: [], // 用户列表
      userListsAll: [], // 用户列表(含内部10 非内部20)
      formData: {
        userMobile: '',
        userId: '', // 选中用户id
        userName: ''
      },
      selectUser: {},
      loading: false,
      checking: false // 接口验证中
    }

    const state = reactive({ ...initialData })

    const codeRef = ref(null)
    const formRef = ref(null)
    const autoInputRef = ref(null)

    const submitDisabled = computed(() => {
      return codeRef.value?.getSmsCode().length !== 6
    })

    const nextDisabled = computed(() => {
      return (
        state.checking ||
        state.formData.userMobile?.length !== 11 ||
        !!formRef.value?.fields[0]?.validateMessage
      )
    })

    const auth_user_info = computed(() => {
      return root.$store.state.permission.auth_user_info || {}
    })

    const telFilter = computed(() => {
      const userTel = auth_user_info.value?.userTel
      return userTel ? userTel.slice(userTel.length - 4) : ''
    })

    const { uam_user_type } = useUam()
    const { uam_payment_accountName } = usePayment()

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
        state.dialogTitle = val === 1 ? '主管理员转让' : '短信验证'
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

    function resetDialog() {
      codeRef.value?.reset()
      formRef.value.resetFields()
      Object.assign(state, initialData)
      state.formData.userMobile = ''
      state.formData.userName = ''
    }

    function openDialog() {
      state.dialogVisible = true
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
      autoInputRef.value.activated = results.length !== 0
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

    function handleNext() {
      formRef.value.validate(valid => {
        if (valid) {
          state.currentStep = 2
        }
      })
    }

    // 验证码提交
    async function handleSubmit() {
      const { userId, userMobile } = state.formData
      let res = await uam_userTransfer({
        userId: userId,
        mobile: userMobile,
        smsCode: codeRef.value.getSmsCode()
      })
      if (res.code === 0) {
        root.$message.success('转让成功')
        codeRef.value.handleResetError()
        handleTransFerCallback()
      } else {
        codeRef.value.handleSetError(res.msg)
      }
    }

    function handleCodeChange(val) {}

    // 转让成功回调
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

    async function uam_sendCode() {
      return await uam_smsSend()
    }

    function handlePaste(e) {
      autoInputRef.value.activated = true
      autoInputRef.value.getData(state.formData.userMobile)
    }

    return {
      ...toRefs(state),
      autoInputRef,
      submitDisabled,
      nextDisabled,
      auth_user_info,
      telFilter,
      codeRef,
      formRef,
      permissionLevel,
      querySearch,
      handleSelect,
      openDialog,
      handleNext,
      handleSubmit,
      handleCodeChange,
      handleTransFerCallback,
      uam_sendCode,
      handlePaste
    }
  }
})
</script>

<style lang="scss" scoped>
.role-form {
  min-height: 100px;
}

.verify-message {
  text-align: center;
  line-height: 1.4;
  margin: 8px 0 25px;
}
</style>

<style lang="scss">
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

.level + .level {
  margin-left: 10px;
}

.ky-ui-tip {
  i {
    padding-left: 12px;
  }
}
</style>
