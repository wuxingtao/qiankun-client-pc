<template>
  <div class='ky-date-picker'>
    <el-date-picker
      :style='{width:width}'
      v-model='startTime'
      v-bind='$attrs'
      @change='changeStart'
      :picker-options='startPickerOptions'
    >
    </el-date-picker>
    <span class='el-range-separator  ky-range-separator'></span>
    <el-date-picker
      :style='{width:width}'
      v-model='endTime'
      v-bind='$attrs'
      @change='changeEnd'
      :picker-options='endPickerOptions'>
    </el-date-picker>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'kyDatePicker',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    width: {
      type: String,
      default: '125px'
    }
  },
  watch: {
    value: {
      handler(n) {
        if (n) {
          let [start, end] = n || []
          this.startTime = start || ''
          this.endTime = end || ''
        }
      },
      immediate: true
    }
  },
  data() {
    const vm = this
    return {
      startTime: '',
      endTime: '',
      startPickerOptions: {
        disabledDate(time) {
          const endTime = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
          if (time.getTime() > new Date(endTime).getTime() || time.getTime() < new Date('2020/01/01').getTime()) {
            return true
          }
          /*     const minDate = dayjs(vm.endTime).add(-2, 'month')
                        const maxDate = dayjs(vm.endTime).format('YYYY-MM-DD HH:mm:ss')
                        return (time.getTime() < minDate && time.getTime() < new Date(endTime).getTime()) || (time.getTime() > maxDate && time.getTime() < new Date(endTime).getTime())
                    */
        },
        // shortcuts: [
        //   {
        //     text: '昨天',
        //     onClick(picker) {
        //       const start = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = start + ' 23:59'
        //       vm.changeData('1')
        //     }
        //   },
        //   {
        //     text: '近7天',
        //     onClick(picker) {
        //       const start = dayjs().add(-7, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('7')
        //     }
        //   },
        //   {
        //     text: '当月',
        //     onClick(picker) {
        //       const isFirstDayOfMonth = dayjs().date() === 1
        //       let start = dayjs().add(isFirstDayOfMonth ? -1 : 0, 'month').startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('2')
        //     }
        //   },
        //   {
        //     text: '近30天',
        //     onClick(picker) {
        //       const start = dayjs().add(-30, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('30')
        //     }
        //   },
        //
        //   {
        //     text: '上月',
        //     onClick(picker) {
        //       let start = dayjs().add(-1, 'month').startOf('month').format('YYYY-MM-DD')
        //       let end = dayjs().add(-1, 'month').endOf('month').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('3')
        //     }
        //   },
        //
        //
        //   {
        //     text: '近90天',
        //     onClick(picker) {
        //       const start = dayjs().add(-90, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('90')
        //     }
        //   },
        //   {
        //     text: '近6个月',
        //     onClick(picker) {
        //       let start = dayjs().add(-5, 'month').startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('180')
        //     }
        //   },
        //   {
        //     text: '近12个月',
        //     onClick(picker) {
        //       let start = dayjs().add(-11, 'month').startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 00: 00')
        //       vm.endTime = end + ' 23:59'
        //       vm.changeData('365')
        //     }
        //   }]
      },
      endPickerOptions: {
        disabledDate(time) {
          const endTime = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
          if (time.getTime() > new Date(endTime).getTime() || time.getTime() < new Date('2020/01/01').getTime()) {
            return true
          }
          /*     const minDate = dayjs(vm.endTime).add(-2, 'month')
                             const maxDate = dayjs(vm.endTime).format('YYYY-MM-DD HH:mm:ss')
                             return (time.getTime() < minDate && time.getTime() < new Date(endTime).getTime()) || (time.getTime() > maxDate && time.getTime() < new Date(endTime).getTime())
                         */
        },
        // shortcuts: [
        //   {
        //     text: '昨天',
        //     onClick(picker) {
        //       const start = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', start + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('1')
        //     }
        //   },
        //   {
        //     text: '近7天',
        //     onClick(picker) {
        //       const start = dayjs().add(-7, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('7')
        //     }
        //   },
        //   {
        //     text: '当月',
        //     onClick(picker) {
        //       let start = dayjs().startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('2')
        //     }
        //   },
        //   {
        //     text: '近30天',
        //     onClick(picker) {
        //       const start = dayjs().add(-30, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('30')
        //     }
        //   },
        //
        //   {
        //     text: '上月',
        //     onClick(picker) {
        //       let start = dayjs().add(-1, 'month').startOf('month').format('YYYY-MM-DD')
        //       let end = dayjs().add(-1, 'month').endOf('month').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('3')
        //     }
        //   },
        //
        //
        //   {
        //     text: '近90天',
        //     onClick(picker) {
        //       const start = dayjs().add(-90, 'd').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('90')
        //     }
        //   },
        //   {
        //     text: '近6个月',
        //     onClick(picker) {
        //       let start = dayjs().add(-5, 'month').startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('180')
        //     }
        //   },
        //   {
        //     text: '近12个月',
        //     onClick(picker) {
        //       let start = dayjs().add(-11, 'month').startOf('month').format('YYYY-MM-DD')
        //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD')
        //       picker.$emit('pick', end + ' 23:59')
        //       vm.startTime = start + ' 00: 00'
        //       vm.changeData('365')
        //     }
        //   }]
      }
    }
  },
  methods: {
    changeData(value) {
      if (this.startTime && this.endTime) {
        let time = [this.startTime, this.endTime]
        this.$emit('input', time)
        this.$emit('change', time)
        this.$emit('changeData', value)
      }
    },
    changeStart(value) {
      let time = [value, this.endTime]
      this.$emit('input', time)
      this.$emit('change', time)
    },
    changeEnd(value) {
      let time = [this.startTime, value]
      this.$emit('input', time)
      this.$emit('change', time)
    }
  }
}
</script>

<style scoped lang='scss'>
.ky-date-picker {
  display: inline-block;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  min-width: 265px;
  height: 35px;
  line-height: 35px;
  
  .ky-range-separator {
    display: inline-block;
    font-size: 0;
    width: 13px;
    height: 13px;
    background: url("../../assets/image/date-arrow.png") no-repeat top left;
    background-size: contain;
  }
  
  ::v-deep .el-input__inner {
    border: none;
    padding-right: 5px;
  }
}
</style>