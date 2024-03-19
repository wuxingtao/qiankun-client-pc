<template>
  <div class='page-style1 main'>
    <ky-dialog title='修改派送时间' width='380px' style='top:5%'
               :visible.sync='dialogVisible' :close-on-click-modal='false'
               @close='onClose'>
      <div class='dialog-body' >
        <div class='row-info'>
          我司将为您免费保管{{ dataInfo.freeDays }}天货物，超期将收取货物保管费，该运单可修改{{ dataInfo.modifyTimes }}次<span
          v-if='dataInfo.modifyTimes===2'>,修改时间需间隔{{ dataInfo.modifyTimeInterval }}小时</span>
        </div>
        <el-form ref='form' :model='formData' :rules='formRules' label-position='top'>
          <div class='date-pick'>
            <el-form-item label='预计派送时间' prop='deliveryTime'>
              <el-date-picker v-model='formData.deliveryTime'
                              size='small' prefix-icon='iconfont icon-purple_calendar' popper-class='date-pick'
                              type='datetime' placeholder='请选择派送时间' format='yyyy/MM/dd HH:mm'
                              :picker-options='pickerOptions'>
              </el-date-picker>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='onClose'>取消</el-button>
        <el-button type='primary' :loading='loading' @click='confirm'> 确定</el-button>
      </span>
    </ky-dialog>
  </div>
</template>

<script>

import waybillApi from '@/services/api/waybill'
import dayjs from 'dayjs'

export default {
  name: 'UpdateAppointmentTime',
  props: {
    visible: { type: Boolean, required: true },
    ydNo: { type: String, required: true },
    dataInfo: { type: Object, required: true },
    preArriveTime: { type: String, default: '' }
  },
  data() {
    const validateDeliveryDate = (rule, value, callback) => {
      /**
       * 时间判断：
       * 时间优先取紧急派送时间，如果没有紧急派送时间选择预计派送时间
       * 可选最早时间取【时间+1分钟】和 当前时间 中晚的时间
       * 可选最晚时间取【时间+15天】
       * */
      const time = dayjs(this.dataInfo.exigencyDate || this.preArriveTime).add(1, 'minute')
      const now = dayjs().add(1, 'minute')
      if ((this.dataInfo.exigencyDate || this.preArriveTime) && time.isAfter(now)) {
        // 接口时间晚于本地时间
        if (time.isAfter(dayjs(value), 'minute')) {
          const last = time.format('YYYY-MM-DD HH:mm')
          return callback(new Error(`派送时间不得早于${last}，请重新选择`))
        }
        if (time.add(15, 'day').isBefore(dayjs(value), 'minute')) {
          const last = time.add(15, 'day').format('YYYY-MM-DD HH:mm:ss')
          return callback(new Error(`派送时间不得晚于${last}，请重新选择`))
        }
      } else {
        if (now.isAfter(dayjs(value), 'minute')) {
          const last = now.format('YYYY-MM-DD HH:mm')
          return callback(new Error(`派送时间不得早于${last}，请重新选择`))
        }
        if (now.add(15, 'day').isBefore(dayjs(value), 'minute')) {
          const last = now.add(15, 'day').format('YYYY-MM-DD HH:mm:ss')
          return callback(new Error(`派送时间不得晚于${last}，请重新选择`))
        }
      }
      callback()
    }
    return {
      dialogVisible: false,
      loading: false,
      freeDays: '',
      modifyTimes: '',
      formData: {
        deliveryTime: ''
      },
      formRules: {
        deliveryTime: [
          { required: true, message: '请选择预计派送时间', trigger: 'blur' },
          { required: true, message: '请选择预计派送时间', trigger: 'change' },
          { validator: validateDeliveryDate, trigger: 'blur' }
        ]
      },
      pickerOptions: {
        disabledDate: time => {
          const send = dayjs(this.dataInfo.exigencyDate || this.preArriveTime)
          const now = dayjs()
          if ((this.dataInfo.exigencyDate || this.preArriveTime) && send.isAfter(now)) {
            // 接口时间晚于本地时间
            return time.getTime() < send.subtract(1, 'day').valueOf()
              || time.getTime() > send.add(15, 'day').valueOf()
          } else {
            return time.getTime() < now.subtract(1, 'day').valueOf()
              || time.getTime() > now.add(15, 'day').valueOf()
          }
        }
      }
    }
  },
  methods: {
    confirm() {
      this.loading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            waybillNumber: this.ydNo,
            deliveryTime: dayjs(this.formData.deliveryTime).format('YYYY-MM-DD HH:mm:ss'),
            source: '30'
          }
          this.modifyDeliveryTimes(params)
          // this.loading = false
        } else {
          this.loading = false
        }
      })
    },
    async modifyDeliveryTimes(params) {
      let res = await waybillApi.modifyDeliveryTime(params)
      if (res && res.code === 0) {
        this.$message.success('修改成功')
        setTimeout(() => this.$emit('success'), 1000)
        this.onClose()
      } else {
        this.loading = false
        // this.$message.error(res.msg)
      }
    },
    onClose() {
      this.loading = false
      this.$refs.form.resetFields()
      this.$refs.form.clearValidate()
      this.dialogVisible = false
    }
  },
  watch: {
    visible(val) {
      this.formData.deliveryTime = this.dataInfo.exigencyDate
      if (val) {
        this.dialogVisible = true
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$refs.form.resetFields()
        this.$refs.form.clearValidate()
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.main {
  /deep/ .el-dialog {
    position: absolute;
    top: 45% !important;
    left: 50%;
  }
}

.row-info {
  font-size: 14px;
  font-weight: 400;
  text-align: justify;
  color: #f13e3e;
  line-height: 20px;
  padding-bottom: 20px;
}

.hhDate {
  bottom: 4px;
  position: relative;
  width: 140px;
  padding: 0;
}

/deep/ {
  .el-form-item {
    .el-form-item__label {
      line-height: 14px;
      padding-bottom: 8px;
    }

    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 100%;
    }

    .el-input__prefix {
      position: absolute;
      width: 25px;
      left: 316px;
      z-index: 5;
    }

    .el-input__suffix {
      right: 10px;
    }

    .el-form-item__error {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .icon-purple_calendar {
    color: #8365f6;
    right: 0;
    position: absolute;
  }

  .el-icon-circle-close {
    right: 20px;
    position: relative;
  }

  .el-button--text {
    display: none;
  }
}

.data-picker {
  position: relative;
}
</style>
<style lang='scss'>
.date-pick .el-picker-panel__footer {
  border-radius: 0 0 8px 8px;
  padding-right: 20px;

  .el-button--text {
    display: none;
  }

  .el-button--mini {
    background: #8365f6;
    border-radius: 4px;
    color: #FFF;
    padding: 9px 22px;
  }

  .el-button.is-plain:hover, .el-button.is-plain:focus {
    background: #8365f6;
    border-color: #8365f6;
    color: #FFF;
  }
}

.date-pick {
  border: none;
  border-radius: 4px;

  .el-date-table th {
    border-top: solid 1px #EBEEF5;
    border-bottom: none;
  }

  .current span {
    border-radius: 4px !important;
  }

  .el-date-table__row .disabled div {
    background-color: #fff;
  }

  .el-date-range-picker__content.is-left {
    border-right: none;
  }

  .el-time-panel {
    .el-time-spinner__item.active {
      color: #8365F6;
    }
  }

  // 选中时间上下边修改无效
  .el-time-panel__content::after, .el-time-panel__content::befor {
    border-color: #eee !important;
  }
}
</style>