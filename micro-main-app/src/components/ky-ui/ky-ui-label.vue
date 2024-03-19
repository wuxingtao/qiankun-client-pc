<template>
  <div :class="['ky-ui-label',{'is-required':required}]">
    <div class="form-label-header"><span class="title">{{title}}</span><span class="c_999" v-if="desc">{{desc}}</span><slot></slot></div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'ky-ui-label',
  props: {
    title:{
      type: String,
      default: ()=>''
    },
    desc:{
      type: String,
      default: ()=>''
    },
    required:{
      type: Boolean,
      default: false
    }
  },
  setup() {
    const state = reactive({})
    return {...toRefs(state)}
  }
})
</script>

<style lang="scss" scoped>
.ky-ui-label {
  padding: 8px 10px;
  margin-bottom: 16px;
  background: linear-gradient(270deg, #fafafa, #f6f6f6);
  border-radius: 2px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    height: 50%;
    margin: auto;

    background: #666666;
    border-radius: 2px;
  }

  .title {
    font-weight: 600;
    color: #333333;
    position: relative;
  }
  &.is-required{
    .title::after{
      content: '*';
      position: absolute;
      width:8px;
      height: 11px;
      right: -10px;
      top: 0;
      bottom: 0;
      margin: auto;
      font-size: 14px;
      color: #ff7374;
    }
  }
}
</style>
