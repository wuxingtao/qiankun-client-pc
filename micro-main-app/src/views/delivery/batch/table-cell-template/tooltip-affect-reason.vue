<template>
  <el-tooltip
    :popper-class="`tooltip-affect-reason-${reasonName}__container`"
    placement="bottom-start"
    :open-delay="300"
    effect="light"
  >
    <div slot="content" :class="['reason-content', reasonName]">
      <!-- <div class="img"></div> -->
      <slot name="tip-msg">{{ tipMsg }}</slot>
    </div>
    <div :class="['tooltip-affect-reason-label__wrapper', tipType, reasonName]">
      <span>{{ reasonText }}</span>
    </div>
  </el-tooltip>
</template>

<script>
import { computed } from '@vue/composition-api'
import deliveryUtil from '@/utils/deliveryUtil'

export default {
  name: 'tooltipAffectReason',
  props: {
    tipType: { type: String }, // 限制类型：warning、error
    tipMsg: { type: String }, // 提示内容
    reasonCode: { type: [Number, String] } // 限制原因编码
  },
  setup(props) {
    const reasonName = computed(() => {
      return deliveryUtil.convetLimitReason(props.reasonCode)
    })

    const reasonText = computed(() => {
      return deliveryUtil.convetLimitReason(props.reasonCode, 'text', props.tipType === 'error')
    })

    return {
      reasonText,
      reasonName
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/affect-reason.scss';
.el-tooltip__popper.is-light[class*="tooltip-affect-reason-"]{
  padding: 4px 12px ;
}

@each $item in $reasons {
  $reason: map-get(
    $map: $item,
    $key: reason
  );
  $arrow-color: map-get(
    $map: $item,
    $key: arrow-color
  );
  .tooltip-affect-reason-label__wrapper.#{$reason} {
    background: #{$arrow-color};
    &::after{
      background-image: url('~@/assets/image/delivery/affect-reason/#{$reason}.png');
    }
  }
}
</style>

<style lang="scss" scoped>
.tooltip-affect-reason-label__wrapper {
  height: 20px;
  line-height: 20px;
  display: inline-flex;
  padding-left: 18px;
  margin-left: 12px;
  border-radius: 4px;
  color: white;
 
  background-size: 22px 22px;
  position: relative;
  &::after{
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    width: 22px;
    height: 100%;
     background-repeat: no-repeat;
     background-size: contain;
  }
  & > span {
    max-width: 72px;
    padding: 0 3px;
    border-radius: 4px;
    border-bottom-left-radius: 0;
    font-size: $--font-size-small;
    white-space: break-spaces;
    @include overflow-ellipsis;
  }
  &.error > span {
    background: #ff7374;
  }
  &.warning span {
    background: $--color-warning;
  }
}
</style>