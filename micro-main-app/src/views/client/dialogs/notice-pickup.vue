<template>
  <div class="clientdialog page-style1">
    <el-dialog title="通知司机取货" :visible.sync="dialogVisible" :close-on-click-modal="false" width="736px" append-to-body>
      <div class="dialog-body" v-loading="loading">
        <div class="row-info">
          已选运单：{{ waybills && waybills.length }}票
        </div>
        <el-form ref='form' :model="formData" :rules="formRules">

          <el-row :gutter="16">
            <el-col :span="isVipshopUser?7:8">
              <div v-if="goodsBatchTimes.length>0">
                <div class="goodsTime">
                  <el-form-item label="货好时间" prop="hhDate">
                    <el-date-picker prefix-icon="iconfont icon-purple_calendar" class="hhDate" v-model="formData.hhDate"
                                    type="date" placeholder="选择日期" style="width:130px;" format="yyyy/MM/dd">
                    </el-date-picker>
                  </el-form-item>
                  <el-select size="medium" v-model="formData.goodsTime" class="goodsBatchTimes">
                    <el-option v-for="item in goodsBatchTimes" :key="item" :label="item" :value="item">
                    </el-option>
                  </el-select>
                </div>
              </div>
              <div v-else>
                <el-form-item label="货好时间" prop="hhDateTime">
                  <el-date-picker size="small" prefix-icon="iconfont icon-purple_calendar" v-model="formData.hhDateTime"
                                  type="datetime" placeholder="选择日期时间" format="yyyy/MM/dd HH:mm">
                  </el-date-picker>
                  <span slot="error" slot-scope="scope" class="el-form-item__error" v-tip="scope.error">
                    {{ scope.error }}
                  </span>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="isVipshopUser?7:8">
              <el-form-item label="预估总重量" prop="Weight" maxlength="10">
                <el-input v-model="formData.Weight" size="medium" clearable placeholder="请输入" @blur="showBigCarInfo"
                          v-kyerestrict.float maxlength=7>
                  <template slot="append">(kg)</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="isVipshopUser?7:8">
              <el-form-item label="预估总件数" prop="Number" maxlength="10">
                <el-input v-model="formData.Number" size="medium" clearable placeholder="请输入" @blur="showBigCarInfo"
                          v-kyerestrict.positive maxlength=5>
                  <template slot="append">(件)</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="isVipshopUser?3:0">
              <el-checkbox v-if="isVipshopUser" v-model="formData.isBulkGoods" class="bulk-goods">大货入仓</el-checkbox>
            </el-col>
          </el-row>
          <div v-show="tableData.length>0&&overload" class="bigCar_content">
            <div> 大票货</div>
            <div class="bigCar_tip">由于您取货地址的运单货物较大，我司可能安排挂车取件，请确认货物所处位置<span style="color:#F13E3E;">是否可以正常出入挂车</span>（长17.5m*宽2.65m*高2.9m）
            </div>
            <el-table :data="tableData" class="client-common-table" border style="width:100%" height="100%">
              <el-table-column prop="qHAddress" label="取货地址" width="520">
              </el-table-column>
              <el-table-column prop="name" label="出入挂车" width="176">
                <template slot-scope="scope">
                  <el-radio v-model="scope.row.isSupport" label="true">支持</el-radio>
                  <el-radio v-model="scope.row.isSupport" label="false">不支持</el-radio>
                </template>
              </el-table-column>

            </el-table>
          </div>

          <el-form-item label="取货备注" prop="orderRemark">
            <el-input type="textarea" :rows="3" v-model="formData.orderRemark" resize="none" clearable
                      placeholder="给司机小哥捎句话" maxlength="100" show-word-limit></el-input>
          </el-form-item>
        </el-form>
        <div class="historyRemark">
          <div>历史备注</div>
          <div v-for="(item,index) in historyRemarkList" :key="index" class="remarkItem">
            <el-button size="medium" round @click="setRemark(item)">
              {{ item.length > 20 ? item.slice(0, 19) + '...' : item }}
            </el-button>
          </div>
        </div>
        <!-- <div class="img-wrap">
          <el-image :src="require('../../../assets/image/admin/wechatOfficalAccount.png')" />
          <div>关注公众号，物流信息实时推送方便查件</div>
        </div> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <div class="footer-left">
          <el-checkbox class="checkbox" v-model="agreementChecked"></el-checkbox>
          <div @click="visibleOfTerms=true" style="cursor:pointer">
            <span>我已阅读并同意</span>
            <span class="spec">《电子运单服务使用协议》</span>
          </div>
        </div>
        <div class="footer-right">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirm" :loading="loading"> 确定</el-button>
        </div>
      </span>

      <!-- 电子运单协议 -->
      <ky-electronic :visible.sync="visibleOfTerms"></ky-electronic>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { placeOrder, getNightPickupFee } from '@/services/api/waybillOld'
import { mapGetters } from 'vuex'
import { getOrderHistoryRemarkList, setOrderHistoryRemarkList } from '@/utils/localStorageUtil'
import { ElectronicService } from '@comps'

