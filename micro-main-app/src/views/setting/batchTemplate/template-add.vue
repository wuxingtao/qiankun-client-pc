<template>
  <div class='page__container page--default page-style1'>
  <div class='page__content'>
  <el-form :model='formData' :rules='formRule' label-position='top' ref='form' v-loading='loading'>
  <div class='page-box'>
    <div class='page-box__title cursor' @click='handleCancel'>
      <i class='el-icon-back theme-color fs_18 mr_8 f_w_700'></i>个性化模板设置
    </div>
    <div class='tutorial-box mb_20 cursor'>
      第一次创建模板，<span class='theme-color' @click='tutorialOpen'>了解使用教程 <i
      class='el-icon-arrow-right theme-color'></i></span>
    </div>
    <div class='page-box__content' style='width:800px;'>
      <el-row :span='24' :gutter='20'>
        <el-col :span='12'>
          <el-form-item label='模板名称' prop='templateName'>
            <el-input v-model='formData.templateName' :maxlength='50' placeholder='请输入模板名称'></el-input>
          </el-form-item>
        </el-col>
        <el-col :span='12'>
          <el-form-item label='备注'>
            <el-input v-model='formData.remark' :maxlength='100' placeholder='请输入备注'></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :span='24' :gutter='20'>
        <el-col :span='12'>
          <el-form-item label='表头读取位置'>
            <el-select v-model='formData.headerLine' placeholder='请选择' :disabled='!excelInfo.excelName'>
              <el-option label='第一行' :value='1'></el-option>
              <el-option label='第二行' :value='2'></el-option>
              <el-option label='第三行' :value='3'></el-option>
              <el-option label='第四行' :value='4'></el-option>
              <el-option label='第五行' :value='5'></el-option>
              <el-option label='第六行' :value='6'></el-option>
              <el-option label='第七行' :value='7'></el-option>
              <el-option label='第八行' :value='8'></el-option>
              <el-option label='第九行' :value='9'></el-option>
              <el-option label='第十行' :value='10'></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span='12'>
          <el-form-item label='上传模板' class='upload-form-item'>
            <!--                  <el-input v-model="excelInfo.excelName" placeholder="请上传模板" disabled></el-input>-->
            <el-upload class='upload-template' :auto-upload='false' :on-change='handleReadExcel' action=''
                       :show-file-list='false' accept='.xls,.xlsx'>
              <!-- <i class="el-icon-upload2 theme-color mr_8"></i> -->
              <svg-icon icon-class='icon_template_upload'></svg-icon>
              <el-button type='text' class='select_file'>选择文件</el-button>
            </el-upload>
          
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </div>
  <div class='page-box'>
    <div class='page-box__title'>替换表头</div>
    <div class='page-box__content'>
      <div class='row__title mb_20'>收方信息</div>
      <el-row type='flex' :gutter='20'>
        <el-col v-for='(item,index) in formData.sf_info' :key='index'>
          <el-form-item :label='item.label' :prop='`sf_info.${index}.value`'>
            <el-select v-model='item.value' placeholder='请填代替对象' clearable @change='handleSfChange($event,item)'>
              <el-option v-for='(headerItem,headerIndex) in excelInfo.header' :label='headerItem' :value='headerItem'
                         :key='headerIndex'
                         v-if='headerUsed.indexOf(headerItem) === -1 || item.value === headerItem'></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class='row__title mb_20'>寄方信息</div>
      <el-row type='flex' :gutter='20'>
        <el-col v-for='(item,index) in formData.jf_info' :key='index'>
          <el-form-item :label='item.label'>
            <el-select v-model='item.value' placeholder='请填代替对象' clearable>
              <el-option v-for='(headerItem,headerIndex) in excelInfo.header' :label='headerItem' :value='headerItem'
                         :key='headerIndex'
                         v-if='headerUsed.indexOf(headerItem) === -1 || item.value === headerItem'></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class='row__title mb_20'>服务信息</div>
      <el-row type='flex' :gutter='20' class='fw-row'>
        <el-col v-for='(item,index) in formData.fw_info' :key='index'>
          <el-form-item :label='item.label'>
            <el-select v-model='item.value' placeholder='请填代替对象' clearable>
              <el-option v-for='(headerItem,headerIndex) in excelInfo.header' :label='headerItem' :value='headerItem'
                         :key='headerIndex'
                         v-if='headerUsed.indexOf(headerItem) === -1 || item.value === headerItem'></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </div>
  </el-form>
  </div>
  <el-dialog :visible.sync='tutorialDialog' title='使用教程' width='554px' custom-class='k-dialog'>
    <img src='../../../assets/image/setting/template-tutorial.png' style='max-width: 100%;'>
    <div class='footer' slot='footer'>
      <el-button type='primary' @click='tutorialDialog=false'>知道了</el-button>
    </div>
  </el-dialog>
  <div class='page__footer admin-footer'>
    <div class='button-group'>
      <el-button size='large' round @click='handleCancel'>取消</el-button>
      <el-button size='large' round type='primary' :loading='loading' v-btnThrottle @click='handleSubmit'>保存
      </el-button>
    </div>
  </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import { getCustomerCode, getPhone } from "@utils/storage"
