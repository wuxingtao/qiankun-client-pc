<template>
  <div class="code-list flex flex_ai_c">
    <code-item v-for="(item,index) in dataList" :key="index" :info="item"></code-item>
  </div>
</template>

<script>
import CodeItem from './code-item'

export default {
  name: 'code-list' ,
  components: {CodeItem} ,
  props: {
    dataList: {
      type: Array ,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../base';
.code-list {
  align-content: flex-start;
  flex-flow: row wrap;
  padding: vm(40) vm(30) vm(40) vm(50);
  height:vm(360);
  overflow-y: auto;


}
::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

::-webkit-scrollbar-track,
::-webkit-scrollbar-thumb {
  border-radius: 999px;
  border: 5px solid transparent;
}

::-webkit-scrollbar-track {
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2) inset;
}

::-webkit-scrollbar-thumb {
  min-height: 20px;
  background-clip: content-box;
  box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.2) inset;
}

::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
