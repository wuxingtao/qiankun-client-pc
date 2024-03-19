<template>
  <!-- 协作人员管理 -->
  <div v-loading.lock="loading">
    <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
      <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>协作人员管理
    </div>
    <div class="flex flex_jc_b page-mtb">
      <div class="view-num" v-if="tableData.length">还可新增{{ 5 - tableData.length }}位</div>
      <div class="flex" @click="routerPush('addCooperation', {}, 1)" style="cursor:pointer" v-if="tableData.length < 5">
        <img src="../../../assets/image/setting/add-cooperation.png" class="img">
        <p class="add-cooper">新增协作人员</p>
      </div>
    </div>
    <div class="page-table">
      <el-table class="client-common-table" :data="tableData" :key="tableKey">
        <el-table-column fixed label="操作" width="180px">
          <template slot-scope="{ row }">
            <div class="btn">
              <el-button type="text" size="small" lass="btn-modify-detail" @click="routerPush('addCooperation', row, 2)">
                编辑
              </el-button>
              <div class="line"></div>
              <el-button type="text" size="small" lass="btn-modify-detail" @click="removeList(row.id)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-for="(col, index) in tableColumns" :key="col.prop + index" :prop="col.prop" :label="col.text" :min-width="col.width">
          <template slot-scope="{row}">
            <span v-if="col.prop === 'userName'" style="color: #333333;">{{ row[col.prop] }}</span>
            <span v-if="col.prop === 'userPhone'" style="color: #333333;">{{ addBlank(row[col.prop]) }}</span>
            <span v-if="col.prop === 'remark'" style="color: #333333;">{{ row[col.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { teamList, teamDelete } from '@/services/api/pyAuth'
export default {
  name: 'cooperationPersonnel',
  data() {
    return {
      tableColumns: [
        { prop: 'userName', text: '姓名', width: '200px' },
        { prop: 'userPhone', text: '手机号码', width: '150px' },
        { prop: 'remark', text: '备注', width: '300px' }
      ],
      tableData: [],
      tableKey:Date.parse(new Date()),
      loading: false
    }
  },
  async activated() {
    this.getTeamList()
  },
  methods: {
    async getTeamList() {
      try {
        this.loading = true
        const result = await teamList()
        this.tableData = result && result.data
      } finally {
        this.loading = false
      }
    },
    handleCancel() {
      this.$router.push({name: 'user'})
    },
    addBlank(num) {
      if (!num) return num
      return String(num).replace(/^(\d{3})(\d{4})(\d{4})$/, "$1" + ' ' + "$2" + ' ' + "$3")
    },
    // 路由跳转
    routerPush(name, query = {}, status) {
      if (!name) {
        return
      }
      this.$router.push({name: name, query: { ...query, status }})
    },
    async removeList(id) {
      const result = await teamDelete({ id })
      if (result && result.code === 0) {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
      }
      this.getTeamList()
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-mtb {
    font-size: 14px;
    margin: 22px 20px 12px;

    .view-num {
      color: #333333;
    }

    .img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    .add-cooper {
      color: #8365f6;
    }
  }

  .page-table {
    margin: 0 20px;
  }

  .client-common-table {
    .btn {
      display: flex;
      align-items: center;

      .line {
        width: 1px;
        height: 12px;
        background: #e9e9e9;
        margin: 0 8px;
      }
    }

  }

  .page-box__title {
    width: auto;
  }
</style>