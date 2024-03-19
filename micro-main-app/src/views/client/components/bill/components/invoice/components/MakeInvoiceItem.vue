<template>
  <div>
    <div class="container"
         ref="container">
      <div class="invoice">
        <div class="title-container">
          <div class="eclipase eclipase-outside"> </div>
          <div class="eclipase eclipase-innerside"> </div>
          <h1 class="invoice-title">增值税发票信息</h1>
          <div @click="handDelete"><i class="el-icon-delete icon-delete"></i></div>
        </div>

        <div class="invoice-amount">
          开票金额：
          <div style="display:inline-block;height:32px;width:60px;">
            <el-form :model="invoiceInfo"
                     :rules="rules">
              <el-form-item prop="invoiceAmount">
                <el-input v-model="invoiceInfo.invoiceAmount"
                          maxlength="10"
                          v-on:input="handleOnAmountInput(invoiceInfo.invoiceAmount)"
                          @keydown.native="keyup"
                          placeholder="请输入开票金额">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>

        </div>

        <div class="invoice-detail">
          <div class="invoice-detail-top">
            <el-row>
              <el-col :span="5">
                <div class="label">购货方名称：</div>
              </el-col>
              <el-col :span="9">
                <el-tooltip   effect="dark" :content="invoiceInfo.deductionCompany" placement="top">
                <div class="text-display">{{invoiceInfo.deductionCompany}}</div>
                </el-tooltip>
              </el-col>
              <el-col :span="4">
                <div class="label">开票类型：</div>
              </el-col>
              <el-col :span="6">
                <div>{{invoiceInfo.invoiceTypeName}}</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="5">
                <div class="label">纳税人识别号：</div>
              </el-col>
              <el-col :span="9">
                <div>{{invoiceInfo.deductionTax}}</div>
              </el-col>
              <div v-show="isShowMore">
                <el-col :span="4">
                  <div class="label">开户银行：</div>
                </el-col>
                <el-col :span="6">
                  <div>{{invoiceInfo.invoiceOpenBank}}</div>
                </el-col>
              </div>
            </el-row>
            <el-row>

              <el-col :span="5">
                <div class="label"> {{ isShowMore?'开户帐号：':'收票人地址：'}}</div>
              </el-col>
              <el-col :span="19">
                <div>{{isShowMore?invoiceInfo.invoiceOpenAccount:invoiceInfo.receiverAddress}}</div>
              </el-col>
            </el-row>
          </div>
          <div v-show="isShowMore"
               class="invoice-detail-bottom"
               ref="invoiceDetailBottom">
            <el-row>
              <el-col :span="5">
                <div class="label">收票人姓名：</div>
              </el-col>
              <el-col :span="19">
                <div>{{invoiceInfo.invoiceReceiver}}</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="5">
                <div class="label">收票人地址：</div>
              </el-col>
              <el-col :span="19">
                <div>{{invoiceInfo.receiverAddress}}</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="5">
                <div class="label">收票人电话：</div>
              </el-col>
              <el-col :span="19">
                <div>{{ invoiceInfo.invoiceReceiverPhone}}</div>
              </el-col>
            </el-row>

          </div>
          <div class="invoice-detail-more"
               @click="isShowMore=!isShowMore">
            <i class="el-icon-d-arrow-left icon-more"
               ref="iconMore"></i> </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>

