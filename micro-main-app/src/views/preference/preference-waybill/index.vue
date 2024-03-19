<template>
  <el-drawer
    title="偏好设置"
    size="540px"
    custom-class="preference-list-drawer preference-drawer drawer-2022"
    :visible.sync="drawerVisible"
  >
    <!--  配置列表  -->
    <ul class="preference-lists">
      <li
        class="preference-item"
        @click="itemVisible('deliveryVisible')"
        v-if="preferenceAble('delivery')"
      >
        <span class="pt_4"><i class="iconfont iconpreference_company fs_20--strict"></i></span>
        <span class="preference-item__title">派送偏好</span
        ><i class="el-icon-arrow-right fs_16 c_666 f_w_b"></i>
      </li>
    </ul>
    <preference-waybill-delivery
      :visible.sync="deliveryVisible"
      :waybillNumber="waybillNumber"
      ref="preferenceDeliveryRef"
    />
  </el-drawer>
</template>

<script>
import { defineComponent, reactive, toRefs, watch, ref } from '@vue/composition-api'
import { preferenceFromEnum } from '@/views/preference/preference-waybill/preferenceUtil'
import preferenceApi from '@api/preferenceApi'

export default defineComponent({
  name: 'preference-waybill',
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
    'preference-waybill-delivery': () => import('./preference-waybill-delivery')
  },
  setup(props, { emit, root }) {
    const state = reactive({
      drawerVisible: props.visible,
      preferenceData: {}
    })

    // 配置列
    const liState = reactive({
      deliveryVisible: false
    })

    const preferenceDeliveryRef = ref(null)

    watch(
      () => props.visible,
      val => {
        state.drawerVisible = val
      }
    )

    watch(
      () => state.drawerVisible,
      (val, oldVal) => {
        emit('update:visible', val)
        if(val){
          getPreferenceSetting()
        }
      }
    )

    // 获取偏好设置信息
    async function getPreferenceSetting() {
      let res = await preferenceApi.getPreferenceSetting({ waybillNumber: props.waybillNumber })
      if (res.code === 0 && res.data) {
        state.preferenceData = res.data || {}
      } else {
        // 兜底数据
        state.preferenceData = {
          deliveryTips: '当前无法设置',
          preferences: []
        }
      }
    }

    function itemVisible(key) {
      if (liState.hasOwnProperty(key)) {
        let result = false
        switch (key) {
          case 'deliveryVisible':
            if (state.preferenceData.deliveryTips) {
              root.$alert(state.preferenceData.deliveryTips, '温馨提醒')
              return
            } else {
              result = true
            }
            break
          default:
            result = true
            break
        }
        liState[key] = result
      }
    }

    function preferenceAble(type) {
      switch (type) {
        case 'delivery':
          return state.preferenceData?.preferences?.includes(20)
        default:
          break
      }
    }

    /**
     * 保存偏好设置
     * @param type
     * @param params
     */
    function savePreference(type, params = {}) {
      console.log(type)
      switch (type) {
        case preferenceFromEnum.DELIVERY:
          preferenceDeliveryRef.value.handleSubmit(params)
          break
        default:
          break
      }
    }

    return {
      ...toRefs(state),
      ...toRefs(liState),
      preferenceDeliveryRef,
      itemVisible,
      savePreference,
      preferenceAble
    }
  }
})
</script>

<style lang="scss" scoped>
$fontColor: #03050d;
/deep/ {
  .preference-drawer.drawer-2022 {
    .el-drawer__header {
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      box-shadow: 0px 1px 0px 0px #ffffff inset;
      border-bottom: 1px solid #f1f1f5;
      color: $fontColor;
      padding: 16px 20px 16px 10px;
      margin-bottom: 0;
      font-size: 14px;
      font-weight: bold;

      span {
        &[role='heading'] {
          padding-left: 10px;
          font-weight: bold;
        }
      }
    }
    .el-drawer__close-btn {
      color: #666666;
      font-size: 16px;
      .el-dialog__close{
        font-weight: bold;
      }
    }
  }

  .preference-list-drawer {
    .el-drawer__header {
      flex-direction: row-reverse;
    }
  }
}

.preference-lists {
  margin: 24px 20px;
}

.preference-item {
  padding: 28px 20px 28px 30px;
  color: $fontColor;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 4px;
  background: url('~@assets/image/preference/preference-bg1.png') no-repeat top center;
  background-size: cover;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    margin-left: 20px;
    font-size: 16px;
    width: 100%;
  }
}
</style>
