
import DatePicker from './picker/date-picker.js'
import TimeSelect from './picker/time-select.js'
import TimePicker from './picker/time-select.js'

const components = [
  DatePicker,
  TimeSelect,
  TimePicker
]
const install = function(Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}
// module.exports = {
//   DatePicker,
//   TimeSelect,
//   TimePicker
// }
export default {
  DatePicker,
  TimeSelect,
  TimePicker
}
