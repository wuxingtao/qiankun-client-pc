<template>
  <div class='verify-id-container'>
    <div class='category-title'>{{ title }}</div>
    <el-form ref='form' :model='formData' :rules='rules'
             label-position='left'
             class='id-card-wrapper'>
      <el-form-item label='姓名' prop='idName'>
        <div class='item-name'>
          <el-input v-model.trim='formData.idName' maxlength='10'
                    placeholder='请填写您的真实姓名'
                    autocomplete='off'></el-input>
          <el-upload :auto-upload='false' :show-file-list='false' action=''
                     :accept="isClientMode ? '.jpeg,.jpg,.png,.pdf,.svg' : 'image/*'"
                     :on-change='uploadIdBackImage'>
            <el-link :underline='false'><img src='@/assets/image/client/realNameVerify/id-card.png' />上传证件</el-link>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label='身份证号' prop='idNo'>
        <el-input v-model.trim='formData.idNo' v-kyerestrict.regular='/^\d*(x)?$/i'
                  maxlength='18'
                  placeholder='请填写您的身份证号'
                  autocomplete='off'></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ocrImgByIdentityCard } from '@/services/api/realNameVerify'
import { checkIdCardNo } from '@/utils/idCardNoUtil'
import native from '@/utils/native'
import { readFileToBase64 } from '@utils/clientUtil'

export default {
  props: {
    title: {
      type: String,
      default: () => '请填写您的二代身份证'
    }
  },
  data() {
    var validateIdCard = (rule, value, callback) => {
      if (value && !checkIdCardNo(value)) {
        callback(new Error('请您填写正确的身份证号码'))
      } else {
        callback()
      }
    }
    return {
      formData: {
        idName: '',
        idNo: '',
        gender: '1'
      },
      rules: {
        idName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { pattern: /^[\u4E00-\u9FA5]+$/, message: '姓名必须为纯中文', trigger: 'blur' }
        ],
        idNo: [{ required: true, message: '身份证号码不能为空', trigger: 'blur' },
          { validator: validateIdCard, trigger: 'blur' }]
      }
    }
  },
  computed: {},
  methods: {
    async ocrRecognitionAndUploadImage(file, callback) {
      const base64 = await readFileToBase64(file, true)
      let res = await ocrImgByIdentityCard(base64, false)
      callback(res)
      // let reader = new FileReader()
      // reader.readAsDataURL(file.raw)
      // reader.onload = async function () {
      //   let res = await ocrImgByIdentityCard(this.result , false)
      //   callback(res)
      // }
    },
    uploadIdBackImage(file) {
      this.ocrRecognitionAndUploadImage(file, (res) => {
        if (res.code === 0) {
          this.formData.idName = res.data.name
          this.formData.idNo = res.data.idNum
          this.formData.gender = res.data.sex === '男' ? 1 : 2
          this.$refs.form.validate()
        } else if (res.msg.includes('OCR识别失败')) {
          this.$message.error('请上传身份证反面照')
        } else if (res.msg.includes('超时')) {
          this.$message.error('网络开小差了，请您重新尝试上传')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async validate() {
      return await this.$refs.form.validate()
    }
  }
}
</script>

<style lang='scss' scoped>
.verify-id-container {
  display: flex;
  flex-direction: column;
  flex: 1;

  .category-title {
    font-size: 20px;
    height: 22px;
    line-height: 22px;
    margin: 0 0 22px;
    color: #333333;
    font-weight: bold;
  }

  .id-card-wrapper {
    width: 530px;

    .item-name {
      position: relative;

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
}
</style>
