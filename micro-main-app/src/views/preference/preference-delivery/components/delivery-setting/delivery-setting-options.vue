<template>
  <div class="setting-content-options">
    <el-checkbox-group v-model="options" @change="handleCheckChange">
      <li :class="['setting-option-item']" v-for="item in receiveOptions" :key="item.key">
        <template v-if="item.key === 40">
          <div class="setting-time-group flex flex_ai_c">
            <el-checkbox :label="item.key" @change="handleTimeCheck">{{ item.label }}</el-checkbox>
            <delivery-time-range
              class="ml_10"
              :timeArr="timeArr"
              @change="handleTimeChange"
              ref="timeRef"
            />
          </div>
        </template>
        <el-checkbox :label="item.key" v-else>{{ item.label }}</el-checkbox>
      </li>
      <li :class="['setting-option-item']">
        <el-checkbox :label="receiveAll.key" @change="handleCheckedYear"
          >{{ receiveAll.label }}
        </el-checkbox>
      </li>
    </el-checkbox-group>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  watch,
  computed,
  nextTick
} from '@vue/composition-api'

const receiveOptions = [
  { key: 10, label: '周六不收货' },
  { key: 20, label: '周日不收货' },
  { key: 30, label: '法定节假日不收货' },
  { key: 40, label: '每天不收货时间段' }
]
const receiveAll = { key: 50, label: '全年都收货' }

export default defineComponent({
  name: 'delivery-setting-options',
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          tips: [],
          disjunctor: 20, // <	10：开，20：关>
          options: [],
          noReceiptStartTime: '',
          noReceiptEndTime: ''
        }
      }
    }
  },
  components: {
    'delivery-time-range': () => import('../delivery-time-range')
  },
  setup(props, { emit }) {
    const constState = reactive({
      receiveOptions: receiveOptions,
      receiveAll: receiveAll
    })
    const state = reactive({
      // checked: props.data?.disjunctor === 10,
      options: props.data?.options,
      noReceiptStartTime: props.data?.noReceiptStartTime,
      noReceiptEndTime: props.data?.noReceiptEndTime
    })

    const timeArr = computed(() => {
      return [state.noReceiptStartTime, state.noReceiptEndTime]
    })

    const timeRef = ref(null)

    watch(
      () => props.data,
      val => {
        updateState(val)
      },
      { deep: true }
    )

    watch(
      [() => state.options, () => state.noReceiptStartTime, () => state.noReceiptStartTime],
      val => {
        emit('change', { ...state })
      }
    )

    function updateState(data = {}) {
      Object.assign(state, {
        options: data?.options,
        noReceiptStartTime: data?.noReceiptStartTime,
        noReceiptEndTime: data?.noReceiptEndTime
      })
    }

    function handleCheckedYear(val) {
      if (val) {
        state.options = [constState.receiveAll.key]
        timeClear()
      }
    }

    function handleCheckChange(val) {
      if (val.includes(constState.receiveAll.key) && val.length > 1) {
        let result = [...val]
        const allIndex = result.indexOf(constState.receiveAll.key)
        if (allIndex >= 0) {
          result.splice(allIndex, 1)
          nextTick(() => {
            state.options = result
          })
        }
      }
    }
    /**
     * 切换不收货时间段
     * @param val {Boolean}
     */
    function handleTimeCheck(val) {
      if (val) {
        ;(!state.noReceiptStartTime || !state.noReceiptEndTime) && timeRef.value[0].timeShow()
      } else {
        timeClear()
      }
    }

    // 清空不收货时间段
    function timeClear() {
      state.noReceiptStartTime = ''
      state.noReceiptEndTime = ''
    }

    function handleTimeChange(val = []) {
      const start = val[0]
      const end = val[1]
      // 不收货时间段反选
      if (!start || !end) {
        const timeIndex = state.options.indexOf(40)
        if (timeIndex !== -1) {
          state.options.splice(timeIndex, 1)
        }
      }

      if (start && end) {
        if (!state.options.includes(40)) {
          state.options.push(40)
        }
      }
      nextTick(() => {
        state.noReceiptStartTime = start
        state.noReceiptEndTime = end
      })
    }

    function getValue() {
      const timeValues = timeRef.value[0].getValues()
      return {
        options: state.options,
        noReceiptStartTime: timeValues[0],
        noReceiptEndTime: timeValues[1]
      }
    }

    return {
      ...toRefs(constState),
      ...toRefs(state),
      timeArr,
      timeRef,
      handleCheckedYear,
      handleCheckChange,
      handleTimeCheck,
      handleTimeChange,
      getValue
    }
  }
})
</script>

<style lang="scss" scoped>
.setting-content-options {
  .setting-option-item {
    margin-bottom: 18px;

    &:first-child {
      //margin-top: 25px;
    }
  }

  .el-checkbox-group {
    //border-top: 1px solid #e3e3ea;
  }

  .setting-time-group {
    padding-bottom: 24px;
    border-bottom: 1px dashed #e3e3ea;
  }
}
</style>
