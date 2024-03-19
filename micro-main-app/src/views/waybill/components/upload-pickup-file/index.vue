<template>
  <ky-dialog
    class='page-style1 dialog-2021'
    :class="{
      'is-only-show-date': onlyShowAppointDate,
      'is-only-show-number': onlyShowAppointNumber
    }"
    :title='title'
    :visible.sync='dialogVisible'
    :close-on-click-modal='false'
    :width='width'
    :before-close='handlerClose'
  >
  <el-form :model='formData' ref='form' :label-position='labelPosition' :rules='rules'>
  <div class='upload-pickup-file'>
  <template v-if='showUpload'>
    <div class='upload-pickup-file--tips'>
      <img src='@/assets/image/waybill/tips-icon.png' alt='' />
      温馨提示：因入仓需要，请上传进仓单、货物发票
    </div>
  </template>
  
  <!-- 只有预约单 -->
  <template v-if='onlyShowUpload'>
    <div class='upload-pickup-file--info'>
      <div class='info-item'>
        <div class='item-label'>详细地址：</div>
        <div class='item-value'>{{ info.address }}</div>
      </div>
      <div class='info-item'>
        <div class='item-label'>收件公司：</div>
        <div class='item-value'>{{ info.company }}</div>
      </div>
    </div>
    <upload-file :waybillNo='waybillNo' ref='upload'></upload-file>
  </template>
  
  <!-- 只有预约号 -->
  <template v-else-if='onlyShowAppointNumber'>
    <el-form-item label='预约号' prop='appointNumber'>
      <el-input
        v-model='formData.appointNumber'
        autocomplete='off'
        :maxlength='64'
        placeholder='请填写预约号'
        @keyup='keyUpHandler'
      ></el-input>
    </el-form-item>
  </template>
  
  <!-- 只有预约时间 -->
  <template v-else-if='onlyShowAppointDate'>
    <el-form-item label='预约时间' prop='appointDate'>
      <div class='appoint-date'>
        <el-date-picker
          v-model='formData.appointDate'
          @blur='handleDateBlur'
          :disabled='datePickerDisabled'
          type='datetime'
          format='yyyy-MM-dd HH:mm'
          value-format='yyyy-MM-dd HH:mm'
          :picker-options='startPickerOptions'
          @click.native='handleDatePickerClick'
          placeholder='请选择和收方约定的入仓时间'
        >
        </el-date-picker>
        <div class='appoint-date-icon'>
          <img src='@/assets/image/waybill/date.png' alt='' />
        </div>
      </div>
    </el-form-item>
  </template>
  
  <!-- 只有采购单号 -->
  <template v-else-if='onlyShowPurchaseNumber'>
    <el-form-item label='采购单号' prop='purchaseNumber'>
      <el-input
        v-model='formData.purchaseNumber'
        autocomplete='off'
        :maxlength='64'
        placeholder='请填写采购单号'
        @keyup='keyUpHandler'
      ></el-input>
    </el-form-item>
  </template>
  
  <template v-else>
    <div class='upload-pickup-file--title'>
      <div class='title'>预约信息</div>
      <div class='desc'>
        (该运单预约时间可修改{{ modifiableCount }}次，修改时间需间隔3小时)
      </div>
    </div>
    
    <div class='upload-pickup-file--form'>
      <el-form-item v-if='showAppointNumber' label='预约号' prop='appointNumber'>
        <el-input
          v-model='formData.appointNumber'
          autocomplete='off'
          placeholder='请填写预约号'
          :maxlength='128'
          @keyup='keyUpHandler'
        ></el-input>
      </el-form-item>
      <el-form-item v-if='showPurchaseNumber' label='采购单号' prop='purchaseNumber'>
        <el-input
          v-model='formData.purchaseNumber'
          autocomplete='off'
          placeholder='请填写采购单号'
          :maxlength='128'
          @keyup='keyUpHandler'
        ></el-input>
      </el-form-item>
      <el-form-item v-if='showAppointDate' label='预约时间' prop='appointDate'>
        <div class='appoint-date'>
          <el-date-picker
            v-model='formData.appointDate'
            @blur='handleDateBlur'
            :disabled='datePickerDisabled'
            type='datetime'
            format='yyyy-MM-dd HH:mm'
            value-format='yyyy-MM-dd HH:mm'
            :picker-options='startPickerOptions'
            @click.native='handleDatePickerClick'
            placeholder='请选择和收方约定的入仓时间'
            popper-class='appoint-date-picker'
          >
          </el-date-picker>
          <div class='appoint-date-icon'>
            <img src='@/assets/image/waybill/date.png' alt='' />
          </div>
        </div>
      </el-form-item>
    </div>
    
    <template v-if='showUpload'>
      <upload-file :waybillNo='waybillNo' ref='upload' @updateFileList='updateFileList'></upload-file>
    </template>
  </template>
  </div>
  </el-form>
  <div slot='footer' class='dialog-footer'>
    <el-button @click='handlerClose'>取消</el-button>
    <el-button type='primary' @click='saveData' :loading='loading'>保存</el-button>
  </div>
  </ky-dialog>
