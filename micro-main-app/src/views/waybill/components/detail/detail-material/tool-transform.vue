<template>
  <div class="toolbar-transform">
    <template>
      <el-button
        type="text"
        class="toolbar-transform-item"
        v-for="item in tools"
        :key="item.mode"
        @click="onClick(item.mode)">
        <ky-icon :type="item.icon" />
        <span class="toolbar-transform-item-label">{{ item.label }}</span>
      </el-button>
    </template>
    <slot />
  </div>
</template>
<script>
import { KyIcon } from '@comps'
/** 旋转角度 */
const ANGLE = 90
/** 缩放比例 */
const SCALE = 0.2
export default {
  props: { transform: Object, datalist: Array },
  components: { KyIcon },
  data() {
    return {
      tools: [
        {
          mode: 'left',
          label: '左转',
          icon: 'iconturn-left'
        },
        {
          mode: 'right',
          label: '右转',
          icon: 'iconturn-right'
        },
        {
          mode: 'zoom',
          label: '放大',
          icon: 'iconzoom'
        },
        {
          mode: 'reset',
          label: '还原',
          icon: 'iconrestore'
        }
      ]
    }
  },
  methods: {
    onClick(mode) {
      let { scale, rotate } = this.transform
      switch (mode) {
        /** 左转 */
        case 'left':
          rotate -= ANGLE
          break
        /** 右转 */
        case 'right':
          rotate += ANGLE
          break
        /** 放大 */
        case 'zoom':
          if (scale < 2.5) {
            scale += SCALE
          }
          break
        /** 还原 */
        case 'reset':
          scale = 1
          rotate = 0
          break
        default:
          break
      }
      const result = Object.assign({}, this.transform, { scale, rotate })
      this.$emit('change', result)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
