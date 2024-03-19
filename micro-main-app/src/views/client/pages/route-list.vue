<template>
  <div class="route-list-container main-container">
    <div class="main-title">多票运单查询</div>
    <el-table :data="tableData" class="client-common-table" :max-height="500" border style="width:100%">
      <el-table-column prop="ydCode" label="运单号" width="150">
        <template slot-scope="{row}">
          <el-button @click="handleClick(row.ydCode)" type="text" size="small">{{row.ydCode}}</el-button>
        </template>
      </el-table-column>
      <el-table-column v-for="col in tableColumns" :key="col.prop" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :width="col.width+'px'">
      </el-table-column> 
    </el-table>
     <BillRoutes ref="billRoutes"></BillRoutes>
  </div>
</template>

<script>
import { getRouteList } from "@/services/api/common"
// import BillRoutes from "@views/ mybill/components/BillRoutes"
const tableColumns = [
  { prop: "jjDateTime", text: "寄件时间", width: "160" },
  { prop: "sjPerson", text: "收件人", width: "170" },
  { prop: "sjCompany", text: "收件公司", width: "200" },
  { prop: "lastRoute", text: "最后路由描述" },
]
export default {
  components: {
    // BillRoutes
  },
  data() {
    return {
      tableColumns,
      tableData: [],
    }
  },
  mounted() {
    this.queryData()
  },
  methods: {
    async queryData() {
      const ydNoText = this.$route.query.ydNoText || ""
      const ydNos = ydNoText.split(/[,，]/).filter((f) => f)
      if (ydNos.length < 1) {
        this.$message.warning("请输入运单号")
        return
      }
      const res = await getRouteList(ydNos)
      if (res.code === 0) {
        this.tableData = res.data.successList.map((m) =>
          Object.assign({}, m, { lastRoute: m.route[0].stepDesc })
        )
      }
    },
    handleClick(ydcode){
      this.$refs.billRoutes.showDialog( ydcode,'client')
    }
  },
}
</script>

<style lang="scss">
  .route-list-container {
    .client-common-table {
      margin-top: 18px;
    }
  }
</style>