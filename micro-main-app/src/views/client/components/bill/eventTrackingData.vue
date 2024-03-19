<template>
  <div class="client-container">
    <div class="title">
      <div class="el-icon-back"
           @click="returnBack"></div>
      <div>统计详情</div>
    </div>

    <el-tabs class="tabs"
             v-model="activeTabPage"
             type="card">
      <el-tab-pane label="总量"
                   name="summary">
        <el-form label-position="top">
          <el-row>
            <el-col :span="5"
                    style="width:224px">
              <el-form-item label="操作日期">
                <el-date-picker v-model="dateArray"
                                type="daterange"
                                class="date-picker-style"
                                size="small"
                                :clearable="false"
                                range-separator="-"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4"
                    style="width:192px">
              <el-form-item label="页面/事件名称">
                <!-- <el-input class="input"
                          v-model.trim="statisticType"
                          clearable
                          placeholder="请输入页面/事件名称"></el-input> -->
                <el-select v-model="statisticType"
                           style="width:180px"
                           filterable
                           clearable
                           placeholder="请选择">
                  <el-option v-for="item in options"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-button type="primary"
                         style="width:72px;margin-top:32px"
                         icon="el-icon-search"
                         @click="loadStatisticData">查询</el-button>
            </el-col>
          </el-row>
        </el-form>

        <div class="content-table">
          <el-table :data="tableData"
                    class="clinet-common-table"
                    stripe
                    style="width:100%">
            <el-table-column label="序号"
                             type="index"
                             width="50"></el-table-column>
            <el-table-column label="页面/事件名称"
                             prop="name"></el-table-column>
            <el-table-column label="类型">
              <template slot-scope="scope">{{scope.row.bizType | statisticTypeName}}</template>
            </el-table-column>
            <el-table-column label="访问量（次）"
                             prop="operateCount"></el-table-column>
          </el-table>
          <div class="client-pagination">
            <el-pagination background
                           @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page.sync="pagination.currentPage"
                           :page-size="pagination.pageSize"
                           :page-sizes="[5,10,30,50]"
                           layout="prev, pager, next,sizes,jumper"
                           :total="pagination.rowsCount"></el-pagination>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="账号"
                   name="account">
        <el-form label-position="top">
          <el-row>
            <el-col :span="5"
                    style="width:224px">
              <el-form-item label="操作日期">
                <el-date-picker v-model="accountData.dateArray"
                                type="daterange"
                                class="date-picker-style"
                                size="small"
                                :clearable="false"
                                range-separator="-"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4"
                    style="width:188px">
              <el-form-item label="页面/事件名称">
                <!-- <el-input v-model.trim="accountData.statisticType"
                          class="input"
                          clearable
                          placeholder="请输入页面/事件名称"></el-input> -->
                <el-select v-model="accountData.statisticType"
                           style="width:180px"
                           filterable
                           clearable
                           placeholder="请选择">
                  <el-option v-for="item in options"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>

              </el-form-item>
            </el-col>
            <el-col :span="4"
                    style="width:192px">
              <el-form-item label="手机号">
                <el-input v-model.trim="accountData.phone"
                          class="input"
                          clearable
                          placeholder="请输入手机号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-button type="primary"
                         style="width:72px; margin-top:32px"
                         icon="el-icon-search"
                         @click="loadStatisticAccountData">查询</el-button>
            </el-col>
          </el-row>
        </el-form>

        <div class="content-table">
          <el-table :data="accountData.tableData"
                    class="clinet-common-table"
                    stripe
                    style="width:100%">
            <el-table-column label="序号"
                             type="index"
                             width="50"></el-table-column>
            <el-table-column label="页面/事件名称"
                             prop="name"></el-table-column>
            <el-table-column label="类型">
              <template slot-scope="scope">{{scope.row.bizType | statisticTypeName}}</template>
            </el-table-column>
            <el-table-column label="操作账号"
                             prop="operator"></el-table-column>
            <el-table-column label="访问量（次）"
                             prop="operateCount"></el-table-column>
          </el-table>
          <div class="client-pagination">
            <el-pagination background
                           @size-change="handleAccountSizeChange"
                           @current-change="handleAccountCurrentChange"
                           :current-page.sync="accountData.currentPage"
                           :page-size="accountData.pageSize"
                           :page-sizes="[5,10,30,50]"
                           layout="prev, pager, next,sizes,jumper"
                           :total="accountData.rowsCount"></el-pagination>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>


<script>
import dayjs from "dayjs"
import {
  queryEventTrackingStatisticDataApi,
  queryEventTrackingStatisticAccountDataApi,
  getEventTrackingTypes
} from "@/services/api/bill"
import "./assets/common.scss"

