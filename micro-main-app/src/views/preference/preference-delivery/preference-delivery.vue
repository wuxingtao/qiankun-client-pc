<template>
  <div class="page__container" v-loading="loading">
    <div :class="['tab__wrapper', !showCompanyPreference && 'single_tab']">
      <el-tabs v-model="activeTabName" :class="['preference-tabs', 'ky-tabs']" :before-leave="handleBeforeLeave">
        <el-tab-pane label="个人派送偏好" name="setting-person"></el-tab-pane>
        <el-tab-pane label="公司派送偏好" name="setting-company" v-if="showCompanyPreference">
        </el-tab-pane>
      </el-tabs>
      <setting-wrapper :tabName="activeTabName" :data="activeTabName === 'setting-person' ? personSetting : companySetting" ref="asyncRef" v-if="activeTabName" v-show="!disjunctor_off"></setting-wrapper>
      <none-data class="preference-empty" v-show="disjunctor_off && !loading && !initLoading">
        <div class="text_center">
          <div class="mb_20">{{ `您还没有设置${activeTabTitle}偏好哦，快来设置吧～` }}</div>
          <el-button size="medium" type="primary" @click="tab_setting_start">去设置</el-button>
        </div>
      </none-data>
      <!--      <keep-alive>-->
      <!--        <component-->
      <!--          :is="activeTabName"-->
      <!--          :data="activeTabName === 'setting-person' ? personSetting : companySetting"-->
      <!--          ref="asyncRef"-->
      <!--        ></component>-->
      <!--      </keep-alive>-->
    </div>
    <ky-text-image-popup ref='kyTextImagePopupRef' />
    <ky-activity-popup ref='kyActivityPopupRef' />
  </div>
</template>

<script>
import {
  reactive,
  toRefs,
  ref,
  computed,
  provide,
  onActivated,
} from '@vue/composition-api'
import settingWrapper from './setting-wrapper'
import noneData from '@/components/none-data'
import preferenceApi from '@api/preferenceApi'
import messagePopup from '@/components/ky-message-popup/message-popup.js'

export default {
  name: 'Preference',
  props: {},
  mixins: [messagePopup],
  components: {
    'setting-person': () => import('./setting-person'),
    'setting-company': () => import('./setting-company'),
    settingWrapper,
    noneData,
  },
  setup (props, { root }) {
    const state = reactive({
      activeTabName: '',
      personSetting: {
        disjunctor: 20, // <	10：开，20：关>
        options: [],
        noReceiptStartTime: '',
        noReceiptEndTime: ''
      },
      companySetting: {
        disjunctor: 20,
        options: [],
        noReceiptStartTime: '',
        noReceiptEndTime: ''
      },
      userExternalType: 3, // <1-主管理员 2-副管理员 3-普通用户>
      loading: false,
      initLoading: false, // 是否初始化loading
      activeTabTitle: computed(() => {
        return state.activeTabName === 'setting-person' ? '个人派送偏好' : '公司派送偏好'
      }),
      disjunctor_off: computed(() => {
        const settingCurrent =
            state.activeTabName === 'setting-person' ? state.personSetting : state.companySetting
        return Number(settingCurrent.disjunctor) !== 10
      })
    })

    const asyncRef = ref(null)

    provide('get_preference', get_preference)
    provide('update_preference', update_preference)

    onActivated(async () => {
      state.initLoading = true
      try {
        await getUserExternalType()
        await tabInt()
      } finally {
        state.initLoading = false
      }
    })

    // TODO 配置主副管理员显示
    const showCompanyPreference = computed(() => {
      return state.userExternalType === 1 || state.userExternalType === 2
    })

    async function get_preference (type) {
      state.loading = true
      try {
        let res = await preferenceApi.delivery_preference_get(type)
        if (res.code === 0 && res.data) {
          switch (type) {
            case 10:
              state.personSetting = {
                ...res.data,
                noReceiptStartTime: res.data.noReceiptStartTime || '',
                noReceiptEndTime: res.data.noReceiptEndTime || '',
                options: res.data.options || []
              }
              break
            case 20:
              state.companySetting = {
                ...res.data,
                noReceiptStartTime: res.data.noReceiptStartTime || '',
                noReceiptEndTime: res.data.noReceiptEndTime || '',
                options: res.data.options || []
              }
              break
          }
        }
      } finally {
        state.loading = false
      }
    }

    async function update_preference ({ params, callback, successTip = '设置成功' }) {
      try {
        state.loading = true
        if (params.options && !params.options.includes(40)) {
          params.noReceiptStartTime = ''
          params.noReceiptEndTime = ''
        }
        if (params.options.includes(40) && (!params.noReceiptStartTime || !params.noReceiptEndTime)) {
          params.options.splice(params.options.findIndex(item => item === 40))
        }
        if (!params.type) {
          params.type = state.activeTabName === 'setting-person' ? 10 : 20
        }
        let res = await preferenceApi.delivery_preference_update(params)
        if (res.code === 0) {
          root.$message.success(successTip)
        } else {
          root.$message.error(res.msg || '设置失败，请重新保存')
        }
        callback && callback(res)
      } catch (e) {
        callback && callback()
      } finally {
        state.loading = false
      }
    }

    function tab_before_close_callback () {
      return asyncRef.value?.tab_before_close()
    }

    function tab_setting_start () {
      return asyncRef.value?.handleEdit()
    }

    async function getUserExternalType () {
      let res = await preferenceApi.getUserExternalType()
      if (res.code === 0 && res.data) {
        state.userExternalType = res.data
      }
    }

    // 初始化tab展示
    async function tabInt () {
      await get_preference(10)
      if (!showCompanyPreference.value) {
        state.activeTabName = 'setting-person'
        return
      } else {
        await get_preference(20)
      }
      switch (state.personSetting.disjunctor) {
        case 10:
          state.activeTabName = 'setting-person'
          break
        case 20:
          // 个人设置为空，公司设置存在显示公司设置
          state.activeTabName = state.companySetting.disjunctor === 10 ? 'setting-company' : 'setting-person'
          break
        default:
          state.activeTabName = 'setting-person'
          break
      }
    }

    async function handleBeforeLeave (activeName, oldActiveName) {
      return tab_before_close_callback()
    }

    return {
      ...toRefs(state),
      asyncRef,
      showCompanyPreference,
      tab_setting_start,
      handleBeforeLeave,
    }
  },
  mounted () {
    this.handlePopup('pcPreference-delivery')
  }
}
</script>

<style lang="scss" scoped>
  @import 'delivery.scss';
</style>