export default {
  name: 'NoticePickup',
  components: {
    'ky-electronic': ElectronicService
  },
  data () {
    var validateHhDateTime = (rule, value, callback) => {
      if (
          dayjs().isAfter(
              dayjs(this.formData.hhDateTime),
              'minute'
          )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
          dayjs(this.formData.hhDateTime).isAfter(
              dayjs().add(1, 'month'),
              'month'
          )
      ) {
        return callback(
            new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    var validateHhDate = (rule, value, callback) => {
      let hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      if (
          dayjs().isAfter(
              dayjs(hhDateTime),
              'minute'
          )
      ) {
        return callback(new Error('货好时间不得小于当前时间，请重新选择'))
      }
      if (
          dayjs(this.formData.hhDate).isAfter(
              dayjs().add(1, 'month'),
              'month'
          )
      ) {
        return callback(
            new Error('货好时间不能超过当前时间一个月，请重新选择')
        )
      }
      callback()
    }
    return {
      loading: false,
      waybills: [],
      dialogVisible: false,
      isSaveSucess: false,
      // goodsBatchTimes: ["11:11", "12:12"],
      callback: null,
      tableData: [],
      overload: false,
      historyRemarkList: [],
      agreementChecked: true,
      visibleOfTerms: false,
      formData: {
        hhDateTime: dayjs().add(2, 'minute'),
        hhDate: dayjs().format('YYYY-MM-DD'),
        goodsTime: '',
        Number: '',
        Weight: '',
        orderRemark: '',
        isBulkGoods: ''
      },
      formRules: {
        hhDateTime: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDateTime, trigger: 'blur' }
        ],
        hhDate: [
          { required: true, message: '请选择货好时间', trigger: 'blur' },
          { validator: validateHhDate, trigger: 'blur' }
        ],
        Weight: [
          {
            required: true,
            type: 'number',
            message: '请输入大于零的数值',
            transform (value) {
              return Number(value)
            },
            min: 0.01,
            trigger: 'blur'
          }
        ],
        Number: [
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
  created () {
    if (this.goodsBatchTimes.length > 0) {
      this.formData.goodsTime = this.goodsBatchTimes[0]
    }
  },
  methods: {
    showDialog (waybills, callback) {
      this.waybills = waybills
      this.isSaveSucess = false
      this.dialogVisible = true

      this.callback = callback
      const addressList = Array.from(new Set(waybills.map(item => item.qHAddress)))
      this.tableData = addressList.map(item => ({ qHAddress: item, isSupport: '' }))
      getOrderHistoryRemarkList().then(res => {
        this.historyRemarkList = res.filter(m => m.replace(/^\s+|\s+$/g, '').length > 0)
      })
      this.overload = false

      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.formData.Weight = this.sum(waybills.map(w => Number(w.weight))) || ''
        this.formData.Number = this.sum(waybills.map(w => Number(w.count))) || ''
        this.formData.hhDateTime = dayjs().add(2, 'minute')
        this.showBigCarInfo()
      })
    },
    sum (array) {
      return array.reduce((total, cur) => { return total + cur }, 0)
    },
    confirm () {
      if (!this.agreementChecked) return this.$message('请先勾选电子运单服务协议')
      const list = this.waybills.map(m => {
        return {
          ydCode: m.ydNo || m.ydCode || m.waybillNumber,
          number: Number(m.count),
          weight: parseFloat(m.weight),
          addressList: [m.qHAddress || '', m.sjAddress || ''],
          areacode: m.sendAreaNo,
          shieldInfo: this.$store.getters.encryptionText,
          bulkCargo: this.tableData.filter(t => t.qHAddress === m.qHAddress)[0].isSupport === 'false'
        }
      })

      this.loading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          this.nightPickupNotice(list)
        } else {
          this.loading = false
        }
      })
    },
    async saveData (list) {
      if (this.goodsBatchTimes.length > 0) {
        this.formData.hhDateTime = dayjs(this.formData.hhDate).format('YYYY-MM-DD') + ' ' + this.formData.goodsTime
      }
      let params = {
        hhDateTime: dayjs(this.formData.hhDateTime).format(
            'YYYY-MM-DD HH:mm:ss'
        ),
        Number: this.formData.Number,
        Weight: this.formData.Weight,
        flexInt1: this.formData.isBulkGoods ? '10' : '20',
        data: list,
        orderRemark: this.formData.orderRemark,
        isPrint: 0
      }
      let res = await placeOrder(params)
      if (res.code === 0) {
        this.isSaveSucess = true
        this.dialogVisible = false
        this.callback && this.callback()
        this.$nextTick(() => { this.$message.success('通知取货成功') })
        if (this.formData.orderRemark) {
          setOrderHistoryRemarkList(this.formData.orderRemark)
        }

      } else {
        console.log('res.msg :>> ', res.msg)
        this.$message.error(res.msg)
      }
      this.loading = false
    },
    async nightPickupNotice (list) {
      try {
        const hour = dayjs(this.formData.hhDateTime).hour
        if (hour >= 8 && hour < 17) {
          await this.saveData(list)
          return
        }
        const areaCodes = Array.from(
            new Set(list.filter(f => f.areacode).map(f => f.areacode))
        )
        let msg = ''
        if (areaCodes.length === 1) {
          const time = dayjs(this.formData.hhDateTime).format('YYYY-MM-DD HH:mm:ss')
          let res = await getNightPickupFee(time, areaCodes[0])
          if (res.code === 0 && parseFloat(res.data.nightPickupFee) > 0) {
            msg = `温馨提示：当前寄件地址${res.data.chargeStartTime}-${res.data.endChargeTime}取货会加收取货费用，详情可咨询您的市场员`
          }
        } else if (areaCodes.length > 1) {
          msg = '温馨提示：部分地区17:00-08:00取货会加收取货费用，详情可咨询您的市场员'
        }
        if (msg) {
          this.$confirm(msg, '夜间收费提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info '
          }).then(async () => {
            await this.saveData(list)
          }).catch(() => { this.loading = false })
        } else {
          await this.saveData(list)
        }
      } catch (ex) {
        this.$message.error('通知取货失败')
        console.log('nightPickupNotice :>> ', ex)
        this.loading = false
      }
    },
    setRemark (value) {
      this.formData.orderRemark = value
    },
    showBigCarInfo () {
      if (this.tableData.length > 1) {
        if (this.formData.Weight && this.formData.Number) {
          if (Number(this.formData.Number) > 0) {
            const avgWeight = Number(this.formData.Weight) / Number(this.formData.Number)
            console.log(avgWeight)
            if (avgWeight > 10000) {
              this.overload = true
            } else {
              this.overload = false
            }
          }
        }
      } else if (this.formData.Weight > 10000) {
        this.overload = true
      } else {
        this.overload = this.false
      }

    }
  },
  computed: {
    isVipshopUser () {
      return this.$store.getters.isVipshopUser
    },
    ...mapGetters([
      'goodsBatchTimes'
    ])
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        this.$emit('on-close', this.isSaveSucess)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-body {
  .row-info {
    height: 30px;
    line-height: 30px;
    background: #f6f3ff;
    //   border: 1px solid rgba(90, 199, 144, 0.9);
    font-size: 14px;
    color: #424242;
    font-weight: bold;
    border-radius: 4px;
    padding-left: 16px;
    margin-bottom: 24px;
  }

  .bulk-goods {
    padding-top: 32px;
  }

  .img-wrap {
    text-align: center;
    margin: 24px 0 0;

    .el-image {
      margin-bottom: 16px;
    }
  }

  /deep/ {
    .el-form-item {
      .el-form-item__label {
        line-height: 14px;
        padding-bottom: 8px;
      }

      .el-date-editor.el-input,
      .el-date-editor.el-input__inner {
        width: 100%;
      }

      .el-input__prefix {
        position: unset;

        .el-textarea__inner {
          padding: 12px;
        }
      }

      .el-form-item__error {
        width: 157px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .icon-purple_calendar {
      color: #8365f6;
      right: 0;
      position: absolute;
    }

    .el-icon-circle-close {
      right: 20px;
      position: relative;
    }

    .bigCar_tip {
      line-height: 20px;
      padding: 12px 0 16px 0;
      color: #333333;
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
    }

    .bigCar_content {
      padding-bottom: 24px;
    }

    .historyRemark {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;

      /deep/ .el-input--medium .el-input__inner {
        height: 40px;
        width: 100px;
      }

      .el-button.is-round {
        opacity: 1;
        background: #f7f7f7;
        border: 1px solid #e9e9e9;
        border-radius: 17px;
        margin: 0 6px 6px 6px;
      }
    }

    .goodsTime {
      display: flex;

      .goodsBatchTimes {
        top: 22px;
        left: 5px;
        position: relative;
      }

      .hhDate {
        bottom: 4px;
        position: relative;
        width: 140px;
        padding: 0;
      }
    }

    .el-checkbox__label {
      padding-left: 6px !important;
    }

    .el-col-3 {
      padding-left: 6px !important;
    }
  }
}

/deep/ .el-dialog__footer {
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-left {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 11px;
      color: #666;

      .checkbox {
        margin-right: 3px;
      }

      .spec {
        color: #8365f6;
      }
    }

    // .cancel {
    //   padding: 10px 22px;
    //   border: 1px solid #dfdfdf;
    //   border-radius: 17px;
    //   color: #333333;
    //   font-size: 14px;
    // }

    // .confirm {
    //   padding: 10px 22px;
    //   background: #8365f6;
    //   border-radius: 16px;
    //   font-size: 14px;
    //   color: #fff;
    // }
  }
}

/deep/ .el-dialog__body .v-tip-container {
  padding: 2px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 14px;

  .v-tip-content {
    background: transparent;
    line-height: 1.5;
  }

  .v-tip-arrows {
    border-top-color: rgba(0, 0, 0, 0.3);
  }

  .v-tip-arrows::after {
    border-top-color: transparent;
  }
}
</style>
