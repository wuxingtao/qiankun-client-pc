<template>
  <section>
    <ky-dialog class='confirm-order page-style1'
               title='确认下单'
               :visible.sync='confirmOrderVisible'
               width='460px'
               @confirm="handleConfirm">
      <el-form label-position="top"
               label-width="80px"
               ref="confirmOrderInfo"
               :model="confirmOrderInfo"
               :validate-on-rule-change="false">
        <div class="form-box top">
          <div class="imgbox">
            <img src="../../../../assets/image/vts/sendpic.png"
                 alt="">
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="寄件人"
                            prop="orderAddresserName"
                            :rules="orderAddresserName">
                <el-input v-model="confirmOrderInfo.orderAddresserName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话"
                            prop="orderAddresserPhone"
                            :rules="orderAddresserPhone">
                <el-input v-model="confirmOrderInfo.orderAddresserPhone"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="form-box top stop-top"
             v-for="(o,i) in confirmOrderInfo.stopValue"
             :key="i">
          <div class="stop-address">
            <b>经停{{confirmOrderInfo.stopValue.length===1?'地':i+1}}：</b> {{o.addressInfo}}
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="联系人"
                            :prop="`stopValue.${i}.contactName`"
                            :rules="orderAddresserName">
                <el-input v-model="o.contactName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话"
                            :prop="`stopValue.${i}.contactPhone`"
                            :rules="orderAddresserPhone">
                <el-input v-model="o.contactPhone"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="form-box">
          <div class="imgbox">
            <img src="../../../../assets/image/vts/receivepic.png"
                 alt="">
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="收件人"
                            prop="orderContactName"
                            :rules="orderContactName">
                <el-input v-model="confirmOrderInfo.orderContactName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话"
                            prop="orderContactPhone"
                            :rules="orderContactPhone">
                <el-input v-model="confirmOrderInfo.orderContactPhone"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <!-- 加载 -->
      <div class="jj-mask"
           v-loading="loading"
           v-if="loading">
      </div>
    </ky-dialog>

  </section>
</template>

