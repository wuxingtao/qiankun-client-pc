<template>
  <div class="setting-wrapper">
    <!--    <delivery-setting-->
    <!--      :data="data"-->
    <!--      title="派送偏好"-->
    <!--      :type="type"-->
    <!--      @onConfirm="handleConfirm"-->
    <!--      ref="settingRef"-->
    <!--    ></delivery-setting>-->
    <div>
      <delivery-view :data="data" v-show="data.disjunctor === 10"></delivery-view>
      <div class="btn-group">
        <el-button type="plain" size="medium" @click="handleDelete">删除设置</el-button>
        <el-button type="primary" size="medium" :class="['btn-submit']" @click="handleEdit"
          >编辑
        </el-button>
      </div>
    </div>
    <preference-delivery-drawer
      :visible.sync="deliveryVisible"
      :data="data"
      :tabType="type"
      @onConfirm="handleConfirm"
      ref="preferenceDeliveryRef"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  onActivated,
  inject,
  watch
} from '@vue/composition-api'
import deliveryView from './components/delivery-view'
import PreferenceDeliveryDrawer from '@views/preference/preference-delivery/preference-delivery-drawer.vue'

export default defineComponent({
  name: 'setting-wrapper',
  props: {
    // <setting-person,setting-company>
    tabName: {
      type: String,
      default: () => 'setting-person'
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
    }
  },
  components: {
    deliveryView,
    PreferenceDeliveryDrawer,
    'delivery-setting': () => import('./components/delivery-setting')
  },
  setup(props, { root }) {
    const state = reactive({
      deliveryVisible: false,
      // 配置类型
      type: computed(() => {
        let result
        switch (props.tabName) {
          case 'setting-person':
            result = 10
            break
          case 'setting-company':
            result = 20
            break
          default:
            result = 10
            break
        }
        return result
      })
    })
    const get_preference = inject('get_preference')
    const update_preference = inject('update_preference')
    const settingRef = ref(null)

    onActivated(() => {
      handleSetting()
    })

    watch(
      () => props.tabName,
      () => {
        if(props.tabName){
          handleSetting()
        }
      }
    )

    function handleSetting() {
      get_preference(state.type)
    }

    function handleConfirm({ params, successTip, callback }) {
      update_preference({
        params,
        successTip,
        callback: res => {
          callback && callback(res)
          handleSetting()
        }
      })
    }

    // tab切换保存检测
    function tab_before_close() {
      return settingRef.value?.tab_before_close()
    }

    // 触发编辑配置
    function handleEdit() {
      state.deliveryVisible = true
    }
    function handleDelete() {
      root.$kye_message
        .warnConfirm(`确定删除${state.type === 20 ? '公司' : '个人'}派送偏好设置吗？`, {
          title: '删除提示',
          closeOnClickModal: false,
          closeOnPressEscape: false
        })
        .then(() => {
          handleConfirm({
            params: {
              ...props.data,
              disjunctor: 20,
              type: state.type
            },
            successTip: '删除成功'
          })
        })
        .catch(() => {})
        .finally(() => {})
    }

    return {
      ...toRefs(state),
      settingRef,
      handleConfirm,
      tab_before_close,
      handleEdit,
      handleDelete
    }
  }
})
</script>

<style lang="scss" scoped>
.btn-group {
  margin-top: 46px;
  .btn-submit {
    width: 86px;
  }
}
</style>
