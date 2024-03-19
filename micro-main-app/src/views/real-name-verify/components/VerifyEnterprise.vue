<template>
  <div class='verify-enterprise-container'>
    <el-form ref='form' :model='formData' :rules='rules'
             label-position='left'
             class='id-card-wrapper'>
      <el-form-item :label='certificateKeywordName' prop='certificateNo'>
        <div class='item-name'>
          <el-input v-model='formData.certificateNo' maxlength='30'
                    :placeholder="'请输入'+certificateKeywordName" autocomplete='off'></el-input>
          <el-upload :auto-upload='false' :show-file-list='false' action=''
                     :accept="isClientMode ? '.jpeg,.jpg,.png,.pdf,.svg' : 'image/*'"
                     :on-change='uploadCertificateImage'>
            <el-link :underline='false'><img src='@/assets/image/client/realNameVerify/id-card.png' />上传证件</el-link>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { ocrImgByIdentityCard, ocrImgRecognition } from '@/services/api/realNameVerify'
import { readFileToBase64 } from '@utils/clientUtil'

export default {
  props: ['certificateType'],
  data() {
    var validateNo = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.certificateKeywordName + '不能为空'))
      } else {
        callback()
      }
    }
    return {
      existsCreditCode: false,
      ocrResult: {
        certificateNo: '',//证件编码
        orgNames: ''
      },
      formData: {
        certificateNo: '',//证件编码
        orgNames: ''
        // companyRegAddress: '',
      },
      rules: {
        certificateNo: [
          { required: true, validator: validateNo, trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    async validate() {
      return await this.$refs.form.validate()
    },
    async ocrRecognitionAndUploadImage(file, callback) {
      const base64 = await readFileToBase64(file, true)
      let res = await ocrImgRecognition(base64, this.certificateType)
      callback(res)
    },
    uploadCertificateImage(file) {
      let that = this
      this.ocrRecognitionAndUploadImage(file, (res) => {
        if (res.code !== 0) {
          if (res.msg.includes('为空')) {
            that.$message.error('请上传正确的证件照')
          } else if (res.msg.includes('超时')) {
            that.$message.error('网络开小差了，请您重新尝试上传')
          } else {
            that.$message.error(res.msg)
          }
          return
        }
        that.setformData(res.data.result.ocr_data_list)
      })
    },
    setformData(ocrDataList) {
      switch (this.certificateType) {
        case '10':
          this.formData.certificateNo = ocrDataList.find((item) => item.key === 'BizLicenseCreditCode').value //'统一信用代码'
          this.existsCreditCode = this.formData.certificateNo
          if (!this.formData.certificateNo) {
            this.formData.certificateNo = ocrDataList.find((item) => item.key === 'BizLicenseRegistrationCode').value //'注册号'
          }
          this.formData.orgNames = ocrDataList.find((item) => item.key === 'BizLicenseCompanyName').value
          // this.formData.companyRegAddress = ocrDataList.find((item) => item.key === 'BizLicenseAddress').value
          break
        case '20':
          this.formData.certificateNo = ocrDataList.find((item) => item.key === 'code').value
          this.formData.orgNames = ocrDataList.find((item) => item.key === 'organization_name').value
          // this.formData.companyRegAddress = ocrDataList.find((item) => item.key === 'address').value
          break
        case '30':
          this.formData.certificateNo = ocrDataList.find((item) => item.key === 'tax_number').value
          this.formData.orgNames = ocrDataList.find((item) => item.key === 'name').value
          // this.formData.companyRegAddress = ocrDataList.find((item) => item.key === 'address').value
          break
      }
      Object.assign(this.ocrResult, this.formData)
      this.$refs.form.validate()
    }
  },
  watch: {
    'formData.certificateNo'() {
      if (this.ocrResult.certificateNo !== this.formData.certificateNo) {
        this.formData.orgNames = ''
      }
    }
  },
  computed: {
    certificateKeywordName() {
      switch (this.certificateType) {
        case '10':
          return '统一信用代码'
        case '20':
          return '组织结构代码'
        default:
          return '税字号'
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.verify-enterprise-container {
  .item-name {
    /deep/ .el-upload {
      position: absolute;
      right: 0;
      bottom: 0;
    }

    .el-link {
      color: #7352bf;

      img {
        display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: text-bottom;
        padding-right: 4px;
      }
    }
  }
}
</style>
