import store from '@/store'

export default {
  inserted(el, binding) {
    const authorityIds=store.getters.authorityIds 
    const hasPermission=authorityIds.includes(binding.value)
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}