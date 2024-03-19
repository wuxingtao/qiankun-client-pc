<template>
  <common-contact descText='司机'
                  :title='driverInfoTitle' :real='isRealDriverPhone'
                  :visible.sync='visible' :waybillNumber='waybillNumber'
                  :realMobile='driverMobile'
                  :virtualMobile='driverVirtualMobile'
                  @update:visible='toggleVisible'
                  @getVirtualMobile='getDriverVirtualMobile'>
    <div class='warning'>
      <span>司机正在驾驶中，请谨慎拨打</span>
    </div>
  </common-contact>
</template>

<script>
import commonContact from './common-contact'
import { defineComponent, ref, computed, onMounted, watch } from '@vue/composition-api'
import { phoneFlagEnum } from '@/views/waybill/enum/driverInfoEnum'
import waybillApi from '@/services/api/waybill'

export default defineComponent({
  name: 'driverContact',
  props: {
    driverInfo: {
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
    const driverMobile = ref('')  // 司机真实手机号
    const driverVirtualMobile = ref('') // 司机虚拟手机号
    const driverInfoTitle = computed(() => {
      return (props.driverInfo && props.driverInfo.phoneFlag === phoneFlagEnum.VIRTUAL) ? '获取司机号码' : '真实司机号码'
    })
    const isRealDriverPhone = computed(() => {
      return props.driverInfo && props.driverInfo.phoneFlag === phoneFlagEnum.REAL
    })
    onMounted(() => {
      watch(() => props.driverInfo, () => {
        if (props.driverInfo && props.driverInfo.mobile) {
          driverMobile.value = props.driverInfo.mobile || ''
        }
      }, {
        immediate: true,
        deep: true
      })
    })
    // 请求司机虚拟号码
    const getDriverVirtualMobile = async mobile => {
      const { data } = await waybillApi.getDriverVirtualMobile(mobile, props.waybillNumber)
      driverVirtualMobile.value = data
    }
    
    const toggleVisible = val => {
      visible.value = val
      if (!val) {
        // 重置virtalMobile修复组件缓存问题
        driverVirtualMobile.value = ''
      }
    }
    
    return {
      visible,
      driverMobile,
      driverVirtualMobile,
      driverInfoTitle,
      isRealDriverPhone,
      getDriverVirtualMobile,
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