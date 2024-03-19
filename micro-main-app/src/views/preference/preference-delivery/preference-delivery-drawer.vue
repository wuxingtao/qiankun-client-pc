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
      <i class="iconfont icon-arrow-left cursor c_666 pl_10 mr_16" @click="handleBack"></i>
      <span :title="title" role="heading" class="back-title c_03050d">{{ title }}</span>
    </header>
    <div class="preference__content mg_20">
      <div class="preference__options">
        <delivery-setting-options
          :data="settingData"
          @change="handleOptionsChange"
          ref="preferenceOptionsRef"
        />
      </div>
      <ul class="preference__desc">
        <li v-if="tabType === 10">个人派送偏好设置成功后将会以个人设置为准</li>
        <li>该设置不应用于生鲜类运单</li>
      </ul>
    </div>
    <div class="preference__footer">
      <el-button
        :class="['btn-submit', { 'is-disabled ': disabledSave }]"
        type="primary"
        size="medium"
        style="width: 86px"
        @click="handleSave"
        >保存
      </el-button>
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
  name: 'preference-delivery-drawer',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
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
    },
    // <10:个人，20:公司>
    tabType: {
      type: Number,
      default: () => 10
    }
  },
  components: {
    KyUiTip,
    'delivery-setting-options': () =>
      import('../preference-delivery/components/delivery-setting/delivery-setting-options')
  },
  setup(props, { root, emit }) {
    const initialState = {
      drawerVisible: props.visible,
      loading: false,
      settingData: {
        disjunctor: 10, // <	10：开，20：关>
        options: [...props.data.options],
        noReceiptStartTime: props.data.noReceiptStartTime,
        noReceiptEndTime: props.data.noReceiptEndTime
      },
      settingDataOnline: {
        disjunctor: props.data.disjunctor, // <	10：开，20：关>
        options: [...props.data.options],
        noReceiptStartTime: props.data.noReceiptStartTime,
        noReceiptEndTime: props.data.noReceiptEndTime
      },
      disabledSave: true // 保存是否置灰
    }
    const state = reactive(cloneDeep(initialState))

    const computedState = reactive({
      title: computed(() => {
        return `编辑${props.tabType === 20 ? '公司' : '个人'}派送偏好`
      })
    })

    const drawerRef = ref(null)

    const preferenceOptionsRef = ref(null)

    const h = root.$createElement

    watch(
      () => props.visible,
      val => {
        state.drawerVisible = val
        if (val) {
          initSettingData()
        }
      }
    )

    watch(
      () => state.drawerVisible,
      val => {
        emit('update:visible', val)
      }
    )

    watch(
      () => props.data,
      val => {
        state.checked = props.data.disjunctor === 10
        Object.assign(state.settingData, {
          disjunctor: 10, // 开关一定为开
          options: [...props.data?.options],
          noReceiptStartTime: props.data?.noReceiptStartTime || '',
          noReceiptEndTime: props.data?.noReceiptEndTime || ''
        })
        Object.assign(state.settingDataOnline, {
          disjunctor: props.data.disjunctor,
          options: [...props.data?.options],
          noReceiptStartTime: props.data?.noReceiptStartTime || '',
          noReceiptEndTime: props.data?.noReceiptEndTime || ''
        })
      },
      { deep: true }
    )

    function initSettingData() {
      state.checked = props.data.disjunctor === 10
      Object.assign(state.settingData, {
        disjunctor: 10, // 开关一定为开
        options: [...props.data?.options],
        noReceiptStartTime: props.data?.noReceiptStartTime || '',
        noReceiptEndTime: props.data?.noReceiptEndTime || ''
      })
      Object.assign(state.settingDataOnline, {
        disjunctor: props.data.disjunctor,
        options: [...props.data?.options],
        noReceiptStartTime: props.data?.noReceiptStartTime || '',
        noReceiptEndTime: props.data?.noReceiptEndTime || ''
      })
    }

    // 运单偏好支持不选中
    function disabledCheck() {
      state.disabledSave = state.settingData.options.length === 0
      // state.disabledSave = state.settingData.options.length === 0 || isEqualOldData()
    }

    watchEffect(() => {
      disabledCheck()
    })

    function handleBack() {
      drawerRef.value.closeDrawer()
    }

    async function handleSave({ callback } = {}) {
      deliveryServe
        .preference_save_valid(state.settingData, state.settingDataOnline, {
          disabledSave: false,
          leastOne: true
        })
        .then(async res => {
          if (!res.valid) {
            root.$message.warning(res.msg)
          } else {
            await handleSubmit({ callback })
          }
        })
    }

    async function handleSubmit(options = { callback: null }) {
      state.loading = true
      const params = {
        ...state.settingData,
        disjunctor: 10 // 设置即为开启配置
      }
      emit('onConfirm', {
        params,
        callback: res => {
          handleSubmitCallback()
          options.callback && options.callback(true)
          state.loading = false
          if (res && res.code === 0) {
            handleClose()
          }
        }
      })
    }

    function handleSubmitCallback(res, callback) {
      state.settingDataOnline = cloneDeep(state.settingData)
      nextTick(() => {
        disabledCheck()
      })
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
      // 无选中直接返回
      if (state.settingData.options.length === 0) {
        done()
        return
      }
      const hasChange = !!!isEqualOldData()
      if (hasChange) {
        root.$kye_message
          .$message({
            message: h('div', null, [
              h('span', { class: 'font-regular' }, '您有更改信息，是否要保存？')
            ]),
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

    function handleClose() {
      state.drawerVisible = false
      Object.assign(state, cloneDeep(initialState))
    }

    return {
      ...toRefs(state),
      ...toRefs(computedState),
      preferenceOptionsRef,
      drawerRef,
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
  .back-title {
    font-size: 14px;
    font-weight: 500;
  }
}

.drawer-title {
  padding: 18px 16px;
}

.preference__content {
}

.preference__footer {
  margin: 24px 20px;
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
.preference__desc {
  color: #8f8fa8;
  padding: 12px 0 20px;
  list-style: none;
  li {
    position: relative;
    padding-left: 10px;
    margin-bottom: 6px;
    &:last-child {
      margin-bottom: 0;
    }
    &::before {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      top: 0;
      bottom: 0;
      left: 0;
      margin: auto;
      border-radius: 100%;
      background-color: #8f8fa8;
    }
  }
}
</style>

<style lang="scss">
.delivery-preference-drawer {
  .el-drawer__header {
    padding: 18px 20px 18px 10px !important;
    margin-bottom: 0;
    border-bottom: 1px solid #f1f1f5;
    background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
    box-shadow: 0px 1px 0px 0px #ffffff inset;
  }
  .el-drawer__close-btn {
    display: none;
  }
}
</style>
