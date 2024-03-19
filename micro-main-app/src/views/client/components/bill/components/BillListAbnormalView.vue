<template>
  <div class="clientdialog">
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="520px">
      <div class="content">
        <div class="content-top">
          <div><span class="label">异常单号</span><span>{{no?no:'-'}}</span>
            <div class="status"
                 :style="{color:status=='20'?'#999':'#EE1D06',borderColor:status=='20'?'#999':'#EE1D06'}">{{status|formateStatus}}</div>
          </div>
          <div><span class="label">申诉类型</span>
            <span style="width: 344px;">{{type}}</span></div>
        </div>

        <div class="timeline">
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in activities"
                              :key="index"
                              :color="index==0?'#EE1D06':''"
                              :timestamp="activity.timestamp"
                              placement="top">
              <div class="timeline-title">{{activity.caption}}</div>
              <p style="margin-bottom:8px;"> {{activity.content}}</p>
              <el-image style="width:38px;height:28px;border:1px solid #d9d9d9"
                        v-if="activity.contentImgUrl"
                        :previewSrcList=[activity.contentImgUrl]
                        :src="activity.contentImgUrl"></el-image>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <div v-if="isAddAbnormal"
           class="adnormalContent">
        <p>申诉内容</p>
        <el-input v-model="adnormalContent"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="请输入账单的异常内容"></el-input>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button v-if="appealInfo.existsBill &&!isAddAbnormal"
                   style="border: none; color: #7352BF;"
                   @click="isAddAbnormal=true;title='继续申诉'">继续申诉</el-button>
        <el-button v-else-if="isAddAbnormal"
                   @click="dialogVisible=false">取消</el-button>
        <el-button type="primary"
                   @click="addAbnormal">{{isAddAbnormal?'确定': '关闭'}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getAppealInfoDetailApi, addOrModifyAppealApi,pushAddAppealMessageApi } from "@/services/api/bill"
import { getCustomerCode } from "@/utils/storage"
import { getLoginCompanyName } from '@/utils/clientUtil'

