<template>
    <div class="index-find_r">
        <el-form ref="form"
                 label-width="120px"
                 :model="form"
                 >
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="付款公司：">
                        <el-input disabled :placeholder="user.customerName" style="width: 100%;"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="寄件区号：">
                        <el-input clearable
                                  style="width: 100%;"
                                  v-model="form.beginAreaCode"
                                  placeholder="寄件区号">
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="收件区号：">
                        <el-input clearable
                                  style="width: 100%;"
                                  v-model="form.endAreaCode"
                                  placeholder="收件区号"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="服务方式：">
                        <el-select
                                style="width: 100%;"
                                v-model="form.serviceType"
                                placeholder="服务方式">
                            <template v-for="item in options">
                                <el-option :key="item.value"
                                           :label="item.displayText"
                                           :value="item.value"/>
                            </template>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-form-item style="text-align: center">
                    <el-button type="primary" size="medium" round @click="submitForm('form')">查询</el-button>
                    <el-button size="medium" round @click="resetForm('form')">重置</el-button>
                </el-form-item>
            </el-row>
        </el-form>
    </div>
</template>
<script>
import {getUserData} from "@/utils/storage"
import { getServiceAll} from '@/services/api/customer'
export default {
  data () {
    return {
      user:  {},
      options: [],
      form: {
        beginAreaCode: '',
        endAreaCode: '',
        serviceType: '',
      },
    }
  },
  created () {
    let user = getUserData()
    if(user){
      this.user = user.customerInfo
    }
    this.getServiceType()
  },
  methods: {
    async getServiceType () {
      if(!this.user) return
      let postData = {
        companyNo: this.user.customCode
      }
      let res = await getServiceAll(postData)
      if (res.code === 0) {
        let { serviceWay } = res.data
        this.options = serviceWay
        /** 默认选中第一个服务方式 */
        if(this.options&&this.options.length>0) {
          this.form.serviceType = this.options[0].value
        }
        this.submitForm()
      }
    },
    submitForm () {
      const newForm = {...this.form, serviceType: `${this.form.serviceType}` }
      this.$emit('find', newForm)
    },
    resetForm (formName) {
      this.form= {
        beginAreaCode: '',
        endAreaCode: '',
        serviceType: '',
      }
      if(this.options&&this.options.length>0){
        this.form. serviceType=  this.options[0].value
      }
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style lang="scss">
    .index-find_r {
        .el-input__inner {
            background: #eef3fc;
            border-radius: 18px;
            border: 0 !important;
        }
    }
</style>
