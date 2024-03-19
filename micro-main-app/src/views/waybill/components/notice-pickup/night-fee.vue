<template>
  <!--  夜间取货费用 start     -->
  <div class='night-feed__wrapper label-tip mb_20' v-if='visible'>
    <div class='label-text mb_12'>以下寄件地址取货会收取夜间取货费，如有疑问请联系商务经理。</div>
    <el-table :data='data' class='night-feed__table mb_4' border style='width:100%' max-height='109px'>
      <el-table-column prop='address' label='取货地址' :show-overflow-tooltip='true'>
      </el-table-column>
      <el-table-column prop='nightFee' label='夜间取货费(元)' width='130'>
      </el-table-column>
    </el-table>
  </div>
  <!--  夜间取货费用 end     -->
</template>

<script>
export default {
  name: 'night-fee',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    data: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang='scss' scoped>
/* 夜间取货费表格 */
.night-feed__table {
  border-radius: 4px;
  border-color: #f6e7b6;
  color: #03050d;

  &::before, &::after {
    content: '';
    background-color: #f6e7b6;
  }

  /deep/ th, /deep/ td {
    padding: 6px 0;
    border-bottom-color: #f6e7b6;
    border-right-color: transparent;
    font-size: 12px;
  }

  /deep/ .el-table__header {
    thead {
      color: #333;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: bold;
    }
  }

  /deep/ el-table-body {
    color: #03050d;
  }
}

.label-tip {
  background: #fff9e6;
  border-radius: 4px;
  padding: 12px;

  .label-text {
    color: #FF8038;
  }
}
</style>
