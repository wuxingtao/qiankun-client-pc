<template>
  <div class="migration-title">
    <ky-icon type="icon-info"/>
    <div class="migration-title-text">您存在以下{{ count }}条待完善的运单，修改校验通过后会同步到待通知取货列表</div>
  </div>
</template>
<script>
import { KyIcon } from '@comps'
export default {
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  components: { KyIcon }
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>