import REGULAR from "@utils/regular"
import { saveUserTemplate } from "@api/setting"
import { readExcel } from "@utils/clientUtil"
import constant from "@views/setting/batchTemplate/constant"
import { paramsSpecife } from "@/views/setting/batchTemplate/utils"
import { updateUserTemplate } from "@/services/api/setting"

export default {
  name: "template-add",
  data() {
    let _this = this
    const validateTel = (rule, value, callback) => {
      if (!_this.formData) {
        return
      }
      if (_this.formData.sf_info.sjMobile.value || _this.formData.sf_info.sjTelPhone.value) {
        callback()
      } else {
        callback(new Error("手机号码和电话必填一项！"))
      }
    }
    return {
      loading: false,
      // 教程弹窗
      tutorialDialog: false,
      // 表单数据
      formData: {
        templateName: "",
        remark: "",
        // 表格读取行
        headerLine: 1,
        sf_info: constant.sf_info,
        jf_info: constant.jf_info,
        fw_info: constant.fw_info
      },
      type: "add",
      templateInfo: {
        // 0 新增，1修改 2删除
        source: 0,
        // source 为1 必传
        sys_guid: "",
        guid: "",
      },
      // excel 模板信息
      excelInfo: {
        excelName: "",
        header: [],
        headerUsed: [],
        file: ""
      },
      // ['add','edit']
      templateStep: "",
      // 模板详情(修改)
      templateDetail: {},
      formRule: {
        templateName: [
          { required: true, message: "请输入模板名称", trigger: "blur" },
          { pattern: REGULAR.genaralText, message: "请输入正确模板名称" }
        ],
        "sf_info.sjAddress.value": [{ required: true, message: "收件地址不能为空", trigger: "blur" }],
        "sf_info.sjPeople.value": [{ required: true, message: "收件人不能为空", trigger: "blur" }],
        "sf_info.sjMobile.value": [{
          validator: validateTel,
          message_error: "收件手机和收件座机必填一项",
          trigger: "blur"
        }],
        "sf_info.sjTelPhone.value": [{ validator: validateTel, message_error: "收件手机和收件座机必填一项", trigger: "blur" }],
      },
      validLists: {
        phone: "收方手机号和座机号必填一项",
        sjAddress: "收件地址不能为空"
      }
    }
  },
  computed: {
    // 已被选表头header
    headerUsed() {
      const result = new Set()
      const { sf_info, jf_info, fw_info } = this.formData
      const obj = { ...sf_info, ...jf_info, ...fw_info }
      for (let i in obj) {
        result.add(obj[i].value)
      }
      return Array.from(result)
    },
    ...mapState(["userInfo"]),
    ...mapState(["userInfo"])
  },
  watch: {
    "formData.headerLine": {
      handler(val) {
        const file = this.excelInfo.file
        if (!val || !file) {
          return
        }
        this.handleReadExcel(file, [file], false)
      }
    },
    // 模板详情监听
    templateDetail: {
      handler(obj) {
        if (obj && obj.type === "edit") {
          const { templateName, remark, excelName, headerLine, sys_guid } = obj
          const { sf_info, jf_info, fw_info } = this.formData
          this.templateInfo = {
            sys_guid: sys_guid
          }
          this.type = "edit"
          this.excelInfo.header = excelName?.split(",") || ""
          this.formData = Object.assign(this.formData, {
            templateName,
            headerLine,
            remark
          })
          for (let i in sf_info) {
            if (sf_info.hasOwnProperty(i)) {
              sf_info[i].value = this.templateDetail[i]
            }
          }
          for (let i in jf_info) {
            if (jf_info.hasOwnProperty(i)) {
              jf_info[i].value = this.templateDetail[i]
            }
          }
          for (let i in fw_info) {
            if (fw_info.hasOwnProperty(i)) {
              fw_info[i].value = this.templateDetail[i]
            }
          }
        } else {
          this.type = "add"
        }
      },
      immediate: true
    },
  },
  activated() {
    if (this.$route.params.type === "edit") {
      this.templateStep = "edit"
      this.templateDetail = { ...this.$route.params }
    } else {
      this.templateStep = "add"
      this.templateDetail = {}
    }
  },
  beforeRouteLeave: function(to, from, next) {
    this.handleClearSelect()
    this.excelInfo = Object.assign(this.excelInfo, {
      excelName: "",
      header: [],
      headerUsed: [],
      file: ""
    })
    this.formData = Object.assign(this.formData, {
      templateName: "",
      remark: "",
      headerLine: 1
    })
    this.templateInfo = {
      sys_guid: "",
      guid: "",
      source: 0
    }
    next()
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        try {
          this.loading = true
          const { templateName, remark, headerLine, jf_info, sf_info, fw_info } = this.formData
          const settingList = { ...jf_info, ...sf_info, ...fw_info }
          const params = Object.assign({
            mobile: getPhone(),
            companyNo: getCustomerCode(),
            dateType: 0,
            excelname: this.excelInfo.header.toString(),
            headerLine,
            templateName,
            remark
          }, this.templateInfo)
          for (let i in settingList) {
            params[i] = settingList[i].value
          }
          const result = paramsSpecife("send", params)
          if (this.type === "add") {
            // 新增模板
            const res = await saveUserTemplate(result)
            if (res && res.code === 0) {
              this.$message.success("保存成功")
              this.handleBack({ refresh: "1" })
            }
          } else {
            // 修改模板
            result.id = this.templateInfo.sys_guid
            const res = await updateUserTemplate(result)
            if (res && res.code === 0) {
              this.$message.success("保存成功")
              this.handleBack({ refresh: "1" })
            }
          }
          this.loading = false
        } catch (e) {
          this.loading = false
        }
      })
    },
    handleCancel() {
      this.$confirm("是否返回个性化模板设置首页", { type: "warning" }).then(() => {
        this.handleBack()
      })
    },
    handleBack(options = { refresh: "0" }) {
      let query = options.refresh === "1" ? { refresh: options.refresh } : {}
      this.$router.push({ path: "/admin/batch-template", query: query })
    },
    // 本地excel读取
    handleReadExcel(file, fileList, resetLine = true) {
      if (fileList.length > 1) {
        fileList.splice(0, 1)
      }
      this.excelInfo = Object.assign(this.excelInfo, {
        excelName: file.name,
        file,
        header: [],
        headerUsed: []
      })
      if (resetLine) {
        this.formData.headerLine = 1
      }
      setTimeout(async () => {
        try {
          const headerIndex = Math.abs(this.formData.headerLine - 1)
          let { header, msg, code } = await readExcel(file, headerIndex)
          if (msg && !header || header.length < 1) {
            if (code) {
              if (code === 3004) {
                msg = "当前行表头为空，请重新选择"
              } else if (code === 3003) {
                msg = "Excel数据不能超过1000行，请重新修改Excel"
              }
            }
            this.$message.error(msg)
            return
          }
          // 过滤COLUMN 数据列
          this.excelInfo.header = header.filter(item => !(/^COLUMN/.test(item.toUpperCase())))
          this.handleClearSelect()
        } catch (ex) {
          console.log("handleReadExcel :>> ", ex)
          let msg = "您导入的表格文件存在异常，请检查后重新导入"
          if (ex && ex.name === "SyntaxError") {
            msg = "您导入的表格有误,请检查文件是否损坏或加密"
          }
          this.$message.error(msg)
        }
      }, 100)
    },
    // 模板变更处理
    handleClearSelect() {
      const { sf_info, jf_info, fw_info } = this.formData
      let iterationList = Object.assign({}, sf_info, jf_info, fw_info)
      for (let i in iterationList) {
        if (iterationList.hasOwnProperty(i)) {
          iterationList[i].value = ""
        }
      }
    },
    // 打开教程弹窗
    tutorialOpen() {
      this.tutorialDialog = true
    },
    handleSfChange(event, item) {
      if (item.label === "收件手机" || item.label === "收件座机") {
        this.$refs.form.validateField("sf_info.sjTelPhone.value")
        this.$refs.form.validateField("sf_info.sjMobile.value")
      }
      if (item.label === "收件地址") {
        this.$refs.form.validateField("sf_info.sjAddress.value")
      }
      if (item.label === "收件人") {
        this.$refs.form.validateField("sf_info.sjPeople.value")
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.page__container {
  @include scroll-bar;
  background-color: #f7f9fa;
  padding-bottom: 1px;
  overflow-x: hidden;
  font-size: 14px;
  height: calc(100% - 62px);
}

.page--default {
  .el-select {
    width: 100%;
  }
  
  /deep/ .el-form--label-top .el-form-item__label {
    line-height: 20px;
    padding-bottom: 4px;
  }
}

.fw-row {
  flex-wrap: wrap;
  
  .el-col {
    width: 20%;
  }
}

.upload-form-item {
  .upload-template {
    position: absolute;
    // border-bottom:1px solid #DCDFE6;
    // width: 384px;
    //top: 23px;
  }
  
  .select_file {
    margin-left: 8px;
  }
  
  /deep/ .el-input.is-disabled .el-input__inner {
    background: none;
  }
}

.row__title {
  display: inline-block;
  width: auto;
  padding: 4px 10px;
  background: #333333;
  color: #ffffff;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
</style>
