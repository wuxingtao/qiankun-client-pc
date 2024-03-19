<template>
  <div v-show="visible" class="bigCar_content">
    <ky-ui-label title="大票货" required></ky-ui-label>
    <div class="bigCar_tip">
      <svg-icon icon-class="notice-warning" class="notice-warning mr_8" />由于您取货地址的运单货物较大，我司可能安排挂车取件，请确认货物所处位置<span class="public-color">是否可以正常出入挂车</span>（长17.5m*宽2.65m*高2.9m）
    </div>
    <el-table :data="tableDataComputed" class="client-common-table ky-table--v3" border style="width:100%" max-height="200px">
      <el-table-column prop="deliveryAddress" label="取货地址">
      </el-table-column>
      <el-table-column prop="name" label="出入挂车" width="176">
        <template slot-scope="scope">
          <el-radio v-model="scope.row.isSupport" label="10">支持</el-radio>
          <el-radio v-model="scope.row.isSupport" label="20">不支持</el-radio>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
import {KyUiLabel} from '@comps/ky-ui'
export default {
  name: 'pickup-big',
  props:{
    tableData:{
      type:Array,
      default: ()=>[]
    },
    visible:{
      type:Boolean,
      default: ()=>false
    }
  },
  components:{
    KyUiLabel
  },
  computed:{
    tableDataComputed(){
      return this.tableData.filter(item=>item.showBigCar)
    }
  }
}
</script>

<style lang="scss" scoped>
/* 大货 */
.ky-table--v3 {
  border-radius: 3px;

  /deep/ .el-table__header {
    thead {
      color: #333;
      font-family: PingFangSC, PingFangSC-Medium;

      tr, th {
        background-color: transparent;
      }

      tr {
        background: linear-gradient(360deg, #ffffff, #f5f2ff);
        box-shadow: 0px -1px 0px 0px #e3e3e3 inset;
      }
    }
  }

  /deep/ th, /deep/ td {
    border-right-color: transparent;
  }

}
</style>
