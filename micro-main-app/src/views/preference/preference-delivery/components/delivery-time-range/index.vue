<template>
  <div class="delivery-time-range page-style1">
    <el-popover
      trigger="click"
      popper-class="time-select-popover"
      @show="timeShow"
      @hide="timeHide"
      :visible-arrow="false"
      v-model="popoverShow"
      ref="popoverRef"
    >
      <time-select
        :popoverShow="popoverShow"
        v-model="timeValue"
        @change="handleChange"
        @close="handleClose"
      ></time-select>
      <el-input
        slot="reference"
        type="text"
        placeholder="请选择"
        class="time-input"
        :value="timeFormat"
        @clear="handleClear"
      >
        <i slot="suffix" class="el-input__icon el-icon-date"></i>
      </el-input>
    </el-popover>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, computed, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'delivery-time-range',
  props: {
    timeArr: {
      type: Array,
      default: () => []
    }
  },
  components: {
    'time-select': () => import('../time-select')
  },
  setup(props, { emit }) {
    const state = reactive({
      timeValue: props.timeArr || [],
      popoverShow: false,
      endHourString: '08:00'
      // timeFormat: ''
    })

    const pickerRef = ref(null)
    const popoverRef = ref(null)

    const timeFormat = computed(() => {
      if (!state.timeValue.length || !state.timeValue[0]) {
        return ''
      }
      const separator = state.timeValue[0].split(':')[0] <= 8 ? '-' : '-次日'
      return state.timeValue.join(separator)
    })

    watch(
      () => props.timeArr,
      val => {
        if (!(val[0] === state.timeValue[0] && val[1] === state.timeValue[1])) {
          state.timeValue = val
        }
      }
    )

    watch(
      () => state.timeValue,
      () => {
        emit('change', state.timeValue)
      }
    )

    function timeShow() {
      state.popoverShow = true
    }

    function timeHide() {
      state.popoverShow = false
      emit('change', state.timeValue)
    }

    function handleChange({ type, value, valueString }) {
      state.timeValue = valueString ? [valueString + ':00', state.endHourString] : ['', '']
    }

    function handleClose() {
      popoverRef.value.showPopper = false
    }

    function handleClear() {
      state.timeValue = []
    }

    function getValues() {
      return state.timeValue
    }

    return {
      ...toRefs(state),
      timeFormat,
      pickerRef,
      popoverRef,
      timeShow,
      timeHide,
      handleClose,
      handleChange,
      handleClear,
      getValues
    }
  }
})
</script>

<style lang="scss" scoped>
.time-input {
  /deep/ {
    .el-input__inner {
      &:focus,
      &:active {
        & + .el-input__suffix {
          color: #8365f6;
        }
      }
    }
    .el-input__suffix {
      right: -5px;
    }
  }
}
</style>
<style>
.time-select-popover {
  padding: 6px 0;
}
</style>
