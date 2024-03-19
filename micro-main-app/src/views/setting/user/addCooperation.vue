<template>
  <!-- 新增协作人员 -->
  <div>
    <div>
      <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
        <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>新增协作人员
      </div>
      <div class="add-cooperation page-style1">
        <el-form :rules="formRules" :model="formData">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="姓名" prop="userName">
                <el-input v-model="formData.userName" placeholder="请填写您的真实姓名" :maxlength="20" clearable @input="onNameInput"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="手机号码" prop="userPhone">
                <el-input v-model="formData.userPhone" placeholder="请填写员工手机号码" :maxlength="11" clearable @input="onPhoneInput" type="number"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" size="medium" clearable :maxlength="100" placeholder="选填"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span class="footer">
          <el-button round @click="handleCancel">取消</el-button>
          <el-button type="primary" round @click="handleClickSave" :loading="loading" :disabled="!formData.userName || !formData.userPhone">提交</el-button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Regular from "@utils/regular"
import { teamAdd, teamUpdate } from '@/services/api/pyAuth'
export default {
  name: 'addCooperation',
  data() {
    return {
      formRules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'change' },
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' }
        ],
        userPhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: Regular.mobileNumber, message: "请输入正确的手机号", trigger: "blur" }
        ]
      },
      formData: {
        userName: '',
        userPhone: '',
        remark: ''
      },
      loading: false
    }
  },
  activated() {
    if (Object.keys(this.$route.query).length) {
      this.formData = { ...this.$route.query }
    }
  },
  methods: {
    async handleClickSave() {
      try {
        let result = {}
        this.loading = true
        if (this.formData.status === 2) {
          result = await teamUpdate({ userName: this.formData.userName, userPhone: this.formData.userPhone, remark: this.formData.remark, id: this.formData.id })
        } else {
          result = await teamAdd({ userName: this.formData.userName, userPhone: this.formData.userPhone, remark: this.formData.remark  })
        }
        if (result && result.code === 0) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }
        this.$router.push({name: 'cooperationPersonnel'})
      } finally {
        this.loading = false
      }
    },
    handleCancel() {
      this.$router.push({name: 'cooperationPersonnel'})
    },
    onNameInput() {
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]*$/
      if (!reg.test(this.formData.userName)) this.formData.userName = this.formData.userName.slice(0, -1)
    },
    onPhoneInput() {
      if (this.formData.userPhone.length > 11) this.formData.userPhone = this.formData.userPhone.slice(0, 11)
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-cooperation {
    margin-left: 20px;
    width: 530px;
  }

  .page-box__title {
    width: auto;
  }
</style>