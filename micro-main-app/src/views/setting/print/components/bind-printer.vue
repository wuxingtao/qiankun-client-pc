<!-- 添加打印机 -->
<template>
  <el-dialog class='dialog-add-printer' title='添加打印机' :visible.sync='dialogVisible' :before-close='resetForm' append-to-body :close-on-click-modal='false' width='390px' custom-class='k-dialog page-style1'>
    <el-form ref='formName' :rules='rules' :model='formData' label-position='right'>
      <el-form-item style="margin-top: -4px;">
        <span class='f_w_500 mr_4'>打印机类型：</span>
        <el-radio-group v-model='formData.radio' class="mg-r10">
          <el-radio label='0' :disabled='isClientMode'>打印组件</el-radio>
          <el-radio label='1'>云打印机</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.radio === '0'">
        <el-form-item label='打印机组件ID' prop='printAppId'>
          <el-input size='medium' placeholder='例：0000-0000-0000-0000' v-model='formData.printAppId' clearable></el-input>
        </el-form-item>
        <div class='print-app-tip'>
          <div>温馨提示</div>
          系统未检测到您的打印组件，请检查是否开启，若未安装请下载打印组件
          <span @click='downloadPrintApp'>
            <svg-icon icon-class='download' />下载打印组件
          </span>
        </div>
      </template>
      <template v-else>
        <el-form-item label='运单云打印机编码' prop='printerId0'>
          <el-input size='medium' placeholder='例：KY049504989400-00' v-model='formData.printerId0'></el-input>
        </el-form-item>
        <div :class="['collapse-content',{'collapse--open':!!!collapse}]">
          <el-form-item label='标签云打印机编码' prop='printerId1'>
            <el-tooltip popper-class='tooltip--custom-1' effect='dark' content='标签云打印机用于打印取货标签，若不需要使用可不用添加' placement='right'>
              <i class='el-icon-question'></i>
            </el-tooltip>
            <el-input size='medium' placeholder='例：KY0394049504945654' v-model='formData.printerId1'></el-input>
          </el-form-item>
        </div>
        <div class='collapse-item cursor' @click='switchCollapse'><span>收起</span><i class='collapse-arrow'></i></div>
      </template>

    </el-form>
    <div slot='footer' class='dialog-footer'>
      <el-button @click='resetForm()'>取消</el-button>
      <el-button size='medium' type='primary' @click='bindDevice'>绑定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { BindDevice, GetSrcWorkerNoByCompNo, isPrintAppOnline } from '@api/setting'
import { mapState } from 'vuex'
import { setPrintAppData, getPrintAppData } from '@utils/storage'
import printerUtil from '@utils/printerUtil'
import printerWebsocket from '@utils/printerWebsocket'

