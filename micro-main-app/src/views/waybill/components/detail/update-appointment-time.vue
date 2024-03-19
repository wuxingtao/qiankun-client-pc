<template>
  <div class='page-style1 main'>
    <ky-dialog title='修改派送时间' width='380px' style='top:5%'
               :visible.sync='dialogVisible' :close-on-click-modal='false'
               @close='onClose'>
      <div class='dialog-body'>
        <ky-ui-tip
          type='plain'
          class='c_ff8038'
          icon-color='#ff8038'
        >
          我司将为您免费保管{{ dataInfo.freeDays }}天货物，超期将收取货物保管费，同笔运单仅能修改{{ dataInfo.modifyTimes }}次<span
          v-if='dataInfo.modifyTimes===2'>,修改时间需间隔{{ dataInfo.modifyTimeInterval }}小时</span>
        </ky-ui-tip>
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

import waybillApi from "@/services/api/waybill"
import dayjs from "dayjs"
import { KyUiTip } from "@comps/ky-ui"

export default {
  name: "UpdateAppointmentTime",
  props: {
    visible: { type: Boolean, required: true },
    ydNo: { type: String, required: true },
    dataInfo: { type: Object, required: true },
    preArriveTime: { type: String, default: "" },
    timeDialogInfo: {
      type: Object,
      default: () => {
        return {
          finalAging: "", // 偏好设置需派时效
          from: "" // <'preference' 偏好设置 >
        }
      }
    }
    
  },
  computed: {
    timeFinally() {
      // return this.timeDialogInfo.finalAging || this.preArriveTime
      let result = ""
      const now = dayjs()
      const send = dayjs(this.timeDialogInfo.finalAging || this.preArriveTime)
      if (send.isAfter(now)) {
        result = this.timeDialogInfo.finalAging || this.preArriveTime
      } else {
        result = now.format("YYYY-MM-DD HH:mm:ss")
      }
      return result
    }
  },
  data() {
    const validateDeliveryDate = (rule, value, callback) => {
      /**
       * 时间判断：
       * 时间优先取需派失效<紧急派送时间会映射到需派失效>
       * 可选最早时间取【时间+3h】和 当前时间 中晚的时间
       * 可选最晚时间取【时间+15天】【+3h】
       * */
      const time = dayjs(this.timeFinally).add(3, "hour")
      const now = dayjs().add(3, "hour")
      if (time && time.isAfter(now)) {
        // 接口时间晚于本地时间
        if (time.isAfter(dayjs(value), "minute")) {
          const last = time.format("YYYY-MM-DD HH:mm")
          return callback(new Error(`派送时间不得早于${last}，请重新选择`))
        }
        if (time.add(15, "day").isBefore(dayjs(value), "minute")) {
          const last = time.add(15, "day").format("YYYY-MM-DD HH:mm:ss")
          return callback(new Error(`派送时间不得晚于${last}，请重新选择`))
        }
      } else {
        if (now.isAfter(dayjs(value), "minute")) {
          const last = now.format("YYYY-MM-DD HH:mm")
          return callback(new Error(`派送时间不得早于${last}，请重新选择`))
        }
        if (now.add(15, "day").isBefore(dayjs(value), "minute")) {
          const last = now.add(15, "day").format("YYYY-MM-DD HH:mm:ss")
          return callback(new Error(`派送时间不得晚于${last}，请重新选择`))
        }
      }
      callback()
    }
    return {
      dialogVisible: false,
      loading: false,
      freeDays: "",
      modifyTimes: "",
      formData: {
        deliveryTime: ""
      },
      formRules: {
        deliveryTime: [
          { required: true, message: "请选择预计派送时间", trigger: "blur" },
          { required: true, message: "请选择预计派送时间", trigger: "change" },
          { validator: validateDeliveryDate, trigger: "blur" }
        ]
      },
      pickerOptions: {
        disabledDate: time => {
          const send = dayjs(this.timeFinally).add(3, "hour")
          const now = dayjs().add(3, "hour")
          if (send && send.isAfter(now)) {
            return time.getTime() < send.subtract(1, "day").valueOf()
              || time.getTime() > send.add(15, "day").valueOf()
          } else {
            return time.getTime() < now.subtract(1, "day").valueOf()
              || time.getTime() > now.add(15, "day").valueOf()
          }
        },
        selectableRange: ""
      }
    }
  },
  methods: {
    confirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$confirm(`您确认将派送时间修改至${dayjs(this.formData.deliveryTime).format("YYYY/MM/DD HH:mm")}吗？`, "确认提醒").then(() => {
            let params = {
              waybillNumber: this.ydNo,
              deliveryTime: dayjs(this.formData.deliveryTime).format("YYYY-MM-DD HH:mm:ss"),
              source: "30"
            }
            this.modifySwitch(params)
          })
        }
      })
    },
    
    modifySwitch(params) {
      // 存在弹窗来源
      if (this.timeDialogInfo.from) {
        const callbackParams = {
          from: this.timeDialogInfo.from,
          deliveryTime: params.deliveryTime
        }
        this.$emit("success", callbackParams)
        this.onClose()
      } else {
        this.modifyDeliveryTimes(params)
      }
      
    },
    
    async modifyDeliveryTimes(params) {
      this.loading = true
      let res = await waybillApi.modifyDeliveryTime(params)
      if (res && res.code === 0) {
        this.$message.success("修改成功")
        setTimeout(() => this.$emit("success"), 1000)
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
      this.$emit("closeAppointmentTimeDialog")
      this.dialogVisible = false
    }
  },
  watch: {
    visible(val) {
      this.formData.deliveryTime = dayjs(this.timeFinally).add(3, "hour").format("YYYY-MM-DD HH:mm:ss")
      
      if (val) {
        this.dialogVisible = true
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$refs.form.resetFields()
        this.$refs.form.clearValidate()
        this.$emit("update:visible", val)
      }
    },
    "formData.deliveryTime": {
      handler(newValue, oldValue) {
        if (newValue) {
          const now = dayjs()
          const send = dayjs(this.timeFinally)
          let selectInfo = dayjs(newValue)
          
          const sendValue = send.add(3, "hour")
          const sendHour = send.add(3, "hour").get("hour")
          const sendMinute = sendValue.get("minute")
          
          const nowHour = now.add(3, "hour").get("hour")
          const nowMinute = now.add(3, "hour").get("minute")
          
          const referenceHour = now.valueOf() > send.valueOf() ? nowHour : sendHour
          const referenceMinute = now.valueOf() > send.valueOf() ? nowMinute : sendMinute
          
          const selectDateString = selectInfo.format("YYYY-MM-DD")
          const sendString = sendValue.format("YYYY-MM-DD")
          let st = ""
          if (selectDateString === sendString) {
            st = `${referenceHour}:${referenceMinute}:00`
            this.pickerOptions.selectableRange = st + " - 23:59:59"
            
            const minDate = selectInfo.set("hour", referenceHour).set("minute", referenceMinute)
            if (dayjs(this.formData.deliveryTime).valueOf() < minDate.valueOf()) {
              this.formData.deliveryTime = new Date(minDate.format())
            }
          } else if (selectDateString === sendValue.add(15, "day").format("YYYY-MM-DD")) {
            this.pickerOptions.selectableRange = `00:00:00 - ${referenceHour}:${referenceMinute}:00`
            
            const maxDate = selectInfo.set("hour", referenceHour).set("minute", referenceMinute)
            if (dayjs(this.formData.deliveryTime).valueOf() > maxDate.valueOf()) {
              this.formData.deliveryTime = new Date(maxDate.format())
            }
          } else {
            st = "00:00:00"
            if (this.pickerOptions.selectableRange !== st + " - 23:59:59") {
              this.pickerOptions.selectableRange = st + " - 23:59:59"
            }
          }
        }
      }
    }
  },
  components: {
    KyUiTip
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
  .el-form {
    background: #f8f8f8;
    border-radius: 4px;
    padding: 10px;
    
    .el-date-editor--datetime {
      .el-input__inner {
        background: #f8f8f8;
      }
      
      .icon-purple_calendar {
        right: 20px;
      }
    }
  }
  
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
    border: none;
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
