<template>
  <div class="date">
    <div class="block">
      <el-date-picker
        class="date-input"
        v-model="subject.timeValue"
        type="date"
        :placeholder="subject.placeholder ? subject.placeholder : '请选择日期'"
        format="yyyy年MM月dd日"
        @change="dateChange(subject.timeValue)"
        clearable
      >
      </el-date-picker>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import jumpSubjectMixin from './jumpSubjectMixin.js'
export default {
  name: "date",
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object
    }
  },
  data() {
    return {
    }
  },
  methods: {
    dateChange(time) {
      this.subject.answerContent = (time && dayjs(time).format('YYYY年MM月DD日')) ||''
      // 跳题
      this.jumpSubjectFn(time, this.subject['jumpSubjectId'])
    }
  }
}
</script>

<style lang="scss" scoped>
.date {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  ::v-deep .el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep.el-input__suffix-inner {
    color: #9673f6;
  }
  ::v-deep.el-date-editor.el-input,
  ::v-deep.el-date-editor.el-input__inner {
    width: 100%;
    background-color: #f7f7f7;
    border-color: #f7f7f7;
    border-radius: 12px;
  }

  ::v-deep.el-input--prefix .el-input__inner:hover {
    border-color: #9673f6;
  }
 
  ::v-deep.el-input--prefix .el-input__inner {
    border-radius: 12px;
    background-color: #f7f7f7;
    border-color: #f7f7f7;
  }
  ::v-deep.date .el-date-editor.el-input:hover,
  ::v-deep.date .el-date-editor.el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep.el-range-input {
    cursor: pointer;
    background-color: #f7f7f7;
  }
  ::v-deep.el-icon-date:before {
    content: "\e78e";
    position: absolute;
    right: -890px;
    color: #9673f6;
  }
  ::v-deep.el-date-editor .el-icon-circle-close::before {
    position: absolute;
    right: 30px;
    color: #C0C4CC;
  }
  ::v-deep .el-input--suffix .el-input__inner {
    padding-left: 15px;
  }
}

</style>