export default {
  name: 'bind-printer',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    const validateId = (rule, value, callback) => {
      if (this.formData.radio !== '1') {
        return callback()
      }
      if (!this.formData.printerId0 && !this.formData.printerId1) {
        return callback(new Error('请输入云打印机编号'))
      }
      callback()
    }
    const validatePrintAppId = async (rule, value, callback) => {
      if (this.formData.radio !== '0') {
        return callback()
      }
      if (!this.formData.printAppId) {
        return callback(new Error('请输入打印组件ID'))
      }
      const apps = getPrintAppData()
      if (apps.find(d => d.appId === this.formData.printAppId)) {
        return callback(new Error('您已绑定了该打印组件ID，请勿重复绑定'))
      }
      const res = await isPrintAppOnline(this.formData.printAppId)
      if (res.code !== 0 || res.data.status === 20) {
        const msg = '打印组件不在线，请确认是否已开启该打印组件'
        return callback(new Error(msg))
      }
      callback()
    }
    return {
      dialogVisible: false,
      formData: {
        // [0:打印组件 1：云打印机]
        radio: this.isClientMode ? '1' : '0',
        // 运单云编码
        printerId0: '',
        // 标签云编码
        printerId1: '',
        //打印组件Id
        printAppId: ''
      },
      // 是否折叠
      collapse: true,
      rules: {
        printerId0: [
          { required: true, validator: validateId, trigger: 'blur' }
        ],
        printerId1: [
          { required: true, validator: validateId, trigger: 'blur' }
        ],
        printAppId: [
          { required: true, validator: validatePrintAppId, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  watch: {
    'formData.radio' (val) {
      this.$refs.formName.clearValidate()
      if (val === '0') {
        this.setPrintAppId()
      }
    },
    visible (val) {
      this.dialogVisible = val
      if (val) {
        setTimeout(() => {
          this.setPrintAppId()
        }, 500)
      }
    },
    dialogVisible (val) {
      if (!val) {
        this.formData.radio = this.isClientMode ? '1' : '0'
        this.formData.printerId0 = this.formData.printerId1 = this.formData.printAppId = ''
        this.$emit('close')
      }
    }
  },
  methods: {
    downloadPrintApp () {
      window.location.href = 'https://ic-h5.kye-erp.com/intro/client/KYE_Printer_2.0.exe'
    },
    async setPrintAppId () {
      printerWebsocket.getPrintAppId(async id => {
        const apps = await printerUtil.getPrintApps()
        if (!apps.find(f => f.printerName === id)) {
          this.formData.printAppId = id
        }
      })
    },
    // 绑定打印机
    bindDevice () {
      this.$refs['formName'].validate(async valid => {
        if (!valid) {
          return
        }
        let result = false
        const returnParams = {}
        if (this.formData.radio === '0') {
          const apps = getPrintAppData()
          apps.push({ appId: this.formData.printAppId })
          setPrintAppData(apps)
          returnParams.printerName = this.formData.printAppId
          result = true
        } else {
          result = await this.bindCloudPrinter()
        }
        if (result) {
          this.$message.success('添加成功')
          this.$emit('refresh', returnParams)
          this.resetForm()
        }
      })
    },
    async bindCloudPrinter () {
      const companyNo = await GetSrcWorkerNoByCompNo({ CompanyNo: this.userInfo.customCode })
      const marketerNo = companyNo.data.workerNo
      const params = {
        'companyNo': this.userInfo.customCode,
        'printers': [
          {
            'templateType': this.formData.printerId0 ? '0' : '1',
            'printerId': this.formData.printerId0 || this.formData.printerId1
          }
        ],
        'telPhone': this.userInfo.phone,
        'marketer': this.userInfo.marketer,
        'marketerNo': marketerNo
      }
      const res = await BindDevice(params)
      return res.code === 0
    },
    resetForm () {
      this.dialogVisible = false
      this.$refs['formName'].resetFields()
    },
    switchCollapse () {
      this.collapse = !this.collapse
    }
  }
}
</script>

<style lang='scss' scoped>
  .dialog-add-printer {
    .mg-r10 {
      margin-left: 10px;
    }
    .collapse-content {
      height: 0;
      transition: height 0.2s;
      overflow: hidden;

      &.collapse--open {
        height: auto;

        & + .collapse-item .collapse-arrow {
          transform: rotate(180deg);
          margin-top: -1px;
        }
      }
    }

    .collapse-arrow {
      width: 0;
      height: 0;
      background: transparent;
      border: 5px solid transparent;
      border-top: 6px solid #999999;
      display: inline-block;
      vertical-align: top;
      margin-top: 4px;
      margin-left: 4px;
    }

    .el-icon-question {
      position: absolute;
      top: 0;
      left: 130px;
    }

    .print-app-tip {
      color: #999999;
      line-height: 22px;

      & > div:first-of-type {
        color: #333333;
        font-weight: bold;
      }

      & > span {
        color: #7c57df;
        cursor: pointer;
      }
    }
  }
</style>
<style lang='scss'>
  .k-dialog {
    .el-dialog__header {
      padding: 7px 20px;
      .el-dialog__title {
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        font-weight: bold;
        // line-height: 1;
        color: $--color-text-primary;
      }
      .el-dialog__headerbtn {
        top: 11px;
        right: 16px;
        & > i {
          color: #999999;
        }
      }
    }

    .el-dialog__body {
      padding: 10px 20px 17px;
    }

    .el-dialog__footer {
      .dialog-footer {
        button {
          border-radius: 4px;
        }
      }
    }
  }
</style>