<template>
  <ky-dialog title="货物绿码" :visible.sync="dialogVisible" width="500px" class="green-dialog">
    <div class="green-code">
      <div class="tips">{{tips}}</div>
      <el-image v-for="(item,index) in urls" :key="index" :src="item" class="green-image" :preview-src-list="urls" fit="cover"></el-image>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="dialogVisible = false">我知道了</el-button>
    </span>
  </ky-dialog>
</template>
<script>
import waybillApi from '@/services/api/waybill'
export default {
  name: 'green-code-image',
  data () {
    return {
      dialogVisible: false,
      urls: [
        require('@assets/image/waybill/gree-code-default.png')
      ],
      tips:'由于您的寄件地址涉及疫情区域，我们将为您的货物进行消杀，请您放心！'
    }
  },
  methods: {
    showDialog (val) {
      this.getImages(val)
      this.dialogVisible = true
    },
    async getImages (nodeCode) {
      try {
        let vo = {
          bizId: nodeCode
        }
        let params = {
          vo: vo,
          page: 1,
          pageSize: 10
        }
        let res = await waybillApi.getKillImage(params)
        if(res.data?.isDefault==0){
          this.tips='由于您的寄件地址涉及疫情区域，我们已将您的货物消杀完毕，请您放心!'
        }else{
          this.tips='由于您的寄件地址涉及疫情区域，我们将为您的货物进行消杀，请您放心！'
        }
        this.urls = res.data?.rows?.length > 0 ? [res.data.rows.map(el => el.url)[0]] : [
          require('@assets/image/waybill/gree-code-default.png')
        ]
      } catch {
        this.urls = [
          require('@assets/image/waybill/gree-code-default.png')
        ]
      }

    }
  }
}
</script>
<style lang="scss" scoped>
  .green-dialog {
    /deep/ .el-dialog {
      max-height: calc(100% - 67px);
      .el-dialog__body {
        padding: 0px 0 14px;
        margin: 16px 4px 0 20px;
      }
    }

    .green-code {
      .tips {
        font-size: 14px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: left;
        color: #03050d;
        line-height: 20px;
        padding-bottom: 11px;
      }
      .green-image {
        width: 460px;
        height: 242px;
        padding: 6px 0;
      }
    }
  }
</style>