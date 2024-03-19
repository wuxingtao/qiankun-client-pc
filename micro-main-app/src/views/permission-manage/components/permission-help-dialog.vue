<template>
  <ky-dialog title="帮助指引" width="500px" :visible.sync="dialogVisible" append-to-body>
    <template v-if="type === 'permission-index'">
      <h2 class="permission-help__header">通用权限管理说明</h2>
      <div class="permission-help__content">
        <p class="h3">通用权限管理</p>
        <div class="content">
          适用于需要管理本公司员工下单查件的人员使用，可设置主管理员和副管理员进行协同管理，例如：可新增/解除账户绑定和分配权限、审批申请等操作。
        </div>
      </div>
    </template>
    <template v-else-if="type === 'payment-auth'">
      <h2 class="permission-help__header">付款授权管理说明</h2>
      <div class="permission-help__content">
        <p class="h3">付款授权管理</p>
        <div class="content">
          适用于需要管理本公司关于付款和对账开票人员使用，可设置主授权号和副授权号协同管理。例如：可新增/解除账户绑定和分配对账开票权限等操作。
        </div>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button size="medium" type="primary" @click="close">我知道了</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'permission-help-dialog',
  props: {
    type: {
      type: String,
      default: () => ''
    }
  },
  setup() {
    const state = reactive({
      dialogVisible: false
    })

    const fun = reactive({
      openDialog() {
        state.dialogVisible = true
      },
      close() {
        state.dialogVisible = false
      }
    })

    return { ...toRefs(state), ...toRefs(fun) }
  }
})
</script>

<style lang="scss" scoped>
.permission-help {
  &__header {
    margin: 4px 0 20px;
    text-align: center;
    font-size: 15px;
    font-family: PingFangSC, PingFangSC-Semibold;
    font-weight: 600;
    color: #03050d;
  }
  &__content {
    line-height: 2;
    .h3 {
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: 600;
      color: #03050d;
    }
    .content {
      font-family: PingFangSC, PingFangSC-Regular;
      color: #666666;
    }
  }
}
</style>
