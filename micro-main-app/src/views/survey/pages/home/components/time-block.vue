<template>
  <div class="time-block">
    <el-time-picker
      v-model="subject.timeValue"
      :placeholder="subject.placeholder ? subject.placeholder : '请选择时间'"
      format="HH时mm分"
      clearable
      @change="timeChange(subject.timeValue)"
    >
    </el-time-picker>
  </div>
</template>

<script>
import dayjs from "dayjs"
import jumpSubjectMixin from "./jumpSubjectMixin.js"
export default {
  name: "time-block",
  mixins: [jumpSubjectMixin],
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {
      value1: "",
    };
  },
  methods: {
    timeChange(time) {
      this.subject.answerContent =
        (time && dayjs(time).format("HH时mm分")) || "";
        
      // 跳题
      this.jumpSubjectFn(time, this.subject['jumpSubjectId'])
    },
  },
};
</script>

<style lang="scss" scoped>
.time-block {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;
  ::v-deep .el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-input__suffix-inner {
    color: #9673f6;
  }
  ::v-deep .el-date-editor.el-input,
  ::v-deep .el-date-editor.el-input__inner {
    width: 100%;
    background-color: #f7f7f7;
    border-color: #f7f7f7;
    border-radius: 12px;
  }
  ::v-deep .el-input--prefix .el-input__inner {
    border-radius: 12px;
    background-color: #f7f7f7;
    border-color: #f7f7f7;
  }
  ::v-deep .el-input--prefix .el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-date-editor--datetimerange.el-input:hover,
  ::v-deep .el-date-editor--datetimerange.el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-range-input {
    background-color: #f7f7f7;
  }
  ::v-deep .el-icon-time:before {
    content: "\e78e";
    position: absolute;
    right: -890px;
    color: #9673f6;
  }
  ::v-deep .el-date-editor .el-icon-circle-close::before {
    position: absolute;
    right: 30px;
    color: #c0c4cc;
  }
  ::v-deep .el-input--suffix .el-input__inner {
    padding-left: 15px;
  }
}
</style>
