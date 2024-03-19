<template>
  <div class="time-select">
    <div class="time-select__content">
      <div class="time-select__cell">
        <div class="time-select__header">
          <el-input placeholder="开始时间" :value="firstLabel" size="mini" readonly></el-input>
        </div>
        <div class="time-select__body">
          <el-scrollbar class="time-select-spinner" ref="spinnerRef1">
            <li
                class="time-item"
                :class="[{ active: item.hour === hours }]"
                v-for="(item, index) in firstDateList"
                :key="index"
                @click="handleClick('hour', { value: item.hour, valueString: item.hourString })"
            >
              <span>{{ item.hourString }}</span
              ><span>{{ item.minute }}</span>
            </li>
          </el-scrollbar>
        </div>
      </div>
      <div class="time-select__cell tomorrow__cell">
        <div class="time-select__header">
          <el-input placeholder="结束时间" size="mini" :value="secondLabel" readonly></el-input>
        </div>
        <div class="time-select__body">
          <el-scrollbar class="time-select-spinner">
            <li
                class="time-item"
                :class="[{ active: item.hour === hours_second }]"
                v-for="(item, index) in secondDateList"
                :key="index"
            >
              <span>{{ item.hourString }}</span
              ><span>{{ item.minute }}</span>
            </li>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="time-select__footer">
      <el-button size="mini" @click="handleCancel">取消</el-button>
      <el-button type="primary" size="mini" class="btn-submit" :disabled="submitDisabled" @click="handleConfirm">确定</el-button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  watch,
  nextTick,
  ref
} from '@vue/composition-api'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'time-select',
  props: {
    pickerOptions: {
      type: Object,
      default: () => {
        return {
          hourLists: [
            { hourStart: 18, hourEnd: 23 },
            { hourStart: 0, hourEnd: 7 }
          ]
        }
      }
    },
    value: {
      type: Array,
      default: () => ['','']
    },
    popoverShow: {
      type: Boolean,
      default: () => false
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      firstCellValue: '',
      secondCellValue: '',
      oldValue: [...props.value]
    })

    const spinnerRef1 = ref(null)

    const firstDateList = computed(() => {
      let result = []
      props.pickerOptions.hourLists.forEach(item => {
        for (let i = item.hourStart; i <= item.hourEnd; i++) {
          result.push({
            hour: Number(i),
            hourString: i < 10 ? '0' + i : i,
            minute: '00'
          })
        }
      })

      return result
    })

    const secondDateList = computed(() => {
      return [
        {
          hour: 8,
          hourString: '08',
          minute: '00'
        }
      ]
    })

    watch(
        () => props.popoverShow,
        () => {
          state.oldValue = [...props.value]
          openTimeSelect()
        }
    )

    const valueDate = computed(() => {
      return props.value.map(item => {
        let itemArr = item ? item.split(':') : []
        if(itemArr.length){
          return dayjs().hour(itemArr[0]).minute(itemArr[1])
        }else{
          return []
        }
      })
    })

    const hours = computed(() => {
      return valueDate.value[0] && valueDate.value[0].$H
    })

    const hours_second = computed(() => {
      return valueDate.value[1] && valueDate.value[1].$H
    })

    const firstLabel = computed(() => {
      return hours.value || hours.value === 0
          ? `${hours.value < 10 ? '0' + hours.value : hours.value}:00`
          : ''
    })

    const secondLabel = computed(() => {
      return hours_second.value || hours_second.value === 0
          ? `${hours_second.value < 10 ? '0' + hours_second.value : hours_second.value}:00`
          : ''
    })

    const submitDisabled = computed(()=>{
      return !((hours.value || hours.value === 0) && (hours_second.value || hours_second.value === 0))
    })


    function openTimeSelect () {
      if (props.value) {
        nextTick(() => {
          const lists = spinnerRef1.value?.$el.querySelectorAll('li.time-item.active')
          updateViewArea(lists[0])
        })
      }
    }

    function updateViewArea (liElem) {
      if (liElem) {
        const height = liElem.offsetHeight
        liElem.parentNode.parentNode.scrollTop = liElem.offsetTop - height * 3
      }
    }

    function handleClick (type = 'hour', { value, valueString }) {
      emit('change', { type, value, valueString })
      openTimeSelect()
    }

    function handleCancel () {
      const oldValueHour = (state.oldValue[0] && state.oldValue[0].split(':')[0]) || ''
      emit('change', { type: 'hour', value: oldValueHour, valueString: oldValueHour })
      close()
    }

    function handleConfirm () {
      close()
    }

    function close () {
      emit('close')
    }

    return {
      ...toRefs(state),
      spinnerRef1,
      firstDateList,
      secondDateList,
      hours,
      hours_second,
      valueDate,
      firstLabel,
      secondLabel,
      submitDisabled,
      handleClick,
      handleCancel,
      handleConfirm
    }
  }
})
</script>

<style lang="scss" scoped>
.time-select {
  color: #606266;
  line-height: 30px;
  margin: 0;
  //border: 1px solid #e4e7ed;
  //-webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  //box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  //background: #ffffff;
  //border-radius: 4px;

  &__content {
    position: relative;
    text-align: center;
    padding: 0;
    width: 260px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 45px;
      width: 100%;
      height: 1px;
      background-color: #f1f1f5;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 10px;
      width: 100%;
      height: 1px;
      background-color: #f1f1f5;
    }
  }

  &__cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 0;
    padding: 4px 7px 7px;
    width: 50%;
    display: inline-block;

    .time-item {
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      color: #606266;

      &.active {
        color: #303133;
        font-weight: bold;
      }

      &:hover:not(.disabled):not(.active) {
        background: #f5f7fa;
        cursor: pointer;
      }

      span {
        width: 50%;
        display: inline-block;
        font-weight: inherit;
      }
    }

    &:first-child {
      .time-select__header {
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 16px;
          right: -10px;
          width: 4px;
          height: 1px;
          background: #99989e;
        }
      }

      .time-select__body {
        &::after {
          content: '';
          position: absolute;
          right: -9px;
          bottom: 0;
          width: 1px;
          height: 100%;
          background-color: #f1f1f5;
        }
      }
    }
  }

  &__header {
    margin-bottom: 12px;
    padding: 0 4px;

    /deep/ {
      .el-input__inner {
        text-align: center;
      }
    }
  }

  &__body {
    position: relative;
    border-radius: 2px;
    //border: 1px solid #e4e7ed;
  }

  &__wrapper {
    width: 100%;
    white-space: nowrap;
  }

  &-spinner {
    height: 232px;
    padding-top: 8px;
  }

  &__footer {
    text-align: right;
    padding: 0 10px;
  }
}

.time-select__cell {
  /deep/ .el-scrollbar__wrap {
    position: relative;

    &::before {
      content: '';
      height: 96px;
      display: block;
    }

    &::after {
      content: '';
      height: 96px;
      display: block;
    }
  }
}

/deep/ {
  .el-scrollbar__wrap {
    max-height: inherit;
    //padding-bottom: 15px;
  }
}
</style>
