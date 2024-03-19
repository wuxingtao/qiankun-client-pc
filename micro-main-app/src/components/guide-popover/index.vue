<template>
  <el-popover
    v-if='showPopover'
    trigger='manual'
    popper-class='guide-popover'
    v-model='visible'
    visible-arrow='true'
    :placement='placement'
    :popper-options='popperOptions'
    :disabled='disabled'
    @after-leave='leave'
  >
    <div class='content'>
      <div class='header'></div>
      <span>{{ content }}</span>
      <i class='iconfont icon-btn-icon' @click='toggleVisible'></i>
    </div>
    <slot slot='reference'></slot>
  </el-popover>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script>
import guide from '@views/waybill/utils/guide'

export default {
  name: 'GuidePopover',
  props: {
    placement: {
      type: String,
      default: 'top-start'
    },
    content: {
      type: String,
      default: ''
    },
    storageKey: {
      type: String,
      required: true
    },
    popperOptions: {
      type: Object,
      default() {
        return {
          gpuAcceleration: false
        }
      }
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      showPopover: false,
      visible: false
    }
  },
  async mounted() {
    const result = await guide.showPopover(this.storageKey)
    if (!result) {
      this.showPopover = !result
      this.$nextTick(() => this.visible = this.showPopover)
      guide.closePopover(this.storageKey)
    }
  },
  methods: {
    toggleVisible() {
      this.visible = false
    },
    leave() {
      console.log(123123)
      this.visible = false
    }
  }
}
</script>

<style lang='scss'>
.guide-popover {
  height: 50px;
  min-width: 260px;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 0 15px 0 24px;
  background: linear-gradient(to right, #9073FF, #C58AFF);
  
  .content {
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    color: #ffffff;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
    position: relative;
    
    .header {
      width: 66px;
      height: 58px;
      position: absolute;
      top: -55px;
      right: 20px;
      background-image: url("~@assets/image/waybill/guide-popover-header.png");
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    
    i {
      font-size: 12px;
      margin-left: 12px;
      
      &:hover {
        cursor: pointer;
      }
    }
  }
  
  .popper__arrow {
    left: 36px !important;
    
    &, &::after {
      border-top-color: #9073FF !important;
      border-bottom-color: #9073FF !important;
    }
  }
}
</style>
