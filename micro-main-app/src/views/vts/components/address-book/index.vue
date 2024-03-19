<template>
  <div class="address-book-container">
    <el-tabs v-model="activeTab" class="tab-wrapper">
      <el-tab-pane label="收方" name="receiver">
        <address-table addressType="20" ref="receiverAddressTable"/>
      </el-tab-pane>
      <el-tab-pane label="寄方" name="sender">
        <address-table addressType="10"  ref="senderAddressTable"/>
      </el-tab-pane>
      <el-tab-pane label="唯品会收方" name="vipshopSender" v-if="isVipshopUser">
        <address-table addressType="" tableHeight="calc(100vh - 330px)"  ref="vipshopAddressTable"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import addressTable from './components/address-table.vue'
export default {
  components: {
    addressTable
  },
  data () {
    return {
      activeTab: 'receiver'
    }
  },
  methods:{
    getAddressTableRef(){
      let addressTableRef = this.$refs.receiverAddressTable
      if (this.activeTab === 'sender') {
        addressTableRef = this.$refs.senderAddressTable
      } else if (this.activeTab === 'vipshopSender') {
        addressTableRef = this.$refs.vipshopAddressTable
      }
      return addressTableRef
    },
  },
  computed: {
    ...mapGetters(["isVipshopUser"])
  },
  watch:{
    activeTab:{
      handler(){
        this.$nextTick(()=>{
          const  tableRef=this.getAddressTableRef()
          tableRef.requeryData()
        })
      },
      immediate:true
    }
  }
}
</script>

<style lang="scss" scoped>
  .address-book-container {
  }
</style>