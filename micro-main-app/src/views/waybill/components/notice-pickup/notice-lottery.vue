<template>
  <ky-dialog title="优惠券变动" width="700px" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body>
<!--    <div class="error-title mb_12">-->
<!--      <i class='el-icon-warning pl_16 pr_8 mb_12'></i><span>不可用原因：货好时间不在优惠券有效期范围内</span>-->
<!--    </div>-->
    <div class="lottery-error-lists">
      <div class="lottery-error-header flex flex_ai_c">
        <span class="th1">运单信息</span><span class="th2">变动原因</span><span class="th3">选择优惠券</span>
      </div>
      <div class="lottery-error-item flex flex_ai_c mb_16" v-for="(item,index) in dataLists" :key="index">
        <div class="th1">
          <div class="waybill-info">
            <div class="waybill-title">
              <span class="title">运单号</span><span class="number">{{ item.waybillNumber }}</span>
            </div>
            <div class="waybill-content">
              <div class="left-side">
                <div class="city">{{ item.deliveryCity }}</div>
                <div class="name ellipsis">{{ item.deliveryPerson }}</div>
                <div class="company ellipsis">{{ item.deliveryCustomerName }}</div>
              </div>
              <div class="middle">
                <span>{{ item.serviceModeDesc }}</span>
              </div>
              <div class="right-side">
                <div class="city">{{ item.pickupCity }}</div>
                <div class="name ellipsis">{{ item.pickupPerson }}</div>
                <div class="company ellipsis">{{ item.pickupCustomerName }}</div>
              </div>
            </div>
          </div>

        </div>
        <div class="error-text th2 ellipsis">{{ item.unusableDesc }}</div>
        <div class="th3">
          <el-button class="select-btn" type="text" v-if="item.disabledCount > 0">暂无可用</el-button>
          <el-button class="select-btn" type="text" disabled
                     v-else-if="item.useableCount === 0 && item.disabledCount === 0 ">暂不可用
          </el-button>
          <el-button class="status-button select-btn" v-else>重新选择</el-button>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { getTicketDetailV2 } from '@api/waybillOld'
import { getPhone } from '@utils/storage'

export default {
  name: 'notice-lottery',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    waybills: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialogVisible: false,
      dataLists: [], // [{...waybill,unusableDesc,prizeCode,useableCount,disabledCount}]
    }
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
      if (val) {
        this.initDialog()
        this.mergeRequest(this.getTicketDetailV2)
      }
    },
    dialogVisible (val) {
      this.$emit('update:lotteryInfo.dialogVisible', val)
    }
  },
  computed: {
    // 当前已选中的优惠券列表
    selectedTickets () {
      return this.dataLists.filter(item => item.prizeCode) || []
    }
  },
  methods: {
    initDialog () {
      this.dataLists = [...this.waybills]
    },
    // 获取优惠券详情
    getTicketDetailV2 (params) {
      return getTicketDetailV2(params)
    },
    mergeRequest (promiseFn) {
      return new Promise((resolve, reject) => {
        let promiseArr = []
        const tempParams = {
          phone: getPhone(),
          selectedTickets: this.selectedTickets, // 已选择的优惠券
          from: this.isClientMode ? 4 : 3,
        }
        this.dataLists.forEach((item, index) => {
          const params = Object.assign(tempParams, {
            prizeCode: item.prizeCode, // 优惠券编码
            serviceMode: item.serviceMode,
            amount: item.waybillAmount,
            serviceAmount: '',
            sendingRegion: item.deliveryAddress,
            receivingRegion: item.pickupAddress,
            goodsTime: item.goodsTime,
            weight: item.actualWeight,
          })
          promiseArr[index] = promiseFn(params).then(res => {
            if (res.code === 0 && res.data) {
              this.dataLists[index]['unusableDesc'] = res.data.externalTicke?.unusableDesc
              this.dataLists[index]['useableCount'] = res.data.useableCount || 0
              this.dataLists[index]['disabledCount'] = res.data.disabledCount || 0
            }
            return Promise.resolve(res)
          }).catch(() => {
            return Promise.resolve('catchError')
          })
        })

        Promise.all(promiseArr).then(res => {
          console.log(res)
          resolve(res)
        }).catch(res => {
          reject('数据异常')
        })

      })
    },
    // TODO 优惠券变动提交
    handleConfirm () {
      this.dialogVisible = false
    },
    // TODO 触发重新选择优惠券
    handleSelectChange () {
      this.mergeRequest(this.getTicketDetailV2)
    }
  }
}
</script>

