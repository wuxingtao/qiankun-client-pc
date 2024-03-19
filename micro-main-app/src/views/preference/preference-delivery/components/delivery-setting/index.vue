<template>
  <div class="setting-content">
    <div class="setting-content-set">
      <div class="setting-content-header">
        <div class="setting-content-left pl_24">
          <i
            :class="[
              'iconfont fs_20--strict',
              type === 10 ? 'iconpreference' : 'iconpreference_company'
            ]"
          ></i>
          <div class="setting-content-text pl_16">
            <p class="setting-content-text-16">
              <span class="text-color-primary f_w_b">{{ title }}</span>
              <el-popover
                content="开启后，将以个人设置为准"
                trigger="click"
                popper-class="default-popover preference-person-tip"
                v-if="type === 10"
              >
                <i slot="reference" class="iconfont iconcoupon-issue"></i>
              </el-popover>
            </p>
          </div>
        </div>
        <div class="setting-content-switch">
          <el-switch v-model="checked" :width="50" inactive-color="#C1C7CF" @change="switchChange">
          </el-switch>
        </div>
      </div>
      <div class="setting-content-body" v-show="checked">
        <delivery-setting-option
          :data="settingData"
          @change="handleOptionsChange"
          ref="preferenceOptionsRef"
        ></delivery-setting-option>
      </div>
    </div>
    <el-button
      v-show="checked"
      type="primary"
      size="small"
      :class="['btn-submit', { 'is-disabled ': disabledSave }]"
      @click="handleSave"
      >提交
    </el-button>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  watchEffect,
  ref,
  nextTick
} from '@vue/composition-api'
import deliveryServe from '@views/preference/utils/deliveryServe'
import { cloneDeep } from 'lodash'

export default defineComponent({
  name: 'delivery-setting',
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
    },
    title: {
      type: String,
      default: () => ''
    },
    // <10 个人, 20 公司>
    type: {
      type: Number,
      default: () => 10
    }
  },
  components: {
    'delivery-setting-option': () => import('./delivery-setting-options')
  },
  setup(props, { root, emit }) {
    const state = reactive({
      checked: props.data.disjunctor === 10,
      settingData: {
        options: [...props.data.options],
        noReceiptStartTime: props.data.noReceiptStartTime,
        noReceiptEndTime: props.data.noReceiptEndTime
      },
      settingDataOnline: {
        options: [...props.data.options],
        noReceiptStartTime: props.data.noReceiptStartTime,
        noReceiptEndTime: props.data.noReceiptEndTime
      },
      disabledSave: true, // 保存是否置灰
      ableSaveStrict: false // 强制不置灰
    })

    const preferenceOptionsRef = ref(null)

    watch(
      () => props.data,
      val => {
        state.checked = props.data.disjunctor === 10
        Object.assign(state.settingData, {
          options: [...props.data?.options],
          noReceiptStartTime: props.data?.noReceiptStartTime,
          noReceiptEndTime: props.data?.noReceiptEndTime
        })
        Object.assign(state.settingDataOnline, {
          options: [...props.data?.options],
          noReceiptStartTime: props.data?.noReceiptStartTime,
          noReceiptEndTime: props.data?.noReceiptEndTime
        })
      },
      { deep: true }
    )

    function disabledCheck() {
      state.disabledSave =
        state.settingData.options.length === 0 || (!state.ableSaveStrict && isEqualOldData())
    }

    watchEffect(() => {
      disabledCheck()
    })

    // 检查是否更新配置
    function isEqualOldData() {
      return deliveryServe.isEqualOldData(state.settingData, state.settingDataOnline)
    }

    /**
     * 提交前验证
     * @param options <callback 切换tab回调>
     */
    function handleSave(options = { callback: null }) {
      deliveryServe
        .preference_save_valid(state.settingData, state.settingDataOnline, {
          disabledSave: state.disabledSave
        })
        .then(res => {
          if (!res.valid) {
            root.$message.warning(res.msg)
            options.callback && options.callback(false)
          } else {
            handleSubmit({
              callback: options.callback
            })
          }
        })
    }

    function handleSubmit(options = { successTip: '设置成功', callback: null }) {
      const params = {
        type: props.type,
        disjunctor: state.checked ? 10 : 20,
        options: [...state.settingData.options],
        noReceiptStartTime: state.settingData.noReceiptStartTime,
        noReceiptEndTime: state.settingData.noReceiptEndTime
      }
      emit('onConfirm', {
        params,
        successTip: options.successTip,
        callback: () => {
          handleSubmitCallback()
          options.callback && options.callback(true)
        }
      })
    }

    function handleSubmitCallback(res) {
      state.settingDataOnline = cloneDeep(state.settingData)
      state.ableSaveStrict = false
      nextTick(() => {
        disabledCheck()
      })
    }

    // 配置更新
    function handleOptionsChange(val) {
      Object.assign(state.settingData, { ...val })
    }

    function switchChange(val) {
      if (val) {
        if (state.settingData.options?.length > 0) {
          state.ableSaveStrict = true
        }
        // handleSubmit({successTip: '设置成功'})
      } else {
        handleSubmit()
      }
    }

    const h = root.$createElement

    function tab_before_close() {
      return new Promise((resolve, reject) => {
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
                callback: valid => {
                  if (valid) {
                    resolve(true)
                  } else {
                    reject(false)
                  }
                }
              })
            })
            .finally(() => {
              resolve(true)
            })
        } else {
          resolve(true)
        }
      })
    }

    return {
      ...toRefs(state),
      preferenceOptionsRef,
      handleOptionsChange,
      switchChange,
      handleSubmit,
      handleSave,
      tab_before_close
    }
  }
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
<style lang="scss">
.preference-person-tip {
  color: #03050d;
  padding-top: 9px;
  padding-bottom: 9px;
}
</style>
