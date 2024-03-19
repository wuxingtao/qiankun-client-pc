<template>
  <div class="page__container">
    <router-back :title="title" :hasBorder="false" />
    <div class="page__content page__card">
      <div class="page__content-box1">
        <div v-if="customerCode" class="customer-code-info">
          <div class="title">已绑定的客户信息</div>
          <div class="info-wrapper">
            <div class="info">
              <span>公司名称</span>
              <span>{{ customerInfo.customerName }}</span>
            </div>
            <div class="info">
              <span>客户编码</span>
              <span>{{ customerInfo.customerCode }}</span>
            </div>
            <div class="info info-pass">
              <span
                >编码密码<i
                  :class="
                    `ml_4 theme-color cursor iconfont iconeye${
                      showOldPassword ? '-open' : '-close'
                    }`
                  "
                  slot="suffix"
                  @click="showOldPassword = !showOldPassword"
                ></i
              ></span>
              <span v-if="showOldPassword">{{ oldPassword }}</span>
              <span v-else>*********</span>
            </div>
          </div>
        </div>
        <div class="password-form-content">
          <h3 class="title text-color-primary">修改客户编码密码</h3>
          <el-form
            class="password-form page-style1"
            :model="formData"
            :rules="formRule"
            ref="formRef"
          >
            <el-form-item prop="pass" label="新密码">
              <el-input
                :type="showPass1 ? 'text' : 'password'"
                placeholder="请输入8位密码"
                maxLength="8"
                v-model="formData.pass"
              >
                <i
                  :class="`theme-color cursor iconfont iconeye${showPass1 ? '-open' : '-close'}`"
                  slot="suffix"
                  @click="showPass1 = !showPass1"
                ></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="confirmPass" label="确认新密码">
              <el-input
                :type="showPass2 ? 'text' : 'password'"
                placeholder="请再次输入新密码"
                maxLength="8"
                v-model="formData.confirmPass"
              >
                <i
                  :class="`theme-color cursor iconfont iconeye${showPass2 ? '-open' : '-close'}`"
                  slot="suffix"
                  @click="showPass2 = !showPass2"
                ></i>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="password-btn">
          <el-button
            type="primary"
            size="small"
            class="btn-submit"
            style="width:96px;"
            :disabled="submitDisabled"
            @click="handleSubmit"
            >确认修改
          </el-button>
        </div>
      </div>
    </div>
    <sms-dialog :sendCodeFn="smsSend" @submitFn="smsSubmit" ref="smsRef" />
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  onMounted,
  watch
} from '@vue/composition-api'
import {
  uam_changeCustomerCodeSendSmsCode,
  uam_changeCustomerPassword,
  uam_getCustomerPassword
} from '@api/permission'
import SmsDialog from '@views/permission-manage/components/sms-dialog'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'customer-pass',
  props: {},
  components: {
    'router-back': () => import('@views/permission-manage/components/router-back.vue'),
    SmsDialog
  },
  setup(props, { root }) {
    const checkConfirmPass = (rule, value, callback) => {
      if (state.formData.pass && state.formData.confirmPass) {
        if (state.formData.pass !== state.formData.confirmPass) {
          return callback('两次输入的新密码必须一致')
        }
      }
      callback()
    }

    const checkPass = (rule, value, callback) => {
      if (state.formData.pass.length === 8 && state.oldPassword === state.formData.pass) {
        return callback('新旧密码不能相同')
      }
      callback()
    }

    const state = reactive({
      title: '客户编码密码',
      formData: {
        pass: '',
        confirmPass: ''
      },
      oldPassword: '', // 旧密码
      showPass1: false,
      showPass2: false,
      showOldPassword: false,
      customerInfo: computed(() => {
        return root.$store.state.userInfo.customerInfo
      }),
      customerCode: computed(() => {
        return state.customerInfo?.customerCode
      }),
      // 禁用按钮
      submitDisabled: computed(() => {
        return !(state.formData.pass && state.formData.confirmPass)
      }),

      formRule: {
        pass: [
          { required: true, message: '请输入8位数字密码', trigger: 'blur' },
          { pattern: /\d{8}/, message: '请输入8位数字密码', trigger: 'blur' },
          { validator: checkPass, trigger: 'blur' }
        ],
        confirmPass: [
          { required: true, message: '请输入8位数字密码', trigger: 'change' },
          { validator: checkConfirmPass, trigger: 'change' }
        ]
      }
    })

    const { auth_user_info } = usePermissionStore()

    const formRef = ref(null)
    const smsRef = ref(null)

    onMounted(() => {
      handleOldPassWord()
    })

    watch(
      () => state.formData.pass,
      val => {
        // 监听确认密码
        if (state.formData.confirmPass) {
          formRef.value?.validateField(['confirmPass'])
        }
      }
    )

    async function handleOldPassWord() {
      let res = await uam_getCustomerPassword()
      if (res.code === 0 && res.data) {
        state.oldPassword = res.data
      }
    }

    function handleSubmit() {
      formRef.value.validate(valid => {
        if (!valid) {
          return
        }
        handleSmsOpen()
      })
    }

    // 打开短信发送
    async function handleSmsOpen () {
      const res = await smsSend()
      if(res.code === 0){
        smsRef.value?.openDialog()
      }
    }

    function handleBackList(){
      root.$router.push({
        name: 'permission-manage',
        params: { activeTabName: 'permission-index' }
      })
    }
    /**
     * 验证码提交
     * @param smsCode 短信验证码
     * @param callback
     * @returns {Promise<void>}
     */
    async function smsSubmit({ smsCode, callback }) {
      if (!smsCode) {
        return
      }
      const param = {
        oldPassword: state.oldPassword,
        newPassword: state.formData.confirmPass,
        smsCode
      }

      let res = await uam_changeCustomerPassword(param)
      if (res.code === 0 && res.data) {
        root.$message.success('修改成功')
        resetForm()
        smsRef.value?.closeDialog()
        state.oldPassword = param.newPassword
        // handleBackList()
      }
      callback && callback(res)
    }

    async function smsSend() {
      return await uam_changeCustomerCodeSendSmsCode({ phone: auth_user_info.value?.userTel })
    }

    function resetForm() {
      formRef.value.resetFields()
    }

    return { ...toRefs(state), formRef, smsRef, smsSend, smsSubmit, handleSubmit }
  }
})
</script>

