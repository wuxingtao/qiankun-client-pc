<template>
  <div class="page">
    <div class="page-wrapper">
      <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
        <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>新增授权账号
      </div>
      <div v-for="(n, index) in addNum" :key="n" class="page-style1 add-card">
        <div class="serial-number">
          {{ addO(index) }}
        </div>
        <div class="add-deleted flex flex_ai_c" @click="() => deleted(index)">
          <img src="../../../assets/image/setting/detele.png" class="delete-img">
          <span>删除</span>
        </div>
        <el-form ref="form" :rules="formRules" :model="formData[index]">
          <el-row :gutter="16">
            <el-col :span="3">
              <el-form-item label="授权给谁" prop="authorizationWho">
                <el-select v-model="formData[index].authorizationWho" size="medium" placeholder="请选择" @change="e => handleChange(e, index)">
                  <el-option label="公司" value="0"></el-option>
                  <el-option label="手机号" value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="formData[index].authorizationWho === '1'">
              <el-form-item label="姓名" prop="name">
                <el-input placeholder="请填写" v-model="formData[index].name" :maxlength="20" clearable @input="() => onNameInput(index)"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3" v-if="formData[index].authorizationWho === '1'">
              <el-form-item label="手机号码" prop="phone">
                <el-input placeholder="请填写" type="number" v-model="formData[index].phone" :maxlength="11" clearable @input="() => onPhoneInput(index)" @blur="() => onBlur(index)"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="客户编码" prop="customer" :error="errorMsgs[index].customer">
                <el-input placeholder="请填写" type="number" v-model="formData[index].customer" :maxlength="15" clearable @input="() => onCustomerInput(index)" @blur="() => onBlur(index)"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="公司名称" prop="company">
                <el-input placeholder="选填" v-model="formData[index].company" :maxlength="10" clearable ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="9">
              <el-form-item label="备注" prop="remark">
                <el-input placeholder="选填" v-model="formData[index].remark" :maxlength="50" show-word-limit clearable ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="flex flex_jc_fe flex_ai_c page-add" @click="add" v-if="this.formData.length < 10">
        <img src="../../../assets/image/setting/add.png" class="img" />
        <span>继续添加</span>
      </div>
    </div>
    <footer class="footer">
      <div class="btn-wrapper">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="confirmAgree" :loading="loading" :disabled="isCanNext">提交</el-button>
      </div>
    </footer>
  </div>
</template>

<script>
const obj = { 
  authorizationWho: '',
  name: '',
  phone: '',
  customer: '',
  company: '',
  remark: ''
}