export default {
  props: ['invoiceInfo', 'remainingAmount', 'isShowMore2', 'index'],
  data () {
    var validInvoiceAmount = (rule, value, callback) => {
      if (parseFloat(value) <= 0) {
        callback(new Error("开票金额必须大于0"))
      } else {
        callback()
      }
    }
    return {
      isShowMore: this.isShowMore2,
      rules: {
        invoiceAmount: [
          { required: true, message: "开票金额不能为空", trigger: "blur" },
          { validator: validInvoiceAmount, trigger: "blur" }
        ]
      },
    }
  },
  methods: {
    handDelete () {
      this.isShowMore = false
      this.$emit('onDeletedItem', this.index)
    },
    keyup (e) {
      let keyCode = e.keyCode
      if (!this.isNumberKeyCode(keyCode)) {
        e.preventDefault()
        return
      }
      let inputValue = this.invoiceInfo.invoiceAmount + ''
      if ((keyCode === 110 || keyCode === 190) && (!inputValue || inputValue.indexOf('.') > -1)) {
        e.returnValue = false
      }
    },
    isNumberKeyCode (keyCode) {
      // 数字
      if (keyCode >= 48 && keyCode <= 57) return true
      // 小数字键盘
      if (keyCode >= 96 && keyCode <= 105) return true
      // Backspace, del, 左右方向键
      if (keyCode == 8 || keyCode == 46 || keyCode == 37 || keyCode == 39) return true
      //小数点
      if (keyCode == 110 || keyCode == 190) return true
      return false
    },
    handleOnAmountInput (val) {
      if ((val + '').startsWith('.')) {
        this.invoiceInfo.invoiceAmount = ''
        return
      }
      this.invoiceInfo.invoiceAmount = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
      this.$emit('onInvoiceAmountChanged', this.invoiceInfo.invoiceAmount)
      if (this.remainingAmount < 0 || this.invoiceInfo.invoiceAmount > this.remainingAmount) {
        this.$message({
          message: `开票金额不能大于剩余总金额${+ this.remainingAmount}`
        })
        this.invoiceInfo.invoiceAmount = ''
      }
    },
  },
  created () {
    this.invoiceInfo["invoiceAmount"] = 0
  },
  mounted () {
    this.isShowMore = false
  },
  watch: {
    isShowMore (visible) {
      this.$refs.iconMore.style.transform = `rotate(${visible ? 90 : 270}deg)`
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    width: 480px;
    margin-top: 16px;
    position: relative;
  }
.text-display {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      }

  .invoice {
    background: rgba(216, 216, 216, 0);
    border: 1px solid #dcdae2;
    border-radius: 4px;
    .title-container {
      position: relative;
      height: 40px;
      width: 100%;
      top: 12px;
      .icon-delete {
        cursor: pointer;
        color: #999999;
        font-size: 18px;
        position: absolute;
        right: 18px;
        top: 5px;
      }
      .eclipase {
        border: 1px solid #ff6262;
        border-radius: 50%/50%;
        position: absolute;
      }
      .eclipase-outside {
        width: 95px;
        height: 40px;
        top: 0;
        left: 193px;
      }
      .eclipase-innerside {
        width: 89px;
        height: 34px;
        top: 3px;
        left: 196px;
      }
      .invoice-title {
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        text-align: center;
        position: absolute;
        top: 14px;
      }
    }

    .invoice-amount {
      font-size: 15px;
      font-weight: bold;
      color: #333333;
      padding-left: 16px;
      margin-top: 31px;
      margin-bottom: 11px;
      /deep/.el-input__inner {
        height: 32px;
        width: 129px;
        margin-left: 8px;
      }
      .el-input-group__append {
        padding: 0 8px;
      }
    }
    .invoice-detail {
      padding-left: 16px;
      font-size: 12px;
      line-height: 17px;
      color: #333333;
      .label {
        color: #999999;
      }
      .el-row {
        height: 21px;
      }
      .el-col-4 {
        width: 13.6%;
      }
      .el-col-5 {
        width: 19%;
      }
      .el-col-6 {
        width: 29%;
      }
      .invoice-detail-bottom {
        margin-top: 24px;
      }
      .invoice-detail-more {
        width: 448px;
        height: 20px;
        padding-top: 5px;
        padding-bottom: 5px;
        text-align: center;
        bottom: 2px;
        .icon-more {
          cursor: pointer;
          transform: rotate(90deg);
          color: #999999;
          font-size: 16px;
        }
      }
    }
  }
  /deep/.el-form-item__error {
    top: 20%;
    left: 200px;
    width: 150px;
  }
</style>