</template>

<script>
import waybillApi from '@/services/api/waybill'
import dayjs from 'dayjs'
import tipsIcon from '@/assets/image/waybill/tips-icon.png'
import { toArray, isInvalidDate } from './utils'
import { options, STATUS } from './constant'
import UploadFile from './upload-file'

export default {
  name: 'UploadPickupFile',
  components: { UploadFile },
  data() {
    var validateAppointDate = (rule, value, callback) => {
      let preArriveTime = dayjs().add(3, 'hour')
      if (this.preArriveTime && dayjs().isBefore(dayjs(this.preArriveTime))) {
        preArriveTime = dayjs(this.preArriveTime).add(3, 'hour')
      }
      const appointmentStartTime = dayjs(preArriveTime).format('YYYY/MM/DD HH:mm')
      const appointmentEndTime = dayjs(preArriveTime).add(15, 'day').format('YYYY/MM/DD HH:mm')
      if (
        value &&
        !dayjs(this.initData.appointDate).isSame(dayjs(value)) &&
        !(
          dayjs(value).valueOf() >= dayjs(appointmentStartTime).valueOf() &&
          dayjs(value).valueOf() <= dayjs(appointmentEndTime).valueOf()
        )
      ) {
        callback(new Error(`当前可修改时间段为${appointmentStartTime} - ${appointmentEndTime}`))
      } else {
        callback()
      }
    }
    return {
      reserveInfo: [],
      waybillNo: '',
      loading: false,
      dialogVisible: false,
      startDate: '',
      endDate: '',
      type: '40',
      fileList: [],
      initData: {},
      updateCount: 0,
      preArriveTime: '',
      lastUpdateDate: '',
      oldLastUpdateDate: '',
      info: {
        address: '',
        company: ''
      },
      formData: {
        appointDate: '', // 预约时间
        appointNumber: '', // 预约号
        purchaseNumber: '' // 采购单号
      },
      rules: {
        appointDate: [{ validator: validateAppointDate, trigger: 'blur' }]
      },
      title: '派货资料'
    }
  },
  computed: {
    // 仓库类型
    warehouseType() {
      return {
        upload: `${this.type}10`, // 显示上传资料
        date: `${this.type}30`, // 显示预约时间
        number: `${this.type}20`, // 显示预约号
        purchaseNumber: `${this.type}40` // 显示采购单号
      }
    },
    // 弹窗宽度
    width() {
      return this.reserveInfo.length >= 2 || this.onlyShowUpload ? '700px' : '360px'
    },
    // 表单label定位
    labelPosition() {
      return this.reserveInfo.length <= 1 ? 'top' : 'left'
    },
    // 显示预约单
    showUpload() {
      return this.reserveInfo.includes(this.warehouseType.upload)
    },
    // 显示预约号
    showAppointNumber() {
      return this.reserveInfo.includes(this.warehouseType.number)
    },
    // 显示预约时间
    showAppointDate() {
      return this.reserveInfo.includes(this.warehouseType.date)
    },
    // 显示采购单号
    showPurchaseNumber() {
      return this.reserveInfo.includes(this.warehouseType.purchaseNumber)
    },
    // 仅显示预约单，上传控件
    onlyShowUpload() {
      return (
        this.reserveInfo.includes(this.warehouseType.upload) &&
        !this.reserveInfo.includes(this.warehouseType.date) &&
        !this.reserveInfo.includes(this.warehouseType.number) &&
        !this.reserveInfo.includes(this.warehouseType.purchaseNumber)
      )
    },
    // 仅显示预约时间，上传控件
    onlyShowAppointDate() {
      return (
        !this.reserveInfo.includes(this.warehouseType.upload) &&
        this.reserveInfo.includes(this.warehouseType.date) &&
        !this.reserveInfo.includes(this.warehouseType.number) &&
        !this.reserveInfo.includes(this.warehouseType.purchaseNumber)
      )
    },
    // 仅显示预约号
    onlyShowAppointNumber() {
      return (
        !this.reserveInfo.includes(this.warehouseType.upload) &&
        !this.reserveInfo.includes(this.warehouseType.date) &&
        this.reserveInfo.includes(this.warehouseType.number) &&
        !this.reserveInfo.includes(this.warehouseType.purchaseNumber)
      )
    },
    // 仅显示采购单号
    onlyShowPurchaseNumber() {
      return (
        !this.reserveInfo.includes(this.warehouseType.upload) &&
        !this.reserveInfo.includes(this.warehouseType.date) &&
        !this.reserveInfo.includes(this.warehouseType.number) &&
        this.reserveInfo.includes(this.warehouseType.purchaseNumber)
      )
    },
    preArriveTimeDiff() {
      let preArriveTime = this.preArriveTime
      if (dayjs(preArriveTime).isBefore(dayjs())) {
        preArriveTime = dayjs()
      }
      return dayjs(preArriveTime).add(3, 'hour').toDate()
    },
    appointmentStartTime() {
      const date = dayjs().add(3, 'hour').toDate()
      if (this.preArriveTime) {
        return dayjs(this.preArriveTimeDiff).toDate()
      }
      return this.startDate ? dayjs(this.startDate).toDate() : date
    },
    appointmentEndTime() {
      const date = dayjs().add(3, 'hour').add(15, 'day').toDate()
      if (this.preArriveTime) {
        return dayjs(this.preArriveTimeDiff).add(15, 'day').toDate()
      }
      return this.endDate ? dayjs(this.endDate).toDate() : date
    },
    startPickerOptions() {
      return {
        // 设定时间范围
        disabledDate: time => {
          return (
            dayjs(time).isBefore(dayjs(this.appointmentStartTime), 'day') ||
            dayjs(time).isAfter(dayjs(this.appointmentEndTime), 'day')
          )
        }
      }
    },
    // 媚姐改动去除6小时限制
    datePickerDisabled() {
      return (
        options.maxUpdateCount <= this.updateCount
      )
    },
    // 可修改次数
    modifiableCount() {
      const count = options.maxUpdateCount - this.updateCount
      return count < 0 ? 0 : count
    }
  },
  methods: {
    handleDatePickerClick() {
      if (!this.datePickerDisabled) return
      if (options.maxUpdateCount <= this.updateCount) {
        this.$confirm(`本运单预约时间已修改${this.updateCount}次，如需修改，请致电95324`, {
          customClass: 'upload-message',
          showCancelButton: false,
          showClose: false,
          confirmButtonText: '知道了',
        })
        return
      }
      // 此逻辑取消
      // if (
      //   this.lastUpdateDate &&
      //   !isInvalidDate(this.lastUpdateDate) &&
      //   dayjs().isBefore(dayjs(this.lastUpdateDate).add(6, 'hour'))
      // ) {
      //   const nextDate = dayjs(this.lastUpdateDate).add(6, 'hour').format('HH:mm')
      //   this.$confirm(`本运单预约时间已被修改，请您在${nextDate}后再次修改。`, {
      //     customClass: 'upload-message',
      //     showCancelButton: false,
      //     showClose: false,
      //     confirmButtonText: '知道了',
      //   })
      //   return
      // }
    },
    handleDateBlur() {
      if (
        this.formData.appointDate &&
        !isInvalidDate(this.formData.appointDate) &&
        (!this.oldLastUpdateDate ||
          isInvalidDate(this.formData.appointDate) ||
          !dayjs(this.formData.appointDate).isSame(this.oldLastUpdateDate))
      ) {
        const appointDate = dayjs(this.formData.appointDate).format('YYYY-MM-DD HH:mm')
        this.$refs?.form?.clearValidate()
        this.$confirm(`您确认将预约时间修改至 ${appointDate} 吗？`, {
          customClass: 'upload-message',
          showCancelButton: true,
          showClose: false,
          confirmButtonText: '是',
          cancelButtonText: '否'
        })
          .then(() => {
            this.oldLastUpdateDate = this.formData.appointDate
          })
          .catch(() => {
            this.formData.appointDate = this.oldLastUpdateDate
          })
          .finally(() => {
            this.$refs?.form?.validateField('appointDate')
          })
      }
    },
    async getUpdateStatus() {
      if (!this.reserveInfo.includes(this.warehouseType.date) || !this.waybillNo) return
      try {
        const res = await waybillApi.getUpdateStatus({ waybillNumber: this.waybillNo })
        this.updateCount = res?.data?.count || 0
        this.lastUpdateDate = res?.data?.lastUpdateDate || ''
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    },
    async showDialog(opt) {
      console.log('showDialog', opt)
      const {
        reserveInfo = [],
        waybillNo = '',
        appointDate = '',
        appointNumber = '',
        purchaseNumber = '',
        address = '',
        company = '',
        warehouseType = '40',
        startDate,
        endDate,
        preArriveTime,
        title
      } = opt
      this.$refs.upload?.clear()
      this.reserveInfo = toArray(reserveInfo) // 类型
      this.type = warehouseType // 仓库类型
      this.waybillNo = waybillNo // 运单号
      this.title = title
      // 预约时间范围
      this.startDate = startDate
      this.endDate = endDate
      this.preArriveTime = preArriveTime // 预计下单时间
      this.formData.appointDate = appointDate ?? new Date(appointDate) // 预约时间
      this.formData.appointNumber = appointNumber // 预约号
      this.formData.purchaseNumber = purchaseNumber // 采购单号
      this.info.address = address // 详细地址
      this.info.company = company // 公司
      this.oldLastUpdateDate = this.formData.appointDate
      this.initData = opt // 记录初始的值，用作比较，没啥其他作用
      this.search()
      this.getUpdateStatus()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs?.form?.clearValidate()
      })
    },
    // 查询
    search() {
      this.$nextTick(() => {
        if (!this.$refs.upload || !this.waybillNo) return
        this.$refs.upload?.search()
      })
    },
    // 清除
    clear() {
      this.initData = {}
      this.$refs.upload?.clear()
      this.formData = this.$options.data().formData
    },
    // 点击保存
    saveData() {
      this.$refs.form?.validate(async valid => {
        if (!valid) return
        this.loading = true
        const fileList = this.$refs['upload']?.fileList || []
        const isUploadFile =
          fileList.some(v => v.status !== STATUS.SUCCESS) ||
          (this.$refs['upload']?.listLen || 0) !== fileList.length
        if (fileList.length) {
          const all = await this.$refs.upload?.batchUpload()
          this.loading = false
          if (all.some(v => v.error)) {
            this.$message.error('文件上传失败，请检查后继续')
            return
          }
        } else {
          this.loading = false
        }
        const isUploadDate =
          this.formData.appointDate &&
          !isInvalidDate(this.formData.appointDate) &&
          (!this.initData.appointDate ||
            !dayjs(this.formData.appointDate).isSame(dayjs(this.initData.appointDate)))
        if (
          isUploadDate ||
          (this.formData.appointNumber &&
            this.formData.appointNumber != this.initData.appointNumber) ||
          (this.formData.purchaseNumber &&
            this.formData.purchaseNumber != this.initData.purchaseNumber) ||
          isUploadFile
        ) {
          let fn = async () => {
          }
          if (
            this.formData.appointDate &&
            (!this.initData.appointDate ||
              !dayjs(this.formData.appointDate).isSame(dayjs(this.initData.appointDate)))
          ) {
            fn = async () =>
              await waybillApi.updateDeliveryRecordCount({ waybillNumber: this.waybillNo })
          }
          this.$emit(
            'save',
            {
              ...this.formData,
              waybillNo: this.waybillNo,
              ...(!isUploadDate && { appointDate: '' }),
              preOrderFlag: (this.formData.appointNumber || fileList.length) ? '10' : '20'
            },
            fn
          )
        }
        this.dialogVisible = false
        this.clear()
      })
    },
    async updateFileList(filelist) {
      // 在上传/移除文件的时候调用接口更新信息
      const { appointNumber } = this.formData
      let params = {
        waybillNumber: this.waybillNo,
        // appointNumber: appointNumber + '',
        // purchaseNumber: purchaseNumber + '',
        // appointDate: (isUploadDate && appointDate) ? dayjs(appointDate + ':00').format('YYYY-MM-DD HH:mm:ss') : '',
        operateSource: '210', // 操作来源，移动端-260 客户端-210
        preOrderFlag: (appointNumber || filelist.length) ? '10' : '20'
      }
      await waybillApi.updatePickupAppoint(params)
    },
    // 弹窗关闭之前
    async beforeClose(done) {
      const isUpdateUpload =
        this.$refs.upload?.fileList?.length &&
        this.$refs.upload?.fileList?.some(v => v.status !== STATUS.SUCCESS)
      const isUpdateAppointDate =
        this.formData.appointDate &&
        !isInvalidDate(this.formData.appointDate) &&
        !dayjs(this.formData.appointDate).isSame(dayjs(this.initData.appointDate))
      const isUpdateAppointNumber =
        this.formData.appointNumber && this.formData.appointNumber != this.initData.appointNumber
      if (
        (this.onlyShowUpload && isUpdateUpload) ||
        (this.onlyShowAppointDate && isUpdateAppointDate) ||
        (this.onlyShowAppointNumber && isUpdateAppointNumber) ||
        (!this.onlyShowUpload &&
          !this.onlyShowAppointDate &&
          !this.onlyShowAppointNumber &&
          (isUpdateAppointDate || isUpdateAppointNumber || isUpdateUpload))
      ) {
        try {
          const h = this.$createElement
          await this.$confirm(
            h('p', { class: 'upload-confirm' }, [
              h('img', { attrs: { src: tipsIcon } }),
              h('span', null, '您有信息未保存，是否要保存？')
            ]),
            {
              customClass: 'upload-message',
              showCancelButton: true,
              showClose: false,
              confirmButtonText: '是',
              cancelButtonText: '否'
            }
          )
          this.saveData()
          // eslint-disable-next-line no-empty
        } catch (error) {
        }
      }
      done()
    },
    // 弹窗关闭
    handlerClose() {
      this.beforeClose(() => {
        this.dialogVisible = false
        this.clear()
      })
    },
    keyUpHandler(value) {
      value = value.replace(/[^a-zA-Z0-9,，;；\\、|/]/g, '').replace(/[,，;；\\、|/]/g, ',').slice(0, 128)
    }
  }
}
</script>

<style lang='scss' scoped>
@import './index.scss';
</style>
<style lang='scss'>
.el-picker-panel.appoint-date-picker {
  .el-picker-panel__footer {
    .el-button--text.el-button--mini {
      display: none;
    }
  }
}
</style>
