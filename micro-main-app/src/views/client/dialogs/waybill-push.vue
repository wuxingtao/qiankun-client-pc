<template>
  <div class="clientdialog">
    <el-dialog title="推送运单" :visible.sync="dialogVisible" :close-on-click-modal="false" width="544px">
      <div class="dialog-body">
        <div class="tip">请选择推送运单需加密信息：</div>
        <el-form ref='form' :model="formData" :rules="formRules" label-position="right" label-width="88px">
          <el-form-item label="寄方信息：" prop="senderInfo">
            <el-checkbox-group v-model="formData.senderInfo" >
              <el-checkbox label="showJJCompanyname" >寄方</el-checkbox>
              <el-checkbox label="showJJPeople">寄件人</el-checkbox>
              <el-checkbox label="showJJMobile">寄件手机</el-checkbox>
              <el-checkbox label="showJJTelphone">寄件电话</el-checkbox>
              <el-checkbox label="showJJAddress">寄件地址</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="收方信息：" prop="reciverInfo">
            <el-checkbox-group v-model="formData.reciverInfo"  >
              <el-checkbox label="showCompanyname">收方</el-checkbox>
              <el-checkbox label="showRecPeople">收件人</el-checkbox>
              <el-checkbox label="showRecMobile">收件手机</el-checkbox>
              <el-checkbox label="showRecTelphone">收件电话</el-checkbox>
              <el-checkbox label="showRecAddress">收件地址</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="推送至：" class="phone-wrap" prop="phone">
            <el-input v-model="formData.phone" clearable placeholder="请输入客户端账号（11位手机号码）" maxlength="11"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { pushWaybill } from '@/services/api/waybillOld'
import Regular from '@utils/regular'
export default {
  name: 'WaybillPush',
  data() { 
    return {
      loading: false,
      waybills: [],
      dialogVisible: false,
      callback:null,
      formData: {
        senderInfo: [],
        reciverInfo:[],
        phone:''
      },
      formRules: {
        phone: [{required: true, pattern: Regular.mobileNumber, message: '请输入正确的手机号' ,trigger: 'blur' }], 
      }
    }
  },
  methods: {
    showDialog(waybills,callback) { 
      this.waybills = waybills
      this.callback=callback
      this.dialogVisible = true
      this.$nextTick(()=>this.$refs.form.resetFields())
    },
    saveData() {
      try {
        this.loading = true
        this.$refs.form.validate(async valid => {
          if (valid) {
            const fields=  ['recommendedPhone','showCompanyname','showRecAddress','showRecPeople','showRecMobile','showRecTelphone','showJJTelphone',
              'showJJMobile','showJJPeople','showJJAddress','showJJCompanyname']
            let params=fields.reduce((obj,cur)=>{
              obj[cur]=(this.formData.senderInfo.includes(cur)||this.formData.reciverInfo.includes(cur))?1:0 
              return obj},{})
            params.recommendedPhone=this.formData.phone
            params.ids=this.waybills.map(m=>({id:m.id}))
            let res=await pushWaybill(params)
            if(res.code==0){ 
              this.$message.success('运单推送成功')
              this.dialogVisible=false 
              this.callback&&this.callback()
            }
                       
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-body {
    .tip {
      margin-bottom: 19px;
    }
    .el-checkbox {
      margin-right: 16px;
    }
     .el-checkbox:last-of-type {
      margin-right: 0;
    }
    /deep/ {
      .el-form-item {
        margin-bottom: 13px;
        .el-checkbox__label {
          padding-left: 8px;
        }
       .el-form-item__label, .el-form-item__content {
          line-height: 20px;
        }
        .el-input {
          width: 321px;
        } 
      }
      .phone-wrap {
        padding-top: 4px;
        /deep/ .el-form-item__label {
            line-height: 36px ;
          }
        }
    }
  }
</style>
