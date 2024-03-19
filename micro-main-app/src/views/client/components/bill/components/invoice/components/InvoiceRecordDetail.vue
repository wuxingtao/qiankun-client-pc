<template>
  <div class="clientdialog">
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="700px">
      <div class="content">
        <div class="content-top">
          <el-row :gutter="10">
            <el-col :span="2">
              <div class="label">发票金额</div>
            </el-col>
            <el-col :span="12">
              <div>￥{{invoiceInfo.invoiceAmount}}</div>
            </el-col>
            <el-col :span="2">
              <div class="label">发票类型</div>
            </el-col>
            <el-col :span="6">
              <div>{{invoiceInfo.invoiceForm | formateInvoiceType}}</div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
             <el-col :span="2">
              <div class="label">发票号码</div>
            </el-col>
            <el-col :span="12">
              <div>{{invoiceInfo.invoiceNumber}}</div>
            </el-col>
          </el-row>
        </div>


        <div class="content-bottom">
          <div class="buyer clearfix">
            <div class="title title-top">
              <p>购货方</p>
            </div>
            <div class="content-bottom-right">
              <el-row>
                <el-col :span="5">
                  <div class="label">名称</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.deductionCompanyName}}</div>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="5">
                  <div class="label">纳税人识别号</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.deductionTaxNumber}}</div>
                </el-col>
                <el-col :span="5">
                  <div class="label">地址</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.companyAddress}}</div>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="5">
                  <div class="label">开户行及账号</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.bankName}}</div>
                </el-col>
              </el-row>

            </div>
          </div>
          <div class="seller clearfix">
            <div class="title title-bottom">
              <p>销售方</p>
            </div>

            <div class="content-bottom-right">
              <el-row>
                <el-col :span="5">
                  <div class="label">名称</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.identificationCompany}}</div>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="5">
                  <div class="label">纳税人识别号</div>
                </el-col>
                <el-col :span="19">
                  <div>{{invoiceInfo.carrierTaxNumber}}</div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>

      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data () {
        return {
            title: "发票详情",
            dialogVisible: false,
            invoiceInfo: {},
        }
    },
    filters: {
        formateInvoiceType (type) {
            let invoiceTypeName = type
            switch (type) {
                case '10':
                    invoiceTypeName = '增值专用发票6%'; break
                case '20':
                    invoiceTypeName = '增值运输发票11%'; break
                case '30':
                    invoiceTypeName = '增值普通发票6%'; break
                case '40':
                    invoiceTypeName = '收据'; break
                case '50':
                    invoiceTypeName = '增值运输发票9%'; break
            }
            return invoiceTypeName
        }
    },
    methods: {
        showDialog (values) {
            this.dialogVisible = true
            this.invoiceInfo = values
        }
    }
}
</script>

<style lang="scss" scoped>
  .clearfix {
    &::after {
      content: "";
      display: block;
      clear: both;
    }
  }
  .content {
    height: 358px;
    width: 100%;
    margin-top: 10px;
    .el-col-19 {
      width: 75.16667%;
    }
    .content-top {
      font-size: 12px;
      line-height: 17px;
      color: #333333;
      .el-row{

     margin-bottom: 12px;
      }
      .label {
        color: #999999;
      }
      .el-col-2 {
        width: 9.5%;
      }
    }
    .content-bottom {
      width: 660px;
      margin-top: 22px;
      .title-top {
        height: 150px;
      }
      .title-bottom {
        height: 132px;
      }
      .title {
        float: left;
        > p {
          width: 20px;
          line-height: 30px;
        }
        display: flex;
        align-items: center;
        justify-content: center;
        width: 55px;
        background: #f1f1f5;
        font-size: 22px;
        font-weight: bold;
        color: #333333;
      }
      .content-bottom-right {
        float: left;
        width: 578px;
        // height: 134px;
        padding-left: 25px;
        padding-top: 15px;
        color: #333333;
        .el-row {
          line-height: 30px;
        }
        .label {
          color: #999999;
        }
      }
      .buyer,
      .seller {
        background: #ffffff;
        border: 1px solid #dcdae2;
        border-radius: 4px 4px 0px 0px;
      }
      .seller {
        border-top-width: 0;
        border-radius: 0px 0px 4px 4px;
      }
    }
  }
</style>
