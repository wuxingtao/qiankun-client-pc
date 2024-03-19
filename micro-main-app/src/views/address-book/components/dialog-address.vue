<template>
  <ky-dialog
    :title="`选择${addressType === '10' ? '寄方' : '收方'}地址`"
    :class="['dialog-2021', isVipshopUser ? 'dialog-addressbook-vipshop' : '']"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="890px"
  >
    <div>
      <address-table
        class="kye-address-table"
        v-if="addressType === '10'"
        ref="senderAddressTable"
        :address-type="addressType"
        :is-in-dialog="true"
        :multi-select="multiSelect"
        v-bind="$attrs"
        max-height="430px"
      />
      <el-tabs v-else v-model="activeTab" :class="['kye-tabs', !isVipshopUser ? 'tabs-hide' : '']">
        <el-tab-pane label="收方地址薄" name="receiver" style="margin-top: 5px">
          <address-table
            class="kye-address-table"
            ref="receiverAddressTable"
            :address-type="addressType"
            :is-in-dialog="true"
            :multi-select="multiSelect"
            v-bind="$attrs"
            max-height="430px"
          />
        </el-tab-pane>
        <el-tab-pane
          label="唯品会地址薄"
          name="vipshopSender"
          v-if="isVipshopUser"
          style="margin-top: 5px"
        >
          <address-table
            class="kye-address-table"
            addressType=""
            ref="vipshopAddressTable"
            :is-in-dialog="true"
            :multi-select="multiSelect"
            max-height="430px"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确定</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import addressTable from './address-table.vue'
import useAddress from '@/hooks/useAddress'

export default {
  name: 'DialogAddress',
  props: {
    visible: { type: Boolean, required: true },
    addressType: {
      //地址薄类型：'10'(寄方),'20'(收方)
      type: String,
      require: true
    },
    // tableHeight: {
    //   type: String,
    //   default: 'calc(100vh - 508px)'
    // },
    multiSelect: {
      type: Boolean,
      default: false
    }
    // isVts: {
    //   type: Boolean,
    //   default: false
    // }
  },
  components: {
    addressTable
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      activeTab: 'receiver'
    }
  },
  methods: {
    getAddressTableRef() {
      let addressTableRef = this.$refs.vipshopAddressTable
      if (this.addressType === '10') {
        addressTableRef = this.$refs.senderAddressTable
      } else if (this.addressType === '20' && this.activeTab !== 'vipshopSender') {
        addressTableRef = this.$refs.receiverAddressTable
      }
      return addressTableRef
    },
    async parseVipshopAddress(vipshopAddressList){
      if(!this.isVipshopUser || vipshopAddressList[0].hasOwnProperty('province')){
        return
      }
      const { parseAddress } = useAddress()
      const promiseList = vipshopAddressList.map(row => {
        return new Promise(async resolve=>{
          try{
            const { districtList, detailAddress } = await parseAddress(row.fullAddress) || {}
            if(districtList){
              row.province = districtList[0] || ''
              row.city = districtList[1] || ''
              row.area = districtList[2] || ''
              row.detailAddress = detailAddress
            }
          }finally{  
            resolve()
          }
        })
      })
      await Promise.all(promiseList)   
    },
    async confirm() {
      try {
        this.loading = true
        const addressTableRef = this.getAddressTableRef()
        const selectedRow = addressTableRef.selectedRows[0]
        if (!selectedRow) {
          const msg = `请${this.multiSelect ? '至少' : ''}选择一条数据进行确认`
          this.$message.warning(msg)
          return
        }
        const rows = this.multiSelect ? addressTableRef.selectedRows : [selectedRow]
        if(!this.multiSelect){
          await this.parseVipshopAddress(rows)
        }        
        this.$emit('on-confirm', this.multiSelect ? rows : rows[0])
        this.dialogVisible = false
      } finally {
        this.loading = false
      }
    },
    closeAllPopper() {
      const popperLists = document.querySelectorAll('.el-tooltip__popper')
      for (let i = 0; i < popperLists.length; i++) {
        popperLists[i].style.display = 'none'
      }
    }
  },
  computed: {
    ...mapGetters(['isVipshopUser'])
  },
  watch: {
    visible(val) {
      if (val) {
        this.dialogVisible = true
      } else {
        this.closeAllPopper()
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
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
.ky-dialog.dialog-2021 {
  &.dialog-addressbook-vipshop {
    /deep/.el-dialog__body {
      margin-top: 8px !important;
      .el-tabs__header {
        padding: 0;
        border-bottom: 1px solid #f1f1f5 !important;
        border-radius: unset;
      }
      .el-tabs__content {
        height: unset !important;
      }
    }
  }
  /deep/ .el-dialog {
    min-width: 750px;
    min-height: 440px;
  }

  /deep/ .el-dialog__body {
    padding-bottom: 0 !important;

    .tabs-hide .el-tabs__header {
      display: none;
    }
  }
}
.address-list-container {
  height: 530px;
}
.kye-address-table {
  /deep/ .element-table {
    min-height: 430px;
    .el-table__empty-block {
      min-height: 430px;
    }
  }
  /deep/ {
    .el-pagination__sizes {
      .el-input__suffix {
        width: 25px;
      }
    }
    .pagination-style__select-total,
    .pagination-style__total-num {
      display: none;
    }
  }
}
.kye-tabs {
  /deep/ .el-tabs__header {
    visibility: initial !important;
    margin-bottom: 8px !important;
  }
}
</style>