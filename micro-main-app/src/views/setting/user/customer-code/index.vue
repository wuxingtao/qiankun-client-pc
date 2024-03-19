<template>
 <ky-page-container styleName="new" class="customer-code__container" :title="title" show-go-back before-route-path="/admin/user" @back="goBack">
    <customer-code-header :customerInfo="customerInfo"/>
    <customer-code-list :customerList="customerList" ref="customerCodeListRef"/>
    <div class="buttons">
      <el-button size="medium" @click="addCustomerCode" :loading="loading">添加客户编码</el-button>
      <el-button type="primary" size="medium" @click="handleBindCustomerCode" :loading="loading">保存</el-button>
    </div>
    <customer-code-add-dialog :visible.sync="visibleAddDialog"/>
</ky-page-container>
</template>

<script>
import { computed, reactive, ref, toRefs } from '@vue/composition-api'
import CustomerCodeHeader from '../components/customer-code-header'
import CustomerCodeList from '../components/customer-code-list'
import CustomerCodeAddDialog from '../components/customer-code-add-dialog'
import useCustomerCode from '../hooks/useCustomerCode'
import userApi from '@/services/module/user'

export default {
  components:{
    CustomerCodeHeader,
    CustomerCodeList,
    CustomerCodeAddDialog
  },
  setup(props,{root}){
    const customerCodeListRef = ref(null)
    const state = reactive({
      loading:false,
      visibleAddDialog:false,
    })
    const customerList = computed(() => root.$store.state.customerList)  
    const customerInfo = computed(() => root.$store.state.userInfo?.customerInfo)  
    const title = computed(() => customerInfo.value ? '更换客户编码' : '绑定客户编码') 

    const { bindCustomerCode } = useCustomerCode(root) 

    const goBack = () => {
      // console.log('back');
    }

    const addCustomerCode = async () => {
      try{
        state.loading = true
        const res = await userApi.getCustomerCodeBindInfo()
        const { bindCount, bindLimit,customers} = res.data || {}
        root.$store.commit('setCustomerList',customers || [])
        if(res.code === 0 && bindCount >= bindLimit){
          root.$message.warning('您当前绑定账号已达上限，请解绑已绑账号后再添加')
          return
        }
      }finally{
        state.loading = false
      }
      state.visibleAddDialog = true
    }

    const handleBindCustomerCode = () => {
      const item = customerCodeListRef.value.getSelectedItem()
      const params = {
        customerCode: item.customerCode
      }
      bindCustomerCode(params)
    }
    return{
      customerCodeListRef,
      ...toRefs(state), 
      title,
      customerList,
      customerInfo,
      goBack,
      addCustomerCode,
      handleBindCustomerCode
    }
  }
}
</script>

<style lang='scss' scoped>
.customer-code__container{
  .customer-code-list__container{
    margin-top: 27px;
    width: 600px;
    /deep/{
      .list--wrapper{
        height: calc(100vh - 430px);
        min-height: 136px;
      }
    }
  }
  .buttons{
    margin-top: 46px;
    button{
      width: 96px;
      padding: 9px 0;
    }
  }
}
</style>