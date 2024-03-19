<template>
  <span :class="['level',`level-type--${type}`]"><slot></slot></span>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'user-label',
  props: {
    type: {
      type: String,
      default: () => 'normal'
    }
  },
  setup () {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
.level {
  background: #fff1e9;
  border-radius: 2px;
  color: #fe743c;
  padding: 4px 3px;
  font-size: 12px;
  //transform: scale(0.8);
  display: inline-block;
  line-height: 1;
}

.level-type {
  &--yellow {
    color: #FEA33C;
    background: #ffefd9;
  }

  &--theme {
    color: #8365F6;
    background: #f0edff;
  }
}

.level-type--yellow {
  color: #FEA33C;
  background: #ffefd9;
}


</style>
