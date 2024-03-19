<template>
  <el-drawer
    :title="title"
    size="540px"
    custom-class="delivery-preference-drawer preference-drawer drawer-2022"
    :visible.sync="drawerVisible"
    :append-to-body="true"
    v-loading="loading"
    :before-close="handleBeforeClose"
    ref="drawerRef"
  >
    <header slot="title" class="drawer__header">
      <i class="iconfont icon-arrow-left cursor c_666 pl_10" @click="handleBack"></i>
      <span :title="title" role="heading">{{ title }}</span>
      <el-button
        :class="['btn-submit', { 'is-disabled ': disabledSave }]"
        type="primary"
        size="small"
        style="width: 80px"
        @click="handleSave"
        >保存
      </el-button>
    </header>
    <div class="preference__content mg_20">
      <ky-ui-tip
        v-if="settingData.tips && settingData.tips.length > 0"
        type="warning"
        class="preference__tip"
      >
        <span class="c_333 f_w_b text1" v-if="settingData.tips[0]">{{ settingData.tips[0] }}</span>
        <span class="text2">{{ settingData.tips.slice(1).join('') }}</span>
      </ky-ui-tip>
      <div class="preference__options">
        <delivery-setting-options
          :data="settingData"
          @change="handleOptionsChange"
          ref="preferenceOptionsRef"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  watch,
  computed,
  nextTick,
  watchEffect,
  inject
} from '@vue/composition-api'
import { cloneDeep } from 'lodash'
import { KyUiTip } from '@comps/ky-ui'
import preferenceApi from '@api/preferenceApi'
import deliveryServe from '@views/preference/utils/deliveryServe'
import { preferenceFromEnum } from '@views/preference/preference-waybill/preferenceUtil'

