<template>
  <div class="dialog-add">
    <el-dialog width='600px'
               class="k-dialog dialogForm page-style1"
               custom-class="admin-dialog"
               :title="formTitle"
               :visible.sync="dialogForm1"
               :before-close="closeDialog"
               :modal="dialogModal"
               append-to-body
               :close-on-click-modal='false'>
      <el-form ref="formName"
               :rules="rules"
               :model="formData"
               label-position="left"
               label-width="80px"
               inline
               v-loading="pageLoading"
               style="width:560px;">
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人"
                          prop="contact">
              <el-input placeholder="请输入真实姓名"
                        v-model="formData.contact"
                        clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码"
                          prop="contactPhone">
              <!-- <encrypt-field-input v-if="showEncryptInput('contactPhone')"
                                   :encryptField="encryptField.contactPhone" /> -->
              <el-input placeholder="请输入手机号"
                        type="number"
                        @input="changeNum"
                        v-model.trim="formData.contactPhone"
                        clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址"
                      label-width="100%"
                      class="w_full form-address-item"
                      prop="address">
          <el-row>
            <el-col :span="24">
              <address-item class="address"
                            :encryptField="encryptField.address"
                            :fullAddress.sync="formData.address"
                            type="poly"
                            ref="addressRef" />
            </el-col>
          </el-row>

        </el-form-item>
        <el-row>
          <el-form-item prop="isCollect">
            <el-checkbox label="设为默认"
                         v-model="formData.isCollect"></el-checkbox>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :error="errorInfo.parse"
                          class="w_full textarea_col">
              <div class="address-parse__content">
                <el-input v-model="addressStr"
                          type="textarea"
                          class="address-parse__input"
                          placeholder="粘贴整段地址，自动识别姓名、电话、地址、公司名称。例：王明，13666666666，广东省深圳市宝安区航站四路跨越速运大厦，深圳仁美；"
                          clearable
                          maxlength="100"
                          @blur="errorInfo.parse=''"
                          show-word-limit
                          :autosize="{minRows:4}"
                          resize="none"></el-input>
                <el-button class="address-parse__btn"
                           size="small"
                           type="primary"
                           round
                           v-btnThrottle
                           @click="parseAddress">识别</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer"
           class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary"
                   v-btnThrottle
                   @click="saveForm('formName')">确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { Address } from '@comps'
  import AddressItem from '@/views/vts/components/address-item'
  import { getPhone, getCustomerCode, REGULAR } from '@/views/vts/utils'
  import { addAddressList, modifyAddress, modifyVipshopAddress, parseAddressInfo } from '@/services/api/vts'
  // import { parseAddressInfo } from '@/services/api/delivery'
  import { smartRecognize } from '@/views/vts/utils/clientUtil'
  // import REGULAR from '@utils/regular'
  import dataMask from "@/views/vts/utils/dataMask"
  // import encryptCommonMixin from "../../../shipment/mixins/encrypt-common.js"
  import { mapGetters } from "vuex"

  export default {
    // mixins: [encryptCommonMixin],
    name: 'dialog-add',
    components: {
      'ky-address': Address,
      AddressItem
    },
    props: {
      // 是否显示遮罩
      dialogModal: {
        type: Boolean,
        default: () => true
      },
      addressType: {
        type: String,//10-寄件，20-收件,为空-唯品
        require: true
      }
    },
    data () {
      const phoneValid = (rule, value, callback) => {
        if (!this.formData) {
          return
        }
        const mobileValid = REGULAR.mobileNumber.test(this.formData.contactPhone)
        const telValid = REGULAR.telephoneNew.test(this.formData.telephone)
        if ((mobileValid && telValid) || (mobileValid && !this.formData.telephone) || (telValid && !this.formData.contactPhone)) {
          callback()
        } else {
          if (!this.formData.contactPhone && !this.formData.telephone) {
            callback(new Error('手机号码和固定电话不能同时为空'))
            this.$refs.formName.clearValidate(['telephone'])
            return
          }
          if (rule.field === 'telephone') {
            this.$refs.formName.validateField(["contactPhone"])
          }
        }
      }

      const contactValid = (rule, value, callback) => {
        if (!this.formData) {
          return ''
        }
        const reg = /^[\u4e00-\u9fa5a-zA-Z0-9（）】【]{2,30}$/
        if (!(reg.test(value))) {
          if (value.length < 2) {
            callback(new Error('联系人姓名不能少于两个字'))
          } else if (value.length > 30) {
            callback(new Error('联系人姓名不能超过10个字'))
          } else {
            callback(new Error('请输入正确的联系人姓名'))
          }
        } else {
          callback()
        }
      }
      const companyValid = (rule, value, callback) => {
        if (!this.formData) {
          return ''
        }
        if (!value) {
          callback()
        }
        const reg = REGULAR.genaralText
        if (!(reg.test(value)) || value.length < 2 || value.length > 30) {
          if (value.length < 2) {
            callback(new Error('公司名称不能少于两个字'))
          }
          if (value.length > 30) {
            callback(new Error('公司名称不超过30个字'))
          } else {
            callback(new Error('请输入正确的公司名称'))
          }
        } else {
          callback()
        }
      }
      return {
        formData: {
          id: '',
          contact: '',
          company: '',
          contactPhone: '',
          telephone: '',
          remark: '',
          address: '',
          province: '',
          city: '',
          area: '',
          // 设为常用
          isCollect: false
        },
        addressStr: '',
        dialogForm1: false,
        formTitle: '',
        // 省市区信息
        districtStr: '',
        defaultDistrict: [],
        pageLoading: false,
        errorInfo: {
          parse: ''
        },
        // 表单验证规则
        rules: {
          contact: [
            { required: true, message: '联系人不能为空', trigger: 'blur' },
            { validator: contactValid, trigger: 'blur' }
          ],
          company: [
            // {required: true , message: '收件公司名称不能为空' , trigger: 'blur'} ,
            { min: 2, max: 30, validator: companyValid, trigger: 'blur' }
          ],
          // 手机号
          contactPhone: [
            { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号' },
            { required: false, validator: phoneValid, trigger: 'blur' }
          ],
          // 固定电话
          telephone: [
            { pattern: REGULAR.telephoneNew, message: '请输入正确的固定电话' },
            { validator: phoneValid, trigger: 'blur' }
          ],
          remark: [
            { max: 100, message: '运单备注最大支持100个汉字长度', trigger: 'blur' },
          ],
        },
        encryptField: {
          address: {
            visible: false,
            value: ''
          },
          contact: {
            visible: false,
            value: '',
            replace: val => dataMask.maskName(val)
          },
          contactPhone: {
            visible: false,
            value: '',
            replace: val => dataMask.maskMobile(val)
          },
          telephone: {
            visible: false,
            value: '',
            replace: val => dataMask.maskTelephone(val)
          },
        },
      }
    },
    computed: {
      addressBookEncryptFields () {
        const { contact, contactPhone, telephone, address } = this.formData
        return { contact, contactPhone, telephone, address }
      },
      ...mapGetters(["isEncryptField"])
    },
    watch: {
      'formData.address': function() {
        if (this.dialogForm1) {
          this.$refs['formName'].validateField(['address'])
        }
      },
      'addressStr': function(val) {
        if (val) {
          this.errorInfo.parse = ''
        }
      },
      dialogForm1 (val) {
        if (!val && this.$options && this.$data) {
          Object.assign(this.$data.formData, this.$options.data().formData)
        }
      },
      addressBookEncryptFields: {
        handler (data) {
          const fields = [{ prop: 'contact', text: '联系人' }, { prop: 'contactPhone', text: '手机号码' }, { prop: 'telephone', text: '固定电话' }
            , { prop: 'address', text: '详细地址' }]
          fields.forEach(item => {
            if (!data[item.prop]) {
              this.encryptField[item.prop].visible = false
            }
            this.encryptField[item.prop].value = data[item.prop]
            this.encryptField[item.prop].content = data[item.prop] ? `${item.text}：${data[item.prop]}` : ''
          })
        },
        immediate: true,
        deep: true
      },
    },
    methods: {
      // 调用弹窗显示/关闭
      setVisible (val) {
        this.dialogForm1 = val
      },
      closeDialog () {
        this.setVisible(false)
        this.resetForm()
      },
      // 取消
      handleCancel () {
        this.$confirm('是否取消修改', { type: 'warning' }).then(() => {
          this.closeDialog()
        })
      },
      resetForm () {
        if (Object.keys(this.$refs).length === 0) {
          return
        }
        this.$refs['formName'].resetFields()
        this.addressStr = ''
        Object.assign(this.$data.formData, this.$options.data().formData)
        // 清空详细地址
        this.$refs.addressRef.$refs.form.resetFields()
        this.$refs.addressRef.formData.districtList = []
      },
      // 当前详细地址格式化为包含省市区
      addressFormatter () {
        return this.$refs.addressRef ? this.$refs.addressRef.formData.detailAddress : this.formData.detailAddress
      },
      // 添加数据
      addForm () {
        this.formData.id = ''
        this.defaultDistrict = []
        this.formTitle = '新增地址信息'
        this.dialogForm1 = true
        this.$nextTick(() => {
          this.resetForm()
        })
      },
      // 获取用户详情
      getDetail ({ index, row }) {
        return new Promise((resolve) => {
          this.$nextTick(async () => {
            this.districtStr = (row.province + row.city + row.area)
            this.defaultDistrict = row.area ? [row.province, row.city, row.area] : [row.province, row.city]
            for (let i in row) {
              this.formData[i] = row[i]
            }
            this.$nextTick(() => {
              // this.resetEncryptVisible()
            })
            if (this.$refs.addressRef) {
              const districtList = this.defaultDistrict
              await this.$refs.addressRef.fillTheAddressNew(this.formData.detailAddress, () => {
                this.$refs['formName'].validateField(['address'])
              }, districtList)
            }
            resolve('true')
          })
        })

      },
      isPhone (val) {
        return /(1[3465789]\d{9})$/.test(val)
      },
      // 获取更新地址簿参数
      getUpdateParam (row) {
        const address = this.addressFormatter()
        let province, city, area
        if (!this.$refs.addressRef) {
          province = row.province
          city = row.city
          area = row.area
        } else {
          const districtList = this.$refs.addressRef.formData.districtList
          province = districtList[0]
          city = districtList[1]
          area = districtList[2]
        }
        return {
          addressType: this.addressType,
          id: this.formData.id,
          phone: getPhone(),
          customerCode: getCustomerCode(),
          contact: this.formData.contact,
          company: this.formData.company,
          contactPhone: this.formData.contactPhone,
          telephone: this.formData.telephone,
          province: province,
          city: city,
          area: area,
          address: address,
          remark: this.formData.remark,
          isCollect: this.formData.isCollect,
          source: "PC客户端",
        }
      },
      async modifyVipshopAddress () {
        const params = {
          UserId: getPhone(),
          CustomerCode: getCustomerCode(),
          Contacts: this.formData.contact,
          FixedTelephone: this.formData.telephone,
          Mobile: this.formData.contactPhone,
          Remark: this.formData.remark
        }

        this.$refs.formName.validate((valid) => {
          this.$refs.addressRef.$refs.form.validate((addressValid) => {
            if (addressValid && valid) {
              this.pageLoading = true
              modifyVipshopAddress(params)
                .then((res) => {
                  this.pageLoading = false
                  if (res.code !== 0) {
                    return
                  }
                  this.$message.success('保存成功')
                  // 新增需刷新第一页
                  this.refreshList(!this.formData.id)
                  this.resetForm()
                  this.setVisible(false)
                }).catch(e => {
                  this.pageLoading = false
                  console.log(e)
                })
            }
          })
        })
      },
      // 保存数据
      async saveForm (formName) {
        if (!this.addressType) {
          this.modifyVipshopAddress()
          return
        }
        let fn = addAddressList
        let params = {}
        if (this.formData.id) {
          params = this.getUpdateParam()
          fn = modifyAddress
        } else {
          const address = this.addressFormatter()
          const districtList = this.$refs.addressRef.formData.districtList
          params = {
            addressType: this.addressType,
            addressList: [{
              phone: getPhone(),
              customerCode: getCustomerCode(),
              contact: this.formData.contact,
              company: this.formData.company,
              contactPhone: this.formData.contactPhone,
              telephone: this.formData.telephone,
              province: districtList[0] || '',
              city: districtList[1] || '',
              area: districtList[2] || '',
              address: address,
              remark: this.formData.remark,
              isCollect: this.formData.isCollect,
              source: "PC客户端",
            }]
          }
        }
        this.$refs[formName].validate((valid) => {
          this.$refs.addressRef.$refs.form.validate((addressValid) => {
            if (addressValid && valid && fn) {
              this.pageLoading = true
              fn(params)
                .then((res) => {
                  this.pageLoading = false
                  if (res.code !== 0) {
                    return
                  }
                  this.$message.success('保存成功')
                  // 新增需刷新第一页
                  this.refreshList(!this.formData.id)
                  this.resetForm()
                  this.setVisible(false)
                }).catch(e => {
                  this.pageLoading = false
                  console.log(e)
                })
            }
          })
        })
      },
      // 修改数据
      async modAddress ({ index, row }) {
        this.formTitle = '修改联系人'
        this.dialogForm1 = true
        await this.getDetail({ index, row })
      },
      // 地址解析
      parseAddress: _.throttle(async function() {
        if (!this.addressStr) {
          this.errorInfo.parse = '请输入需要解析的信息'
          return
        } else {
          this.errorInfo.parse = ''
        }
        let result = smartRecognize(this.addressStr) || {}
        let res = await parseAddressInfo(this.addressStr)
        this.resetForm()
        if (res.code !== 0) {
          this.formData = Object.assign(this.formData, {
            contact: result.name,
            company: result.company,
            contactPhone: result.mobiles[0],
            address: result.address
          })
          return
        }

        let data = res.data[0]
        if (data) {
          const { name, city, district } = data
          const province = data.provice
          const addressArr = data.detailed_address.split(' ') || []
          const districtStr = province + city + district
          this.formData = Object.assign(this.formData, {
            contact: name,
            address: districtStr + addressArr[0],
            contactPhone: data.phone_number,
            company: addressArr[1],
            telephone: '',
            province: province,
            city: city,
            area: district,
            districtStr: districtStr
          })
          this.defaultDistrict = district ? [province, city, district] : [province, city]
          if (this.$refs.addressRef) {
            await this.$refs.addressRef.fillTheAddressNew(addressArr[0], () => {
              this.$refs['formName'].validateField(['address'])
            }, province && city && district ? [province, city, district] : [])
          }
          // 增加识别效验
          this.$refs['formName'].validate()
        }
      }, 500),

      /**
       * 刷新列表
       * @param val 是否强制刷新第一页
       */
      refreshList (val) {
        this.$emit('refreshList', val)
      },
      changeNum () {
        //限制长度
        if (this.formData.contactPhone.length > 11) {
          this.formData.contactPhone = this.formData.contactPhone.slice(0, 11)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .address-parse__content {
    position: relative;

    .address-parse__btn {
      position: absolute;
      bottom: 13px;
      right: 13px;
      width: 72px;
    }
  }
  .address {
    /deep/.el-form-item {
      margin-right: 0;
    }
  }
  /deep/.el-form-item__content {
    line-height: 20px;
  }
  /deep/ .address-parse__input {
    .el-textarea__inner {
      width: 100%;
      height: 148px;
      padding: 12px;
      opacity: 1;
      background: #f7f7f7;
      border-radius: 6px;
      border-width: 0;
      color: #999999;
    }

    .el-input__count {
      right: 108px;
      bottom: 20px;
      font-size: 14px;
      color: #999999;
      background: none;
    }
  }

  .w_full {
    /deep/ .el-form-item__content {
      width: 100%;
    }
  }

  .textarea_col {
    margin-bottom: 0;
  }

  .el-form-item__label {
    color: #333333;
  }

  .address-container {
    /deep/ .el-row {
      .el-col {
        &:first-child {
          width: 30%;
        }

        &:last-child {
          width: 70%;
        }
      }

      .el-form-item {
        display: block;
      }
    }
  }

  /deep/ .dialog-footer {
    .el-loading-mask {
      border-radius: 20px;
    }
  }
</style>
