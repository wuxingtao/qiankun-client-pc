<!-- 货好时间自定义时间 -->
<template>
  <el-form class='delivery-form' :model='formData' :rules='formRules' ref='form'>
    <div v-if='goodsBatchTimes.length>0'>
      <div class='goodsTime'>
        <el-row>
          <el-col :span='12'>
            <el-form-item prop='hhDate'>
              <el-date-picker prefix-icon='none' class='hhDate' v-model='formData.hhDate'
                              type='date' placeholder='选择日期' style='width:130px;'
                              format='yyyy/MM/dd' :picker-options='pickerOptions' @change='goodsBatchTimesInit'>
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span='12'>
            <el-form-item prop='goodsTime'>
              <el-select size='medium' v-model='formData.goodsTime'
                         class='goodsBatchTimes' prefix-icon='iconfont icon-purple_calendar'
                         @change='handleTimeChange'>
                <el-option v-for='item in goodsBatchTimesFilter' :key='item' :label='item' :value='item'>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-else>
      <el-row>
        <el-col :span='12'>
          <el-form-item prop='hhDate'>
            <el-date-picker size='small' v-model='formData.hhDate'
                            type='date' placeholder='选择日期时间' format='yyyy/MM/dd'
                            prefix-icon='none'
                            :picker-options='pickerOptions' @change='goodsBatchTimesInit'>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span='12'>
          <el-form-item prop='goodsTime'>
            <el-time-select v-model='formData.goodsTime'
                            placeholder='选择时间'
                            class='goodsBatchTimes'
                            prefix-icon='iconfont icon-purple_calendar'
                            @change='handleTimeChange'
                            :picker-options='timePickerOptions'>
            </el-time-select>
          </el-form-item>

        </el-col>
      </el-row>
      <!--  是否使用提醒    -->
      <div v-if='showTip' class='warning-tip'>{{ tip }}</div>
      <span slot='error' slot-scope='scope' class='el-form-item__error' v-tip='scope.error'>
                  {{ scope.error }}
                </span>

    </div>
  </el-form>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import { debounce } from 'lodash'

