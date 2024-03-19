<template>
  <ky-page-container title="表格组件示例">
    <v-table2 :tableColumns="tableColumns" :data="tableData" height="500px"></v-table2>
  </ky-page-container>
</template>

<script>
import vTable2 from '../../components/table/v-table2.vue'

const tableColumns = [
  { prop: 'distrId', text: '订单号', width: '120', visible: true },
  { prop: 'supplierName', text: '供应商', width: '120', visible: true },
  { prop: 'skuStr', text: 'SKU(数量)', width: '120', visible: true },
  { prop: 'deliveryTime', text: '要求到货时间', width: '180', visible: true },
  { prop: 'distrStatusStr', text: '发货状态', width: '100', visible: true }
]

export default {
  components: { vTable2 },
  data() {
    return {
      tableColumns: tableColumns,
      tableData: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      const list = []
      for (let i = 0; i < 100; i++) {
        const obj = this.tableColumns.reduce((item, cur) => {
          item[cur.prop] = cur.text + i
          return item
        }, {})
        list.push(obj)
      }
      this.tableData = list
    }
  }
}
</script>

<style lang="scss" scoped></style>
