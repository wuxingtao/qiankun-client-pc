<!-- 地址簿批量导入 -->
<template>
  <div>
    <ky-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false"
               :custom-class="`k-dialog el-dialog--origin current-step-${currentStep}`" class="dialog-2021"
               :width="dialogWidth">
      <div class="dialog__content" v-loading="loading">
        <ky-ui-tip type="error" class="mb_12" v-show="currentStep === 2 && errorSummary.errorCount > 0">共有{{
            errorSummary.totalRowCount
          }}条，其中有&nbsp;{{ errorSummary.errorCount }}&nbsp;处错误
        </ky-ui-tip>
        <ky-ui-tip type="info" class="mb_12" v-show="currentStep === 2 && errorSummary.errorCount === 0 ">
          共有{{ errorSummary.totalRowCount }}条
        </ky-ui-tip>
        <div :class="['download-wrapper text_right',{'flex flex_ai_c flex_jc_fe':currentStep!==1}]">
          <el-button type='text' class='el-dropdown-link pd0' @click="reset" v-if="currentStep!==1">
            <svg-icon icon-class='waybill-batch-export-button' class="pr_8" />
            重新上传
          </el-button>
          <el-button type="text" @click="downloadTemplate" class="pd0" v-if="currentStep===1">
            <svg-icon icon-class="download2" class="icon-tabs" />
            下载模版
          </el-button>
        </div>
        <div v-show="currentStep === 1">
          <div class="import-content">
            <div class="upload-wrapper">
              <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleReadExcel"
                         @drop.native="e => beforeUploadHandler(e.dataTransfer.files[0],['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'])"
                         action="" accept=".xls,.xlsx"
                         drag>
                <svg-icon icon-class="upload" class-name="icon-upload" />
                <div class="el-upload__text">点击{{ isClientMode ? '' : '或将文件拖拽到' }}这里上传</div>
                <p class="mt_12 fs_12 c_999">支持扩展名 .xls .xlsx</p>
              </el-upload>
            </div>
          </div>

        </div>
        <!--  导入的数据列  -->
        <div v-show="currentStep === 2" class="table__content">
          <editable-table ref="editableTable" indexColumn indexColumnFixed="left" :tableColumns="tableColumns"
                          :maxHeight="tableHeight" :verifyRules="verifyRules" :errorSummary.sync="errorSummary"
                          :clearable="false" />
        </div>
      </div>
      <div slot="footer" class="dialog-footer text_right">
        <el-button round @click="handleClose">取 消</el-button>
        <el-button round type="primary" :disabled="currentStep === 1 || loading" v-btnThrottle @click="handleConfirm">
          确定导入
        </el-button>
      </div>
    </ky-dialog>
  </div>
</template>

<script>
import * as clientUtil from '@/utils/clientUtil'
import EditableTable from '@/components/table/editable-table'
import { addAddressList, splitAddressList } from '@/services/api/address'
import { KyUiTip } from '@comps/ky-ui'
import REGULAR from '@utils/regular'
import { fileDataTrim, batchRequest } from '@utils/commonUtil'
import { mapState, mapGetters } from 'vuex'
import { getCustomerCode, getPhone } from '@utils/storage'