export default {
  name: 'delivery-time',
  props: {
    tip: {
      type: String,
      default: () => ''
    }
    // showGoodsTime:{
    //   type:Boolean,
    //   default: ()=>false
    // }
  },
  data() {
    const validateHhDate = (rule, value, callback) => {
      if (!this.formData.hhDate) {
        return callback(new Error('请选择货好时间'))
      }
      let hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      if (
          dayjs().isAfter(
              dayjs(hhDateTime),
              'minute'
          )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      console.log(dayjs(this.formData.hhDate).format('YYYY-MM-DD'))
      console.log(dayjs().add(1, 'month').format('YYYY-MM-DD'))
      if (
          dayjs(this.formData.hhDate).isAfter(
              dayjs().add(1, 'month'),
              'day'
          )
      ) {
        console.log('is after')
        return callback(
            new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    return {
      formRules: {
        hhDate: [
          // { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDate, trigger: 'blur' }
        ],
        goodsTime: [
          { required: true, message: '请选择时间', trigger: 'change' }
        ]
      },
      formData: {
        hhDate: dayjs().format('YYYY-MM-DD'),
        goodsTime: ''
        // goodsTime: dayjs().add(5, 'minute').format('HH:mm')
      },
      // 过滤过期的批次时间
      goodsBatchTimesFilter: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      timePickerOptions: {
        step: '00:15',
        minTime: '',
        start: '00:00',
        end: '23:45'
      },
      hasInit: false
    }
  },
  computed: {
    ...mapState('waybill', ['goodsBatchTimes']),
    showTip() {
      return this.tip && this.formData.hhDate && this.formData.goodsTime
    }
  },
  deactivated() {
    console.log('deactive')
  },
  beforeDestroy() {
    this.hasInit = false
  },
  methods: {
    init() {
      if (!this.hasInit) {
        this.goodsBatchTimesInit()
        this.hasInit = true
      }
    },
    // 初始化自定义时间
    goodsBatchTimesInit(options = { dateTime: '' }, callback) {
      this.formData.goodsTime = ''
      const currentDate = dayjs().add(5, 'minute')
      const cur_hour = currentDate.$H < 10 ? `0${currentDate.$H}` : currentDate.$H
      const cur_minute = currentDate.$m < 10 ? `0${currentDate.$m}` : currentDate.$m
      const currentDateString = `${cur_hour}:${cur_minute}`
      const hhDateTime = dayjs(this.formData.hhDate).valueOf()

      const ymd = dayjs(currentDate).format('YYYY-MM-DD')
      const maxTodayTime = dayjs(ymd + ' ' + this.goodsBatchTimes[this.goodsBatchTimes.length - 1]).valueOf()
      const CompareDate = (t1, t2) => {
        let date = new Date()
        let a = t1.split(':')
        let b = t2.split(':')
        return date.setHours(a[0], a[1]) < date.setHours(b[0], b[1])
      }

      // 存在批次时间
      if (this.goodsBatchTimes.length > 0) {
        // 日期大于今天
        if (hhDateTime > +currentDate) {
          this.formData.goodsTime = this.goodsBatchTimes[0]
          this.goodsBatchTimesFilter = this.goodsBatchTimes
        } else if (+currentDate > maxTodayTime) {
          // 日期今天
          console.log('大于当天最大时间')
          this.formData.hhDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
          this.formData.goodsTime = this.goodsBatchTimes[0]
          this.goodsBatchTimesFilter = this.goodsBatchTimes
        } else {
          // 过滤批次时间
          this.goodsBatchTimesFilter = this.goodsBatchTimes.filter(item => {
            return CompareDate(currentDateString, item)
          })
          this.formData.goodsTime = this.goodsBatchTimesFilter[0]
        }
      } else {
        // timePickerOptions 时间选择器限制时间
        const minMinutes = [0, 15, 30, 45].find(item => item > currentDate.$m)
        const minHours = !minMinutes ? currentDate.$H + 1 : currentDate.$H

        const isNextDay = dayjs(this.formData.hhDate).valueOf() > dayjs(currentDate).valueOf()
        this.timePickerOptions.start = isNextDay ? '00:00' : `${minHours}:${minMinutes || '00'}`
        // this.timePickerOptions.minTime = isNextDay ? '' : this.timePickerOptions.start
        this.timePickerOptions.minTime = isNextDay ? '' : currentDateString
        if (!this.formData.goodsTime) {
          this.formData.goodsTime = this.timePickerOptions.start
        }
      }
      if (options?.dateTime) {
        this.formData.hhDate = dayjs(options.dateTime).format('YYYY-MM-DD')
        this.formData.goodsTime = dayjs(options.dateTime).format('HH:mm')
      }
      callback && callback()
    },
    handleTimeChange() {
      this.$refs.form.validateField('hhDate')
    },
    async validateForm() {
      let result = false
      try {
        await this.$refs.form.validate()
        result = true
      } catch (e) {
        return false
      }
      return result
    },
    // 触发日期+时间变更
    handleValueChange: debounce(function() {
      if (this.formData.hhDate && this.formData.goodsTime) {
        this.$emit('change', dayjs(dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime).format('YYYY-MM-DD HH:mm:ss'))
      }
    }, 300),
    reset() {
      this.formData.hhDate = ''
      this.formData.goodsTime = '00:00'
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    }
  },
  watch: {
    'formData.hhDate': {
      handler(val) {
        this.$emit('updateField', { key: 'hhDate', val: val })
        this.handleValueChange()
      },
      immediate: true
    },
    'formData.goodsTime': {
      handler(val) {
        this.$emit('updateField', { key: 'goodsTime', val: val })
        this.handleValueChange()
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
.delivery-form {
  .el-row .el-col {
    padding: 0 !important;
  }

  /deep/ {
    .el-date-editor--date {
      .el-input__prefix, .el-input__suffix {
        display: none;
      }
    }
  }

}

.goodsBatchTimes {
  &.el-date-editor, &.el-select--medium {
    /deep/ .el-input__inner {
      height: 32px;
    }

  }
}


/deep/ {
  .el-date-editor.hhDate {
    .el-input__prefix {
      display: none;
    }
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

  .el-icon-circle-close {
    right: 20px;
    position: relative;
  }

  .el-form-item {
    margin-bottom: 0;

    .el-form-item__error {
      white-space: initial !important;
      min-width: 140px;
    }
  }
}

/deep/ .icon-purple_calendar {
  color: #8365f6;
  right: 0;
  position: absolute;
}

.warning-tip {
  background: #ffe6e3;
  border: 1px solid #ff7374;
  border-radius: 4px;
  color: #ff7374;
  font-size: 12px;
  line-height: 1.3;
  padding: 4px;
  position: relative;
  top: 5px;

  &::before {
    content: '';
    border-color: transparent transparent #ffe6e3;
    border-width: 0 6px 6px;
    border-radius: 3px;
    border-style: solid;
    position: absolute;
    top: -5px;
    left: 20px;
    z-index: 12;
  }

  &::after {
    content: '';
    border-color: transparent transparent #ff7374;
    border-width: 0 6px 6px;
    border-radius: 3px;
    border-style: solid;
    position: absolute;
    top: -6px;
    left: 20px;
    z-index: 10;
  }
}
</style>
