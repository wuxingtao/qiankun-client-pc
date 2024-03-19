<template>
  <common-contact descText='商务'
                  :title='businessInfoTitle' :real='isRealBusinessPhone'
                  :visible.sync='visible' :waybillNumber='waybillNumber'
                  :realMobile='businessMobile' :virtualMobile='businessVirtualMobile'
                  @update:visible='toggleVisible' @getVirtualMobile='getBusinessVirtualMobile'>
  </common-contact>
</template>

<script>
import commonContact from './common-contact'
import { defineComponent, ref, computed, onMounted, watch, nextTick } from '@vue/composition-api'
import { phoneFlagEnum } from '@/views/waybill/enum/driverInfoEnum'
import waybillApi from '@/services/api/waybill'

export default defineComponent({
  name: 'businessContact',
  props: {
    businessInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    waybillNumber: {
      type: String,
      default: ''
    }
  },
  components: {
    commonContact
  },
  setup(props) {
    const visible = ref(false)
    const businessMobile = ref('')  // 司机真实手机号
    const businessVirtualMobile = ref('') // 司机虚拟手机号
    const businessInfoTitle = computed(() => {
      return (props.businessInfo && props.businessInfo.phoneFlag === phoneFlagEnum.VIRTUAL) ? '获取商务号码' : '真实商务号码'
    })
    const isRealBusinessPhone = computed(() => {
      return props.businessInfo && props.businessInfo.phoneFlag === phoneFlagEnum.REAL
    })
    
    onMounted(() => {
      // nextTick(() => {
      //   console.log(props.businessInfo, 111)
      //   businessMobile.value = (props.businessInfo && props.businessInfo.phoneFlag === phoneFlagEnum.REAL)
      //     ? props.businessInfo.mobile
      //     : ''
      // })
      watch(() => props.businessInfo, () => {
        if (props.businessInfo && props.businessInfo.phoneFlag === phoneFlagEnum.REAL) {
          businessMobile.value = props.businessInfo.mobile
        }
      }, {
        immediate: true,
        deep: true
      })
    })
    // 请求司机虚拟号码
    const getBusinessVirtualMobile = async mobile => {
      const { data } = await waybillApi.getBusinessVirtualMobile(mobile, props.waybillNumber)
      businessVirtualMobile.value = data
    }
    
    const toggleVisible = val => {
      visible.value = val
      if (!val) {
        // 重置virtalMobile修复组件缓存问题
        businessVirtualMobile.value = ''
      }
    }
    
    return {
      visible,
      businessMobile,
      businessVirtualMobile,
      businessInfoTitle,
      isRealBusinessPhone,
      getBusinessVirtualMobile,
      toggleVisible
    }
  }
})
</script>

<style lang='scss' scoped>
.warning {
  width: 100%;
  height: 20px;
  border-radius: 2px;
  box-sizing: border-box;
  margin-bottom: 8px;
  text-align: left;
  
  span {
    padding: 4px 8px;
    background: #ffedd0;
    color: #FF8038;
  }
}
</style>