<template>
  <ky-page-container class="page-form-container" :title="`${isView?'查看':(isModify?'修改':'新增')}SKU`" show-go-back @back="handleGoBack" is-form-page v-loading="loading">
    <!-- <template #header-right>
      <div>
        <el-button type="text">
          <svg-icon icon-class="personalized-set" /> 个性化配置
        </el-button>
      </div>
    </template> -->
    <div class="main-container">
      <el-form ref="form" :model="formData" :rules="formRules" label-position="top" v-loading="loading">
        <el-row :gutter="60">
          <el-col :span="12">
            <el-form-item label="SKU(用于快速识别商品)" prop="barCode">
              <el-input placeholder="如无SKU系统自动生成" v-model.trim="formData.barCode" :maxlength="50" size="medium" v-kyerestrict.letterOrNumber :disabled="isModify" class="show-word-limit" :readonly="isView" show-word-limit clearable>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品尺寸">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-input placeholder="长度" v-model="formData.itemLength" :readonly="isView" size="medium" :maxlength="5" v-kyerestrict.integerNonZero clearable>
                    <template slot="append">(mm)</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input placeholder="宽度" v-model="formData.itemWidth" :readonly="isView" size="medium" :maxlength="5" v-kyerestrict.integerNonZero clearable>
                    <template slot="append">(mm)</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input placeholder="高度" v-model="formData.itemHeight" :readonly="isView" size="medium" :maxlength="5" v-kyerestrict.integerNonZero clearable>
                    <template slot="append">(mm)</template>
                  </el-input>
                </el-col>
              </el-row>

            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="60">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="itemName">
              <el-input placeholder="请输入商品名称" v-model.trim="formData.itemName" :maxlength="30" size="medium" :readonly="isView" class="show-word-limit" show-word-limit clearable>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量" prop="itemWeight">
              <el-input placeholder="请输入商品重量" v-model="formData.itemWeight" :maxlength="5" size="medium" v-kyerestrict.integerNonZero :readonly="isView" clearable><template slot="append">(kg)</template></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="60">
          <el-col :span="12">
            <el-form-item label="规格" prop="itemSpecs">
              <el-input placeholder="请输入商品规格" v-model.trim="formData.itemSpecs" :maxlength="40" size="medium" :readonly="isView" class="show-word-limit" show-word-limit clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="itemColor">
              <el-input placeholder="请输入颜色" v-model.trim="formData.itemColor" :maxlength="20" size="medium" :readonly="isView" class="show-word-limit" show-word-limit clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="60">
          <el-col :span="12">
            <el-form-item label="商品单位" prop="itemUnit">
              <el-select v-model="formData.itemUnit" placeholder="请选择" :readonly="isView">
                <el-option v-for="item in options" :key="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="尺码" prop="itemSize">
              <el-input placeholder="请输入尺码" v-model.trim="formData.itemSize" :maxlength="20" :readonly="isView" size="medium" class="show-word-limit" show-word-limit clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="60">
          <el-col :span="12">
            <el-form-item label="商品库存" prop="stocks">
              <el-input placeholder="请输入商品库存" v-model="formData.stocks" :maxlength="6" size="medium" v-kyerestrict.integerNonZero :readonly="isView" integerNonZero clearable><template slot="append">({{formData.itemUnit?formData.itemUnit:"件"}})</template></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remarks">
              <el-input placeholder="请输入备注" v-model="formData.remarks" :maxlength="100" :readonly="isView" size="medium" class="show-word-limit" show-word-limit clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="itemUrl">
        <p>商品图片</p>
        <div class="item-img">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" :before-upload="beforeAvatarUpload">
            <el-image v-if="imageUrl" :src="imageUrl" class="avatar" fit="contain" style="width:210px;height:210px">
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
            </el-image>
            <div v-else class="before-upload">
              <p>
                <svg-icon icon-class="itemimg-upload" style="width:26px;height:28px" />
              </p>
              <p>上传商品图片</p>
              <p class="img-type">支持上传JPG、PNG、JPEG格式</p>
            </div>
          </el-upload>

        </div>

      </div>
    </div>
    <el-button v-if="!isView" round size="medium" @click="handleGoBack">取消</el-button>
    <el-button v-if="!isView" type="primary" round size="medium" @click="saveData">保存</el-button>
  </ky-page-container>