export default {
  data() {
    return {
      options: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        rowsCount: 0
      },
      activeTabPage: "summary",
      dateArray: ["2019/12/1", "2020/1/17"], //[moment().add(-7, "d"), moment()],
      statisticType: "",
      tableData: [],
      accountData: {
        currentPage: 1,
        pageSize: 10,
        rowsCount: 0,
        dateArray: ["2019/12/1", "2020/1/17"], //[moment().add(-7, "d"), moment()],
        statisticType: "",
        phone: "",
        tableData: []
      }
    }
  },
  filters: {
    statisticTypeName(val) {
      return val == 10 ? "页面" : "事件"
    }
  },
  created() {
    this.loadEventTypes()
  },
  mounted() {
    this.loadStatisticData()
    this.loadStatisticAccountData()
  },
  // beforeRouteEnter (to,from,next){
  //   console.log('1',to);
  //      next(vm=>{
  //        vm.activeTabPage=to.params.type=="page":'summary'
  //      });
  // },
  methods: {
    returnBack() {
      this.$router.go(-1)
    },
    async loadEventTypes() {
      // let res = await queryEventTrackingStatisticsTypesApi({
      //     customerCode: getCustomCode()
      // })
      // if(res.data&&res.data.length>0){
      //     this.options =  res.data.map(m=>({'value':m.code,'label':m.name}))
      // }
      let data= await getEventTrackingTypes()
      if(data){
        this.options =  data.map(m=>({'value':m.code,'label':m.name}))
      }
    },
    async loadStatisticData() {
      let params = {
        pageNo: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        startTime: dayjs(this.dateArray[0]).format("YYYY-MM-DD 00:00:00"),
        endTime: dayjs(this.dateArray[1]).format("YYYY-MM-DD 23:59:59"),
        bizCode: this.statisticType + ""
      }
      let res = await queryEventTrackingStatisticDataApi(params)
      this.tableData = []
      this.pagination.rowsCount = 0
      if (res.data) {
        this.tableData = res.data.records
        this.pagination.rowsCount = Number(res.data.total)
      }
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadStatisticData()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadStatisticData()
    },

    async loadStatisticAccountData() {
      let params = {
        pageNo: this.accountData.currentPage,
        pageSize: this.accountData.pageSize,
        startTime: dayjs(this.accountData.dateArray[0]).format(
          "YYYY-MM-DD 00:00:00"
        ),
        endTime: dayjs(this.accountData.dateArray[1]).format(
          "YYYY-MM-DD 23:59:59"
        ),
        bizCode: this.accountData.statisticType + "",
        operator: this.accountData.phone
      }
      let res = await queryEventTrackingStatisticAccountDataApi(params)
      this.accountData.tableData = []
      this.accountData.rowsCount = 0
      if (res.data) {
        this.accountData.tableData = res.data.records
        this.accountData.rowsCount = Number(res.data.total)
      }
    },
    handleAccountSizeChange(val) {
      this.accountData.pageSize = val
      this.loadStatisticAccountData()
    },
    handleAccountCurrentChange(val) {
      this.accountData.currentPage = val
      this.loadStatisticAccountData()
    }
  }
}
</script>


<style lang="scss" scoped>
  .client-container {
    padding: 0 24px;
    .title {
      margin-left: -6px;
      font-size: 18px;
      line-height: 50px;
      color: #333333;
      // margin: 0 24px 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid #f1f1f5;

      div {
        display: inline-block;
        font-weight: bold;
      }
      .el-icon-back {
        font-size: 17px;
        margin-right: 15px;
        position: relative;
        top: 1px;
        cursor: pointer;
      }
    }

    .date-picker-style {
      width: 216px;
    }
    .input {
      width: 180px;
    }
  }
  .el-row {
    border-bottom: 1px solid #f1f1f5;
    height: 86px;
    margin-bottom: 19px;
  }
  /deep/.el-form-item__label {
    height: 29px;
    font-size: 12px;
    color: #333333;
  }

  /deep/.el-tabs__header {
    margin: 0;
  }
  /deep/ .el-tabs__item {
    height: 44px;
    padding: 0 51px !important;
  }

  /deep/ .el-tabs--card > .el-tabs__header {
    border-bottom: 1px solid #f1f1f5;
  }
  /deep/ .el-tabs--card > .el-tabs__header .el-tabs__nav {
    border: none;
  }
  /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item {
    border-left-color: transparent;
    border-top-color: transparent;
    font-size: 16px;
    color: #666666;
    line-height: 44px;
  }

  /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    border-left-color: #f1f1f5;
    border-right: 1px solid #f1f1f5;
    font-weight: bold;
    color: #7352bf;
    position: relative;
    &::after {
      position: absolute;
      content: "";
      height: 2px;
      width: 100%;
      left: 0;
      top: 0px;
      background: #7352bf;
    }
  }

  //表格样式
  /deep/ .el-table th > .cell {
    font-weight: bold;
  }
  /deep/ .el-table .cell {
    font-size: 12px;
  }

  // /deep/ .el-date-editor {
  //   .el-range-separator,
  //   .el-range-input {
  //     color: #aaaaaa;
  //   }
  // }
</style>
