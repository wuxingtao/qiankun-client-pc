import { watch } from '@vue/composition-api'

export default function({ formData, shareData, emit }) {
  watch(
    () => formData,
    () => {
      emit('update:tempFormData', formData)
    },
    {
      immediate: true,
      deep: true
    }
  )
  watch(
    () => shareData,
    () => {
      emit('update:tempShareData', shareData)
    },
    {
      immediate: true,
      deep: true
    }
  )
}
