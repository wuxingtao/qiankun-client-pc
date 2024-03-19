<template>
  <div>
    <ky-table :data="tableData" :paginationVisible="true" :pagination="pagination" @pagination-change="getAppealInfos" border stripe :height="tableHeight" style="width:100%">
      <el-table-column :show-overflow-tooltip="true" prop="waybillNumber" label="申诉单号" width="130px"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="complaintStatus" label="申诉状态" min-width="100px">
        <template slot-scope="scope">
          {{ scope.row.complaintStatus | formateComplaintStatus }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="complaintDate" label="申诉日期" min-width="100px">
        <template slot-scope="scope">
          {{ scope.row.complaintDate | formateComplaintDate }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="complaintType" label="申诉类型" min-width="100px">
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="complaintContent" label="申诉内容" min-width="100px">
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="complaintImgeUrl" label="申诉截图" min-width="100px">
        <template slot-scope="scope">
          <el-image v-if="scope.row.complaintImgeUrl" style="height:30px;width:100%;" fit="none" :previewSrcList="[scope.row.complaintImgeUrl]" :src="scope.row.complaintImgeUrl"></el-image>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="replyContent" label="回复内容" min-width="100px"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="replyImgeUrl" label="回复截图" min-width="100px">
        <template v-if="scope.row.replyImgeUrl" slot-scope="scope">
          <el-image style="height:30px;width:100%;" fit="none" :previewSrcList="[scope.row.replyImgeUrl]" :src="scope.row.replyImgeUrl"></el-image>
        </template>
      </el-table-column>
      <el-table-column fixed="left" label="操作" width="120px">
        <template slot-scope="scope">
          <el-button @click.native.prevent="
              viewAbnormalDetail(
                scope.row.batchNumber,
                scope.row.replyDate,
                scope.row.newReply
              )
            " v-eventTracting="bizCode" type="text" size="small">
            查看详情
          </el-button>
          <span class="redtip" v-show="scope.row.newReply"></span>
        </template>
      </el-table-column>
    </ky-table>
    <BillListAbnormalView :appealInfo="appealInfo" ref="billListAbnormalView" @onSaveSuccess="handleAddAbnormal"></BillListAbnormalView>
  </div>
</template>

<script>
import BillListAbnormalView from "./BillListAbnormalView"
import {
  getAppealInfosApi,
  getAppealTips,
  updateAppealTip
} from "@/services/api/bill"
import { getCustomerCode } from "@/utils/storage"
import dayjs from 'dayjs'
export default {
  components: {
    BillListAbnormalView
  },
  props: {
    tableHeight: {
      type: [String, Number]
    },
    bizCode: { type: String, required: true },
    complaintStatus: { type: Array, required: true }, //10：未处理,20：已处理
    appealInfo: { type: Object, require: true }
  },
  data () {
    return {
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      },
      billingMonth: "",
      tableData: []
    }
  },
  methods: {
    viewAbnormalDetail (batchNumber, replyDate, newReply) {
      this.$refs.billListAbnormalView.showDialog({ batchNumber: batchNumber })
      console.log(newReply)
      if (newReply) {
        this.tableData.filter(el => el.batchNumber == batchNumber)[0].newReply = false
        console.log(this.tableData.filter(el => el.batchNumber == batchNumber)[0].newReply, this.tableData)

        updateAppealTip({ id: batchNumber, date: replyDate })
      }
    },
    async getAppealInfos (billingMonth) {
      this.tableData = []
      if (billingMonth) {
        this.billingMonth = billingMonth
      }
      if (!this.appealInfo.billNumber) {
        this.pagination.totalCount = 0
        return
      }
      // let beginDateTime = moment(this.billingMonth).format('YYYY-MM-DD 00:00:00');
      // let endDateTime = moment(beginDateTime).add(1, 'M').add(-1, 'days').format('YYYY-MM-DD 23:59:59');
      let params = {
        page: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
        elasticsearchFlag: "N",
        generic: {
          vos: [
            {
              propertyName: "complaintStatus",
              columnName: "complaint_status",
              frontBrackets: "(",
              postBrackets: ")",
              conditionOperation: "and",
              operation: "contain",
              type: "enum",
              values: this.complaintStatus
            },
            {
              propertyName: "paymentCompanyNumber",
              columnName: "payment_company_number",
              frontBrackets: "(",
              postBrackets: ")",
              conditionOperation: "and",
              operation: "equal",
              type: "enum",
              values: [getCustomerCode()]
            },
            {
              propertyName: "billNumber",
              columnName: "bill_number",
              frontBrackets: "(",
              postBrackets: ")",
              conditionOperation: "",
              operation: "equal",
              type: "string",
              values: [this.appealInfo.billNumber]
            }
          ]
        },
        vo: {},
        ERPSearchCacheFlag: true,
        forceCache: true
      }
      let res = await getAppealInfosApi(params)
      if (res.data && res.data.rows && res.data.rows.length > 0) {
        this.tableData = res.data.rows
        this.pagination.totalCount = res.data.rowTotal
        let result = await getAppealTips(
          this.tableData.map(o => o.batchNumber)
        )
        this.tableData.forEach(element => {
          this.$set(element, "newReply", false)
          if (element.replyDate) {
            if (result.data) {
              result.data.forEach(item => {
                if (item.id === element.batchNumber) {
                  element.newReply = (dayjs(element.replyDate).format("YYYY-MM-DD HH:mm:ss") != item.date + "")
                }
              })
            } else {
              element.newReply = true
            }
          } else {
            element.newReply = false
          }
        })
      } else {
        this.pagination.totalCount = 0
      }
    },
    handleAddAbnormal () {
      this.$emit('onSaveSuccess')
    }
  },
  filters: {
    formateComplaintStatus (val) {
      if (val === "10") {
        return "处理中"
      }
      if (val === "20") {
        return "已处理"
      }
      return val
    },
    formateComplaintDate (timeStamp) {
      return dayjs(timeStamp).format("YYYY-MM-DD")
    }
  }
}
</script>

<style lang="scss" scoped>
  .redtip {
    border-radius: 5px;
    margin-bottom: 8px;
    display: inline-block;
    border: 3px solid red;
  }
</style>
