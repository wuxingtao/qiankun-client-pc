<template>
  <div class="multi-input">
    <el-input
      class="input"
      type="textarea"
      :placeholder="subject.remark ? subject.remark : '请输入'"
      v-model="subject.answerContent"
      clearable
      resize="none"
      :maxlength="subject.lengthLimit"
      show-word-limit
      :autosize="{ minRows: 2 }"
      @keydown.native="keydown($event, subject.answerContent)"
    >
    </el-input>
  </div>
</template>

<script>
import jumpSubjectMixin from './jumpSubjectMixin.js'
export default {
  name: "single-input",
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object
    }
  },
  data() {
    return {}
  },
  watch: {
    // 跳题操作
    "subject.answerContent"(val) {
     // 跳题
     console.log(this.subject, 'subject', val)
     this.jumpSubjectFn(val, this.subject['jumpSubjectId'])
    },
  },
  methods: {
    keydown(e, val) {
      if (!val) {
        if(+e.keyCode === 32){
          e.returnValue = false
        }
      }
    }
  }
};
</script>

<style lang="scss">
.multi-input {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  cursor: pointer;
  .el-textarea__inner {
    border-radius: 12px;
    background-color: #f7f7f7;
    border: 1px solid transparent;
  }

  .el-textarea .el-input__count {
    background-color: transparent;
  }
  .el-textarea {
    border: 1px solid #f7f7f7;
    border-radius: 12px;
    background: #f7f7f7;
    padding-bottom: 20px;
  }
  .el-textarea:hover {
    border: 1px solid #9673f6;
  }
}
</style>