export default defineComponent({
  name: 'preference-waybill-delivery',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    waybillNumber: {
      type: String,
      default: () => ''
    }
  },
  components: {
    KyUiTip,
    'delivery-setting-options': () =>
      import('../preference-delivery/components/delivery-setting/delivery-setting-options')
  },
  setup(props, { root, emit }) {
    const initialState = {
      title: '派送偏好',
      drawerVisible: props.visible,
      loading: false,
      settingData: {
        tips: [],
        options: [],
        noReceiptStartTime: '',
        noReceiptEndTime: ''
      },
      settingDataOnline: {
        tips: [],
        options: [],
        noReceiptStartTime: '',
        noReceiptEndTime: ''
      },
      hitOptions: [], // 上次命中配置
      disabledSave: true // 保存是否置灰
    }
    const state = reactive(cloneDeep(initialState))

    const drawerRef = ref(null)

    const preferenceOptionsRef = ref(null)

    const openTimeDialog = inject('openTimeDialog')
    const freshRoute = inject('freshRoute')

    const h = root.$createElement

    watch(
      () => props.visible,
      val => {
        state.drawerVisible = val
        if (val) {
          handleInfo()
        }
      }
    )

    watch(
      () => state.drawerVisible,
      val => {
        emit('update:visible', val)
      }
    )

    // 运单偏好支持不选中
    function disabledCheck() {
      state.disabledSave = isEqualOldData()
    }

    watchEffect(() => {
      disabledCheck()
    })

    async function handleInfo() {
      let res = await preferenceApi.delivery_preference_waybill(props.waybillNumber)
      if (res.code === 0 && res.data) {
        const dataFormat = {
          ...res.data,
          noReceiptStartTime: res.data.noReceiptStartTime || '',
          noReceiptEndTime: res.data.noReceiptEndTime || '',
          options: res.data.options || []
        }
        state.settingData = dataFormat
        state.settingDataOnline = cloneDeep(dataFormat)
      }
    }

    function handleBack() {
      drawerRef.value.closeDrawer()
    }

    async function handleSave({ deliveryTime, callback } = {}) {
      deliveryServe
        .preference_save_valid(state.settingData, state.settingDataOnline, { leastOne: false })
        .then(async res => {
          if (!res.valid) {
            root.$message.warning(res.msg)
          } else {
            await handleSubmit({ deliveryTime, callback })
          }
        })
    }

    async function handleSubmit({ deliveryTime, callback } = {}) {
      const settingData = state.settingData
      state.loading = true
      try {
        let params = {
          ...settingData,
          waybillNumber: props.waybillNumber,
          finalAging: deliveryTime // 派送时间存在则传
        }

        if (params.options && !params.options.includes(40)) {
          params.noReceiptStartTime = ''
          params.noReceiptEndTime = ''
        }

        delete params.tips

        if (deliveryTime) {
          params.hitOptions = state.hitOptions
        }

        let res = await preferenceApi.delivery_preference_waybill_update(params)
        if (res.code === 0) {
          if (res.data) {
            if (res.data.needUpdateFinalAging === 10) {
              handleDeliveryTimeOpen(res.data.tips, res.data.finalAgingByCalculate)
            } else {
              handleSubmitCallback(res, callback)
            }
            state.hitOptions = res.data.hitOptions
          } else {
            handleSubmitCallback(res, callback)
          }
        } else {
          if (res.data?.outModifyDeliveryTime === 10) {
            root.$alert('本运单派送偏好已修改2次，如需修改，请致电95324', '温馨提醒', {
              confirmButtonText: '确认'
            })
          } else {
            root.$message.error(res.msg || '设置失败')
          }
        }
      } finally {
        state.loading = false
      }
    }

    // 修改派送时间
    function handleDeliveryTimeOpen(tips, finalAgingByCalculate) {
      root.$kye_message
        .$message({
          message: h('div', null, [
            h('span', null, '如需取消'),
            h('span', { style: 'color:#FF8038' }, tips ? `【${tips}】` : ''),
            h('span', null, '，需要重新修改派送时间，是否继续取消？')
          ]),
          title: '温馨提示',
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          customClass: 'message-box__info'
        })
        .then(async () => {
          openTimeDialog({
            finalAgingByCalculate,
            from: preferenceFromEnum.DELIVERY
          })
        })
        .catch(() => {})
        .finally(() => {})
    }

    function handleSubmitCallback(res, callback) {
      root.$message.success('设置成功')
      state.settingDataOnline = cloneDeep(state.settingData)
      nextTick(() => {
        disabledCheck()
      })
      freshRoute && freshRoute()
      callback && callback()
    }

    // 配置更新
    function handleOptionsChange(val) {
      Object.assign(state.settingData, { ...val })
    }

    // 检查是否更新配置
    function isEqualOldData() {
      return deliveryServe.isEqualOldData(state.settingData, state.settingDataOnline)
    }

    function handleBeforeClose(done) {
      const hasChange = !!!isEqualOldData()
      if (hasChange) {
        root.$kye_message
          .$message({
            message: h('div', null, [h('span', {class:'font-regular'}, '您有更改信息，是否要保存？')]),
            type: '',
            title: '修改提醒',
            confirmButtonText: '保存',
            cancelButtonText: '不保存',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            customClass: 'message-box__info'
          })
          .then(async () => {
            await handleSave({
              callback: () => {
                done && done()
                Object.assign(state, cloneDeep(initialState))
              }
            })
          })
          .catch(() => {
            done && done()
            Object.assign(state, cloneDeep(initialState))
          })
          .finally(() => {})
      } else {
        done && done()
      }
    }

    return {
      ...toRefs(state),
      preferenceOptionsRef,
      drawerRef,
      handleInfo,
      handleSave,
      handleBack,
      handleOptionsChange,
      handleSubmit,
      isEqualOldData,
      handleBeforeClose
    }
  }
})
</script>

<style lang="scss" scoped>
.drawer__header {
  display: flex;
  align-items: center;
  span {
    flex: 1;
  }
}

.drawer-title {
  padding: 18px 16px;
}

.preference__content {
}

.preference__tip {
  margin-bottom: 20px;
  display: flex;
  padding: 10px 20px 10px 0;
  /deep/ > span {
    display: flex;
    align-items: flex-start;
    .text1 {
      width: auto;
    }
    .text2 {
      flex: 1;
      padding-top: 1px;
    }
  }
}

.preference__options {
  padding: 24px 20px 4px;
  border: 1px solid #d6d6d6;
  border-radius: 3px;
}
</style>

<style lang="scss">
.delivery-preference-drawer {
  .el-drawer__header{
    padding: 10px 20px 10px 10px !important;
  }
  .el-drawer__close-btn {
    display: none;
  }
}
</style>
