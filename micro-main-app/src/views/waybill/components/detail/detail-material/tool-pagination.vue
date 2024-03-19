<template>
  <div class="toolbar-pagination">
    <div @click="onClick('first')">
      <ky-icon type="iconleft-next-ten" />
    </div>
    <div @click="onClick('prev')">
      <ky-icon type="iconleft-next" />
    </div>
    <div class="toolbar-pagination-unit">
      <el-input class="unit-input" v-model="currentPage" @blur="onBlur" @focus="onFocus"/>
      <span class="unit-diagonal">/</span>
      <span>{{ total }}</span>
    </div>
    <div @click="onClick('next')">
      <ky-icon type="iconright-next" />
    </div>
    <div @click="onClick('last')">
      <ky-icon type="iconright-next-ten" />
    </div>
  </div>
</template>
<script>
import { KyIcon } from '@comps'
export default {
  props: {
    total: Number,
    page: Number
  },
  components: { KyIcon },
  data() {
    return {
      currentPage: this.page
    }
  },
  watch: {
    page() {
      this.currentPage = this.total === 0 ? '' : this.page
    }
  },
  methods: {
    onClick(mode) {
      let page = this.page
      switch (mode) {
        /** 第一页 */
        case 'first':
          page = 1
          break
        /** 上一页 */
        case 'prev':
          if (page > 1) {
            page -= 1
          }
          break
        /** 下一页 */
        case 'next':
          if (page < this.total) {
            page += 1
          }
          break
        /** 最后一页 */
        case 'last':
          page = this.total
          break
        default:
          break
      }
      this.$emit('change', page)
    },
    onBlur() {
      let page = this.currentPage
      if (!page || page > this.total || page < 0 || isNaN(page)) { 
        this.currentPage = this.page
        return
      }
      this.$emit('change', +this.currentPage)
    },
    onFocus() {
      this.currentPage = ''
    }
  }
}
</script>
<style lang="scss" scoped>
@import './style.scss';
</style>