<style lang="scss" scoped>
.page__container {
  background-color: #f5f7fb;
  height: 100%;
  min-width: 1020px;

  .router-back {
    &::after {
      content: none;
    }
  }
}

.page__content {
  margin-top: 8px;
  padding: 12px 20px 20px;
  background-color: #ffffff;
  height: calc(100% - 77px);
  position: relative;

  .page__content-box1 {
    width: 600px;
    margin-top: 8px;
  }

  .customer-code-info {
    width: 600px;
    height: 110px;
    margin-bottom: 36px;
    border-radius: 4px;
    box-sizing: border-box;
    background: url('~@assets/image/permission/customer-bg.png') no-repeat top right;

    .title {
      width: 134px;
      height: 26px;
      line-height: 26px;
      text-align: left;
      padding-left: 10px;
      box-sizing: border-box;
      background-image: url('~@assets/image/setting/customer-info-header.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100%;
      color: #fff;
    }

    .info-wrapper {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;

      .info {
        display: flex;
        flex-direction: column;

        span:first-of-type {
          font-size: 12px;
          line-height: 1;
          text-align: left;
          color: #8f8fa8;
          margin-bottom: 8px;
        }

        span:last-of-type {
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          color: #03050d;
        }
        &.info-pass {
          width: 68px;
          position: relative;
          .iconfont {
            position: absolute;
            top: -1px;
          }
        }
      }
    }
  }

  .password-form-content {
    .title {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Semibold;
      font-weight: 600;
      margin-bottom: 20px;
    }
  }

  .password-btn {
    padding-top: 20px;
  }
}
/*表单样式覆盖*/
.page-style1 .el-form-item {
  margin-bottom: 28px;
}
</style>
