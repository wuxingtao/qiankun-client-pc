<template>
  <div class='page__container plr_20'>
    <div class='page__header'>
      <div class='main-title'>个性化模板设置</div>
      <div class='page__operation mt_20 mb_20'>
        <div class='mb_20 flex' style='line-height: 1.2'>
          <i class='el-icon-info' style='color:#41C381'></i>
          <div class='ml_8 fs_14'>
            <p class='c_666'>批量导入时，若使用自定义模版，请先新建上传您的模板，与我司系统模板映射后，即可使用您的模板进行批量导入。</p>
            <p class='c_666'>若您取消默认模板，系统将优先使用我司模板。</p>
          </div>
        </div>
        <el-button type="primary" size="mini" @click="handleAdd">新增</el-button>
      </div>
    </div>
    <div class='page__content'>
      <k-table :data='tableData' :columns='tableColumns' :total='dataCount'
               height='calc(100vh - 314px)' :pageIndex='pagination.pageIndex'
               @refreshList='handleList'
               v-loading='loading' ref='tableRef'>
        <el-table-column slot='operation' label='操作' width='200px'>
          <template slot-scope='scope'>
            <el-button class='btn-text-border' type='text' @click='handleModify(scope.row)'>修改</el-button>
            <el-button class='btn-text-border' type='text' @click='handleDelete(scope.row)'>删除</el-button>
            <el-button class='btn-text-border' type='text' @click='handleCancelDefault(scope.row, 1)'
                       v-if='scope.row.defaultSate !== 1'>设为默认
            </el-button>
            <el-button class='btn-text-border' type='text' @click='handleCancelDefault(scope.row, 0)' v-else>取消默认
            </el-button>
          </template>
        </el-table-column>
        <el-table-column slot='templateName' :show-overflow-tooltip='true'
                         prop='templateName'
                         label='模板名称'>
          <template slot-scope='scope'>
            {{ scope.row.templateName }}
            <span v-if='scope.row.defaultSate === 1' class='label--collect'>常用</span>
          </template>
        </el-table-column>
      
      </k-table>
    </div>
  </div>
</template>

<script>
import { KTable } from "@comps"
import { getUserTemplatePageSearch, personalUpdateTemplate, updateDefaultTemplate } from "@api/setting"
import { mapState } from "vuex"
import { getPhone, getCustomerCode } from "@utils/storage"
import { paramsSpecife } from "@/views/setting/batchTemplate/utils"
import { deleteUserTemplate, updateUserTemplate } from "@/services/api/setting"

export default {
  name: "batch-template",
  components: { KTable },
  data() {
    return {
      tableData: [],
      tableColumns: [
        {
          slot: "operation",
          label: "操作",
          width: "180"
        },
        {
          slot: "templateName",
          prop: "templateName",
          label: "模板名称",
        },
        {
          prop: "remark",
          label: "备注",
        }
      ],
      // 数据条数
      dataCount: 0,
      loading: false,
      pagination: {
        pageIndex: 1,
        pageSize: 10
      }
    }
  },
  computed: {
    ...mapState(["userInfo"]),
  },
  mounted() {
    this.handleList()
  },
  //路由
  beforeRouteEnter: (to, from, next) => {
    next(vm => {
      if (to.query.refresh) {
        vm.handleList()
      }
    })
  },
  methods: {
    async handleList(params = {}) {
      const { pageIndex, pageSize } = params
      if(pageIndex && pageSize) {
        this.pagination.pageSize = pageSize
        this.pagination.pageIndex = pageIndex
      }
      try {
        this.loading = true
        let res = await getUserTemplatePageSearch({
          page: this.pagination.pageIndex,
          pageSize: this.pagination.pageSize
        })
        this.loading = false
        if (res.code === 0 && res.data) {
          this.tableData = this.tableSpecife(res.data.rows) || []
          this.dataCount = res.data.rowTotal || 0
        }
      } catch (e) {
        this.loading = false
      }
    },
    // 新旧版接口表单字段兼容
    tableSpecife(tableData) {
      return tableData.map(item => paramsSpecife("receipt", item))
    },
    // 修改
    handleModify(row) {
      if (row.sys_guid) {
        this.$router.push({ name: "batchTemplateAdd", params: { ...row, type: "edit" } })
      }
    },
    handleDelete(row) {
      this.$confirm("是否删除当前模板？", "模板管理").then(async () => {
        const params = { id: row.sys_guid }
        let res = await deleteUserTemplate(params)
        if (res.code === 0) {
          await this.handleList()
        }
      })
      
    },
    // 设为默认|取消默认
    handleCancelDefault(row, type) {
      // type = 1设为默认
      let msg = ""
      if (type === 1) {
        msg = "是否将当前模板设为默认模板？"
      } else {
        msg = "是否取消将当前模板设为默认模板？"
      }
      this.$confirm(msg, "模板管理")
        .then(async () => {
          // const params = {
          //   mobile: getPhone(),
          //   templateName: type && type === 1 ? row.templateName : ""
          // }
          const params = paramsSpecife("send", row)
          let res = await updateUserTemplate({
            ...params,
            id: row.sys_guid,
            defaultSate: type
          })
          if (res.code === 0) {
            await this.handleList()
          }
        })
        .catch(() => {
        })
    },
    handleAdd() {
      this.$router.push({ name: "batchTemplateAdd", params: { type: "add" } })
    }
  }
}
</script>

<style lang='scss' scoped>
.main-title {
  font-size: $--font-size-title;
  font-weight: bold;
  font-family: PingFangSC, PingFangSC-Medium;
  color: rgba(51, 51, 51, 0.93);
  border-bottom: 1px solid #f1f1f5;
  height: 35px;
  line-height: 35px;
}

.label--collect {
  background: #f25050;
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
  padding: 4px;
  white-space: nowrap;
  margin-left: 4px;
}
</style>