</template>

<script>
import Regular from '@utils/regular'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { getLoginCompanyName } from '@/utils/clientUtil'
import { addItemInfo, updateItemInfo, getItemInfoById } from '@/services/api/supplier'
import { uploadFileApi } from '@/services/api/bill'

export default {
  data () {
    const checkEmoji = async (rule, value, callback) => {
      if (Regular.emoji.test(value) || /[ ]/.test(value)) {
        let fieldName = ''
        switch (rule.field) {
          case 'itemName':
            fieldName = '商品名称'; break
          case 'itemSpecs':
            fieldName = '规格'; break
          case 'remarks':
            fieldName = '备注'; break
          case 'itemSize':
            fieldName = '尺码'; break
          case 'itemColor':
            fieldName = '颜色'; break
        }
        return callback(`${fieldName}不支持空格和特殊字符`)
      }
      callback()
    }
    return {
      loading: false,
      imgs: [],
      imageUrl: '',
      formData: {
        id: '',
        barCode: '',
        itemName: '',
        itemSpecs: '',
        itemUnit: '',
        remarks: '',
        itemLength: '',
        itemWidth: '',
        itemHeight: '',
        itemWeight: '',
        stocks: '',
        itemPicture: '',
        itemSize: '',
        itemColor: ''
      },
      formRules: {
        itemName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { max: 30, message: '商品名称不得超过30个字', trigger: 'change' },
        ],
        itemUnit: [
          { required: true, message: '请选择商品单位', trigger: 'blur' },
        ],
        barCode: [
          { validator: this.checkSku, trigger: 'blur' }
        ],
        itemColor: [
          { validator: checkEmoji, trigger: 'change' }
        ],
        itemSize: [
          { validator: checkEmoji, trigger: 'change' }
        ]

      },
      options: ['件', '盒', '箱', '包', '瓶', '只', '千克', '克', '两', '斤', '双', '套', '对', '块', '台', '本', '把', '码', '捆', '提', '杯', '听', '条', '副', '顶']
    }
  },
  async activated () {
    const id = this.$route.query.id
    if (!id) {
      return
    }
    this.formData.id = id
    let params = {
      id: id
    }
    const res = await getItemInfoById(params)
    if (res.code === 0 && res.data) {
      Object.assign(this.formData, res.data)
      this.imageUrl = res.data.itemPicture
    }
  },
  beforeRouteLeave (to, from, next) {
    this.resetForm()
    next()
  },
  methods: {
    async handleGoBack () {
      if (this.isView) {
        this.$router.push('/supplier/sku')
        return
      }
      await this.$confirm('取消后将不再保存数据，请确认是否取消?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this.$router.push('/supplier/sku')
    },
    resetForm () {
      this.$refs.form.resetFields()
      Object.assign(this.$data.formData, this.$options.data().formData)
      this.imgs = []
      this.formData.id = ''
      this.formData.barCode = ''
      this.formData.itemName = ''
      this.formData.itemSpecs = ''
      this.formData.itemUnit = ''
      this.formData.remarks = ''
      this.formData.itemLength = ''
      this.formData.itemWidth = ''
      this.formData.itemHeight = ''
      this.formData.itemPicture = ''

      this.imageUrl = ''
    },
    saveData () {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        this.loading = true
        let res
        try {
          if (!this.isClientMode) {
            await this.uploadFile()
          }

          const params = Object.assign({ supplierPhone: getPhone(), supplierName: getLoginCompanyName(true), customerCode: getCustomerCode() }, this.formData)
          if (this.isModify) {
            params.stocks = this.handleNumber(params.stocks)
            params.itemWeight = this.handleNumber(params.itemWeight)
            params.itemHeight = this.handleNumber(params.itemHeight)
            params.itemWidth = this.handleNumber(params.itemWidth)
            params.itemLength = this.handleNumber(params.itemLength)
            res = await updateItemInfo(params)
          } else {
            res = await addItemInfo(params)
          }
          if (res.code === 0) {
            this.$message.success(`${this.isModify ? '修改' : '新增'}成功`)
            this.resetForm()
            this.$router.push({ name: 'sku', params: { refresh: true } })
          }
        } finally {
          this.loading = false
        }
      })
    },
    async beforeAvatarUpload (el) {
      try {

        let self = this
        self.imgs = []
        if (this.isClientMode) {
          let isPngOrJpg = false

          const imgType = el.path.substring(el.path.lastIndexOf('.') + 1).toLowerCase()

          if (imgType === 'jepg' || imgType === 'jpg' || imgType === 'png') {
            isPngOrJpg = true
          }
          if (!isPngOrJpg) {
            this.$message.error('图片只支持 JPG ,PNG格式!')
            return
          }
          const img = await this.$native.fileToBase64(el.path, false)
          const size = this.calculationFileSize(img)
          const isLt2M = size / 1024 / 1024 < 2
          if (!isLt2M) {
            this.$message.error('上传图片大小不能超过 2MB!')
            return
          }
          self.imgs.push('img,' + img)
          await this.uploadFile()
          this.imageUrl = this.formData.itemPicture
        }
        else {

          const isJPG = el.type === 'image/jpeg' || el.type === 'image/png'
          const isLt2M = el.size / 1024 / 1024 < 2

          if (!isJPG) {
            this.$message.error('图片只支持 JPG ,PNG格式!')
            return
          }
          if (!isLt2M) {
            this.$message.error('上传图片大小不能超过 2MB!')
            return
          }
          this.imageUrl = URL.createObjectURL(el)
          let reader = new FileReader()
          reader.readAsDataURL(el)
          reader.onload = function (e) {
            self.imgs.push(this.result)
          }
        }


      } catch (ex) {
        console.log('ex', ex)
      }
    },
    async uploadFile () {
      if (this.imgs.length === 0) {
        return
      }
      let pictures = this.imgs.map(item => {
        return item.substring(item.indexOf(',') + 1)
      })
      let params = {
        paymentCompanyNumber: getPhone(),
        picture: pictures,
      }
      let res = await uploadFileApi(params)
      if (res.code === 0) {
        this.formData.itemPicture = res.data.imageUrl
      }
    },
    async checkSku (rule, value, callback) {
      if (this.isModify) {
        return callback()
      }
      if (value) {
        const params = {
          barCode: value
        }
        const res = await getItemInfoById(params)
        if (res.code === 0 && res.data) {
          return callback('SKU号已存在')
        }
      }
      callback()
    },
    calculationFileSize (val) {
      let eqTagIndex = val.indexOf('=')
      val = eqTagIndex != -1 ? val.substring(0, eqTagIndex) : val
      let strLen = val.length
      let fileSize = strLen - (strLen / 8) * 2
      return fileSize
    },
    handleNumber (value) {
      let val = value
      if (!value) {
        val = 0
      }
      return val
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
  watch: {

  }
}
</script>

<style lang="scss" scoped>
  .page-form-container {
    /deep/ {
      .el-form {
        max-width: 920px;
        margin-top: 20px;
        .el-form-item {
          margin-bottom: 26px;
        }
      }
      .el-button + .el-button {
        margin-left: 12px;
      }
    }
    .main-container {
      font-size: 14px;
      color: #606266;
      display: flex;
      .itemUrl {
        text-align: left;
        margin-top: 20px;
        margin-left: 60px;
        .item-img {
          margin-top: 12px;
          border: 1px solid #e9e9e9;
          width: 212px;
          height: 212px;
          // display: flex;
          // justify-content: center;
          // align-items: center;

          .before-upload {
            display: flex;
            justify-content: center;
            flex-direction: column;
            line-height: 24px;
            height: 212px;
            width: 212px;
            vertical-align: middle;
            .img-type {
              font-size: 12px;
              color: #c4c4c4;
            }
          }
        }
      }
    }
  }
</style>