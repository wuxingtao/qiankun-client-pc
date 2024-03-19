<template>
  <div class="clientdialog">
    <el-dialog :title="`${addressType==='10'?'寄方':'收方'}地址簿`"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               width="773px"
               custom-class="vts-reset-dialog">
      <div>
        <address-table v-if="addressType==='10'"
                       ref="senderAddressTable"
                       :address-type="addressType"
                       :is-in-dialog="true"
                       :multi-select="multiSelect"
                       tableHeight="calc(100vh - 500px)" />
        <address-table v-else
                       ref="receiverAddressTable"
                       :address-type="addressType"
                       :is-in-dialog="true"
                       :multi-select="multiSelect"
                       tableHeight="calc(100vh - 500px)" />
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="confirm"
                   :loading="loading">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>  
  import { mapGetters } from "vuex"
  import addressTable from './address-table.vue'
  export default {
    name: "DialogAddress",
    props: {
      visible: { type: Boolean, required: true },
      addressType: { //地址薄类型：'10'(寄方),'20'(收方)
        type: String,
        require: true
      },
      tableHeight: {
        type: String,
        default: 'calc(100vh - 409px)'
      },
      multiSelect: {
        type: Boolean,
        default: false
      },
    },
    components: {
      addressTable
    },
    data () {
      return {
        loading: false,
        dialogVisible: false,
        activeTab: 'receiver'
      }
    },
    methods: {
      getAddressTableRef () {
        let addressTableRef = this.$refs.vipshopAddressTable
        if (this.addressType === '10') {
          addressTableRef = this.$refs.senderAddressTable
        } else if (this.addressType === '20' && this.activeTab !== 'vipshopSender') {
          addressTableRef = this.$refs.receiverAddressTable
        }
        return addressTableRef
      },
      confirm () {
        try {
          this.loading = true
          const addressTableRef = this.getAddressTableRef()
          const selectedRow = addressTableRef.selectedRows[0]
          if (!selectedRow) {
            const msg = `请${this.multiSelect ? '至少' : ''}选择一条数据进行确认`
            this.$message.warning(msg)
            return
          }
          this.$emit('on-comfirm', this.multiSelect ? addressTableRef.selectedRows : selectedRow)
          this.dialogVisible = false
        } finally {
          this.loading = false
        }
      }
    },
    computed: {
      ...mapGetters(["isVipshopUser"])
    },
    watch: {
      visible (val) {
        if (val) {
          this.dialogVisible = true
        }
      },
      dialogVisible (val) {
        if (!val) {
          this.$emit("update:visible", false)
          this.activeTab = 'receiver'
          const addressTableRef = this.getAddressTableRef()
          addressTableRef.reset()
        } else {
          this.$nextTick(() => {
            this.getAddressTableRef().queryData()
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .clientdialog {
    /deep/ .el-dialog {
      border-radius: 4px !important;
    }

    /deep/ .el-dialog__header {
      padding: 0 20px !important;
      height: 38px;
      line-height: 40px;
    }

    /deep/ .el-dialog__headerbtn {
      top: 0 !important;
    }
    // /deep/ {
    //   .el-dialog__body {
    //     padding-bottom: 0 !important;
    //     .el-tabs__header {
    //       padding: 0 20px !important;
    //       visibility: unset !important;
    //       height: 38px;
    //       line-height: 42px;
    //       font-size: 16px;
    //     }
    //     .tabs-hide .el-tabs__header {
    //       display: none;
    //     }
    //   }
    .el-pagination .el-pagination__sizes .el-input__inner {
      background: #ffffff !important;
      border: 1px solid #d6dde5 !important;
      border-radius: 15px !important;
    }
    .el-pagination .el-pagination__jump .el-input__inner {
      background: #f2f6fd;
      border-radius: 14px !important;
      padding-right: 0 !important;
      border: 1px solid #f2f6fd !important;
      font-weight: 400 !important;
    }
  }
</style>
