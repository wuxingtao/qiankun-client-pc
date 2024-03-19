<template>
  <div :class="['router-back fs_16 f_w_800', hasBorder && 'has-border']">
    <a class="cursor" @click="routerTo">
      <svg-icon icon-class="icon-return" class-name="icon-return mr_8" />
      <span class="f_w_700">{{ title }}</span>
    </a>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'router-back',
  props: {
    title: {
      type: String,
      default: () => ''
    },
    hasBorder: {
      type: Boolean,
      default: () => true
    },
    routerParam: {
      type: Object,
      default: () => {}
    },
    triggerFun: {
      type: Function,
      default: () => {}
    }
  },
  setup(props, { root }) {
    const state = reactive({})

    async function routerTo() {
      if (props.triggerFun) {
        await props.triggerFun()
      }
      // 权限管理tab选中
      const permission_tab_active = root.$store.state.permission.permission_tab_active
      // 路由参数
      const params = Object.assign({}, props.routerParam, { activeTabName: permission_tab_active })
      await this.$router.push({ name: 'permission-manage', params })
    }
    return { ...toRefs(state), routerTo }
  }
})
</script>

<style lang="scss" scoped>
.router-back {
  padding: 10px 16px;
  //margin: 0 16px;
  background-color: #ffffff;
  position: relative;
  border-radius: 4px;

  &.has-border::after {
    content: '';
    margin-left: 16px;
    width: calc(100% - 32px);
    height: 1px;
    background-color: #f1f1f5;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  a {
    color: rgba(51, 51, 51, 0.93);
    font-weight: 800;
  }
}
</style>
