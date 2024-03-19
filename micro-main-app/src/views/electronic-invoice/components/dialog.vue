<template>
  <div class="dialog">
    <el-dialog :title="title" :visible.sync="dialogVisible" width="750px">
      <el-form :model="form" :rules="rules" ref="form"  v-loading="loading">
        <el-row>
          <el-form-item label="抬头类型" prop="buyerType" style="margin: 10px auto 5px auto;">
            <el-radio-group v-model="form.buyerType">
              <el-radio label="10">企业</el-radio>
              <el-radio label="20">个人</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票抬头" prop="buyerName">
              <el-input clearable v-model="form.buyerName" placeholder="请输入发票抬头"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.buyerType==='10'">
              <el-form-item label="纳税人识别号" prop="taxpayersId">
                <el-input clearable v-model="form.taxpayersId" placeholder="请输入纳税人识别号" maxlength="30" :oninput="handleOninput(/[^\dA-Za-z]/g, form.taxpayersId, 'taxpayersId')"></el-input>
              </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票内容">
              <el-input disabled placeholder="收派服务费"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票金额">
              <el-input  disabled :placeholder="codeList.length>0?codeList[0].expressAmount:''"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票税点">
              <el-input disabled placeholder="6%"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.buyerType==='10'">
              <el-form-item label="开户银行" prop="bankName">
                <el-input clearable v-model="form.bankName" placeholder="请输入开户银行"></el-input>
              </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.buyerType==='10'">
              <el-form-item label="银行账号" prop="bankAccountNumber">
                <el-input clearable v-model="form.bankAccountNumber" placeholder="请输入银行账号"></el-input>
              </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input clearable v-model="form.email" placeholder="请输入电子邮箱">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="companyPhoneNumber">
              <el-input clearable v-model="form.companyPhoneNumber" placeholder="请输入电话" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12"  v-if="form.buyerType==='10'">
              <el-form-item label="地址" prop="buyerAddress">
                <el-input clearable v-model="form.buyerAddress" placeholder="请输入地址"></el-input>
              </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {submitEleInvoice} from '@/services/api/electronic-invoice.js'
import { validateThingName, validateNashui, validateEmail } from '@/utils/validate'
export default {
  props: ['codeList', 'phone'],
  data () {
    var validUserName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('发票抬头不能为空'))
      } else {
        if (!validateThingName(value)) {
          callback(new Error('只能输入字母、中文、数字、括号和-'))
        } else {
          callback()
        }
      }
    }
    var checkTaxpayers = (rule, value, callback) => {
      if (this.form.buyerType === '01') {
        if (value === '') {
          callback(new Error('请输入纳税人识别号'))
        } else {
          if (!validateNashui(value)) {
            callback(new Error('只能输入字母中文数字括号空格和-'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    }
    var checkBuyerAccount = (rule, value, callback) => {
      if (value) {
        if (!validateThingName(value)) {
          callback(new Error('只能输入字母、中文、数字、括号和-'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    var checkEmail = (rule, value, callback) => {
      if (value) {
        if (!validateEmail(value)) {
          callback(new Error('邮箱格式不正确'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      title: '开电子发票',
      dialogVisible: false,
      loading: false,
      form: {
        buyerName: '',
        buyerType: '10',
        taxpayersId: "",
        email: "",
        bankName: "",
        bankAccountNumber:"",
        buyerAddress: "",
        companyPhoneNumber: ""
      },
      rules: {
        buyerName: [
          { required: true, message: '请输入发票抬头', trigger: 'blur' },
          { min: 0, max: 25, message: '长度在25个字符内', trigger: 'blur' },
          { validator: validUserName, trigger: 'blur' }
        ],
        buyerType: [
          { required: true, message: '请选择抬头类型', trigger: 'change' }
        ],
        taxpayersId: [
          { required: true, message: '请输入纳税人识别号', trigger: 'blur' },
          { min: 0, max: 18, message: '长度在18个字符内', trigger: 'blur' },
          { validator: checkTaxpayers, trigger: 'blur' }
        ],
        buyerAccount: [
          { min: 0, max: 49, message: '长度在49个字符内', trigger: 'blur' },
          { validator: checkBuyerAccount, trigger: 'blur' }
        ],
        buyerAddress: [
          { min: 0, max: 50, message: '长度在50个字符内', trigger: 'blur' },
          { validator: checkBuyerAccount, trigger: 'blur' }
        ],
        email: [
          { min: 0, max: 50, message: '长度在50个字符内', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleOninput (reg, obj, attr) {
      if (obj && obj.replace) {
        var value = obj.replace(reg, '')
        this.$set(this.form, attr, value)
      }
    },
    // 打开弹框
    openDialog () {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    saveData () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let parms={
            invoiceTitle: this.form.buyerName,
            invoiceTitleType: this.form.buyerType,
            // personPhone: this.phone,
            invoiceType: 1,
            taxpayerIdentifierNumber: this.form.taxpayersId,
            invoiceContent: '收派服务费',
            companyAddress: this.form.buyerAddress,
            invoiceAmount: this.codeList.length>0?this.codeList[0].expressAmount:'',
            companyPhoneNumber:this.form.companyPhoneNumber,
            email: this.form.email,
            appInvoiceDetailExList: this.codeList,
            sendWaybillFlag: 1,
            bankAccountNumber:this.form.bankAccountNumber,
            bankName:this.form.bankName,
          }
          this.loading = true
          let res=await submitEleInvoice(parms)
          if (res.code === 0) {
            this.dialogVisible = false
            this.$emit('getDataList')
            this.$message({
              message: '发票将在1个工作日内开具，可通过[开票状态]筛选查询',
              type: 'success'
            })
          }else{
            this.$message({
              message: res.msg||'出错了，请联系客服处理',
              type: 'warning'
            })
          }
          this.loading = false
        }
      })
    }

  }
}
</script>
