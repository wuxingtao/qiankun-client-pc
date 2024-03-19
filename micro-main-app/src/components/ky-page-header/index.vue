<template>
  <div class='ky-page-header' :class="[styleName]" v-bind='$attrs'>
    <slot name='back'>
      <div v-if='showGoBack' class='ky-page-header__back' @click='goBack'>
        <svg-icon icon-class='icon-return' class='icon-back' />
        {{ backText }}
      </div>
    </slot>
    <slot>
      <div class='ky-page-header__title' @click='goBack'> {{ title }}</div>
    </slot>
    <div class='ky-page-header__right'>
      <slot name='right'></slot>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'

export default {
  name: 'ky-page-header',
  props: {
    title: {
      type: String,
      required: true
    },
    showGoBack: {
      type: Boolean,
      default: false
    },
    backText: {
      type: String
    },
    beforeRoutePath: {
      type: String
    },
    beforeRouteName: {
      type: String
    },
    beforeRouteParams: {
      type: Object,
      default: () => {
        return {}
      }
    },
    styleName:{
      type:String,
    }
  },
  methods: {
    goBack() {
      this.$emit('back')
      if (!this.beforeRoutePath && !this.beforeRouteName) {
        // this.$router.go(-1)
        return
      }
      if (!isEmpty(this.beforeRouteParams) && this.beforeRouteName) {
        this.$router.push({
          name: this.beforeRouteName,
          params: this.beforeRouteParams
        })
      } else {
        this.$router.push(this.beforeRoutePath)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.ky-page-header {
  display: flex;
  align-items: center;
  height: 40px;
  // padding: 17px 0;
  border-bottom: 1px solid #f1f1f5;
  &.new{
    background-color: #fff;
    border-bottom:none;
    padding: 0 20px;
    border-radius: 0 0 4px 4px;
  }
  &__back {
    padding-right: 9px;
    cursor: pointer;

    .icon-back {
      font-size: $--tab-font-size;
    }
  }

  &__title {
    font-weight: bold;
    color: $--color-text-primary;
    font-size: $--tab-font-size;
    cursor: pointer;
  }

  &__right {
    margin-left: auto;
  }
}
</style>
