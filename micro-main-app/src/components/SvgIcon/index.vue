<template>
 <i v-if="iconClass.startsWith('el-icon')" :class="iconClass"></i>
 <div v-else-if="isExternal" :style="styleOfExternalIcon" class="svg-icon svg-icon-external" v-on="$listeners" />
  <svg v-else :class="['svg-icon',className]" aria-hidden="true" v-on="$listeners">
    <use :xlink:href="`#icon-${iconClass}`"></use>
  </svg>
</template>

<script>
import REGULAR from '@utils/regular'

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed:{
    isExternal() {
      return REGULAR.externalLink.test(this.iconClass)
    },
    styleOfExternalIcon() {
      return {
        mask: `url(${this.iconClass}) no-repeat 50% 50%`,
        '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
      }
    }
  }
}
</script>

<style lang="css" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-icon-external {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
</style>