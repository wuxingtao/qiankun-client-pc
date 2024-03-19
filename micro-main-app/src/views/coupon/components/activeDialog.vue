<template>
  <div class="active-dialog font-12">
    <el-dialog
      title="优惠券激活"
      :visible.sync="activeDialogVisible"
      width="374px"
      :show-close="false"
      @open="openDialog"
      @closed="closeDialog"
    >
      <div class="deduction-month">
        <div class="font-12">抵扣公司：</div>
        <div>{{ customerShortName }}</div>
      </div>
      <div class="deduction-month-des">激活后不可更换抵扣月份，出账后抵扣运费</div>
      <div class="deduction-month-date font-12">
        <div class="title">选择抵扣月份</div>
        <div class="dateMonth">
          <el-date-picker
            v-model="monthValue"
            type="month"
            placeholder="请选择"
            :clearable="false"
            :picker-options="pickerOptions"
            popper-class="active-dialog-picker"
          >
          </el-date-picker>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button class="font-12" @click="activeDialogVisible = false">取消</el-button>
        <el-button class="font-12" type="primary" @click="activeDialogconfirm">确定激活</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { activatePackage } from '@api/coupon'
import { getCustomerData } from '@/utils/storage'

export default {
  name: 'active-dialog',

  props: {
    prizeCode: {
      type: String,
      default: '',
    },
    couponList: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      activeDialogVisible: false,
      monthValue: dayjs().toDate(), // 选中日期
      customerShortName: '',
      customerCode: '',
      pickerOptions: {
        disabledDate(time) {
          const currentDate = dayjs(time).toDate()
          const minDate = dayjs().toDate()
          const maxDate = dayjs().add('1', 'year').toDate()
          return currentDate < minDate || currentDate > maxDate
        },
      },
    }
  },
  methods: {
    /** 获取抵扣公司和客户编码 */
    openDialog() {
      const data = getCustomerData()
      this.customerCode = data.customerCode || ''
      this.customerShortName = data.customerShortName || ''
    },
    /** 重置当前月份 */
    closeDialog() {
      this.monthValue = dayjs().toDate()
    },
    /** 确认激活 */
    async activeDialogconfirm() {
      const params = {
        packageTicketNo: this.prizeCode,
        deliveryCustomerCode: this.customerCode,
        deliveryMonth: this.monthValue ? dayjs(this.monthValue).format('YYYY-MM') : '',
      }
        const data = await activatePackage(params)
        if (data.code === 0) {
          this.activeDialogVisible = false
          this.monthValue = ''
          this.$message.success('激活成功')
          this.onSuccess(this.prizeCode)
          
        } else {
          this.$message.error(data.msg)
        }
    },
    onSuccess(prizeCode) {
      const index = this.couponList.findIndex(item => item.prizeCode === prizeCode)
      this.couponList.splice(index, 1)
    },
  },
}
</script>
<style lang="scss" scoped>
.active-dialog {
  ::v-deep {
    .el-dialog {
      &__header {
        position: relative;
        padding: 10px 20px;
        &::before {
          position: absolute;
          top: 0;
          right: 2px;
          content: '';
          width: 99%;
          height: 100%;
          background: url('../assets/active-dialog-header.png') no-repeat;
          background-size: cover;
        }
      }
      &__footer {
        margin-top: 20px;
        border-top: 1px solid #f1f1f5;
        .el-button {
          width: 80px;
          height: 32px;
          line-height: 32px;
          padding: 0;
          border: 1px solid #dfdfdf;
          border-radius: 4px;
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 400;
          &:first-child {
            color: #03050d;
          }
        }
      }
    }
  }
  .deduction-month {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    overflow: hidden;
    padding-left: 12px;
    margin: 11px auto 0;
    background: #fdfcff;
    box-sizing: border-box;
    border: 1px solid #f1f1f5;
    &::after {
      position: absolute;
      content: '';
      top: 0;
      right: 0;
      z-index: 99;
      width: 180px;
      height: 36px;
      background: url('../assets/active-dialog-content.png') no-repeat;
      background-size: cover;
    }
    div {
      position: relative;
      z-index: 999;
      &:first-child {
        font-size: 12px;
        font-weight: 400;
        color: #666666;
      }
      &:last-child {
        font-size: 12px;
        font-weight: 400;
        color: #03050d;
      }
    }
    &-des {
      position: relative;
      padding-left: 22px;
      margin-top: 16px;
      margin-left: 3px;
      font-size: 12px;
      font-weight: 400;
      color: #fe743c;
      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        content: '';
        width: 15px;
        height: 15px;
        background: url('../assets/active-dialog-warn.png') no-repeat;
        background-size: cover;
      }
    }
    &-date {
      display: flex;
      align-items: center;
      margin-top: 12px;
      padding: 16px 12px;
      border-radius: 4px;
      background: #f8f8f8;
      .dateMonth {
        margin-left: 8px;
        ::v-deep {
          .el-input__inner {
            width: 228px;
            height: 32px;
            line-height: 32px;
            padding-left: 8px;
          }
          .el-input__icon {
            line-height: 32px;
          }
          .el-icon-date {
            position: relative;
            &::before {
              content: '';
              position: absolute;
              left: 200px;
              top: 50%;
              transform: translateY(-50%);
              width: 16px;
              height: 15px;
              background: url('../assets/active-dialog-month.png') no-repeat;
              background-size: cover;
            }
          }
          .el-date-editor .el-icon-circle-close {
            &::before {
              position: absolute;
              right: 15px;
            }
          }
        }
      }
    }
  }
  .font-12 {
    font-size: 12px;
  }
}
</style>

<style lang="scss">
.active-dialog-picker {
  .el-month-table {
    td.current:not(.disabled) .cell {
      background: #8365f6;
      border-radius: 4px;
      color: #fff;
    }
    td.disabled .cell {
      border-radius: 4px;
    }
  }
}
</style>