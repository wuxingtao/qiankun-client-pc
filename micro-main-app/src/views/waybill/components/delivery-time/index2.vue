<template>
  <el-form class="delivery-form" ref="form">
    <el-form-item prop="goodTime" :error="errorInfo">
      <ky-input
          v-model="goodTime"
          placeholder="日期和时间选择"
          type="datetime"
          className="delivery-input"
          :close-when-date-change="false"
          :min-date="minDate"
          :max-date="maxDate"
          :goodsBatchTimes="goodsBatchTimesFilter"
          :valueFormat="valueFormat"
          :labelFormat="valueFormat"
          :editable="false"
          :disabled-method="disabledMethod"
          @change="changeDate"
          @dateHourChange="dateHourChange"
          @blur="handleBlur"
          :transfer="isTransfer"
          :hour-array="hourArray"
          :minute-array="minuteArray"
          ref="inputRef"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import KyInput from '@/components/ky-input'
import {
  reactive,
  toRefs,
  computed,
  watch,
  nextTick,
  ref,
  onMounted,
  onUnmounted
} from '@vue/composition-api'
import dayjs from 'dayjs'
import useTimeHook from '@views/waybill/components/delivery-time/useTimeHook'
import { debounce } from '@utils'

export default {
  components: {
    KyInput
  },
  props: {
    tip: {
      type: String,
      default: () => ''
    }
  },
  setup (props, { root, emit }) {
    const { hourFilter, minuteFilter, fullMinuteArray, fullHourArray } = useTimeHook()

    const state = reactive({
      valueFormat: 'yyyy-MM-dd HH:mm',
      goodTime: dayjs().format('YYYY-MM-DD HH:mm'),
      minDate: dayjs().format('YYYY-MM-DD'),
      maxDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
      hourArray: fullHourArray,
      minuteArray: fullMinuteArray,
      // 过滤过期的批次时间
      goodsBatchTimesFilter: [],
      dateString: {
        DateString: dayjs().format('YYYY-MM-DD'), // 年月日
        HourMinuteString: '' // 时分 00:00
      },
      hasInit: false,
      errorInfo: '', // 错误验证
      formData: {
        goodTime: ''
      },
      formRules: {
        goodTime: [{ validator: validateHhDate, trigger: 'blur' }]
      },
      pageResize: {
        ratio: 2,
        height: 0
      },
      hasMounted: false
    })

    onMounted(() => {
      goodsBatchTimesInit()
      // handleResize()
      // window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      // window.removeEventListener('resize', handleResize)
    })

    const inputRef = ref(null)
    const form = ref(null)

    const goodsBatchTimes = computed(() => {
      return root.$store.state.waybill.goodsBatchTimes
    })

    const showTip = computed(() => {
      return props.tip && state.goodTime
    })

    const isTransfer = computed(() => {
      return false
      // return state.pageResize.ratio <= 2 && state.pageResize.height > 690
    })

    watch(
        () => state.goodTime,
        val => {
          emit('updateField', { key: 'customDate', val })
        },
        { immediate: true }
    )

    watch(
        () => showTip.value,
        val => {
          if (val) {
            state.errorInfo = props.tip
          } else {
            validateHhDate()
          }
        }
    )

    const handleResize = debounce(() => {
      state.hasMounted = false
      Object.assign(state.pageResize, {
        ratio: window.devicePixelRatio,
        height: document.documentElement.clientHeight
      })
      nextTick(() => {
        state.hasMounted = true
      })
    }, 100)

    const validateHhDate = (rule, value, call) => {
      if (!state.goodTime || state.goodTime === 'Invalid Date') {
        state.errorInfo = '请选择货好时间'
        return
      }
      let hhDateTime = state.goodTime
      if (dayjs().isAfter(dayjs(hhDateTime), 'minute')) {
        state.errorInfo = '货好时间不得小于当前时间，请重新选择'
        return
      }

      if (dayjs(state.goodTime).isAfter(dayjs().add(1, 'month'), 'day')) {
        state.errorInfo = '货好时间不能超过当前时间一个月，请重新选择'
        return
      }
      state.errorInfo = ''
    }

    const disabledMethod = ({ date, viewType }) => {
      const currentToday = dayjs(dayjs().format('YYYY-MM-DD 00:00:00'))
      return (
          dayjs(date).isBefore(currentToday) ||
          dayjs(date).isAfter(currentToday.add(1, 'month'))
      )
    }

    function init () {
      if (!state.hasInit) {
        goodsBatchTimesInit()
        state.hasInit = true
      }
    }

    /**
     *  初始化自定义时间
     * @param options dateTime: 'YYYY-MM-DD HH:mm'
     * @param callback
     */
    function goodsBatchTimesInit (options = { dateTime: '', delay: 0 }, callback) {
      const currentDate = dayjs().add(5, 'minute')
      const cur_hour = currentDate.$H < 10 ? `0${currentDate.$H}` : currentDate.$H
      const cur_minute = currentDate.$m < 10 ? `0${currentDate.$m}` : currentDate.$m
      const currentDateString = `${cur_hour}:${cur_minute}`
      const ymd = dayjs(currentDate).format('YYYY-MM-DD')
      // 当前选中值,优先取传入dateTime
      const defaultGoodTime = options.dateTime || state.goodTime
      const goodsDate = dayjs(defaultGoodTime)
      const goodsDateFormat = dayjs(defaultGoodTime).format('YYYY-MM-DD')
      const goodsBatchTimesValue = goodsBatchTimes.value
      // 存在批次时间
      if (goodsBatchTimesValue?.length > 0) {
        const maxTodayTime = dayjs(
            ymd + ' ' + goodsBatchTimesValue[goodsBatchTimesValue.length - 1]
        ).valueOf()
        const CompareDate = (t1, t2) => {
          let date = new Date()
          let a = t1.split(':')
          let b = t2.split(':')
          return date.setHours(a[0], a[1]) < date.setHours(b[0], b[1])
        }
        // 日期大于今天
        if (dayjs(goodsDateFormat).valueOf() > +currentDate) {
          state.dateString.HourMinuteString = goodsBatchTimesValue[0]
          state.goodsBatchTimesFilter = goodsBatchTimesValue
        } else if (+currentDate > maxTodayTime) {
          // 日期今天
          console.log('大于当天最大时间')
          state.dateString.DateString = dayjs().add(1, 'day').format('YYYY-MM-DD')
          state.dateString.HourMinuteString = goodsBatchTimesValue[0]
          state.goodsBatchTimesFilter = goodsBatchTimesValue
        } else {
          // 过滤批次时间
          state.goodsBatchTimesFilter = goodsBatchTimesValue.filter(item => {
            return CompareDate(currentDateString, item)
          })
          state.dateString.HourMinuteString = state.goodsBatchTimesFilter[0]
        }
        if (options.delay) {
          setTimeout(() => {
            state.goodTime = dayjs(
                `${state.dateString.DateString} ${state.dateString.HourMinuteString}`
            ).format('YYYY-MM-DD HH:mm')
            validateHhDate()
          }, options.delay)
        } else {
          state.goodTime = dayjs(
              `${state.dateString.DateString} ${state.dateString.HourMinuteString}`
          ).format('YYYY-MM-DD HH:mm')
        }
      } else {
        const minMinutes = fullMinuteArray.find(item => item > currentDate.$m) || 0
        const minHours = !minMinutes ? currentDate.$H + 1 : currentDate.$H
        const isNextDay = dayjs(goodsDateFormat).valueOf() > dayjs(currentDate).valueOf()
        if (isNextDay) {
          state.hourArray = hourFilter(0)
          state.minuteArray = minuteFilter(0)
        } else {
          state.hourArray = hourFilter(minHours)
          if (goodsDate.$H <= minHours) {
            state.minuteArray = minuteFilter(minMinutes)
          }
        }
        const startTime = isNextDay ? '00:00' : `${minHours}:${minMinutes || '00'}`
        const minTime = isNextDay ? '' : currentDateString

        state.goodTime = dayjs(`${ymd} ${startTime}`).format('YYYY-MM-DD HH:mm')
      }

      nextTick(() => {
        if (options?.dateTime) {
          state.goodTime = dayjs(options.dateTime).format('YYYY-MM-DD HH:mm')
          const dateFormat = dayjs(state.goodTime)
          if (inputRef.value) {
            inputRef.value.inputValue = state.goodTime
            inputRef.value.datetimePanelValue?.setMinutes(dateFormat.$m)
            inputRef.value.datePanelValue = new Date(state.goodTime)
            inputRef.value.datetimePanelValue = new Date(state.goodTime)
          }
        }
        callback && callback()
      })
    }

    function changeDate ({ $event, value }) {
      const valueDate = dayjs(value)
      const currentDate = dayjs().add(5, 'minute')
      let dateResult = valueDate
      if (goodsBatchTimes.value?.length === 0 && valueDate.valueOf() < currentDate.valueOf()) {
        const minMinutes = fullMinuteArray.find(item => item > currentDate.$m)
        const minHours = !minMinutes ? currentDate.$H + 1 : currentDate.$H
        const ymd = dayjs(currentDate).format('YYYY-MM-DD')
        dateResult = dayjs(`${ymd} ${minHours}:${minMinutes || '00'}`).format('YYYY-MM-DD HH:mm')
        goodsBatchTimesInit({ dateTime: dateResult })
      }

      if (goodsBatchTimes.value?.length > 0 && valueDate.valueOf() < currentDate.valueOf()) {
        goodsBatchTimesInit({ delay: 100 })
      } else {
        goodsBatchTimesInit({ dateTime: dateResult })
      }

      nextTick(() => {
        validateHhDate()
        emit('change', getGoodTimeFormat())
      })
    }

    function getGoodTimeFormat () {
      return dayjs(state.goodTime).format('YYYY-MM-DD HH:mm:ss') || ''
    }

    // 小时区域切换
    function dateHourChange (val) {
      const currentDate = dayjs().add(5, 'minute')
      const cur_h = currentDate.$H
      const cur_m = currentDate.$m
      const selectDate = dayjs(dayjs(state.goodTime).format('YYYY-MM-DD'))
      if (selectDate.valueOf() > currentDate.valueOf()) {
        state.minuteArray = fullMinuteArray
        return
      }
      if (val > cur_h) {
        state.minuteArray = fullMinuteArray
      }
      if (val === cur_h) {
        const minMinutes = fullMinuteArray.find(item => item > currentDate.$m)
        state.minuteArray = minuteFilter(minMinutes)
      }
      if (val < cur_h) {
        state.minuteArray = []
      }
    }

    function handleBlur () {
      validateHhDate()
    }

    function validateForm () {
      validateHhDate()
      return new Promise((resolve, reject) => {
        if (state.errorInfo) {
          reject(false)
        } else {
          resolve(true)
        }
      })
    }

    function reset () {
      form.value.resetFields()
      state.goodTime = ''
      state.hasInit = false
      nextTick(() => {
        state.errorInfo = ''
      })
    }

    return {
      ...toRefs(state),
      goodsBatchTimes,
      showTip,
      inputRef,
      form,
      isTransfer,
      disabledMethod,
      init,
      goodsBatchTimesInit,
      changeDate,
      dateHourChange,
      validateHhDate,
      handleBlur,
      validateForm,
      reset
    }
  }
}
</script>
<style lang="scss" scoped>
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
<style lang="scss">
.delivery-form {
  .vxe-input--date-picker-icon {
    top: 16px !important;
  }

  .vxe-input {
    height: 32px;
  }

  // transfer:false
  .delivery-input {
    .vxe-input--panel {
      width: 384px !important;
    }
  }

  .vxe-input--panel-bottom-wrapper {
    box-shadow: 0px 3px 6px 2px rgba(0, 0, 0, 0.1);
  }

  .vxe-input--time-picker-confirm {
    line-height: 1;
  }
}

.delivery-time__popper {
  .el-picker-panel__sidebar {
    right: 0;
  }

  .el-picker-panel__sidebar + .el-picker-panel__body {
    margin-left: unset;
    margin-right: 110px;
  }
}

.vxe-input-batch-list {
  width: 58px !important;
  text-align: center;

  li {
    padding-left: 0 !important;
  }
}

.delivery-input {
  .vxe-input--time-picker-hour-list,
  .vxe-input--time-picker-minute-list {
    padding-bottom: 18px !important;
  }
}

.vxe-input--panel.type--datetime .vxe-input--panel-left-wrapper .vxe-input--date-picker-body table td.is--hover > div, .vxe-input--panel.type--datetime .vxe-input--panel-left-wrapper .vxe-input--date-picker-body table td.is--selected > div, .vxe-input--panel.type--datetime .vxe-input--panel-left-wrapper .vxe-input--date-picker-body table td.is--now > div {
  border-radius: 4px;
}
</style>
