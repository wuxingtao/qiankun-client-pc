<template>
  <div>
    <Child :columns="columns">
      <!--  作用域插槽  <template v-slot:name="scope"></template>  -->
      <template #name="{row}">
        value: {{ row }}
        {{ row.year }}
      </template>
      <!--   具名插槽   -->
      <template #user="{user}">
        value: {{ user }}
        <div>{{ user.name }}</div>
      </template>
    </Child>
  </div>
</template>

<script>
import Child from './child.vue';

export default {
  name: 'index' ,
  components: {Child} ,
  data() {
    return {
      columns: [
        {
          prop: 'name' ,
          label: '姓名' ,
          slot: true
        } ,
        {
          prop: 'year' ,
          label: '年龄'
        }
      ] ,
    };
  }
};
</script>

<style scoped>

</style>
