<template>
  <div class="clientdialog">
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="848px"
               height="749px">
      <div class="content">
        <el-form ref="form"
                 :model="formData"
                 :rules="rules"
                 label-position="top"
                 label-width="80px">
          <div class="header">
            <div class="header-caption">发票抬头</div>

            <el-row>
              <el-col :span="24">
                <el-form-item label="抬头"
                              prop="companyType">
                  <el-radio-group v-model="formData.companyType"
                                  size="medium">
                    <el-radio label="10">公司</el-radio>
                    <el-radio label="20">个人</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="开票类型"
                              prop="invoiceType">
                  <el-select v-model="formData.invoiceType"
                             style="width:183px;"
                             placeholder="请选择开票类型">
                    <el-option label="增值专用发票6%"
                               value="10"></el-option>
                    <!-- <el-option label="增值运输发票11%"
                               value="20"></el-option> -->
                    <el-option label="增值普通发票6%"
                               value="30"></el-option>
                    <!-- <el-option label="收据"
                               value="40"></el-option> -->
                    <el-option label="增值运输发票9%"
                               value="50"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="购货方名称"
                              prop="deductionCompany">
                  <el-input v-model="formData.deductionCompany"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="纳税人识别号"
                              prop="deductionTax">
                  <el-input v-model="formData.deductionTax"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="开户银行"
                              prop="invoiceOpenBank">
                  <el-input v-model="formData.invoiceOpenBank"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="银行账号"
                              prop="invoiceOpenAccount">
                  <el-input v-model="formData.invoiceOpenAccount"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="公司电话"
                              prop="invoicePhone">
                  <el-input v-model="formData.invoicePhone"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="地区"
                              prop="invoiceAddress">
                  <el-cascader v-model="formData.invoiceAddress"
                               ref="invoiceAddress"
                               :props="addressProps"></el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="详细地址"
                              prop="invoiceAddressDetail">
                  <!-- <el-input v-model="formData.invoiceAddressDetail"
                            maxlength="50"></el-input> -->
                  <el-autocomplete style="width: 100%;"
                                   v-model="formData.invoiceAddressDetail"
                                   :trigger-on-focus="false"
                                   :fetch-suggestions="addressSuggestofInvoice"
                                   @select="selectSuggestAddressofInvoice"
                                   placeholder="请输入详细地址"></el-autocomplete>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="certification">
            <div class="certification-caption">证明材料</div>
             <el-form-item prop="imgs">
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
              <li v-if="imgs.length<4"
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
            </el-form-item>
          </div>
          <div class="receiptor">
            <div class="receiptor-caption">收票人</div>
            <el-row :gutter="24">
              <el-col :span="6">
                <el-form-item label="收票人姓名"
                              prop="invoiceReceiver">
                  <el-input v-model="formData.invoiceReceiver"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="收票人电话"
                              prop="invoiceReceiverPhone">
                  <el-input v-model="formData.invoiceReceiverPhone"
                            maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="地区"
                              prop="addressIdList">
                  <el-cascader v-model="formData.addressIdList"
                               ref="receiverAddress"
                               :props="addressProps"></el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="详情地址"
                              prop="doorNumber">
                  <!-- <el-input v-model="formData.doorNumber"
                            maxlength="50"></el-input> -->
                  <el-autocomplete v-model="formData.doorNumber"
                                   :trigger-on-focus="false"
                                   :fetch-suggestions="addressSuggestofReciver"
                                   @select="selectSuggestAddressofReciver"
                                   placeholder="请输入详细地址"></el-autocomplete>
                </el-form-item>
              </el-col>
            </el-row>
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
import { addInvoiceInfoApi, pushAddInvoiceInfoMessageApi, uploadFileApi, addressSuggestApi } from "@/services/api/bill"
import { guid } from "../../../assets/common"
import { getLoginCompanyName } from '@/utils/clientUtil'
import { getMultiLevelSubList } from "@/services/api/address"
import { getCustomerCode,getCustomerId } from "@/utils/storage"
export default {
  data () {
    var validateImgs = (rule, value, callback) => {
      if (this.imgs.length<1) {
        callback(new Error('证明材料不能为空'))
      }else{
        callback()
      }
    }
    return {
      title: "开票资料",
      dialogVisible: false,
      imgs: [],
      addressProps: {
        lazy: true,
        lazyLoad (node, resolve) {
          const { value, level } = node
          getMultiLevelSubList(value).then(res => {
            if (res.data && res.data.districtList) {
              const nodes = res.data.districtList.map(item => ({
                value: item.districtID,
                label: item.districtName,
                leaf: level >= 2
              }))
              resolve(nodes)
            }
          })
        }
      },
      formData: {
        invoiceType: '10',
        deductionCompany: '',
        companyType: '10',
        deductionTax: '',
        invoiceOpenBank: '',
        invoiceOpenAccount: '',
        phoneAddress: '',
        invoicePhone: '',
        invoiceAddress: '',
        invoiceAddressDetail: '',

        invoiceReceiver: '',
        invoiceReceiverPhone: '',
        addressId: '',
        addressIdList: [],
        doorNumber: ''
      },
      rules: {
        imgs:[{ validator: validateImgs }],
        companyType: [{ required: true, message: "抬头不能为空", trigger: "change" }],
        invoiceType: [{ required: true, message: "开票类型不能为空", trigger: "blur" },],
        deductionCompany: [{ required: true, message: "购货方名称不能为空", trigger: "blur" },],
        deductionTax: [{ required: true, message: "纳税人识别号不能为空", trigger: "blur" },
          {
            pattern: /(^[A-Za-z0-9]{15}$)|(^[A-Za-z0-9]{18}$)|(^[A-Za-z0-9]{20}$)/,
            trigger: "blur",
            message: "识别号为15,18,20位数字或字母"
          }],
        invoiceOpenBank: [{ required: true, message: "开户银行不能为空", trigger: "blur" },],
        invoiceOpenAccount: [{ required: true, message: "银行账号不能为空", trigger: "blur" },
          {
            pattern: /\d{5,30}/,
            trigger: "blur",
            message: "请输入正确的银行账号"
          }
        ],
        invoicePhone: [{ required: true, message: "公司电话不能为空", trigger: "blur" },
          {
            pattern: /(^(0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?$)|(^(400-)?[2-9]{6,7}$)|(^(0|86|17951)?(13\d|15\d|17\d|18\d|19\d|14[057]|165|166|168|199|198)(\d{8}|(\s{0,}|-)\d{4}(\s{0,}|-)\d{4})$)/,
            trigger: "blur",
            message: "请输入正确的电话号码"
          }],
        invoiceAddress: [{ required: true, message: "地区不能为空", trigger: "change" },],
        invoiceAddressDetail: [{ required: true, message: "详细地址不能为空", trigger: "blur" },],

        invoiceReceiver: [{ required: true, message: "收票人姓名不能为空", trigger: "blur" },],
        invoiceReceiverPhone: [{ required: true, message: "收票人电话不能为空", trigger: "blur" },
          {
            pattern: /(^(0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?$)|(^(400-)?[2-9]{6,7}$)|(^(0|86|17951)?(13\d|15\d|17\d|18\d|19\d|14[057]|165|166|168|199|198)(\d{8}|(\s{0,}|-)\d{4}(\s{0,}|-)\d{4})$)/,
            trigger: "blur",
            message: "请输入正确的电话号码"
          }],
        addressIdList: [{ required: true, message: "地区不能为空", trigger: "change" },],
        doorNumber: [{ required: true, message: "详细地址不能为空", trigger: "blur" },],
      }
    }
  },
  watch: {
    dialogVisible () {
      if (!this.dialogVisible) {
        this.$emit('onDialogClose')
      }
    },
  },
  methods: {
    resetForm () {
      this.$refs["form"].resetFields()
    },
    showDialog () {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.imgs = []
      })
    },
    saveData () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.uploadFile()
        let params = this.formData
        params["customerCode"] = getCustomerCode()
        params.deductionCompanyArea = '20'
        let address = ''
        if (!this.$refs.invoiceAddress.presentText) {
          this.$refs.invoiceAddress.presentText.replace(/\s\/\s/g, "")
        }
        params.phoneAddress = `${params.invoicePhone} ${address}${params.invoiceAddressDetail}`
        params.addressId = params.addressIdList[params.addressIdList.length - 1]
        addInvoiceInfoApi(params).then(res => {
          if (res.code == 0) {
            this.$message({
              message: '保存成功',
              type: 'success'
            })
            this.dialogVisible = false
            this.$emit('onSaveSuccess')
            this.resetForm()
            this.pushAddInvoiceInfoMessage()
          }
        })
      })
    },
    pushAddInvoiceInfoMessage () {
      let params = {
        companyName: getLoginCompanyName(),
        companyCode: getCustomerCode(),
        bilingId: guid(),
      }
      pushAddInvoiceInfoMessageApi(params)
    },
    uploadFile () {
      let pictures = this.imgs.map(item => {
        return item.substring(item.indexOf(',') + 1)
      })
      let params = {
        paymentCompanyNumber: getCustomerId(),
        picture: pictures,
      }
      uploadFileApi(params).then(() => {
        // this.$message(res);
      })
    },
    removeImage (img) {
      let index = this.imgs.indexOf(img)
      this.imgs.splice(index, 1)
      this.$refs.form.validateField('imgs')
      this.$refs.imgInput.value=null
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
        console.log(el)
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
          self.$refs.form.validateField('imgs')
        }
      } catch (ex) {
        console.log('ex', ex)
      }
    },
    addressSuggestofInvoice (queryString, cb) {
      this.addressSuggest(queryString, cb, this.$refs.invoiceAddress)
    },
    selectSuggestAddressofInvoice (item) {
      this.formData.invoiceAddressDetail = this.getSuggestAddress(item, this.$refs.invoiceAddress)
    },
    addressSuggestofReciver (queryString, cb) {
      this.addressSuggest(queryString, cb, this.$refs.receiverAddress)
    },
    selectSuggestAddressofReciver (item) {
      this.formData.doorNumber = this.getSuggestAddress(item, this.$refs.receiverAddress)
    },
    addressSuggest (queryString, cb, regionControl) {
      if (!queryString) {
        return
      }
      let region = ''
      let sepecialRegions = ["东莞市", "中山市", "三沙市", "儋州市", "嘉峪关市"]
      let regions = (regionControl.inputValue + '').split('/').map(item => item.replace(/\s/g, ""))
      if (regions.length > 2) {
        if (sepecialRegions.includes(regions[1])) {
          region = regions[0] + regions[1]
        } else {
          region = regions[2]
        }
        region = region.replace(/\s/g, "")
      }
      let params = {
        keyword: queryString.replace(/\s/g, ""),
        region: region,
        'page_index': 1,
        'page_size': 20,
        'region_fix': region ? 1 : 0,
      }
      addressSuggestApi(params).then(res => {
        if (res.data && res.data.data) {
          let results = res.data.data.map(item => {
            return { value: item.address, item: item }
          })
          cb(results)
        } else {
          cb([])
        }
      })
    },
    getSuggestAddress (item, control) {
      if (control.inputValue) {
        let regions = control.inputValue.replace(/[\s|\/]/g, '')
        console.log(regions, item, item.value.replace(regions, ''))
        return item.value.replace(regions, '')
      }
      else {
        control.inputValue = item.value
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    font-size: 12px;
    color: #333333;
    .header-caption,
    .certification-caption,
    .receiptor-caption {
      background: #f5f5fa;
      width: 796px;
      height: 28px;
      font-size: 14px;
      color: #333333;
      line-height: 28px;
      font-weight: bold;
      padding-left: 12px;
      margin-bottom: 16px;
    }
    .header,
    .receiptor {
      /deep/.el-form-item {
        margin-bottom: 12px;
        .el-form-item__content {
          font-size: 12px;
          color: #333333;
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
          padding-bottom: 2px;
        }
      }
    }
    .certification {
      margin-top: 6px;
    }
    .certification-imgs {
      margin-bottom: 3px;
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
          font-size: 12px;
          top: 21px;
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
    /deep/ .el-form-item__error {
      padding-top: 0;
    }
  }
</style>
