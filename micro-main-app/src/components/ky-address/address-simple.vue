<template>
  <address-cascader :labelList="districtList" @valueChange="districtChange" :disabled="disabled"
                    :fetch-suggestions="getSuggestDistrictsByKeyword" ref="cascaderRef" :placeholder="placeholder" />
</template>

<script>
import { defineComponent, nextTick, reactive, ref, toRefs, watch,onUnmounted } from '@vue/composition-api'
import useAddress from '@comps/ky-address/hooks/useAddress'
import AddressCascader from './address-cascader'
import { debounce } from 'lodash'

export default defineComponent({
  name: 'address-simple',
  props: {
    labelList: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    AddressCascader
  },
  setup (props, { emit }) {
    const formData = reactive({
      districtList: []
    })

    const errorMsgOfdistrict = ref('')

    const { getSuggestDistrictsByKeyword } = useAddress()

    onUnmounted(()=>{
      formData.districtList = []
    })

    watch(() => props.labelList, d => {
      nextTick(() => {
        formData.districtList = d || []
        if (d?.length > 0) {
          validateForm()
        }
      })
    }, { immediate: false, deep: true })

    watch(()=>formData.districtList,val=>{
      valueChange()
    },{ immediate: false})

    const valueChange = debounce(async function () {
      const valid = await validateForm()

      emit('change', { labelList: formData.districtList,valid, validError: errorMsgOfdistrict.value})
    }, 500)

    //省市区变更
    function districtChange (selectedOptions) {
      formData.districtList = selectedOptions.map(o => o.label)
      valueChange()
    }

    // 省市区验证
    function validateForm () {
      let valid = false
      errorMsgOfdistrict.value = ''
      if (!formData.districtList || formData.districtList.filter(d => d).length < 1) {
        errorMsgOfdistrict.value = '省市区不能为空'
        emit('validate',{ valid, validError: errorMsgOfdistrict.value})
        return valid
      } else if (formData.districtList.filter(d => d).length < 2) {
        errorMsgOfdistrict.value = '省市区至少要包含省市二级'
        emit('validate',{ valid, validError: errorMsgOfdistrict.value})
        return valid
      }
      valid = true
      emit('validate',{ valid, validError: errorMsgOfdistrict.value})
      return valid
    }

    function clearInput(){
      formData.districtList = []
    }

    return { ...toRefs(formData), getSuggestDistrictsByKeyword, districtChange,validateForm,clearInput }
  }
})
</script>

<style scoped></style>
