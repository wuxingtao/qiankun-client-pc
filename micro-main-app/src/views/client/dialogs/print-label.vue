<template>
  <div class="clientdialog page-style1">
    <ky-dialog title="补打取货标签" :visible.sync="dialogVisible" :close-on-click-modal="false" width="380px">
      <div class="dialog-body" v-loading="loading">
        <div class="row-info">
          运单号：{{waybills&& waybills.ydNo}}
        </div>
        <el-form ref='form' :model="formData" :rules="formRules">
          <div>
            <el-form-item label="打印件数" prop="number">
              <el-input size="medium" clearable placeholder="请输入" v-model="formData.number" maxlength="5">
                <template slot="append">(件)
                </template></el-input>
            </el-form-item>
            <!-- <p style="color:#666;padding:12px 0;">打印件数</p>
            <el-input size="medium" clearable placeholder="请输入" v-model="number" maxlength="5" oninput="value=value.replace(/^\.+|[^\d.]/g,'')">
              <template slot="append">(件)
              </template></el-input> -->
            <p style="colo:#999;padding:4px 0;">(打印件数为最终发货件数)</p>
          </div>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm" :loading="loading"> 确定</el-button>
      </span>
    </ky-dialog>
  </div>
</template>

<script>
import { updateYdNumber,getSecurityCodeList } from '@/services/api/waybillOld'
import dayjs from 'dayjs'
import { mapGetters ,mapState} from 'vuex'
import {getPrinters} from '@/services/api/common'
import {  printTagByCloudPrinter } from '@/utils/clientUtil'
import { getCustomerCode } from '@/utils/storage'

export default {
  name: 'PrintLabel',
  data () {
    return {
      loading: false,
      waybills: {},
      dialogVisible: false,
      callback: null,
      printerInfo: [],
      formData: {
        number: ''
      },
      formRules: {
        number: [
          {
            required: true,
            type: 'integer',
            message: '请输入大于零的整数',
            transform (value) {
              return Number(value)
            },
            min: 1,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    showDialog (waybills, callback) {
      this.waybills = waybills[0]
      this.dialogVisible = true
      this.callback = callback
      this.formData.number = ''
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
      this.getPrinters()
    },
    async confirm () {
     
      const params = {
        ydCode: this.waybills.ydNo,
        ydStatus: this.waybills.ydStatus,
        number: this.formData.number,
        hasPrint: this.waybills.type === '是'
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          const printerModel=this.printerInfo.find(m=>m.printerId===this.printConfig.printModel)
          if(!this.printConfig.printModel||this.printerInfo.length===0||!printerModel){
            this.$message('未设置标签打印机')
            return
          }
          if(printerModel&&printerModel.printerStatus===0){
            this.$message('标签打印机离线')
            return
          }
          let res =await  updateYdNumber(params)
          console.log(res)
          if (res.code === 0) {
            
            this.dialogVisible = false
            this.callback && this.callback()
            this.$message.success(res.msg)
            this.printTag()
          } else {
            console.log('res.msg :>> ', res.msg)
            this.$message.error(res.msg)
          }
          this.loading = false
        } else {
          this.loading = false
        }
      })

    },
    async getPrinters(){
      let res = await getPrinters({ companyNo: getCustomerCode() })
      if (res.data && res.data.dataList.length > 0) {
        res.data.dataList.forEach(item => {
          if(item.modelType!==0){
            this.printerInfo.push({
              printerId:item.printerId,
              printerStatus:item.printerStatus
            })
          }
        })
      }
    },
    async printTag()
    {
      
      this.waybills.count=this.formData.number
      //获取防伪码
      const result2= getSecurityCodeList([
        {
          waybillNumber:this.waybills.ydNo,
          printTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
          startPage:1,
          endPage:Number(this.waybills.count),
          count:Number(this.waybills.count),
        }])

      if(result2.code===0&&result2.data&&result2.data.waybillSecurityCodeList)
      {
        const list=result2.data.waybillSecurityCodeList
        list.forEach(el=>{
          const model = this.waybills.find(m=>m.ydNo===el.split('|')[0])
          model && (model.ydNo = el)
        })
      }
      
     
      const params=JSON.parse(JSON.stringify([ {
        YDCode:this.waybills.ydNo,
        SJCompany:this.waybills.sjCompany,
        ServerModel:this.waybills.serviceWay,
        Pages:this.formData.number,
        SJQH:this.sjQH||'',
        EndAirport:this.waybills.destAirport,
        BelongStation:''
      }]))
      printTagByCloudPrinter(params,this.printConfig.printModel)
      // this.$native.printTag(
      //   params,this.authorityIds+''
      // )
    }
  },
  computed:{
    ...mapGetters([
      'authorityIds' // '054' B2B 字母单权限
    ]),
    ...mapState('client', ['printConfig'])
  }
 
}
</script>

<style lang="scss" scoped>
  .dialog-body {
    .row-info {
      height: 40px;
      line-height: 40px;
      background: #f6f3ff;
      //   border: 1px solid rgba(90, 199, 144, 0.9);
      font-size: 14px;
      color: #424242;
      font-weight: bold;
      border-radius: 4px;
      padding-left: 16px;
      margin-bottom: 24px;
    }
  }
</style>