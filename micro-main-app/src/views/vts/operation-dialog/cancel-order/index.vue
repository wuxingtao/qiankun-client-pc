<template>
  <ky-dialog class='confirm-order'
             title='取消订单'
             :visible.sync='cancelOrderVisible'
             width='450px'
             @confirm="dialogConfirm">

    <!-- <Remark isBgColor>
      <div class="vts-actived remark">
        <i class="icon el-icon-warning-outline"></i>
        <span>如确认下单后仍取消订单，需联系销售人员处理</span>
      </div>
    </Remark> -->
    <div class="tips"><i class="el-icon-warning-outline tipicon"></i>确认下单后取消订单，需联系销售人员处理</div>
    <div style="padding-top: 10px;">
      <el-form :model="formCancel"
               ref="formCancel"
               :rules="rules"
               label-width="80px"
               class="cancel-container"
               :validate-on-rule-change="false">
        <el-row>
          <el-form-item label="取消类型"
                        prop="cancelType">
            <el-radio-group v-model="formCancel.cancelType"
                            @change="handleChangeCause">
              <el-radio :label="items.value"
                        v-for="items in cancelSelectList"
                        :key="items.value">
                {{items.label}}
              </el-radio>
            </el-radio-group>
          </el-form-item>

        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="期 望 价"
                          prop="consultPrice"
                          v-show="consultPriceFlag">
              <el-input placeholder="请输入期望价"
                        v-model="formCancel.consultPrice"
                        onkeyup="this.value=this.value.match(/\d+\.?\d{0,2}/);this.dispatchEvent(new Event('input'))"
                        :max="1000000">
                <span slot="suffix"
                      class="el-input__unit">元</span>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="原因描述"
                        prop="cancelCause"
                        class="block"
                        v-show="cancelCauseFlag">
            <el-input placeholder="请填写取消订单的原因"
                      v-model="formCancel.cancelCause"
                      type="textarea"
                      maxlength="60"
                      show-word-limit
                      resize="none">
            </el-input>
          </el-form-item>
        </el-row>
      </el-form>
    </div>

  </ky-dialog>
</template>

