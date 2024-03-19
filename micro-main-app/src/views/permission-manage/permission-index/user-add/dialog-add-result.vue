<template>
  <ky-dialog
    class="dialog-add-result dialog-2021"
    :visible.sync="dialogVisible"
    :show-close="false"
    confirm-text=""
    cancel-text=""
    width="360px"
    title=""
    append-to-body
  >
    <div class="content">
      <svg-icon icon-class="icon-success" class="icon-circle-check" />
      <span class="success-msg">{{ msg }}</span>
      <span class="text-tip">您可以</span>
    </div>
    <div class="btn-wrapper">
      <el-button size="small" @click="handleClose('lists')">返回{{ tabName }}</el-button>
      <el-button type="primary" size="small" @click="handleClose('add')">继续新增账户</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs, computed } from '@vue/composition-api'
import usePermissionStore from '@views/permission-manage/hooks/usePermissionStore'

export default defineComponent({
  name: 'dialog-add-result',
  props: {},
  setup(porps, { root, emit }) {
    const state = reactive({
      msg: '新增成功',
      dialogVisible: false,
      routerParam: {
        needRefresh: true
      }
    })

    const { permission_tab_active } = usePermissionStore()

    const tabName = computed(() => {
      return permission_tab_active.value === 'permission-index' ? '通用权限管理' : '付款授权管理'
    })

    function openDialog() {
      state.dialogVisible = true
    }

    function handleClose(type) {
      emit('clearInput')
      switch (type) {
        case 'lists':
          state.dialogVisible = false
          root.$router.push({
            name: 'permission-manage',
            params: { ...state.routerParam, activeTabName: permission_tab_active.value }
          })
          break
        case 'add':
          state.dialogVisible = false
          break
      }
    }

    return { ...toRefs(state), tabName, openDialog, handleClose }
  }
})
</script>

<style lang="scss" scoped>
.dialog-add-result {
  font-size: 14px;
  color: #333;

  /deep/ {
    .el-dialog {
      .el-dialog__header {
        background: linear-gradient(180deg, #e1ddff, rgba(255, 255, 255, 0));
        height: 20px;
        border-bottom: 0;
        border-radius: 4px;
      }

      .el-dialog__footer {
        display: none;
      }

      .el-dialog__body {
        margin-top: 0 !important;

        .content {
          margin-top: 0 !important;
          padding-bottom: 20px !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .icon-circle-check {
          width: 144px;
          height: 144px;
        }

        .success-msg {
          padding: 0 0 16px;
          font-size: 26px !important;
          font-weight: bold;
          color: #41c381;
        }

        .text-tip {
          color: #333333;
          font-size: 16px !important;
          font-weight: bold;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: -60px;
            top: 8px;
            width: 50px;
            margin: auto;
            border-bottom: 1px dashed #e6e6ea;
          }

          &::after {
            content: '';
            position: absolute;
            right: -60px;
            top: 8px;
            width: 50px;
            margin: auto;
            border-bottom: 1px dashed #e6e6ea;
          }
        }

        .btn-wrapper {
          padding-top: 24px;
          text-align: center;

          .el-button {
            width: 140px;
            height: 44px;
            border-radius: 4px;

            &:first-child {
              border: 1px solid #8365f6;
              font-size: 14px;
              font-weight: 500;
              color: #8365f6;
            }

            &:last-child {
              font-size: 14px;
              font-weight: 500;
              background: #8365f6;
              border: 1px solid #8365f6;
            }

            span {
              font-size: 14px;
            }
          }

          .el-button + .el-button {
            margin-left: 16px;
          }
        }
      }
    }
  }
}
</style>
