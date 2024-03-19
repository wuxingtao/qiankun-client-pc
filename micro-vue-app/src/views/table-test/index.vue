<template>
<div class="page__content">
  <k-table :data="tableData" :columns="tableColumns" :total="dataCount"
           height="calc(100vh - 450px)"
           @refreshList="handleList"
           @selection-change="selectionChange"
           v-loading="loading" ref="tableRef">

    <el-table-column slot="operation" label="操作" width="160">
      <template slot-scope="scope">
        <el-button class="btn-text-border" type="text">通知司机取货</el-button>
        <el-button class="btn-text-border" type="text">打单</el-button>
      </template>
    </el-table-column>
    <el-table-column slot="batchNo" label="批次号" min-width="130">
      <template slot-scope="scope">
        <el-button type="text">{{ scope.row.batchNo }}</el-button>
      </template>
    </el-table-column>
  </k-table>
</div>
</template>

<script>
import {KTable} from '@/components';

export default {
  name: 'table-test',
  components:{KTable},
  data(){
    return {
      tableData: [] ,
      // 不可变列表原始数据
      tableColumnsOriginal: [
        {
          type: 'selection' ,
          minWidth: '5.7%' ,
          align: 'center' ,
          unList: true
        } ,
        {
          slot: 'operation' ,
          prop: 'operation' ,
          label: '操作' ,
          unList: true
        } ,
        {
          slot: 'batchNo' ,
          prop: 'batchNo' ,
          label: '批次号' ,
          minWidth: '100' ,
          visible: true ,
        } ,
        {
          prop: 'createTime' ,
          label: '填单时间' ,
          minWidth: '160' ,
          visible: true
        } ,
      ] ,
      // 表格列
      tableColumns: [] ,
    }
  }
};
</script>

<style scoped>

</style>
