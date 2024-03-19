import VxeInput from './input'
import './styles/input.scss'

export const Input = Object.assign(VxeInput, {
  install (Vue) {
    Vue.component(VxeInput.name, VxeInput)
  }
})

export default Input