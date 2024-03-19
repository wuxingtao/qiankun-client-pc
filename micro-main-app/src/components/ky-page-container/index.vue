<template>
  <div class='ky-page-container' :class="[styleName,{'page-style1':isFormPage}]" v-bind='$attrs'>
    <div class='page-header-wrapper' v-if='showGoBack || title'>
      <ky-page-header :styleName="styleName" :before-route-path='beforeRoutePath' :before-route-name='beforeRouteName'
                      :before-route-params='beforeRouteParams'
                      :show-go-back='showGoBack' :title='title' @back="$emit('back')">
        <template #right>
          <slot name='header-right' />
        </template>
      </ky-page-header>
    </div>
    <div class="content-wrapper">
       <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ky-page-container',
  props: {
    title: {
      type: String
    },
    showGoBack: {
      type: Boolean,
      default: false
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
    isFormPage: {
      type: Boolean,
      default: false
    },
    styleName:{
      type:String,
    }
  }
}
</script>

<style lang='scss' scoped>
.ky-page-container {
  padding: 0 20px;
  &.new{
    padding: 0;
    .page-header-wrapper{
      background-color: #f5f7fb;
      padding-bottom: 8px;
    }
    .content-wrapper{
      padding: 20px;
    }
  }
  /deep/ {
    .el-input.show-word-limit {
      input {
        padding-right: 58px !important;
      }
    }
  }
}
</style>
