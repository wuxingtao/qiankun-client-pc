import dayjs from 'dayjs'
class ElementUtil{
  /**
   * 获取 DatePicker或DateTimePicker的picker-options属性
   * @param {Date} minDisabledDate 最小可选时间
   * @param {Number} span 可选时间区域大小，配合unit一起使用
   * @param {String} unit 可选时间区域大小的单位，默认为月(day,month)
   * @param {Date} maxDisabledDate 最大可选时间
   * @returns 
   */
  getPickerOptions(minDisabledDate,span,unit='month',maxDisabledDate){
    const pickerOptions= {
      tempSelectedDate: '',
      onPick: ({ maxDate, minDate }) => {
        this.tempSelectedDate = minDate.getTime()
        if (maxDate) {
          this.tempSelectedDate = ''
        }
      },
      disabledDate: (time) => {
        if (minDisabledDate&&dayjs(time).isBefore(dayjs(minDisabledDate),'day')) {
          return true
        }
        if(maxDisabledDate&&time>maxDisabledDate){
          return true
        }
        if (span&&this.tempSelectedDate !== '') {
          const minDate = dayjs(this.tempSelectedDate).add(Number('-'+span), unit)
          const maxDate = dayjs(this.tempSelectedDate).add(span, unit)
          return time.getTime() < minDate || time.getTime() > maxDate
        }
      },
    }
    return pickerOptions
  }
}

export default new ElementUtil()