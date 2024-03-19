<template>
  <div class="clientdialog">
    <el-dialog title="异常申诉"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="572px">
      <div class="content">
        <el-form ref="form"
                 :model="formData"
                 :rules="rules"
                 label-position="top"
                 label-width="80px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="申诉对象"
                            required>
                <el-radio-group @change="handleAppealTypeChanged"
                                v-model="appealType"
                                size="medium"
                                style="padding-top: 8px;">
                  <el-radio label="10">运单号</el-radio>
                  <el-radio label="20">本月账单</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="申诉运单号"
                            prop="waybillNumber">
                <el-input v-model="formData.waybillNumber"
                          :disabled="appealType==='20'"
                          maxlength="200"
                          placeholder="请输入运单号（多个运单号以逗号隔开） "></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="申诉类型"
                            prop="problemList">
                <el-checkbox-group v-model="formData.problemList">
                  <el-checkbox label="运费不对"></el-checkbox>
                  <el-checkbox label="重量不对"></el-checkbox>
                  <el-checkbox label="寄收件人不对"></el-checkbox>
                  <el-checkbox label="货物破损"
                               class="checkbox-last"></el-checkbox>
                  <el-checkbox label="货物超时"></el-checkbox>
                  <el-checkbox label="回单丢失"></el-checkbox>
                  <el-checkbox label="需要底联对账"></el-checkbox>
                  <el-checkbox label="账单与合同不符"
                               class="checkbox-last"></el-checkbox>
                  <el-checkbox label="需要运费计算规则"
                               style="margin-right:12px"></el-checkbox>
                  <el-checkbox label="其它"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="complaintContent">
                <template slot="label">申诉内容<span class="caption-description">（支持多选，选择其他时申诉内容必填）</span></template>
                <el-input v-model="formData.complaintContent"
                          type="textarea"
                          :rows="4"
                          maxlength="200"
                          show-word-limit
                          placeholder="请输入账单的异常内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="certification">
            <div class="certification-caption">上传证明<span class="caption-description">（用于辅助说明问题）</span></div>
            <ul class="certification-imgs">
              <li style="position:relative"
                  v-for="(item, index) in imgs"
                  :key="index">
                <i class="el-icon-circle-close certification-imgs-remove"
                   @click="removeImage(item)"></i>
                <el-image style="width: 126px; height: 126px"
                          fit="cover"
                          :src="item"></el-image>
              </li>
              <li v-if="imgs.length<1"
                  class="certification-imgs-add "
                  @click="uploadImgInClient">
                <i class="el-icon-plus"></i>
                <p>请上传2M以内的图片</p>
                <div v-if="!isClientMode">
                  <input id="selectImage"
                         type="file"
                         style="font-size:0; position:absolute; z-index:-99"
                         @change="uploadImg"
                         ref="imgInput" />
                  <label for="selectImage"> </label></div>
              </li>
            </ul>
          </div>

        </el-form>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="resetForm(); dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="saveData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addOrModifyAppealApi, pushAddAppealMessageApi } from "@/services/api/bill"
import { getCustomerCode } from "@/utils/storage"
import dayjs from 'dayjs'
import { getLoginCompanyName } from '@/utils/clientUtil'