<script>
  import { Regular } from '@/views/vts/utils'
  import { fetchInternalPhoneNumber, configOrder, getStopover } from '@/services/api/vts/index'
  import { clearTimeout, setTimeout } from 'timers';
  export default {
    // props: {
    //   detailInfo: {
    //     type: Object,
    //     required: true
    //   }
    // },
    data () {
      return {
        confirmOrderVisible: false,
        loading: false,
        confirmOrderInfo: {
          orderAddresserName: '',
          orderAddresserPhone: '',
          orderContactName: '',
          orderContactPhone: '',
          stopValue: [],
          startId: '',
          endId: ''
        },
        btnTime: null,
        detailInfo: {}
      }
    },
    computed: {
      //  表单校验
      orderAddresserName () {
        return {
          required: true,
          validator: this.validorderAddresserName,
          trigger: 'blur'
        }
      },
      orderAddresserPhone () {
        return {
          required: true,
          validator: this.validFetchInternalPhoneNumber,
          trigger: 'blur'
        }
      },
      orderContactName () {
        return {
          required: true,
          validator: this.validorderAddresserName,
          trigger: 'blur'
        }
      },
      orderContactPhone () {
        return {
          required: true,
          validator: this.validFetchInternalPhoneNumber,
          trigger: 'blur'
        }
      }
    },
    methods: {
      async showConfirmOrderVisible (val) {
        let res = await getStopover({ demandOrderCode: val.demandOrderCode })
        this.detailInfo = { ...val }
        this.confirmOrderVisible = true
        this.confirmOrderInfo.orderAddresserName = val.orderAddresserName
        this.confirmOrderInfo.orderAddresserPhone = val.orderAddresserPhone
        this.confirmOrderInfo.orderContactName = val.orderContactName
        this.confirmOrderInfo.orderContactPhone = val.orderContactPhone
        // TODO
        // 获取始发、目的地ID以及经停地信息
        this.confirmOrderInfo.startId = res.data.find(item => +item.locationTypeCode === 1).locationId
        this.confirmOrderInfo.endId = res.data.find(item => +item.locationTypeCode === 3).locationId
        this.confirmOrderInfo.stopValue = res.data.filter(item => +item.locationTypeCode === 2)
      },
      closeConfirmOrderVisible () {
        this.confirmOrderVisible = false
      },
      // 校验是否内部员工手机号
      async validFetchInternalPhoneNumber (rule, val, cb) {
        let regular = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
        if (val === '') cb(new Error('请填写11位手机号'))
        if (!regular.test(val)) cb(new Error('请填写正确的手机号'))
        let _res = await fetchInternalPhoneNumber({ phone: val })
        let _inside = _res.data.inside
        if (_inside) {
          cb(new Error('该手机号是内部员工手机号'))
        } else {
          cb()
        }
      },
      // 提交下单
      handleConfirm () {
        console.log('提交');
        this.$refs['confirmOrderInfo'].validate((valid) => {
          if (valid) {
            if (this.btnTime) {
              clearTimeout(this.btnTime)
            }
            this.btnTime = setTimeout(() => {
              this.save()
            }, 500)
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      async save () {
        this.loading = true
        console.log('this.confirmOrderInfo.stopValue', this.confirmOrderInfo.stopValue)
        let { startId, orderAddresserName, orderAddresserPhone, endId, orderContactName, orderContactPhone, stopValue } = this.confirmOrderInfo
        // 弄一个副本，避免污染数据源
        let stopValueTmp = [].concat(stopValue)
        // 加入目的地
        stopValueTmp.push({
          locationId: endId,
          contactName: orderContactName,
          contactPhone: orderContactPhone
        })
        // 加入始发地
        stopValueTmp.unshift({
          locationId: startId,
          contactName: orderAddresserName,
          contactPhone: orderAddresserPhone
        })
        // 拼接请求参数
        let params = {
          demandOrderCode: this.detailInfo.demandOrderCode,
          addresserName: orderAddresserName,
          addresserPhone: orderAddresserPhone,
          contactName: orderContactName,
          contactPhone: orderContactPhone,
          confirmLocationVos: stopValueTmp
        }
        try {
          console.log('params', params)
          let res = await configOrder(params)
          console.log(res, '确认下单');
          this.loading = false
          this.$emit('close', 'configOrder')
        } catch (error) {
          console.log(error);
          this.loading = false
        }
      },
      //校验
      validorderAddresserName (rule, value, callback) {
        console.log(value, 'value')
        if (value) {
          if (/^(?![0-9]+$)[\u4E00-\u9FFFa-zA-Z0-9]{2,10}$/.test(value)) {
            callback()
          } else {
            callback(Error('请输入2-10位合法的名称'))
          }
        } else {
          callback(Error('请输入姓名'))
        }
      }
    },
    beforeDestroy () {
      clearTimeout(this.btnTime)
    }
  }
</script>

<style lang="scss" scoped>
  .confirm-order {
    /deep/ {
      @include loading;
    }
    .form-box {
      min-height: 98px;
      width: 100%;
      background-color: #fdfcff;
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      padding-top: 12px;
      box-sizing: border-box;
      border: 1px solid #f5f5f5;
      border-radius: 4px;
      position: relative;
      .imgbox {
        width: 72px;
        height: 18px;
        position: absolute;
        top: 0;
        left: 0;
        img {
          width: 100%;
        }
      }
      .stop-address {
        // position: absolute;
        top: 8px;
        left: 8px;
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
        b {
          font-size: 12px;
        }
      }
      /deep/ .el-form-item {
        margin-bottom: 0 !important;
        display: inline-block !important;
      }
    }
    .top {
      margin-bottom: 20px;
      padding: 0 20px;
    }
    .stop-top {
      padding: 10px 20px 18px 20px;
    }
    /deep/ .el-input__inner {
      background-color: #fdfcff;
    }
    /deep/ .el-form-item__label {
      padding-bottom: 0 !important;
      color: #666;
      font-size: 12px;
    }

    /deep/ .el-form-item__content {
      line-height: 32px !important;
    }
    .jj-mask {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      /deep/ .el-loading-spinner {
        left: 25% !important;
        top: 30% !important;
      }
    }
  }
</style>
