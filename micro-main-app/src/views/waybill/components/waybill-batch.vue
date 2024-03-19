<template>
  <div class="main-title" v-if="batchNo">
    <!-- <span v-if="!this.batchNo">{{isQueryPage?'运单跟踪':'运单查询'}}</span> -->
    <div class="page-box__title cursor">
      <div class="inline-block btn-text-border pr_10" @click="handleBack">
        <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>
        <h3 class="inline-block">批次运单信息</h3>
      </div>
      <div class="inline-block fs_14 ml_24">
        批次号：{{ this.batchNo }}
        <el-button type="text" v-clipboard="batchNo">
          <svg-icon icon-class="copy" class="icon-copy" /><span class="ml_4">复制</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WaybillBatch',
  props: {
    batchNo: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleBack() {
      this.$router.push({ name: 'waybillBatch' })
    }
  }
}
</script>

<style lang="scss" scoped>
.main-title {
  font-size: 16px;
  font-weight: bold;
  color: rgba(51, 51, 51, 0.93);
  border-bottom: 1px solid #f1f1f5;
  height: 49px;
  line-height: 49px;
  & > span {
    font-weight: bold;
  }
  .inline-block {
    font-weight: bold;
  }
}
</style>