export default {
  props: {
    appealInfo: { type: Object, required: true },
  },
  data () {
    let validateContent = (rule, value, callback) => {
      if (!value && this.formData.problemList.includes('其它')) {
        callback(new Error("选择其他时,申诉内容不能为空"))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      appealType: '10',//申诉对象
      formData: {
        waybillNumber: '',
        problemList: [],
        complaintContent: '',
      },
      imgs: [],
      rules: {
        problemList: [{ required: true, message: "申诉类型不能为空", trigger: "change" },],
        complaintContent: [{ validator: validateContent, trigger: "blur" }]
      },
    }
  },
  methods: {
    resetForm () {
      this.$refs["form"].resetFields()
    },
    showDialog (waybillNumber) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.formData.waybillNumber = waybillNumber
        this.imgs = []

      })


    },
    handleAppealTypeChanged (selectedVal) {
      this.formData.waybillNumber = (selectedVal === "20") ? `${this.appealInfo.inMonth}账单` : ''
    },
    removeImage (img) {
      let index = this.imgs.indexOf(img)
      this.imgs.splice(index, 1)
    },
    async uploadImgInClient () {
      if (this.isClientMode ) {
        let img = await this.$native.selectFileToBase64('img')
        if (img) {
          let fileLength = parseInt(img.length - (img.length / 8) * 2)
          let size = (fileLength / 1024 / 1024).toFixed(2)
          if (parseInt(size) > 2) {
            this.$message('上传图片大小不能大于2M')
            return
          }
          this.imgs.push('data:image/png;base64,' + img)
        }
      }
    },
    uploadImg (el) {
      try {
        console.log(el.target.files[0])
        if (el.target.files[0].size <= 0) {
          this.$message('图片上传失败，请检查文件是否损坏')
          return
        }
        if (el.target.files[0].size / 1024 / 1024 > 2) {
          this.$message('上传图片大小不能大于2M')
          return
        }
        let self = this
        let file = this.$refs.imgInput
        let reader = new FileReader()
        reader.readAsDataURL(file.files[0])
        reader.onload = function (e) {
          self.imgs.push(this.result)
        }
      } catch (ex) {
        console.log('ex', ex)
      }
    },
    saveData () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        let pictures = this.imgs.map(item => {
          return item.substring(item.indexOf(',') + 1)
        })
        let params = {
          paymentCompanyNumber: getCustomerCode(),
          waybillNumber: this.formData.waybillNumber || this.appealInfo.inMonth,
          complaintType: this.formData.problemList.join(),
          complaintDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          expiredDate: dayjs().add(7, 'd').format('YYYY-MM-DD HH:mm:ss'),
          complaintContent: this.formData.complaintContent,
          picture: pictures,
          inMonth: this.appealInfo.inMonth,
          paymentCompanyId: this.appealInfo.paymentCustomerId,
          paymentCompany: this.appealInfo.paymentCustomerName,
          billNumber: this.appealInfo.billNumber,
          operationType: '1',
        }
        addOrModifyAppealApi(params).then(res => {
          if (res.success) {
            this.$message({
              message: '申诉成功',
              type: 'success'
            })
            this.$emit('onSaveSuccess')
            this.resetForm()
            this.dialogVisible = false
            this.pushAddAppealMessage(params,res.data.batchNumber)
          }
        })
      })

    },
    pushAddAppealMessage (appealInfo,batchNumber) {
      let params = {
        companyName: getLoginCompanyName(),
        companyCode: getCustomerCode(),
        waybillNo: appealInfo.waybillNumber || this.appealInfo.inMonth,
        exptionType: appealInfo.complaintType,
        exptionContent: appealInfo.complaintContent,
        batchNumber: batchNumber
      }
      pushAddAppealMessageApi(params).then(() => {})
    }
  },
}
</script>

<style lang="scss" scoped>
  .content {
    height: 528px;
    width: 100%;
    font-size: 12px;
    color: #333333;
    /deep/.el-form-item {
      margin-bottom: 12px;
      .el-form-item__content {
        font-size: 12px;
        color: #333333;
        line-height: 24px;
        .el-textarea,
        .el-input__inner,
        .el-checkbox__label {
          font-size: 12px;
        }
        .el-textarea,
        .el-input {
          margin-top: 8px;
        }
        .el-checkbox {
          margin-right: 60px;
        }
        .el-checkbox-group {
          margin-top: 9px;
          .checkbox-last {
            margin-right: 0;
          }
        }
      }
      .el-radio__label {
        font-size: 12px;
        color: #333333;
      }
      .el-form-item__label {
        font-size: 12px;
        color: #333333;
        padding: 0;
        line-height: 16px;
      }
      .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #7352bf;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #7352bf;
        border-color: #7352bf;
      }
    }

    .caption-description {
      font-size: 12px;
      color: #999999;
    }
    .certification {
      // margin-bottom: 23px;
      .certification-caption {
        font-size: 14px;
        margin: 11px auto 10px;
      }
      .certification-imgs {
        // margin-bottom: 25px;
        &::after {
          content: "";
          display: block;
          clear: both;
        }
        .certification-imgs-add {
          position: relative;
          background-color: #f8f8fa;
          border: 1px dashed #c8c8c8;
          border-radius: 4px;
          i {
            font-size: 25px;
            color: #bdbdbd;
            position: relative;
            top: 39px;
            left: 50px;
          }
          p {
            color: #aaaaaa;
            position: relative;
            top: 48px;
            left: 8px;
          }
          label {
            cursor: pointer;
            width: 100%;
            height: 100%;
            display: inline-block;
            position: absolute;
            top: 0;
          }
        }
        .certification-imgs-remove {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 23px;
          z-index: 3;
        }
        li {
          width: 126px;
          height: 126px;
          float: left;
          margin-right: 16px;
          border: 1px solid #dcdae2;
          cursor: pointer;
        }
      }
    }

    /deep/ .el-form-item__error {
      padding-top: 0;
    }
  }
</style>
