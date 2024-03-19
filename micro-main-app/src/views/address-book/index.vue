<template>
  <div class="address-book-container">
<!--    <address-search  @search="handleSearch" @change="handleUpdateSearch"/>-->
    <el-tabs v-model="activeTab" class="tab-wrapper client-theme-bg">
      <el-tab-pane label="寄方" name="sender">
        <address-table addressType="10" :showSearch="true" tableHeight="calc(100vh - 234px)" :searchValue="searchValue" ref="senderAddressTable" />
      </el-tab-pane>
      <el-tab-pane label="收方" name="receiver">
        <address-table addressType="20" :showSearch="true" tableHeight="calc(100vh - 234px)" :searchValue="searchValue" ref="receiverAddressTable" />
      </el-tab-pane>
      <el-tab-pane label="唯品会收方" name="vipshopSender" v-if="isVipshopUser">
        <address-table addressType="" :showSearch="true" :searchValue="searchValue" tableHeight="calc(100vh - 234px)" ref="vipshopAddressTable" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import addressTable from './components/address-table.vue'
import addressSearch from './components/address-search.vue'

export default {
  components: {
    addressTable,
    addressSearch
  },
  data () {
    return {
      activeTab: 'sender',
      searchValue: ''
    }
  },
  methods: {
    getAddressTableRef () {
      let addressTableRef = this.$refs.receiverAddressTable
      if (this.activeTab === 'sender') {
        addressTableRef = this.$refs.senderAddressTable
      } else if (this.activeTab === 'vipshopSender') {
        addressTableRef = this.$refs.vipshopAddressTable
      }
      return addressTableRef
    },
    // // 搜索列表
    // handleSearch(val){
    //   const tableRef = this.getAddressTableRef()
    //   tableRef.requeryData()
    // },
    // // 更新关键词
    // handleUpdateSearch(val){
    //   this.searchValue = val
    // }
  },
  computed: {
    ...mapGetters(['isVipshopUser'])
  },
  watch: {
    activeTab: {
      handler () {
        this.$nextTick(() => {
          const tableRef = this.getAddressTableRef()
          tableRef.requeryData()
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';

.address-book-container {
}
</style>
