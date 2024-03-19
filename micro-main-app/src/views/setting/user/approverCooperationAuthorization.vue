<template>
  <div :class="{page: status === 1 }" v-loading.lock="loading">
    <div :class="{'page-wrapper': status === 1}">
      <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
        <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>{{ source === 1 ? '申请记录' : '审批付款授权' }}
      </div>
      <div class="tabs-container-wrap" v-if="source !== 1">
        <div class="tab-item-wrap">
          <div class="tab-item" :class="tabClass(1)" @click="handleTabClick(1)">
            待审批
          </div>
        </div>
        <div class="tab-item-wrap">
          <div class="tab-item" :class="tabClass(2)" @click="handleTabClick(2)">
            审批记录
          </div>
        </div>
      </div>
      <div class="page-content search-container" v-if="source !== 1">
        <el-form ref="ruleForm" :model="formData" label-position="left">
          <el-row :gutter="24">
            <!-- <el-col :span="4" v-if="status === 2 || source === 1">
              <el-form-item label="审批状态" prop="authStatus" label-width="66px">
                <el-select v-model="formData.authStatus" size="medium" clearable>
                <el-option v-for="(item, index) in authStatusArr" :key="`0-${index}`" :label="item.displayText" :value="item.displayText">
                </el-option>
              </el-select>
              </el-form-item>
            </el-col> -->
            <el-col :span="7" v-if="source !== 1">
              <el-form-item label="申请人信息" prop="deliveryInfo" label-width="80px">
                <el-input v-model="formData.deliveryInfo" size="medium" clearable placeholder="姓名/手机号码"></el-input>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6" v-if="source !== 1">
              <el-form-item label="所在公司" prop="company" label-width="66px">
                <el-input v-model="formData.company" size="medium" clearable placeholder="所在公司"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="source !== 1">
              <el-form-item prop="dateRange" label-width="0" class="datetimeType">
                <div class="auth-time">授权时间</div>
                <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" style="width:calc(100% - 80px)" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" popper-class="data_picker">
                </el-date-picker>
              </el-form-item>
            </el-col> -->
            <el-col :span="1"><el-button type="primary" round class="query-btn" @click="query">查询</el-button></el-col>
          </el-row>
        </el-form>
      </div>
      <div style="margin-left: 20px; margin-right: 20px">
        <el-table 
          :data="tableData" 
          class="client-common-table" 
          :key="tableKey" 
          :height="tableHeight" ref="multipleTable"
          @selection-change="handleSelectionChange"
          border stripe style="width:100%"
        >
          <el-table-column fixed type="selection" width="55" v-if="status === 1 && source !== 1">
          </el-table-column>
          <el-table-column fixed label="操作" width="55px">
            <template slot-scope="{row}">
              <el-button size="small" class="detail" @click="routerPush('authorizationAccountDetail', row.id)">详情</el-button>
            </template>
          </el-table-column>
          <el-table-column v-for="(col, index) in tableColumns" :key="col.prop + index" :show-overflow-tooltip="true"
            :prop="col.prop" :label="col.text" :min-width="col.width+'px'"
          >
            <template slot-scope="{row}">
              <span v-if="col.prop === 'applyMobile'">
                {{ addBlank(row[col.prop]) }}
              </span>
              <span v-else>{{ row[col.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="client-pagination" >
        <div class="client-pagination-total">共{{pagination.totalRowCount}}条</div>
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pagination.currentPage" :page-size="pagination.pageSize" :page-sizes="[10, 30, 50]" layout="prev, pager, next,sizes,jumper" :total="pagination.totalRowCount">
        </el-pagination>
      </div>
    </div>
    <footer class="footer" v-if="status === 1 && source !== 1">
      <div class="btn-wrapper">
        <el-button @click="handleConfirm('20')">拒绝</el-button>
        <el-button type="primary" @click="handleConfirm('10')">同意</el-button>
      </div>
    </footer>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { list, apply, applyList } from '@/services/api/pyAuth'
export default {
  name: 'approverCooperationAuthorization',
  data() {
    return {
      pickerOptions: {
        tempSelectedDate: '',
        onPick: ({ maxDate, minDate }) => {
          this.pickerOptions.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.pickerOptions.tempSelectedDate = ''
          }
        },
        disabledDate: time => {
          if (time < dayjs().add(-6, 'month')) {
            return true
          }
          if (this.pickerOptions.tempSelectedDate !== '') {
            const minDate = dayjs(this.pickerOptions.tempSelectedDate).add(-1, 'day')
            const maxDate = dayjs(this.pickerOptions.tempSelectedDate).add(30, 'day')
            return time.getTime() < minDate || time.getTime() > maxDate
          }
        },
      },
      status: 1,
      formData: {
        deliveryInfo: '',
        dateRange: [dayjs().add(-15, 'd'), dayjs()],
        company: ''
      },
      tableData: [],
      tableKey:Date.parse(new Date()),
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalRowCount: 0
      },
      tableColumns: [
        { prop: 'applyName', text: '申请人', width: '100' },
        { prop: 'applyMobile', text: '手机号码', width: '100' },
        { prop: 'applyCustomerName', text: '所在公司', width: '150' },
        { prop: 'applyCustomerCode', text: '客户编码', width: '100' },
        { prop: 'authTime', text: '授权时间', width: '150' },
      ],
      authStatusArr: [
        { displayText: '请选择' }
      ],
      tableHeight: 0,
      selectedRows: [],
      source: 2
    }
  },
  async activated() {
    if (this.$route.query.source == '1') {
      this.source = 1
      this.getApplyList()
    } else {
      this.source = 2
      this.status = this.$route.query.status || 1
      this.getListData()
    }
    this.tableColumns = [
      { prop: 'applyName', text: '申请人', width: '100' },
      { prop: 'applyMobile', text: '手机号码', width: '100' },
      { prop: 'applyCustomerName', text: '所在公司', width: '150' },
      { prop: `${this.source === 1 ? 'customerCode' : 'applyCustomerCode'}`, text: `${this.source === 1 ? '授权账号' : '客户编码'}`, width: '100' },
      { prop: 'authTime', text: '授权时间', width: '150' },
    ]
    this.setTableHeight()
    window.onresize = () => {
      this.setTableHeight()
    }
  },
  methods: {
    query() {
      this.pagination = {
        currentPage: 1,
        pageSize: 10,
        totalRowCount: 0
      }
      if (this.source === 1) {
        this.getApplyList()
      } else {
        this.getListData()
      }
    },
    async handleConfirm(operateType) {
      let messageObj = this.selectedRows[0]
      try {
        this.loading = true
        const result = await apply({ operateType, authIds: [messageObj.id], applyCustomList: [{ applyId: String(messageObj.id || 0), applyCustomerCode: messageObj.applyCustomerCode, applyMobile: messageObj.applyMobile }] })
        if (result && result.code === 0) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }
        this.getListData()
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    setTableHeight() {
      let tempHeight = this.status === 1 ? 516 : 450
      if (this.source === 1) {
        tempHeight = 320
      }
      this.$nextTick(() => {
        this.tableHeight = `calc(100vh - ${tempHeight}px)`
        this.$refs.multipleTable.doLayout()
      })
    },
    async getApplyList() {
      try {
        this.loading = true
        const result = await applyList({ 
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
        })
        this.tableData = result && result.data && result.data.rows
        this.pagination.totalRowCount = result && result.data && result.data.rowTotal
      } finally {
        this.loading = false
      }
    },
    async getListData() {
      try {
        this.loading = true
        const result = await list({
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          authStatusList: this.status === 1 ? ['10'] : ['20', '30', '40'],
          keyword: this.formData.deliveryInfo
        })
        this.tableData = result && result.data && result.data.rows
        this.pagination.totalRowCount = result && result.data && result.data.rowTotal
      } finally {
        this.loading = false
      }
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getListData()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.getListData()
    },
    addBlank(num) {
      if (!num) return num
      return String(num).replace(/^(\d{3})(\d{4})(\d{4})$/, '$1' + ' ' + '$2' + ' ' + '$3')
    },
    handleCancel() {
      this.$router.push({name: 'user'})
    },
    tabClass(status) {
      return { active: status === this.status }
    },
    handleTabClick(status) {
      this.status = status
      this.getListData()
      this.setTableHeight()
    },
    // 路由跳转
    routerPush(name, id) {
      if (!name) {
        return
      }
      this.$router.push({name: name, query: { id }})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../styles/footer.scss";

  .page {
    background: #f7f9fa;
    height: 100%;

    .page-wrapper {
      background: #fff;
      height: calc(100% - 94px)
    }
  }

  .page-box__title {
    width: auto;
    margin-bottom: 0;
  }

  .tabs-container-wrap {
    display: flex;
    height: 50px;
    line-height: 50px;
    margin: 0 20px;
    border-bottom: 1px solid #f1f1f5;

    .tab-item-wrap {
      width: 100px;
      display: flex;

      .tab-item {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: rgba(51, 51, 51, 0.93);
        height: 100%;
        user-select: none;
        cursor: pointer;

        &.disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        &.active {
          font-weight: 500;
          color: #8365f6;
          position: relative;

          &::after {
            content: "";
            display: block;
            position: absolute;
            bottom: 0;
            height: 4px;
            width: 60%;
            background: #8365f6;
            border-radius: 4px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }
    }    
  }

  .client-common-table {
    .detail {
      padding: 0;
      border: none;
      color: #8365f6;
    }
  }

  .page-content {
    padding: 20px 0;
    margin: 0 20px;
    border-bottom: 2px solid #f1f1f5;
  }

  .search-container {
      // form {
      //   display: flex;
      //   flex-wrap: wrap;
      //   justify-content: space-between;
      // }
      .query-btn {
        width: 84px;
        height: 36px;
        line-height: 36px;
        text-align: center;
        padding: 0;
      }

      .el-row {
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      element.style {
        width: 70px;
        padding-right: 0;
      }
      /deep/.el-form-item__label {
        padding: 0 8px 0 0;
      }
      /deep/.el-select {
        width: 100%;
      }
      .datetimeType {
        position: relative;
        background: #eef3fc;
        border-radius: 18px;
        &::after {
          content: "";
          position: absolute;
          top: 0px;
          left: 80px;
          height: 36px;
          width: 1px;
          background-color: #dfe7f7;
        }

        .auth-time {
          height: 36px;
          line-height: 36px;
          padding: 0 12px;
        }

        /deep/ .el-form-item__content {
          display: flex;
          line-height: 36px;
        }
      }

      /deep/ {
        .el-form-item {
          margin-bottom: 0;
        }

        .time-wrap {
          .el-select .el-input__inner {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }

          .el-date-editor.el-input__inner {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left-width: 0;

            &.is-active,
            &:hover {
              border-left-width: 1px;
              margin-left: -1px;
            }
          }
        }

        .el-input--suffix .el-input__inner {
          padding-right: 26px;
        }

        .el-input__inner {
          border-radius: 18px;
          background: #eef3fc;
          border: 0 !important;
        }
        .ml_12 {
          border-radius: 19px;
        }
        .el-range-separator {
          font-size: 0;
          width: 12px;
          height: 13px;
          background: url("../../../assets/image/date-arrow.png") no-repeat top
            left;
          background-size: contain;
        }
        .el-range-input {
          border: 0 !important;
          background-color: transparent;
        }
        .el-icon-date {
          position: absolute;
          right: 16px;
          color: #7556ed;
        }
      }
    }

  .client-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 37px 20px 0;
    bottom: 0;
    right: 0;

    .client-pagination-total {
      color: #333333;
    }
  }

  /deep/ .el-table::before {
    z-index: inherit;
  }

</style>