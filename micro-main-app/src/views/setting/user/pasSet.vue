<template>
  <!-- 密码设置 -->
  <div class="page-style1">
    <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
      <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>密码管理
    </div>
    <div class="pasSet">
      <el-form :model="ruleForm"
               :rules='rules'
               ref="ruleForm">
        <el-row v-if="isHasPwd">
          <el-col :span='7'>
            <el-form-item label='当前密码'
                          prop='curPass'>
              <el-input type="password"
                        onpaste='return false'
                        maxLength='32'
                        v-model="ruleForm.curPass"
                        placeholder='请输入当前密码'
                        clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span='7'>
            <el-form-item label='新密码'
                          prop='pass'>
              <el-input type="password"
                        onpaste='return false'
                        maxLength='32'
                        v-model="ruleForm.pass"
                        placeholder='请输入新密码'
                        clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span='7'>
            <el-form-item label='确认新密码'
                          prop='checkPass'>
              <el-input type="password"
                        onpaste='return false'
                        maxLength='32'
                        v-model="ruleForm.checkPass"
                        placeholder='请再次填写新密码'
                        clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button round @click="handleCancel">取消</el-button>
          <el-button class="elButton"
                     size="medium"
                     type="primary"
                     round v-btnThrottle
                     @click="submitForm('ruleForm2')">确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { updateUserPassword , updateUserFirstPassword } from '@/services/api/setting'
import { userLogout } from '@/utils/commonUtil'

var md5 = require('md5')
export default {
  data() {
    let validatePass2 = (rule , value , callback) => {
      if (value === '') {
        callback(new Error('请再次填写密码'))
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次填写密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        curPass: '' ,
        pass: '' ,
        checkPass: ''
      } ,
      rules: {
        curPass: [
          {required: true , message: '请输入当前密码' , trigger: 'blur'} ,
        ] ,
        pass: [
          {required: true , message: '请输入当前密码' , trigger: 'blur'} ,
          {pattern: /^[^\u4e00-\u9fa5]{8,32}$/ , message: '请输入8-32位密码'}
        ] ,
        checkPass: [
          {required: true , validator: validatePass2 , trigger: 'blur'}
        ]
      }
    }
  } ,
  computed:{
    isHasPwd(){
      return this.$store.state.userInfo && this.$store.state.userInfo.hasPwdFlag
    }
  },
  methods: {
    async submitForm() {
      if (this.isHasPwd) {
        let params = {
          oldPassWord: md5(this.ruleForm.curPass).toLocaleUpperCase() ,
          newPassWord: md5(this.ruleForm.pass).toLocaleUpperCase()
        }
        this.$refs['ruleForm'].validate((valid) => {
          valid && updateUserPassword(params).then((res) => {
            if (res.code === 0) {
              this.$message({
                showClose: true ,
                message: '设置成功!' ,
                type: 'success'
              })
              userLogout()
            }
          })
        })
      } else {
        let params = {
          password: md5(this.ruleForm.pass).toLocaleUpperCase()
        }
        this.$refs['ruleForm'].validate((valid) => {
          valid && updateUserFirstPassword(params).then((res) => {
            if (res.code === 0) {
              this.$message({
                showClose: true ,
                message: '设置成功!' ,
                type: 'success'
              })
              userLogout()
            }
          })
        })
      }
    },
    handleCancel() {
      this.$router.push({name: 'user'})
    }
  }
}
</script>
<style lang="scss" scoped>
.pasSet {
  padding: 0 24px 24px;
}

.page-box__title {
  width: auto;
}
</style>
