<template>
  <ky-page-container class="page-form-container" title="表单页示例" show-go-back before-route-path="/demo/page-list" is-form-page>
    <el-form ref="form" :model="formData" :rules="formRules" label-position="top" v-loading="loading" >
      <el-row :gutter="20" >
        <el-col :span="12">
          <el-form-item label="公司名称" prop="company">
            <el-input placeholder="请输入公司名称" v-model.trim="formData.company" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contact">
            <el-input placeholder="请输入真实姓名" v-model="formData.contact" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="公司名称" prop="company">
            <el-input placeholder="请输入公司名称" v-model.trim="formData.company" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contact">
            <el-input placeholder="请输入真实姓名" v-model="formData.contact" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-button round size="medium">取消</el-button>
    <el-button type="primary" round size="medium">保存</el-button>
  </ky-page-container>
</template>

<script>
export default {
  data() {
    const companyValid = (rule, value, callback) => {
      if (!value && value.length < 2) {
        return callback(new Error("收件公司名称不能少于两个字"))
      }
      callback()
    }
    return {
      loading: false,
      formData: {
        company: "",
        contact: "",
      },
      formRules: {
        contact: [
          { required: true, message: "联系人不能为空", trigger: "blur" },
        ],
        company: [
          { min: 2, max: 30, validator: companyValid, trigger: "blur" },
        ],
      },
    }
  },
}
</script>

<style lang="scss" scoped>
  .page-form-container {
    /deep/ {
      .el-form {
        margin-top: 20px;
        .el-form-item {
          margin-bottom: 26px;
        }
      }
      .el-button + .el-button {
        margin-left: 12px;
      }
    }
  }
</style>