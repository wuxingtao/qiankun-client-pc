<template>
  <ky-page-container class="page-form-container" :title="`${isView?'查看':(isModify?'修改':'新增')}供应商`" show-go-back is-form-page v-loading="loading" @back="handleGoBack">
    <el-form ref="form" class="main-form" :model="formData" :rules="formRules" label-position="top" v-loading="loading">
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input placeholder="请输入供应商名称" v-model.trim="formData.supplierName" class="show-word-limit" show-word-limit :maxlength="30" size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input placeholder="请输入联系人姓名" v-model.trim="formData.contactName" :maxlength="30" class="show-word-limit" show-word-limit size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="contactPhone">
        <el-input placeholder="请输入11位手机号码" v-model.trim="formData.contactPhone" v-kyerestrict.positive :maxlength="11" size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <el-form-item label="固定电话" prop="telephone">
        <el-input placeholder="请输入供应商固定电话" v-model="formData.telephone" :maxlength="20" size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input placeholder="请输入供应商电子邮箱" v-model="formData.email" :maxlength="20" size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <el-form-item label="供应商地址" required :prop="isView?'':'supplierAddress'">
        <el-input v-if="isView" v-model="formData.supplierAddress" size="medium" :readonly="isView"></el-input>
        <address-item v-else ref="supplierAddress" :fullAddress.sync="formData.supplierAddress" :readonly="isView" />
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input placeholder="请输入备注(选填)" v-model="formData.remarks" :maxlength="100" class="show-word-limit" show-word-limit size="medium" clearable :readonly="isView"></el-input>
      </el-form-item>
      <!-- <el-row :gutter="60">
        <el-col :span="12">
          <el-form-item label="联系人" prop="contactName">
            <el-input placeholder="请输入联系人姓名" v-model.trim="formData.contactName" :maxlength="30" class="show-word-limit" show-word-limit size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电子邮箱" prop="email">
            <el-input placeholder="请输入供应商电子邮箱" v-model="formData.email" :maxlength="20" size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="60">
        <el-col :span="12">
          <el-form-item label="手机号码" prop="contactPhone">
            <el-input placeholder="请输入11位手机号码" v-model.trim="formData.contactPhone" v-kyerestrict.positive :maxlength="11" size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="固定电话" prop="telephone">
            <el-input placeholder="请输入供应商固定电话" v-model="formData.telephone" :maxlength="20" size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="60">
        <el-col :span="12">
          <el-form-item label="供应商名称" prop="supplierName">
            <el-input placeholder="请输入供应商名称" v-model.trim="formData.supplierName" class="show-word-limit" show-word-limit :maxlength="30" size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remarks">
            <el-input placeholder="请输入备注(选填)" v-model="formData.remarks" :maxlength="100" size="medium" clearable :readonly="isView"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="60" class="row-address">
        <el-col :span="24">
          <el-form-item label="供应商地址" required prop="supplierAddress">
            <el-input v-if="isView" v-model="formData.supplierAddress" size="medium" :readonly="isView"></el-input>
            <address-item v-else ref="supplierAddress" :fullAddress.sync="formData.supplierAddress" :readonly="isView" />
          </el-form-item>
        </el-col>
      </el-row> -->
    </el-form>
    <div class="btns-wrapper" v-if="!isView">
      <el-button round size="medium" @click="handleGoBack">取消</el-button>
      <el-button type="primary" round size="medium" @click="saveData">保存</el-button>
    </div>
  </ky-page-container>
</template>