export default {
  props: {
    appealInfo: { type: Object, required: true },
  },
  data () {
    return {
      title: "查看申诉",
      dialogVisible: false,
      no: '',
      type: '',
      status: '',
      activities: [],
      isAddAbnormal: false,
      adnormalContent: '',
      batchNumber: '',
    }
  },
  methods: {
    showDialog ({ batchNumber }) {
      Object.assign(this.$data, this.$options.data())
      this.batchNumber = batchNumber,
      // this.activities = [];
      getAppealInfoDetailApi({ batchNumber: batchNumber }).then(res => {
        if (res.data) {
          let info = res.data
          this.dialogVisible = true
          this.no = info[0].waybillNumber
          this.status = info[0].complaintStatus
          this.type = info[0].complaintType

          res.data.forEach(m => {
            this.activities.push(...this.formateModel(m))
          })
          this.activities.sort((pre, next) => {
            if (dayjs(pre.timestamp).isSame(dayjs(next.timestamp))) {
              return 0
            } else if (dayjs(pre.timestamp).isBefore(dayjs(next.timestamp))) {
              return 1
            }
            return -1
          })
          // let mapResult = res.data.map(m => {
          //   let arr = { ...this.formateModel(m) };
          //   return arr;
          // });
          // this.activities = [...mapResult]
          // console.log('this.activities', this.activities)
        } else {
          this.$message('查无数据')
        }
      })
    },
    formateModel (model) {
      let arr = [{
        'caption': '我提出',
        'timestamp': dayjs(model.complaintDate).format('YYYY-MM-DD HH:mm:ss'),
        'content': model.complaintContent,
        'contentImgUrl': model.complaintImgeUrl,
      }]
      if (model.replyContent || model.replyImgeUrl) {
        arr.push({
          'caption': '回复',
          'timestamp': dayjs(model.replyDate).format('YYYY-MM-DD HH:mm:ss'),
          'content': model.replyContent,
          'contentImgUrl': model.replyImgeUrl,
        })
      }
      return arr
    },
    addAbnormal () {
      if (!this.isAddAbnormal) {
        this.dialogVisible = false
        return
      }
      let params = {
        paymentCompanyNumber: getCustomerCode(),
        waybillNumber: this.no || this.appealInfo.inMonth,
        complaintType: this.type,
        complaintDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        expiredDate: dayjs().add(7, 'd').format('YYYY-MM-DD HH:mm:ss'),
        complaintContent: this.adnormalContent,
        // picture: pictures,
        inMonth: this.appealInfo.inMonth,
        paymentCompanyId: this.appealInfo.paymentCustomerId,
        paymentCompany: this.appealInfo.paymentCustomerName,
        billNumber: this.appealInfo.billNumber,
        operationType: '2',
        batchNumber: this.batchNumber
      }
      addOrModifyAppealApi(params).then(res => {
        if (res.success) {
          this.$message({
            message: '申诉成功',
            type: 'success'
          })
          this.adnormalContent = ''
          this.dialogVisible = false
          this.$emit('onSaveSuccess')
          this.pushAddAppealMessage(params)
        }
      })
    },
    pushAddAppealMessage (params) {
      let params2 = {
        companyName: getLoginCompanyName(),
        companyCode:params.paymentCompanyNumber,
        waybillNo: params.waybillNumber,
        exptionType: params.complaintType,
        exptionContent: params.complaintContent,
        batchNumber:params.batchNumber
      }
      pushAddAppealMessageApi(params2).then(() => {})
    }
  },
  filters: {
    formateStatus (status) {
      switch (status) {
        case '10':
          return '处理中'
        case '20':
          return '已处理'
      }
      return status
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/.el-dialog__body {
    padding: 0 15px 0 20px !important;
    margin: 16px 0 0 !important;
  }
  .content {
    max-height: 489px;
    width: 100%;
    position: relative;
    .content-top {
      span {
        display: inline-block;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        font-weight: bold;
        color: #333333;
      }
      .label {
        margin: 8px 93px 0 0px;
      }
      .status {
        display: inline-block;
        border: 1px solid #999;
        border-radius: 2px;
        padding: 3px 5px;
        margin-left: 4px;
        font-size: 12px;
      }
    }

    .timeline {
      margin-top: 47px;
      max-height: 382px;
      padding: 5px 0;
      overflow-y: scroll;
      .el-timeline {
        margin-left: 98px;
      }
      /deep/.el-timeline-item {
        padding-bottom: 0;
        &:last-child .el-timeline-item__tail {
          display: block;
          bottom: 25px;
          // height: 100%;
          // border-left: 1px solid #f0f0f0;
        }
        .el-timeline-item__node {
          background-color: #e7e7e7;
        }
        .el-timeline-item__tail {
          height: 100%;
          border-left: 1px solid #f0f0f0;
        }
        .el-timeline-item__wrapper {
          padding-left: 43px;
          .el-timeline-item__timestamp.is-top {
            font-size: 12px;
            color: #999999;
          }
        }
        /deep/ .el-timeline-item__content {
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: #333;
          padding-bottom: 23px;
        }
      }
      .timeline-title {
        font-size: 12px;
        font-weight: bold;
        position: absolute;
        left: -98px;
        top: 2px;
      }
    }
    //滚动条的宽度
    .timeline::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    // 滚动条的滑块
    .timeline::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
  }
  .adnormalContent {
    border-top: 1px solid #f1f1f5;
    position: relative;
    left: -20px;
    width: 480px;
    padding: 16px 20px 8px;
    font-size: 12px;
    p {
      margin-bottom: 8px;
      font-weight: bold;
      color: #333333;
    }
    /deep/.el-textarea__inner {
      font-size: 12px;
      color: #333333;
    }
  }
</style>
