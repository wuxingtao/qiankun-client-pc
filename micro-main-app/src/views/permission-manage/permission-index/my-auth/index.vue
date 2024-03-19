<template>
  <div class="permission-container-self">
    <router-back :title="title" :has-border="false" />
    <div class="page__content pt_16">
      <ky-ui-tip type="plain" class="c_03050d mb_16 ptb_0--strict">如有疑问，请联系商务</ky-ui-tip>
      <auth-view :data="data" :hideExclusive="false"></auth-view>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance
} from '@vue/composition-api'
import useUam from '../../hooks/useUam'
import { KyUiTip } from '@comps/ky-ui'

export default defineComponent({
  name: 'my-auth',
  props: {},
  components: {
    'router-back': () => import('@views/permission-manage/components/router-back.vue'),
    'auth-view': () => import('@views/permission-manage/components/auth-view.vue'),
    KyUiTip
  },
  setup(props, { root }) {
    const state = reactive({
      title: '我的权限',
      data: []
    })

    const { uam_auth_edit } = useUam()

    onMounted(() => {
      getAuth()
    })

    async function getAuth() {
      const vm = getCurrentInstance()
      console.log(vm.proxy.$route.name)
      state.data = await uam_auth_edit(1)

      // if (vm.proxy.$route?.query.id) {
      // }
    }

    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
.permission-container-self {
  background-color: #f5f7fb;
  height: 100%;
}

.page__content {
  height: calc(100% - 90px);
  overflow-y: auto;
  padding: 20px;
  margin-top: 4px;
  background-color: #ffffff;
  border-radius: 4px;
  //border-bottom-left-radius: 4px;
  //border-bottom-right-radius: 4px;
}
</style>
