<template>
  <div class="declared-value__header">
    保价声明
    <el-tooltip placement='bottom-start' effect='light' content='保价说明'>
      <i class="iconfont icon-declare-value" style="color:#f57333;cursor: pointer;" @click="dialogVisible = true" />
    </el-tooltip>

    <declared-value-agreement :visible.sync="dialogVisible"/>
  </div>
</template>

<script>

import DeclaredValueAgreement from '@comps/agreements/declared-value-agreement'
import { ref } from '@vue/composition-api'

export default {
  components:{
    DeclaredValueAgreement
  },
  setup(props) {
    const dialogVisible = ref(false)
    return{
      dialogVisible
    }
  }
}
</script>

<style lang="scss" scoped>
.declared-value__header{
  display: flex;
  .icon-declare-value{
    margin-left: 4px;
  }
}
</style>