export default {
  name: 'dialog-import',
  components: {
    EditableTable,
    KyUiTip
  },
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    addressType: { //地址薄类型：'10'(寄方),'20'(收方)
      type: String,
      require: true
    }
  },
  data () {
    const phoneValid = (row, value, fieldName) => {
      if (!row.contactPhone.value && !row.telephone.value) {
        return '手机号码和固定电话不能同时为空'
      }
      const mobileValid = REGULAR.mobileNumber.test(row.contactPhone.value)
      const telValid = REGULAR.telephoneNew.test(row.telephone.value)
      if (fieldName === 'telephone') {
        if (!row.telephone.value && mobileValid) {
          return ''
        }
        if (row.telephone.value && !telValid) {
          return '请输入正确的固定电话'
        }
        if (telValid && !mobileValid) {
          this.$refs.editableTable.verifyField('contactPhone', row.contactPhone, row)
        }
      }

      if (fieldName === 'contactPhone') {
        if (!row.contactPhone.value && telValid) {
          return ''
        }
        if (row.contactPhone.value && !mobileValid) {
          return '请输入正确的手机号码'
        }

        if (mobileValid && !telValid) {
          this.$refs.editableTable.verifyField('telephone', row.telephone, row)
        }
      }
    }
    const addressValid = async (row, value, fieldName, isInit) => {
      const reg = REGULAR.genaralText
      if (!(reg.test(value.value)) || value.value.length > 150 || value.value.length < 11) {
        if (value.value.length < 11) {
          return '地址不能小于11个字'
        } else if (value.value.length > 150) {
          return '地址不能大于150个字'
        } else {
          return '请输入正确的联系地址'
        }
      }
      if (!isInit) {
        const res = await splitAddressList([{ id: 0, address: row.address.value }])
        if (res.code !== 0 || !res.data.dataList || res.data.dataList.length < 1) {
          return '地址解析失败，请输入正确的地址'
        }
        const data = res.data.dataList[0]
        row.province = { value: data.province }
        row.city = { value: data.city }
        row.zone = { value: data.zone }
      }
    }
    const contactValid = (row, value) => {
      const reg = /^[\u4e00-\u9fa5a-zA-Z0-9（）】【]{2,30}$/
      if (!(reg.test(value.value))) {
        if (value.value.length < 2) {
          return '联系人姓名不能少于两个字'
        } else if (value.value.length > 30) {
          return '联系人姓名不能大于10字'
        } else {
          return '请输入正确的联系人姓名'
        }
      }
    }
    const companyValid = (row, info) => {
      const value = info.value
      const reg = REGULAR.genaralText
      if (!value) {
        return ''
      }
      if (!(reg.test(value)) || value.length < 2 || value.length > 30) {
        if (value.length < 2) {
          return '公司名称不能少于两个字'
        } else if (value.length > 30) {
          return '公司名称不超过30个字'
        } else {
          return '请输入正确的公司名称'
        }
      } else {
        return ''
      }
    }
    return {
      dialogVisible: false,
      hasImport: false,
      loading: false,
      // 1 未上传 2已上传
      currentStep: 1,
      tableHeight: '500px',
      // 错误提示
      errorSummary: {
        errorRowCount: 0,
        errorCount: 0,
      },
      tableColumns: [
        { prop: 'contact', text: '联系人', width: '100' },
        { prop: 'contactPhone', text: '手机号码', aliasText: '联系方式', alias1: '手机号', maxlength: 11, width: '120' },
        { prop: 'telephone', text: '固定电话', width: '150' },
        { prop: 'address', text: '地址', aliasText: '联系地址', alias1: '详细地址', maxlength: 150, width: '260' },
        { prop: 'company', text: '公司名称', aliasText: '公司', width: '160' },
        { prop: 'remark', text: '备注', maxlength: 100, width: '150' },
      ],
      verifyRules: {
        contact: [
          { required: true, msg: '请输入联系人姓名', trigger: 'blur' },
          { validator: contactValid, trigger: 'blur' },
        ],
        company: [
          { msg: '请输入公司名称', trigger: 'blur' },
          { validator: companyValid, trigger: 'blur' },
        ],
        contactPhone: [
          { msg: '请输入手机号码', validator: phoneValid, trigger: 'blur' },
        ],
        telephone: [
          { msg: '请输入固定电话', validator: phoneValid, trigger: 'blur' },
        ],
        address: [
          { require: true, msg: '请输入详细地址' },
          { validator: addressValid, trigger: 'blur' },
        ],
        remark: [
          { max: 100, msg: '请输入100个字内非特殊字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState(['userInfo']),
    ...mapGetters(['canModifySenderCompany']),
    disableCompanyName(){
      return  this.addressType === '10' && getCustomerCode() && !this.canModifySenderCompany
    },
    title () {
      return this.currentStep === 1 ? '从Excel中导入' : '批量导入'
    },
    dialogWidth () {
      return this.currentStep === 1 ? '500px' : '1040px'
    }
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        this.$emit('close')
        this.reset()
      }
    },
    visible: function (val) {
      this.dialogVisible = val
    }
  },
  methods: {
    reset () {
      this.$refs.editableTable.clearTableRows()
      this.currentStep = 1
      this.loading = false
    }
    ,
    //检查数据是否符合要求，并将excel数据格式化成标准数据
    checkAndFormatExcelData (dataList, headerIndex = 1) {
      try {
        if (!dataList || dataList.length === 0) {
          return '您导入的excel无数据,请确认'
        }
        // 指定列名称
        const colNames = ['联系人', '手机号码', '固定电话', '地址', '公司名称', '备注']
        // 兼容老模板
        const colNamesOld = ['公司名称', '联系人', '手机号码', '固定电话', '联系地址', '备注']
        const colNames1 = ['联系人', '联系方式', '公司', '地址', '备注']
        const colNames2 = ['公司名称', '联系人', '手机号码', '固定电话', '详细地址', '备注']
        const excelColNames = Object.keys(dataList[0]).filter(item => !(/^COLUMN/.test(item.toUpperCase())))
        if (excelColNames.some(c => !colNames.includes(c)) && excelColNames.some(c => !colNamesOld.includes(c))
            && excelColNames.some(c => !colNames1.includes(c)) && excelColNames.some(c => !colNames2.includes(c))) {
          if (headerIndex === 0) {
            return '导入Excel格式不正确,请下载正确的模板'
          }
          dataList.length = 0
          return ''
        }
        if (dataList.length < 1) {
          return '导入的数据为空,请确认'
        }
        if (dataList.length > 1000) {
          return '一次最多只允许导入1000条，请重新修改Excel'
        }
        const newList = dataList.map((d, index) => {
          let row = { no: index }
          this.tableColumns.forEach(item => {
            row[item.prop] = d[item.text] || d[item.aliasText] || d[item.alias1] || ''
          })
          if(this.addressType === '10'){
            if(this.disableCompanyName){
              row.company = clientUtil.getLoginCompanyName()
            }else{
              row.company = row.company || clientUtil.getLoginCompanyName()
            }
          }
          return row
        })
        dataList.length = 0
        dataList.push(...newList)
      } catch (err) {
        console.log('err:>>', err)
        this.$message.error('您导入的表格文件存在异常，请检查后重新导入')
      }
    },
    beforeUploadHandler (file, accept = []) {
      //验证文件类型
      if (accept.indexOf(file.type) === -1) {
        this.$message.warning('导入的Excel表格格式不正确,请下载正确的模板')
        return false
      }
      return true
    },
    // 上传文件变更
    async handleReadExcel (file, fileList, headerIndex = 0) {
      this.loading = true
      setTimeout(async () => {
        try {
          const companyColumn = this.tableColumns.find(c=>c.prop === 'company')
          if(companyColumn){
            companyColumn.readOnly = this.disableCompanyName
          }
          let { jsonData: dataList, msg } = await clientUtil.readExcel(file, headerIndex)
          msg = msg || this.checkAndFormatExcelData(dataList, headerIndex)
          if (msg && headerIndex === 0) {
            this.$message.warning(msg)
            this.loading = false
            return
          }
          if (dataList.length === 0) {
            this.$message.warning('您导入的excel无数据,请确认')
            this.loading = false
            return
          }
          // 去除数组对象空格
          const tableData = fileDataTrim(dataList)
          this.currentStep = 2
          await this.$refs.editableTable.initTableData(tableData)
          await this.verifyImportDataResult(tableData)
          this.$refs.editableTable.setErrorCountAndSort()
          this.loading = false
        } catch (ex) {
          let msg = '您导入的表格文件存在异常，请检查后重新导入'
          if (ex && ex.name === 'SyntaxError') {
            msg = '您导入的表格有误,请检查文件是否损坏或加密'
          }
          this.$message.error(msg)
          console.log('ex :>> ', ex)
          this.loading = false
          this.currentStep = 1
        }
      }, 200)
    },
    async verifyImportDataResult (tableData) {
      const addressArr = [...new Set(tableData.map(d => d.address))]
      const addressList = addressArr.map((d, index) => ({
        id: index,
        address: d
      }))
      const resList = await batchRequest({
        requestFunc: arr => splitAddressList(arr),
        arrayData: addressList,
        signleDataCount: 200
      })
      if (!resList) {
        this.$message.error('数据请求校验失败')
        return this.reset()
      }
      const results = resList.reduce((arr, cur) => {
        if (cur.code === 0 && cur.data && cur.data.dataList) {
          arr.push(...cur.data.dataList)
        }
        return arr
      }, [])
      const editableTableData = this.$refs.editableTable.editableTableData
      editableTableData.forEach(d => {
        if (results) {
          const result = results.find(f => f.address == d.address.value)
          if (result && result.province && result.city) {
            d.province = { value: result.province }
            d.city = { value: result.city }
            d.zone = { value: result.zone }
          } else {
            let msg = '地址解析失败，请输入正确的地址'
            if (!d.address.value || d.address.value.length < 11) {
              msg = '地址不能小于11个字'
            }
            d.address.errorInfo = msg
          }
        }
      })
    },
    // 下载地址簿模板
    downloadTemplate () {
      const fileName = '地址簿模板.xls'
      if (!this.isClientMode) {
        window.location.href = `/templates/${fileName}`
      } else {
        const url = `${window.location.origin}/templates/${fileName}`
        this.$native.downLoadFile(url, 'excel', fileName)
      }
    }
    ,
    // 可修改表格数据转换为[{key:value}]
    changeToModelList (tableRows, isOriginTableData = false) {
      return tableRows.map(row => {
        let item = {}
        for (let key in row) {
          item[key] = isOriginTableData ? row[key] : row[key].value
        }
        return item
      })
    }
    ,
    // 获取格式化导入列表
    getDataFromEdit () {
      const editableTableData = this.$refs.editableTable.editableTableData
      const tableModel = this.changeToModelList(editableTableData)
      return tableModel.map((item, index) => {
        item.contactPhone = (item.contactPhone).toString()
        item.telephone = (item.telephone).toString()
        return { ...item, no: index }
      })
    }
    ,
    // 确定
    handleConfirm () {
      if (this.errorSummary && this.errorSummary.errorCount > 0) {
        this.$message.warning(`共有${this.errorSummary.errorCount}处错误，请修正异常信息`)
        return
      }
      this.handleQueueSubmit()
    },

    /**
     * 单次提交模板数据
     * @param data 提交模板数据
     * @param time 时间间隔
     * @returns {Promise<unknown>}
     */
    handleSingleRequest (data, time = 0) {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            console.log('data :>> ', data)
            const params = {
              addressType: this.addressType,
              addressList: data.map(d => ({
                phone: getPhone(),
                customerCode: getCustomerCode(),
                contact: d.contact,
                company: d.company,
                contactPhone: d.contactPhone,
                telephone: d.telephone,
                province: d.province || '',
                city: d.city || '',
                area: d.zone || '',
                address: d.address.replace(d.province + d.city + d.zone, ''),
                remark: d.remark,
                source: 'PC客户端',
              }))
            }
            addAddressList(params)
              .then(res => {
                if (res.code !== 0) {
                  throw new Error('code error')
                } else {
                  resolve(res)
                }
              }).catch(e => {
                this.loading = false
                reject(e)
              })
          }, time)
        } catch (e) {
          this.loading = false
          reject(e)
        }
      })

    },
    // 批量提交数据，每次最多200
    handleQueueSubmit () {
      const data = this.getDataFromEdit()
      const queueData = this.splitDataQueue(data, 200) || []
      this.loading = true
      let promiseQueque = []
      try {
        queueData.forEach((item, index) => {
          // window.requestAnimationFrame(()=>{})
          promiseQueque[index] = this.handleSingleRequest(item, 1000 * index)
        })
        Promise.all(promiseQueque).then(() => {
          this.handleClose()
          this.$emit('refreshList')
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      } catch (e) {
        this.$emit('refreshList')
        this.loading = false
      }
    },
    splitDataQueue (data = [], num = 200) {
      let result = []
      for (let i = 0; i < data.length; i += num) {
        result.push(data.slice(i, i + num))
      }
      return result
    },
    handleClose () {
      this.dialogVisible = false
    }
    ,
  }
}
</script>

<style lang="scss" scoped>
.download-wrapper {
  font-size: 12px;
  color: #666666;
  margin: 0 0 10px;

  .pd0 {
    padding: 0;
    font-size: 12px
  }
}

.import-content {
  margin-right: 12px;
  // margin-bottom: 35px;
  width: 100%;

  .icon-upload {
    width: 52px;
    height: 43px;
    margin-bottom: 20px;
  }

  .upload-wrapper {
    /deep/ .el-upload {
      width: 100%;

      .el-upload-dragger {
        background: #f9f9f9;
        width: 100%;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: column;

        .el-upload__text {
          color: #333;
        }
      }
    }
  }
}

/deep/ .el-button + .el-button {
  margin-left: 16px !important;
}

/deep/ .current-step-1 {
  .el-dialog__footer {
    display: none;
  }
}

/deep/ .editable-table {
  thead th {
    font-family: PingFangSC, PingFangSC-Medium;
  }
}

</style>