import Regular from "@utils/regular"
import { add } from '@/services/api/pyAuth'
import { getPhone } from "@/utils/storage"
export default {
  name: 'addAuthorizationAccount',
  data() {
    return {
      addNum: 1,
      formRules: {
        authorizationWho: [
          { required: true,  }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'change' },
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: Regular.mobileNumber, message: "请输入正确的手机号", trigger: "blur" }
        ],
        customer: [
          { required: true, message: '请输入客户编码', trigger: 'blur' },
        ]
      },
      formData: [{
        authorizationWho: '0'
      }],
      loading: false,
      errorMsgs: [{
        customer: '', authorizationWho: '0'
      }]
    }
  },
  computed: {
    isCanNext() {
      return !this.formData.some(item => item.customer)
    }
  },
  methods: {
    handleChange(e, index) {
      this.errorMsgs[index] = { customer: '', authorizationWho: String(e) }
      this.isRepetition(index)
    },
    isRepetition(index) {
      let authorizationWho = this.formData[index].authorizationWho, customer = this.formData[index].customer, phone = this.formData[index].phone
      let arrPersonnel = [], arrCompany = [], arr = [], phoneArr = [], arrErrorMsgs = [...this.errorMsgs], arrayErrorMsgs = []
      this.formData.forEach(item => {
        if (item.authorizationWho === '0') {
          arrCompany.push({ ...item })
        } else {
          arrPersonnel.push({ ...item })
        }
      })
      if (authorizationWho === '0') {
        arrCompany.forEach(item => {
          if (item.customer === customer) {
            arr.push({ ...item })
          }
        })
        if (arr.length > 1) {
          this.errorMsgs[index].customer = '您输入的客户编码重复，请修改'
        } else {
          arrErrorMsgs.forEach(item => {
            if (item.authorizationWho === '0') {
              return arrayErrorMsgs.push({ customer: '', authorizationWho: '0' })
            }
            return arrayErrorMsgs.push({ ...item })
          })
          this.errorMsgs = [...arrayErrorMsgs]
          if (!customer) return this.errorMsgs[index].customer = '请输入客户编码'
          this.errorMsgs[index].customer = ''
        }
      } else {
        arrPersonnel.forEach(item => {
          if (item.customer === customer) {
            arr.push({ ...item })
          }
          if (arr.length > 1) {
            arr.forEach(item => {
              if (item.phone === phone) {
                phoneArr.push({ ...item })
              }
            })
            if (phoneArr.length > 1) {
              this.errorMsgs[index].customer = '您输入的客户编码重复，请修改'
            } else {
              arrErrorMsgs.forEach(item => {
                if (item.authorizationWho === '0') {
                  return arrayErrorMsgs.push({ customer: '', authorizationWho: '0' })
                }
                return arrayErrorMsgs.push({ ...item })
              })
              this.errorMsgs = [...arrayErrorMsgs]
              if (!customer) return this.errorMsgs[index].customer = '请输入客户编码'
              this.errorMsgs[index].customer = ''
            }
          } else {
            arrErrorMsgs.forEach(item => {
              if (item.authorizationWho === '0') {
                return arrayErrorMsgs.push({ customer: '', authorizationWho: '0' })
              }
              return arrayErrorMsgs.push({ ...item })
            })
            this.errorMsgs = [...arrayErrorMsgs]
            if (!customer) return this.errorMsgs[index].customer = '请输入客户编码'
            this.errorMsgs[index].customer = ''
          }
        })
      }
    },
    onBlur(index) {
      this.isRepetition(index)
    },
    async confirmAgree() {
      let customerPayAuths = []
      this.formData.forEach(item => {
        if (item.authorizationWho === '0') {
          customerPayAuths.push({
            authType: 1,
            applyCustomerCode: item.customer || '',
            applyCustomerName: item.company || '',
            applyReason: item.remark || ''
          })
        } else {
          customerPayAuths.push({
            authType: 2,
            open: true,
            applyCustomerCode: item.customer || '',
            applyCustomerName: item.company || '',
            applyReason: item.remark || '',
            applyName: item.name || '',
            applyMobile: item.phone || ''
          })
        }
      })
      try {
        this.loading = true
        const result = await add({ addType: '10', customerPayAuths, mainAuthMobile: getPhone() })
        if (result && result.code === 0) {
          let infos = result.data.infos || [], isFail = false, failText = ''
          infos.forEach(item => {
            if (item.executeCode === 20) {
              isFail = true
              failText = item.executeResult
            }
          })
          if (isFail) {
            this.$message({
              message: failText,
              type: 'error'
            })
            return
          }
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$router.push({name: 'approverCooperationAuthorization', query: { status: 2 }})
          this.addNum = 1
          this.formData = [ { authorizationWho: '0' } ]
        }
      } finally {
        this.loading = false
      }
    },
    addO(index) {
      if (index + 1 < 10) {
        return `0${index + 1}`
      }
      return index + 1
    },
    handleCancel() {
      this.$router.push({name: 'user'})
    },
    deleted(index) {
      let arr = [...this.formData]
      let array = [...this.errorMsgs]
      arr.splice(index, 1)
      array.splice(index, 1)
      this.formData = [...arr]
      this.errorMsgs = [...array]
      this.addNum = this.addNum - 1
    },
    add() {
      let arr = [...this.formData]
      let array = [...this.errorMsgs]
      arr.push({ ...obj, authorizationWho: '0' })
      array.push({ customer: '', authorizationWho: '0' })
      this.formData = [...arr]
      this.errorMsgs = [...array]
      this.addNum = this.addNum + 1
    },
    onNameInput(index) {
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]*$/
      if (!reg.test(this.formData[index].name)) return this.formData[index].name = this.formData[index].name.slice(0, -1)

    },
    onPhoneInput(index) {
      if (this.formData[index].phone.length > 11) return this.formData[index].phone = this.formData[index].phone.slice(0, 11)
    },
    onCustomerInput(index) {
      if (this.formData[index].customer.length > 15)  this.formData[index].customer = this.formData[index].customer.slice(0, 15)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../styles/footer.scss";

  .page {
    background: #f7f9fa;
    height: 100%;

    .page-wrapper {
      background: #fff;
      height: calc(100% - 94px);
      overflow-y: auto;
      padding-bottom: 20px;
      box-sizing: border-box;
    }
  }

  .add-card {
    position: relative;
    padding: 48px 20px 24px;
    margin: 0 20px 16px;
    border: 1px solid #e6e6e6;
    border-radius: 5px;

    .serial-number {
      position: absolute;
      left: 0;
      top: 8px;
      width: 32px;
      height: 20px;
      line-height: 20px;
      padding-left: 7px;
      box-sizing: border-box;
      background-image: url('../../../assets/image/setting/add-authorization-account.png');
      background-repeat: no-repeat;
      background-size: 32px 20px;
      color: #ffffff;
    }

    .add-deleted {
      position: absolute;
      top: 10px;
      right: 20px;
      color: #8365f6;
      cursor: pointer;

      .delete-img {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    }
  }

  .page-add {
    margin-right: 20px;
    color: #8365f6;
    cursor: pointer;

    .img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }

  .page-box__title {
    width: auto;
  }
</style>