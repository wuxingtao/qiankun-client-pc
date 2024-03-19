<template>
  <div class="date-time">
    <div class="block">
      <el-date-picker
        v-model="subject.timeValue"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        :placeholder="subject.placeholder ? subject.placeholder : '请选择日期时间'"
        @change="dateTimeChange(subject.timeValue)"
        :default-time="defaultTime"
      >
      </el-date-picker>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import jumpSubjectMixin from './jumpSubjectMixin.js'

export default {
  mixins: [jumpSubjectMixin],
  name: "date-time",
  props: {
    subject: {
      type: Object
    }
  },
  data() {
    return {
      defaultTime: dayjs().format('HH:mm:ss')
    };
  },
  methods: {
    dateTimeChange(time) {
      this.subject.answerContent = (time && dayjs(time).format('YYYY年MM月DD日HH时mm分')) ||''
      // 跳题
      this.jumpSubjectFn(time, this.subject['jumpSubjectId'])
    }
  }
}
</script>

<style lang="scss" scoped>
.date-time {
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
  ::v-deep .el-date-editor--datetimerange.el-input:hover,
  ::v-deep .el-date-editor--datetimerange.el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-range-input {
    cursor: pointer;
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
    color: #C0C4CC;
  }
}
::v-deep .el-date-table td.in-range div {
  background-color: #ececf5;
}
::v-deep .el-date-table td.start-date span,
::v-deep .el-date-table td.end-date span {
  background: #8365f6;
}
::v-deep .el-button + .el-button {
  background: #8365f6;
  color: #fff;
  border: 0;
}
::v-deep .el-date-table td.current:not(.disabled) span {
  background: #8365f6;
}
::v-deep .date-time .el-date-editor.el-input, ::v-deep.date-time .el-date-editor.el-input__inner {
  border-radius: 12px;
  background-color: #fff;
}
::v-deep .el-input--suffix .el-input__inner {
    padding-left: 15px;
  }
</style>
