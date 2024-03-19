<template>
  <ky-dialog title='智能填写' :visible.sync='dialogVisible' :close-on-click-modal='false' width='700px' :lock-scroll='false'
             @close='onClose'>
    <div class='dialog-body page-style1'>
      <div>粘帖整段地址，自动识别姓名、电话和地址</div>
      <el-form ref='form' :model='formData' :rules='formRules' label-position='top' label-width='88px'>
        <el-form-item prop='content'>
          <el-input type='textarea' :rows='5' v-model='formData.content' resize='none' clearable maxlength='100'
                    show-word-limit placeholder='粘贴文本，自动识别姓名、电话和地址。例如：张三  13666666666  广东省深圳市宝安区航站四路跨越速运大厦'></el-input>
          <el-button plain size='small' class='btn-parse'
                     :disabled='!formData.content' @click='parseAddress'>识别
          </el-button>
        </el-form-item>
        <div v-show='showParseContent'>
          <ky-ui-tip type='warning' class='mb_20 mt_20' v-if='show_parse_tip'>请检查地址、姓名、电话信息等是否准确，如有遗漏请及时修改</ky-ui-tip>
          <el-row :gutter='16'>
            <!-- <el-col :span="8">
              <el-form-item label="公司名称" prop="company">
                <el-input v-model="formData.company" size="medium" clearable :maxlength="30" placeholder="请输入公司名称" />
              </el-form-item>
            </el-col> -->
            <el-col :span='8'>
              <el-form-item label='联系人' prop='contact'>
                <el-input v-model='formData.contact' size='medium' clearable :maxlength='30' placeholder='请输入联系人姓名' />
              </el-form-item>
            </el-col>
            <el-col :span='8'>
              <el-form-item label='手机号码' prop='contactPhone'>
                <el-input v-model='formData.contactPhone' size='medium' clearable :maxlength='11'
                          placeholder='请输入手机号码' />
              </el-form-item>
            </el-col>
            <el-col :span='8'>
              <el-form-item label='固定电话' prop='telephone'>
                <el-input v-model='formData.telephone' size='medium' clearable :maxlength='20' placeholder='请输入固定电话' />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter='16' style='margin-top:16px'>
            <el-col :span='24'>
              <el-form-item>
                <template #label>
                  <!--                  <i style='color:#F56C6C'>*</i> -->
                  详细地址
                </template>
                <ky-address ref='addressRef' :data='formData.addressData' />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <span slot='footer' class='dialog-footer'>
      <el-button @click='onClose'>取 消</el-button>
      <el-button type='primary' class="ky-button" @click='saveData' :loading='loading' :disabled='!showParseContent'>确 定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import Regular from '@utils/regular'
import * as addressApi from '@api/address'
import { KyUiTip } from '@comps/ky-ui'

export default {
  name: 'ParseAddressInfo',
  props: {
    callbackFunc: { type: Function }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      show_parse_tip: false,
      showParseContent: false, // 是否展示识别内容
      parseResultMd5:'', //地址解析对应md5
      formData: {
        content: '',
        // company: '',
        contact: '',
        contactPhone: '',
        telephone: '',
        addressData: {}
      },
      formRules: {
        // content:[{ required: true, message: '请输入需要解析的信息', trigger: 'blur' }],
        contact: [{ message: '请输入联系人姓名', trigger: 'change' },
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
          { max: 30, message: '姓名不得超过30个字', trigger: 'change' },
          {
            pattern: /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]{2,30}$/,
            message: '姓名不支持空格和特殊字符',
            trigger: 'change'
          },
          {
            pattern: /^(?=.*[\u4E00-\u9FA5A-Za-z])[\s\S]{2,30}$/,
            message: '请输入真实姓名',
            trigger: 'change'
          }
        ],
        contactPhone: [
          {
            // required: true,
            len: 11,
            message: '请输入11位手机号',
            trigger: 'blur'
          },
          {
            pattern: Regular.mobileNumber,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  components: {
    KyUiTip
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.addressRef.reset()
        this.$refs.form.resetFields()
        this.show_parse_tip = false
        this.parseResultMd5 = ''
      })
    },
    async parseAddress() {
      // this.formData.content = '王明，13666666666，广东省深圳市宝安区航站四路跨越速运大厦，深圳仁美；'
      if (!this.formData.content ) {
        this.$message('请输入需要解析的地址信息')
        return
      }
      let res = await addressApi.aiAddrAnalysis(this.formData.content)
      if (res.code !== 0) {
        this.$message('地址识别失败，请重新输入')
        return
      }
      const data = res.data
      // this.formData.company = ''
      this.parseResultMd5 = data.aimd5
      this.formData.contact = data.contact
      this.formData.contactPhone = data.contactPhone
      this.formData.telephone = data.telephone
      const districtList = [data.province, data.city, data.district].filter(f => f)
      this.formData.addressData = {
        districtList: districtList,
        detailAddress: data.detailAddress
      }
      this.showParseContent = true
      this.$refs.form.validate(() => {
        this.$refs.addressRef.validateForm()
      })
      this.show_parse_tip = true
    },
    saveData() {
      try {
        this.loading = true
        this.$refs.form.validate(async valid => {
          if (!await this.$refs.addressRef.validateForm()) {
            return
          }
          if (valid) {
            const result = {
              ...this.formData,
              ...this.formData.addressData,
              address: this.formData.addressData.districtList.join('') + this.formData.addressData.detailAddress
            }
            this.callbackFunc(result)
            this.dialogVisible = false
            this.parseAddressResultCallback()      
          }
        })
      } finally {
        this.loading = false
      }
    },
    parseAddressResultCallback(){
      if(!this.parseResultMd5){
        return
      }
      const {districtList,detailAddress}= this.formData.addressData
      const params = {
        name:this.formData.contact,
        province:districtList[0],
        city:districtList[1],
        district:districtList[2]||'',
        detailedAddress:detailAddress,
        phoneNumber:this.formData.contactPhone || this.formData.telephone,
        // companyName:'',
        aimd5:this.parseResultMd5
      }
      addressApi.aiAddrAnalysisCallback(params)
    },
    onClose() {
      this.showParseContent = false
      this.dialogVisible = false
    }
  }
}
</script>

<style lang='scss' scoped>
.dialog-body {
  margin-bottom: 4px;

  & > div:first-of-type {
    height: 20px;
    line-height: 20px;
    color: #03050d;
    margin-bottom: 8px;
  }

  /deep/ {
    .ky-ui-tip {
      height: 30px;
      line-height: 30px;
    }

    .el-form-item {
      margin-bottom: 0;

      .el-form-item__error {
        top: 105%;
      }
    }

    .el-textarea__inner {
      padding: 12px;
      background: #f7f7f7;
      border: none;
      color: #03050D;
      font-weight: bold;
    }

    .el-input__count {
      background: transparent;
      line-height: 1;
      bottom: 18px;
      right: 104px;
    }

    .btn-parse {
      height: 32px;
      width: 72px;
      position: absolute;
      right: 12px;
      bottom: 8px;
      border: 1px solid #8365f6;
      border-radius: 4px;
      font-size: 12px;
      color: #8365f6;
      background-color: #F7F7F7;
    }

    .is-disabled, .is-disabled:hover {
      background-color: #e8ecf2;
      border-color: #c1c7cf;
      color: #b3bbc5;
    }

    textarea {
      @include scroll-bar;
    }

    .address-container {
      .address-cascader--wrapper {
        width: 33%;
      }

      .address-input--wrapper {
        width: 67%;
      }
    }
  }
}
</style>
