<template>
  <div class="clientdialog page-style1 main">
    <el-dialog title="修改派送时间" :visible.sync="dialogVisible" :close-on-click-modal="false" width="380px" style="top:5%">
      <div class="dialog-body" v-loading="loading">
        <div class="row-info">
          我司将为您免费保管{{dataInfo.freeDays}}天货物，超期将收取货物保管费，该运单可修改{{dataInfo.modifyTimes}}次<span v-if="dataInfo.modifyTimes===2">,修改时间需间隔{{dataInfo.modifyTimeInterval}}小时</span>
        </div>
        <el-form ref='form' :model="formData" :rules="formRules" label-position="top">
          <div class="date-pick">
            <el-form-item label="预计派送时间" prop="deliveryTime">
              <el-date-picker size="small" prefix-icon="iconfont icon-purple_calendar" v-model="formData.deliveryTime" type="datetime" placeholder="请选择派送时间" format="yyyy/MM/dd HH:mm" :picker-options="pickerDisabled"  popper-class="date-pick">
              </el-date-picker>
            </el-form-item>

          </div>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirm"> 确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { modifyDeliveryTime } from '@/services/api/waybillOld'
import dayjs from 'dayjs'
export default {
  name: 'UpdateAppointmentTime',
  props: {
    visible: { type: Boolean, required: true },
    ydNo: { type: String, required: true },
    dataInfo: { type: Object, required: true }
  },
  data () {
    var validateDeliveryDate = (rule, value, callback) => {
      let hhDateTime = dayjs(this.formData.hhDate)
      if (
        dayjs().isAfter(
          dayjs(hhDateTime),
          'minute'
        )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
        dayjs(this.formData.hhDate).isAfter(
          dayjs().add(1, 'month'),
          'month'
        )
      ) {
        return callback(
          new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
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
          // { validator: validateDeliveryDate, trigger: "change" }
        ],
      },

      pickerDisabled: {  //验证时间范围
        disabledDate: time => {
          return time.getTime() < Date.now()
        }
      }

    }
  },
  mounted () {
  },
  methods: {
    confirm () {
      this.loading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            waybillNumber: this.ydNo,
            deliveryTime: dayjs(this.formData.deliveryTime).format('YYYY-MM-DD HH:mm:ss'),
            source: '30'
          }
          this.modifyDeliveryTimes(params)
          this.loading = false
        } else {
          this.loading = false
        }
      })
    },
    async modifyDeliveryTimes (params) {
      let res = await modifyDeliveryTime(params)
      if (res && res.code === 0) {
        this.$message.success('修改成功')
        this.dialogVisible = false
      } else {
        // this.$message.error(res.msg)
      }
    }
  },
  watch: {
    visible (val) {
      this.formData.deliveryTime = this.dataInfo.exigencyDate
      if (val) {
        this.dialogVisible = true
      }
    },
    dialogVisible (val) {
      if (!val) {
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
        position: unset;
        .el-textarea__inner {
          padding: 12px;
        }
      }
      .el-form-item__error {
        width: 157px;
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
    .el-button--text{
      display: none;
    }
  }
  
</style>
<style>
.date-pick .el-picker-panel__footer
{
   border-radius: 8px;
   padding-right: 20px;
  
 }
.date-pick .el-picker-panel__footer .el-button--text{
   display: none;
 }
 .date-pick .el-picker-panel__footer .el-button--mini{
    background: #8365f6;
    border-radius: 16px;
    color: #FFF;
    padding: 9px 22px;
 }
.date-pick .el-picker-panel__footer .el-button.is-plain:hover, .el-button.is-plain:focus {
    background: #8365f6;
    border-color: #8365f6;
    color: #FFF;
}
</style>