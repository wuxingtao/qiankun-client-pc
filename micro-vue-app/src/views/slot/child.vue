<template>
  <div class="page__content">
    <el-table :data="dataList">
      <template v-for="(item,index) in columns">
        <el-table-column v-if="item.slot" :key="index" :prop="item.prop" :label="item.label">
          <template slot-scope="scope">
            <slot :name="item.prop" :row="scope.row"></slot>
          </template>

        </el-table-column>
        <el-table-column v-else :key="index" :prop="item.prop" :label="item.label"></el-table-column>
      </template>

    </el-table>
    <slot name="user" :user="user"></slot>
  </div>
</template>

<script>
export default {
  name: "child",
  props:{
    columns:{
      type:Array,
      default:()=>[]
    }
  },
  data(){
    return {

      dataList:[
        {
          name:'11',
          year:11
        },
        {
          name:'22',
          year:22
        },
        {
          name:'33',
          year:33
        },
      ],
      user:{
        firstName:'wang',
        year:24
      }
    }
  }
};
</script>

<style scoped>

</style>