<script>
  //   import Remark from '../../../../vts-paper/common/remark'
  import { cancel } from '@/services/api/vts/index'
  //   import { debounce } from '@/utils/validate'
  export default {
    // props: {
    //   detailInfo: {
    //     type: Object,
    //     default: () => { return {} }
    //   }
    // },
    data () {
      var valiConsultPrice = (rule, val, cb) => {
        if (!val && val !== 0) {
          cb(Error('请填写期望价格'))
          return
        }
        if (val && isNaN(val)) {
          cb(Error('仅限数字'))
        } else if (+val < 0 || +val > 10000000) {
          cb(Error(`期望价格范围在${0} ~ ${1000000}元`))
        } else {
          cb()
        }
      }
      var valiCancelCause = (rule, val, cb) => {
        if (val === '') {
          cb(Error('请填写取消原因'))
          return
        } else {
          cb()
        }
      }
      return {
        cancelOrderVisible: false,
        formCancel: {
          cancelType: 100, // 取消类型
          consultPrice: '', // 期望价
          cancelCause: '', // 原因描述
          submitBtnTime: null
        },
        // cancelSelectList: [

        // ],
        consultPriceFlag: true,
        cancelCauseFlag: false,
        validValue: ['cancelType', 'consultPrice'],
        rules: {
          cancelType: [
            { required: true, message: '请选择取消原因', trigger: 'change' }
          ],
          consultPrice: [
            { required: true, validator: valiConsultPrice, trigger: 'change' }
          ],
          cancelCause: [
            { required: true, validator: valiCancelCause, trigger: 'change' }
          ]
        },
        detailInfo: {}
      }
    },
    computed: {
      cancelSelectList () {
        if (+this.detailInfo.orderStatus === 100) {
          return [
            {
              value: 1600,
              label: '报价不及时'
            },
            {
              value: 300,
              label: '暂时不发货'
            },
            {
              value: 800,
              label: '其他原因'
            }
          ]
        } else {
          return [
            {
              value: 100,
              label: '价格太高'
            },
            {
              value: 300,
              label: '暂时不发货'
            },
            {
              value: 800,
              label: '其他原因'
            }
          ]
        }
      }
    },
    // watch: {
    //   'detailInfo.orderStatus' (val) {
    //     console.log(val, '监听');

    //     if (+val === 100) {
    //       this.consultPriceFlag = false
    //       this.cancelCauseFlag = false
    //       this.formCancel.cancelType = 1600
    //     } else {
    //       this.consultPriceFlag = true
    //       this.cancelCauseFlag = false
    //       this.formCancel.cancelType = 100
    //     }
    //   }
    // },
    activated () {
      console.log('初始化');

    },
    components: {
      //   Remark
    },
    methods: {
      // showCancel
      showCancelOrderVisible (val) {
        this.cancelOrderVisible = true
        this.detailInfo = val
        console.log(this.detailInfo, 'detailInfo');
        if (+this.detailInfo.orderStatus == 100) {
          this.consultPriceFlag = false
          this.cancelCauseFlag = false
          this.formCancel.cancelType = 1600
        } else {
          this.consultPriceFlag = true
          this.cancelCauseFlag = false
          this.formCancel.cancelType = 100
        }
      },
      colseCancelOrderVisible () {
        this.formCancel.cancelCause = ''
        this.formCancel.consultPrice = ''
        this.$refs.formCancel.clearValidate(['cancelCause', 'consultPrice'])
        this.cancelOrderVisible = false
      },
      dialogCancel () {
        this.formCancel.cancelCause = ''
        this.formCancel.consultPrice = ''
        this.$refs.formCancel.clearValidate(['cancelCause', 'consultPrice'])
        this.$emit('close')
      },
      // 提交
      async dialogConfirm (formCancel) {
        if (+this.formCancel.cancelType === 100 || this.formCancel.cancelType === '') {
          this.$refs['formCancel'].validateField('cancelType', (valid1) => {
            this.$refs['formCancel'].validateField('consultPrice', (valid2) => {
              if (!valid1 && !valid2) {
                console.log('提交');
                this.submitFN()
              } else {
                console.log('校验失败');
                return false;
              }
            })
          });
        } else if (+this.formCancel.cancelType === 300 || +this.formCancel.cancelType === 1600) {
          this.$refs['formCancel'].validateField('cancelType', (valid1) => {
            if (!valid1) {
              console.log('提交');
              this.submitFN()
            } else {
              console.log('校验失败');
              return false;
            }
          });
        } else if (+this.formCancel.cancelType === 800) {
          this.$refs['formCancel'].validateField('cancelType', (valid1) => {
            this.$refs['formCancel'].validateField('cancelCause', (valid2) => {
              if (!valid1 && !valid2) {
                console.log('提交');
                this.submitFN()
              } else {
                console.log('校验失败');
                return false;
              }
            })
          });
        }
      },
      // 提交
      async submitFN () {
        if (this.submitBtnTime) {
          clearTimeout(this.submitBtnTime)
        }
        this.submitBtnTime = setTimeout(async () => {
          let cancelCause = ''
          if (+this.formCancel.cancelType === 100) {
            cancelCause = `价格太高，期望价${this.formCancel.consultPrice}元`
          } else if (+this.formCancel.cancelType === 300) {
            cancelCause = `暂时不发货`
          } else if (+this.formCancel.cancelType === 800) {
            cancelCause = this.formCancel.cancelCause
          } else if (+this.formCancel.cancelType === 1600) {
            cancelCause = '报价不及时'
          }
          let parmas = {
            cargoOrderCode: this.detailInfo.cargoOrderCode,
            demandOrderCode: this.detailInfo.demandOrderCode,
            cancelCause: cancelCause,
            cancelType: this.formCancel.cancelType,
            consultPrice: this.formCancel.consultPrice
          }
          console.log('执行');
          let _res = await cancel(parmas)
          this.$message.success('订单取消成功')
          this.$emit('close', 'cancelOrder')
        }, 300)
      },
      handleChangeCause (val) {
        switch (val) {
          case 100:
            this.consultPriceFlag = true
            this.cancelCauseFlag = false
            this.validValue = ['cancelType', 'consultPrice']
            break;
          case 300:
            this.consultPriceFlag = false
            this.cancelCauseFlag = false
            this.validValue = ['cancelType']
            break;
          case 800:
            this.cancelCauseFlag = true
            this.consultPriceFlag = false
            this.validValue = ['cancelType', 'cancelCause']
            break;
          case 1600:
            this.cancelCauseFlag = false
            this.consultPriceFlag = false
            this.validValue = ['cancelType']
            break;
          default:
            break;
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .confirm-order {
    .tips {
      font-size: 12px;
      color: #666;
      padding-left: 5px;
      box-sizing: border-box;
      .tipicon {
        color: #faad14 !important;
        margin-right: 5px;
      }
    }
  }
  .cancel-container {
    /deep/ .el-radio__label {
      padding-left: 0 !important;
    }
    /deep/ .el-input__inner {
      height: 30px;
    }
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
    /deep/ .el-textarea {
      margin-top: 10px;
    }
    /deep/ .el-textarea .el-input__count {
      bottom: 4px;
      height: 15px;
      line-height: 15px;
    }
    // /deep/ .el-form-item__label {
    //   font-size: 12px;
    //   line-height: 14px;
    //   padding: 16px 0 10px;
    // }
  }
</style>
