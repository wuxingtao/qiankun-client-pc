<template>
  <ky-dialog class="encrypt-field-view--container" title="警告" :visible.sync="dialogVisible" width="360px" :show-close="false" cancel-text="取消查看" confirm-text="确认查看" @confirm="handleConfirm" append-to-body>
    查看加密信息会触发安全监控，如非必要请勿查看
  </ky-dialog>
</template>

<script>
import { addRecord } from '@/services/api/encrypt'
import { getUserData } from "@/utils/storage"
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String
    },
    menuText: {
      type: String
    }
  },
  data () {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    handleConfirm () {
      this.saveData()
      this.$emit('on-confirm')
      this.dialogVisible = false
    },
    saveData () {
      if (!this.content) {
        return
      }
      let menuText = this.menuText
      if (!menuText) {
        switch (this.$route.path) {
          case '/admin/order':
            menuText = '单票发货'
            break
          case '/admin/waybill':
            menuText = '修改运单'
            break
        }
      }
      const { phone, userName ,customCode } = getUserData()
      const params = [{
        customerCode:customCode,
        name: userName || phone,
        phone,
        module: menuText,
        cotent: this.content
      }]
      try {
        addRecord(params)
      } catch {
        //ignore
      }
    }
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang="scss" scoped>
  .encrypt-field-view--container {
    /deep/ .el-dialog {
      .el-dialog__header,
      .el-dialog__footer {
        border: none;
      }
    }
  }
</style>