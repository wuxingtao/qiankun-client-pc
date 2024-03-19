<template>
  <section class="apply-look">
    <el-form ref="ruleForm"
             label-width="100px"
             class="demo-ruleForm">
      <el-input type="textarea"
                v-model="ruleForm.desc"
                :maxlength="60"
                show-word-limit
                placeholder="请填写申请原因，便于商务为您快速开通权限"
                :rows="4"
                resize="none"></el-input>
      <div class="tips"
           v-show="isShowTips">请输入申请原因</div>
    </el-form>
  </section>
</template>
<script>
  export default {
    name: 'applyLook',
    props: {
      isShowTips: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        ruleForm: { desc: '' },
      }
    },
    watch: {
      isShowTips: {
        handler (val) {
          console.log(val, '===');
        },
        deep: true,
        immediate: true
      }
    }
  }
</script>
<style lang="scss" scoped>
  .apply-look {
    width: 400px;
    .demo-ruleForm {
      position: relative;
    }
    .tips {
      font-size: 13px;
      color: red;
      position: absolute;
      bottom: -16px;
    }
  }
</style>
