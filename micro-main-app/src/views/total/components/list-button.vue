<template>
    <div class="list-button-button">
        <div @click="left" v-if="leftTitle" class="list-button-button-item list-button-button-left" :class="{'is-active':value==='left'}">{{leftTitle}}</div>
        <div @click="right" v-if="rightTitle" class="list-button-button-item list-button-button-right" :class="{'is-active':value==='right'}">{{rightTitle}}</div>
    </div>
</template>

<script>
export default {
  name: "list-button",
  props:{
    value:{
      type:String,
      default:'left'
    },
    leftTitle:{
      type:String,
      default:''
    },
    rightTitle:{
      type:String,
      default:''
    }
  },
  methods:{
    left(){
      this.$emit('input', 'left')
      this.$emit('left', 'left')
    },
    right(){
      this.$emit('input', 'right')
      this.$emit('right','right')
    }
  }
}
</script>

<style scoped lang="scss">
  .list-button-button {
    margin-bottom: 1rem;

    &-item {
      color: #0C092B;
      padding: 1rem 2.7rem;
      text-align: center;
      display: inline-block;
      opacity: 1;
      background: #ffffff;
      cursor: pointer;
      font-size: 1.4rem;

      &.is-active{
        background: #5445E4;
        color: #fff;
      }
    }

    &-left {
        border-radius: .5rem 0 0 .5rem;
        border-right: 1px solid #fff;
    }

    &-right {
        border-radius: 0 .5rem .5rem 0;
    }
  }
</style>