<style lang="scss" scoped>
.error-title {
  height: 36px;
  line-height: 36px;
  opacity: 0.9;
  background: #fff6f6;
  border-radius: 4px;
  font-size: 14px;
  color: #ff706d;
}

.lottery-error-header {
  height: 36px;
  margin-bottom: 8px;
  background: #f7f8fe;
  box-shadow: 0px -1px 0px 0px #dedede inset;
  font-family: PingFangSC, PingFangSC-Medium;
  font-size: 14px;
  color: #666666;
  position: sticky;
  top: 0;
  z-index: 5;
  span {
    padding: 0 16px;
    box-sizing: border-box;
  }

  span:not(:first-child) {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 8px;
      height: 100%;
      width: 1px;
      margin: auto;
      background: #d5d2de;
    }
  }
}

.th1 {
  width: 50%;
}

.th2 {
  width: 30%;
}

.th3 {
  width: 20%;
}

.error-text {
  color: #ff706d;
}

.status-button {
  width: 80px;
  padding: 10px 12px;
  color: #9378fa;
  border-color: #9378fa;
  border-right: 1px solid #9378fa;

  &.active {
    background: white;
    border-color: #9378fa;
    color: #9378fa;
    border-right: 1px solid #9378fa;
  }

  &.active span {
    font-weight: 800;
  }
}

.lottery-error-item {
  margin-bottom: 8px;
  box-shadow: 0px -1px 0px 0px #dedede inset;

  &:last-child {
    box-shadow: none;
  }

  .th1, .th2, .th3 {
    padding-left: 16px;
    box-sizing: border-box;
  }
  .th3{
    .select-btn{
      width:80px;
    }
  }
}

.waybill-info {
  background-color: #ffffff;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  margin: 0 20px 8px 0;
  box-sizing: border-box;
}

.waybill-title {
  background: linear-gradient(180deg, rgba(216, 226, 255, .3), #ffffff);
  border-radius: 4px 4px 0px 0px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(187, 187, 233, .1);

  .title {
    color: #666666;
    margin-right: 24px;
    position: absolute;
  }

  .number {
    color: #03050d;
    margin-left: 72px;
  }
}

.waybill-info {
  border: 1px solid #f2efff;
  border-radius: 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-bottom: 30px solid #f3f0ff;
    /* border-left: 50px solid transparent; */
    border-right: 14px solid transparent;
    height: 0;
    width: 56px;
  }
}

.waybill-content {
  min-width: 280px;
  width: 100%;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  box-sizing: border-box;

  .middle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 70px;
    height: 20px;
    margin: auto;
    text-align: center;
    line-height: 20px;
    font-size: 12px;

    span {
      height: 20px;
      line-height: 20px;
      background: #ffffff;
      width: 100%;
      border: 1px solid #dbdbdb;
      border-radius: 11px;
      display: block;
      position: relative;
      z-index: 2;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 150%;
      left: -25%;
      height: 1px;
      margin: auto;
      background: #dbdbdb;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 1px;
      background: #dbdbdb;
      transform: rotate(45deg);
      right: -26%;
      top: 7px;
    }
  }

  .left-side {
    width: 36%;
    text-align: left;
  }

  .right-side {
    width: 36%;
    text-align: right;

    .name {
      padding-left: 25px
    }
  }

  .city {
    font-size: 16px;
    font-weight: 600;
    color: #03050d;
    margin-bottom: 8px;
  }

  .name {
    font-size: 12px;
    color: #666666;
    margin-bottom: 8px;
  }

  .company {
    font-size: 12px;
    color: #999999;
  }

}
</style>
