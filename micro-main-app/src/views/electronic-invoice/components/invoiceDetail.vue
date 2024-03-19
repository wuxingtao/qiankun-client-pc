<template>
  <div class="dialog">
    <el-dialog :title="title"
               v-loading="loading"
               :visible.sync="dialogVisible"
               width="444px">
      <div class="title">
        <div class="invoiceInfo">
          <img src="@/assets/image/electronic-invoice/invoiceInfo.png" />
          <span style="padding: 0 5px;">开票中</span>
        </div>
        <div class="message">
          发票将在1个工作日内开具
        </div>
      </div>
      <div class="content">
        <el-form label-width="100px" style="padding-right: 20px;">
          <el-row>
            <el-form-item label="抬头类型" style="margin-bottom: 0;">
              <div>{{!detailInfo.invoiceTitleType?"-":detailInfo.invoiceTitleType===10?'企业':'个人'}}</div>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="发票抬头" style="margin-bottom: 0;">
              <div>{{detailInfo.invoiceTitle||'-'}}</div>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="发票内容" style="margin-bottom: 0;">
              <div>{{detailInfo.invoiceContent||'-'}}</div>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="发票金额" style="margin-bottom: 0;">
              <div>{{detailInfo.invoiceAmount||'-'}}</div>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="电子邮箱" style="margin-bottom: 0;">
              <div>{{detailInfo.email||'-'}}</div>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {getDetail} from '@/services/api/electronic-invoice.js'
import {getCustomerCode} from "@/utils/storage"
export default {
  data () {
    return {
      loading: false,
      title: '发票详情',
      dialogVisible: false,
      detailInfo: {
        invoiceAmount: '',
        invoiceTitle: '',
        invoiceContent: '',
        invoiceTitleType: '',
        email: ''
      }
    }
  },
  created () {

  },
  mounted () {

  },
  methods: {
    // 打开弹框
    openDialog (val) {
      this.dialogVisible = true
      this.getData(val)
    },
    async getData (val) {
      let parms ={
        invoiceSerialNumber: val,
        customerCode: getCustomerCode()
      }
      this.loading =true
      let res = await getDetail(parms)
      if (res.code === 0) {
        this.detailInfo = res.data
      }
      this.loading =false
    }
  }
}
</script>


<style lang="scss" scoped>
  /*.dialog {*/
  /*  /deep/ .el-dialog__header {*/
  /*    padding: 0 20px;*/
  /*    height: 48px;*/
  /*    line-height: 48px;*/
  /*    // border-bottom: 1px solid #f1f1f5;*/
  /*  }*/
  /*  /deep/ .el-dialog__body {*/
  /*    padding: 12px 20px;*/
  /*  }*/
  /*  /deep/ .el-form-item {*/
  /*    margin-bottom: 0;*/
  /*    margin-top: 6px;*/
  /*    /deep/ .el-form-item__label {*/
  /*      font-family: PingFangSC-Regular;*/
  /*      font-size: 12px;*/
  /*      color: #333333;*/
  /*      text-align: left;*/
  /*      width: 100%;*/
  /*    }*/
  /*    /deep/ .el-input {*/
  /*      font-size: 12px;*/
  /*    }*/
  /*  }*/
  /*}*/
  .title {
    background-color: #fafafa;
    width: 404px;
    height: 76px;
    .invoiceInfo {
      padding-left: 16px;
      padding-top: 16px;
      font-size: 18px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: 500;
      text-align: left;
      color: #7c57df;
    }
    .message {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #333333;
      line-height: 18px;
      padding-left: 38px;
      padding-top: 10px;
    }
  }
  .content {
    display: flex;
    .labels {
      width: 110px;
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #999999;
      line-height: 28px;
    }
    .values {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #333333;
      line-height: 28px;
    }
  }
</style>
