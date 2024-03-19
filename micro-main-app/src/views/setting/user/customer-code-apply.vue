<template>
  <ky-page-container class="customer-code-apply__container" title="申请客户编码" show-go-back :before-route-path="beforeRoutePath" is-form-page>
    <template v-if="!visibleResult">
      <customer-code-tip />
      <div class="page__content">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" v-loading="loading">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input placeholder="请输入姓名" v-model.trim="formData.name" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="mobile">
                <el-input placeholder="请输入手机号" disabled v-model="formData.mobile" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="公司名称" prop="company">
                <el-input placeholder="请输入公司名称" v-model.trim="formData.company" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop='address'>
                <template #label> 详细地址
                  <i class="asterisk-address">*</i>
                </template>
                <ky-address ref='addressRef' :data='formData.addressData' />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-button type="primary" class="ky-button" size="small" @click="saveData">确认申请</el-button>
      </div>
    </template>
    <customer-code-apply-result v-else :contactInfo="applyResult"/>
  </ky-page-container>
</template>

<script>
import { computed, reactive, ref, toRefs } from '@vue/composition-api'
import * as storageUtil from '@/utils/storage'
import formatUtil from '@utils/format'
import CustomerCodeTip from './components/customer-code-tip'
import CustomerCodeApplyResult from './components/customer-code-apply-result'
import * as settingApi from '@/services/api/setting'

export default {
  components: {
    CustomerCodeTip,
    CustomerCodeApplyResult
  },
  beforeRouteLeave (to, from, next) {
    this.visibleResult = false
    this.formData.name = this.formData.company = ''
    next()
  },
  setup (props,{root}) {
    // const companyValid = (rule, value, callback) => {
    //   if (!value && value.length < 2) {
    //     return callback(new Error('收件公司名称不能少于两个字'))
    //   }
    //   callback()
    // }
    const addressRef = ref(null)
    const formRef = ref(null)
    const state = reactive({
      loading: false,
      visibleResult:false,
      applyResult:{person:''},
      formData: {
        name: '',
        mobile: formatUtil.formatMobliePhone(storageUtil.getPhone()),
        company: '',
        addressData: {
          districtList: [],
          detailAddress: '',
        }
      },
      formRules: {
        // name: [{ required: true, message: '姓名不能为空', trigger: 'blur' },],
        // company: [
        //   { required: true, message: '公司名称不能为空', trigger: 'blur' },
        // ],
        // company: [
        //   { min: 2, max: 30, validator: companyValid, trigger: 'blur' },
        // ],
      },
    })

    const beforeRoutePath = computed(()=>{
      return root.$route.params.routePath || '/admin/user'
    })
    
    const saveData = async () => {
      const addressValid = await addressRef.value.validateForm()
      const valid = await formRef.value.validate()
      if(!addressValid || !valid){
        return
      } 
      const params = {
        phone:  storageUtil.getPhone(),
        address: addressRef.value.fullAddress,
        origin:'80',//官网
      }
      // const add = '广东省深圳市宝安区福永街道跨越速运集团'
      // const params = {
      //   phone: '13480945675' || storageUtil.getPhone(),
      //   address:add || addressRef.value.fullAddress,
      //   origin:'80',//官网
      // }
      
      const res = await settingApi.getMarketingInfoByAddress(params)
      if(res.code === 48800){
        const flag = await addressRef.value.checkAddressSuggest()
        if(!flag){
          root.$message('详细地址不准确，请填写正确的地址')
        }   
        return    
      }
      state.applyResult = res.data || {}
      state.visibleResult = true
    }

    return {
      addressRef,
      formRef,
      ...toRefs(state),
      beforeRoutePath,
      saveData
    }
  }
}
</script>

<style lang="scss" scoped>
  .customer-code-apply__container {
    /deep/ {
      padding: 0;
      height: 100%;
      .page-header-wrapper {
        background-color: #f5f7fb;
        padding-bottom: 8px;
        .ky-page-header {
          padding: 0 20px;
          background-color: #fff;
          border-bottom: unset;
          border-radius: 0 0 4px 4px;
        }
      }
      .page__content {
        padding: 12px 20px 0;
        .el-form {
          width: 600px;
          .el-form-item {
            margin-bottom: 26px;
            .asterisk-address {
              color: rgb(245, 108, 108);
              top: 2px;
              left: -2px;
              position: relative;
            }
          }
        }
        .ky-button{
          margin-top: 20px;
        }
      }
    }
  }
</style>