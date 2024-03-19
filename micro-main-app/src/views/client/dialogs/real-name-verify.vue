<template>
  <div class="clientdialog">
    <el-dialog title="实名认证" :visible.sync="dialogVisible" :close-on-click-modal="false" width="600px">
      <div class="dialog-body">
         <div class="text-wrap">
           <h3>关于跨越速运执行寄收快递实名认证通知</h3>
           <p>尊敬的客户</p>
           <p>您好！</p>
           <p>接国家邮政局重要通知，根据《邮政行业安全监督管理办法》规定，跨越速运集团有限公司（以下简称：跨越速运）在取收件时，严格执行国家政策法规，全面实施实名制寄收件，对寄件者身份证信息进行登记。</p>
           <p>为保障《邮政行业安全监督管理办法》顺利实施，高效操作，节约客户时间。跨越速运采用先进的科技手段进行信息登记，同一发件人只登记一次，简化实名认证流程。</p>
           <p>快递实名制是国家对快递行业的统一规定，旨在保护客户信息安全，行业健康发展。跨越速运将全面执行，为广大客户提供优质、高效的快递服务。</p>
           <p>请广大客户配合，谢谢！</p>
           <div>跨越速运集团有限公司</div>
         </div>
         
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script> 
import SkuInfoItem from "@client/components/SkuInfoItem"
export default {
  name: "SkuInfo",
  components: {
    SkuInfoItem
  },
  props: {
    sizeList: { type: [Array,String] },
    goodsInfo: { type: String },
    skuList:{type:Array}
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
           
      formData: {
        list: [
          { GoodsName: "", GoodsWeight: "", GoodsNumber: "", GoodsSize: "" }
        ]
      }
    }
  },  
  methods: {
    showDialog() {
      this.dialogVisible = true 
            
    },
      
    saveData() {
      try {
        this.loading = true 
        if(!this.checkData()){
          this.$message.warning('数据格式不正确，请修改')
          return
        }
        this.dialogVisible=false  
      } finally {
        this.loading = false
      }
    }, 
  }
}
</script>

<style lang="scss" scoped>
  .dialog-body { 
  }
</style>
