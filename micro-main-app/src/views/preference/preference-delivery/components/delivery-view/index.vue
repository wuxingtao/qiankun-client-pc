<template>
  <div class="delivery-view">
    <div class="delivery-view__title">
      <img src="@assets/image/preference/delivery-view-title.png" alt="" />
    </div>
    <div class="delivery-view__content">
      <ul>
        <li v-for="item in viewOptions" :key="item.key">
          <i class="iconfont iconpreference-check"></i>
          <span>{{ item.label }}</span>
          <span class="time-range-text" v-if="item.key === 40 && timeRangeText">{{
            timeRangeText
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch } from '@vue/composition-api'
import { preference_options_object } from '@views/preference/enum/preferenceEnum'

export default defineComponent({
  name: 'delivery-view',
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
  setup(props) {
    const state = reactive({
      viewOptions: updateOptions(),
      timeRangeText: computed(() => {
        const { noReceiptStartTime, noReceiptEndTime } = props.data
        if (noReceiptStartTime && noReceiptEndTime) {
          const startHour = props.data.noReceiptStartTime?.split(':')[0]
          let separatorDay = Number(startHour) <= 8 ? '当日' : '次日'
          return `当日${noReceiptStartTime}~${separatorDay}${noReceiptEndTime}`
        } else {
          return ''
        }
      })
    })

    watch(
      () => props.data.options,
      val => {
        state.viewOptions = updateOptions()
      },
      { immediate: true }
    )

    function updateOptions() {
      let result = []
      const dataArr = [...props.data?.options].sort()
      dataArr.forEach(item => {
        if (preference_options_object[item]) {
          result.push(preference_options_object[item])
        }
      })
      return result
    }

    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
.delivery-view {
  width: 600px;
  background: #ffffff;
  border: 1px solid #d6d6d6;
  border-radius: 3px;
  &__title {
    img {
      max-width: 100%;
    }
  }
  &__content {
    padding: 3px 30px 28px 30px;
    li {
      width: 50%;
      display: inline-block;
      margin-top: 25px;
      i {
        margin-right: 12px;
        color: #aeaeae;
      }
      span {
        color: #333333;
        font-weight: 500;
      }
    }
    .time-range-text {
      font-size: 12px;
      font-weight: 400;
      color: #8f8fa8;
      margin-left: 8px;
    }
  }
}
</style>
