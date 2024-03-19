<!--老版本 弃用-->
<template>
  <div class="setting-wrapper">
    <delivery-setting
      :data="data"
      title="个人派送偏好"
      :type="type"
      @onConfirm="handleConfirm"
      ref="settingRef"
    ></delivery-setting>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onActivated, inject } from '@vue/composition-api'

export default defineComponent({
  name: 'setting-person',
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          disjunctor: 20, // <	10：开，20：关>
          options: [],
          noReceiptStartTime: '',
          noReceiptEndTime: ''
        }
      }
    }
  },
  components: {
    'delivery-setting': () => import('./components/delivery-setting')
  },
  setup() {
    const state = reactive({
      type: 10
    })
    const get_preference = inject('get_preference')
    const update_preference = inject('update_preference')
    const settingRef = ref(null)

    onActivated(() => {
      get_preference(state.type)
    })

    function handleConfirm({ params, callback, successTip }) {
      update_preference({ params, callback, successTip })
    }

    function tab_before_close() {
      return settingRef.value.tab_before_close()
    }

    return { ...toRefs(state), settingRef, handleConfirm, tab_before_close }
  }
})
</script>

<style scoped></style>
