<template>
  <div :class="['single-address-tip__container', limitReason]" v-if="message">
    <div class="img"></div>
    <div class="text" v-html="message"> </div>
    <div :class="['mark',{'can-close':canClose}]">
      <i v-if="canClose" class="el-icon-close" @click="hanleClose" />
      <!-- <span v-else class="restrict">限制下单</span> -->
    </div>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
export default {
  props: {
    _addressRestrictWarningInfo: {
      type: Object
    },
    _addressRestrictErrorInfo: {
      type: Object
    }
  },
  setup(props, { emit }) {
    const message = computed(() => {
      return props._addressRestrictErrorInfo.msg || props._addressRestrictWarningInfo.msg
    })
    const limitReason = computed(() => {
      return (
        props._addressRestrictErrorInfo.limitReason || props._addressRestrictWarningInfo.limitReason
      )
    })
    const canClose = computed(()=>{
      return (
        !props._addressRestrictErrorInfo.msg
      )
    })
    const hanleClose = () => {
      // emit('close')
      emit('update:_addressRestrictWarningInfo', {msg:''})

    }
    return {
      message,
      hanleClose,
      limitReason,
      canClose
    }
  }
}
</script>

<style lang="scss" scoped>
.single-address-tip__container {
  @import '../styles/affect-reason.scss';
  z-index: 2;
  position: absolute;
  // bottom: -29px;
  display: flex;
  line-height: 17px;
  border: 1px solid #ffffff;
  border-radius: 4px;
  max-width: calc(100% - 0px);
  .img {
    flex-shrink: 0;
    width: 26px;
    margin: 0 4px 0 2px;
    background-position: center;
    background-size: contain;       
    background-repeat: no-repeat;
    position: relative;
    &::after{
      position: absolute;
      top: 0;
      left: 0;
      content: '';
      width: 100px;
      height: 100%;
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
  & > .mark {
    margin-left: auto;
    padding-left: 8px;
    display: flex;
    align-items: center;
    &.can-close{
      padding-right: 8px;
    }
    & > .icon-close2 {
      cursor: pointer;
    }
  }
  & > .text {
    padding: 4px 0;
    word-break: break-all;
  }

  @each $item in $reasons {
    $reason: map-get(
      $map: $item,
      $key: reason
    );
    $tooltip-color: map-get(
      $map: $item,
      $key: tooltip-color
    );
    $tooltip-bg: map-get(
      $map: $item,
      $key: tooltip-bg
    );
    $tooltip-bg-color: map-get(
      $map: $item,
      $key: tooltip-bg-color
    );
    &.#{$reason} {
       background-color: #{$tooltip-bg-color};
       color: #{$tooltip-color};
      .img{
        background-image: url('~@/assets/image/delivery/affect-reason/#{$reason}.png');
        &::after{
          background: #{$tooltip-bg};
          z-index: -1;
        }
      }
      
    }
  }
}
</style>