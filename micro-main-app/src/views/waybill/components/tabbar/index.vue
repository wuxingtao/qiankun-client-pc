<template>
  <div class='tabs-container'>
    <div class='tabs-container-wrap'>
      <template v-for='(tab, index) in tabs'>
        <div v-if='tab.label !== "转我付款" || steps !== 3' :key='index' class='tab-item-wrap'>
          <span
            class='tab-item'
            :class="[index === selectedIndex ? 'active' : '', size]"
            @click='clickHandler(index, tab.value)'
          >
            {{ tab.label }}
          </span>
        </div>
        <div v-else :key='index' class='tab-item-wrap'>
          <guide-popover
            content='只包含您作为第三方付款的运单'
            storageKey='isShowTabPopover'
          >
            <span
              :class="[index === selectedIndex ? 'active' : '', size]"
              class='tab-item'
              @click='clickHandler(index, tab.value)'
            >
              {{ tab.label }}
            </span>
          </guide-popover>
        </div>
      </template>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { isEmpty, isNumber } from 'lodash'
import GuidePopover from '@comps/guide-popover'

export default {
  name: 'Tabbar',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'normal'
    },
    value: {
      type: String,
      required: true
    },
    steps: {
      type: Number,
      require: true
    }
  },
  components: {
    GuidePopover
  },
  data() {
    return {
      selectedIndex: 0
    }
  },
  mounted() {
    if (!isEmpty(this.value) || isNumber(this.value)) {
      this.$watch('value', (newVal, oldVal) => {
        if (newVal !== oldVal) {
          this.tabs.forEach((item, index) => {
            if (item.value === newVal) {
              this.selectedIndex = index
            }
          })
        }
      })
    }
  },
  methods: {
    clickHandler(index, value) {
      if (!isEmpty(this.value) || isNumber(this.value)) {
        this.$emit('update:value', value)
      } else {
        this.selectedIndex = index
        this.$emit('change', value)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.tabs-container {
  display: flex;
  padding: 0 20px;

  .tabs-container-wrap {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #f1f1f5;
  }

  .icon-tabs {
    padding-right: 3px;
  }

  .tab-item-wrap {
    display: flex;
    height: 100%;
    justify-content: center;
    margin-right: 46px;
    white-space: nowrap;
    &>span{
      font-weight: bold;
    }
  }

  .normal {
    height: 39px;
    line-height: 39px;
    font-size: 16px;
  }

  .large {
    width: 56px;
    height: 50px;
    line-height: 50px;
  }

  .tab-item {
    font-size: $--tab-font-size;
    font-weight: 400;
    color: rgba(51, 51, 51, 0.93);
    height: 100%;
    user-select: none;
    cursor: pointer;
    text-align: center;

    &.disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    &.active {
      font-weight: bold;
      color: #8365f6;
      position: relative;

      &::after {
        content: '';
        display: block;
        position: absolute;
        height: 3px;
        width: 100%;
        background: #8365f6;
        border-radius: 3px;
        left: 50%;
        bottom: -1;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