<script>
import Regular from "@utils/regular"
import { getPhone, getCustomerCode } from '@/utils/storage'
import { addSupplier, modifySupplier, getSupplierList } from '@/services/api/supplier'
export default {
  data () {
    const checkContactPhone = async (rule, value, callback) => {
      if (value === getPhone()) {
        return callback('手机号码不支持为本人号码')
      }
      callback()
    }
    const checkSupplierAddress = async (rule, value, callback) => {
      const result = await this.$refs.supplierAddress.validateForm()
      if (!result) {
        return callback(new Error(" "))
      }
      callback()
    }
    const checkEmoji = async (rule, value, callback) => {
      if (Regular.emoji.test(value) || /[ ]/.test(value)) {
        let fieldName = ""
        switch (rule.field) {
          case "contactName":
            fieldName = "联系人"; break
          case "supplierName":
            fieldName = "供应商名称"; break
        }
        return callback(`${fieldName}不支持空格和特殊字符`)
      }
      callback()
    }
    return {
      loading: false,
      originContactPhone: '',
      formData: {
        id: '',
        contactName: '',
        email: '',
        contactPhone: '',
        telephone: '',
        supplierName: '',
        remarks: '',
        supplierAddress: ''
      },
      formRules: {
        contactName: [
          { required: true, message: "请输入联系人", trigger: "blur" },
          { min: 2, message: "联系人不能少于2个字", trigger: "change" },
          { max: 30, message: "联系人不得超过30个字", trigger: "change" },
          { validator: checkEmoji, trigger: "change" },],
        email: [
          // { required: true, message: "请输入正确的电子邮箱", trigger: "blur" },
          { pattern: Regular.email, message: "请输入正确的电子邮箱", trigger: "blur", },],
        contactPhone: [
          { required: true, message: "请输入正确手机号码", trigger: "blur" },
          { pattern: Regular.mobileNumber, message: "请输入正确的手机号", trigger: "blur", },
          { validator: checkContactPhone, trigger: "blur" },],
        telephone: [
          { pattern: Regular.landlinePhone2, message: "请输入正确的固定电话", trigger: "blur", }],
        supplierName: [
          { required: true, message: "请输入供应商名称", trigger: "blur" },
          { min: 2, message: "供应商名称不能少于2个字", trigger: "change" },
          { max: 30, message: "供应商名称不得超过30个字", trigger: "change" },
          { pattern: /[A-Za-z\u4e00-\u9fa5]{1,30}/, message: '供应商名称不支持纯数字、纯符号或数字与符号组合', trigger: 'change' },
          { validator: checkEmoji, trigger: "change" },],
        supplierAddress: [
          { validator: checkSupplierAddress, trigger: "blur" },
        ],
      },
    }
  },
  async activated () {
    const id = this.$route.query.id
    if (!id) {
      return
    }
    this.formData.id = id
    const res = await getSupplierList({ id })
    if (res.code === 0 && res.data && res.data.rows) {
      Object.assign(this.formData, res.data.rows[0])
      this.originContactPhone = this.formData.contactPhone
      if (this.$refs.supplierAddress) {
        this.$refs.supplierAddress.fillTheAddress(this.formData.supplierAddress, () =>
          this.$refs.form.validateField("supplierAddress")
        )
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    this.resetForm()
    next()
  },
  methods: {
    async handleGoBack () {
      if (!this.isView) {
        await this.$confirm('取消后将不再保存数据，请确认是否取消?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      this.$router.push('/supplier/index')
    },
    resetForm () {
      this.$refs.form.resetFields()
      Object.assign(this.$data.formData, this.$options.data().formData)
      // 清空详细地址
      if (this.$refs.supplierAddress) {
        this.$refs.supplierAddress.$refs.form.resetFields()
        this.$refs.supplierAddress.errorMsgOfdistrict = ''
        this.$refs.supplierAddress.formData.districtList = []
      }
    },
    saveData () {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        if (this.isModify && this.originContactPhone !== this.formData.contactPhone) {
          await this.$confirm('更换手机号码后原账号商品库将被清空并替换, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
        this.loading = true
        let res
        try {
          let params = Object.assign(this.formData, { customerCode: getCustomerCode() })
          if (this.isModify) {
            params = Object.assign(params, { updatedBy: getPhone() })
            res = await modifySupplier(params)
          } else {
            params = Object.assign(params, { createdBy: getPhone() })
            res = await addSupplier(params)
          }
          if (res.code === 0) {
            this.$message.success(`${this.isModify ? '修改' : '新增'}成功`)
            this.$router.push({ name: 'supplier-index', params: { refresh: true } })
          }
        } finally {
          this.loading = false
        }
      })
    }
  },
  computed: {
    isModify () {
      return !!this.formData.id
    },
    isView () {
      return this.$route.query.type === 'view'
    }
  },
}
</script>

<style lang="scss" scoped>
  .page-form-container {
    /deep/ {
      .main-form {
        max-width: 530px;
        margin-top: 20px;
        .el-form-item {
          margin-bottom: 26px;
        }
        .row-address > .el-col {
          .el-col {
            &:first-child {
              width: 47%;
            }
            &:last-child {
              width: 53%;
            }
          }
        }
      }
      .btns-wrapper {
        margin-bottom: 220px;
        .el-button + .el-button {
          margin-left: 12px;
        }
      }
    }
  }
</style>