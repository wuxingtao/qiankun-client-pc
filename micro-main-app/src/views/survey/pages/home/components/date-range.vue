<template>
  <div class="date-range">
    <div class="block">
      <el-date-picker
        v-model="subject.timeValue"
        type="daterange"
        unlink-panels
        range-separator="/"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy年MM月dd日"
        :picker-options="pickerOptions"
        @change="dateStartChange(subject.timeValue)"
        clearable
      >
      </el-date-picker>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs"
import jumpSubjectMixin from './jumpSubjectMixin.js'

export default {
  name: "date-range",
  mixins: [jumpSubjectMixin] ,
  props: {
    subject: {
      type: Object,
    },
  },
  data() {
    return {
      pickerOptions: {
        /** 当前时间小于大于6个月 */
        disabledDate(time) {
          return (
            dayjs(time).isBefore(dayjs().subtract(6, "month"), "day") ||
            dayjs(time).isAfter(dayjs().add(6, "month"), "day")
          )
        },
      },
    }
  },
  created() {},
  methods: {
    dateStartChange(time) {
      this.subject.answerContent =
        (time &&
          `${dayjs(time[0]).format("YYYY年MM月DD日")} 至 ${dayjs(
            time[1]
          ).format("YYYY年MM月DD日")}`) ||
        ""
      // 跳题
      this.jumpSubjectFn(time, this.subject['jumpSubjectId'])
    },
  },
}
</script>

<style lang="scss" scoped>
.date-range {
  padding: 0 34px 30px 34px;
  margin-bottom: 20px;
  background-color: #fff;

  ::v-deep .el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-input__suffix-inner {
    color: #9673f6;
  }
  ::v-deep .el-range-editor.el-input__inner {
    width: 100%;
    border-radius: 12px;
    background-color: #f7f7f7;
    border-color: #f7f7f7;
  }
  ::v-deep .el-range-editor.el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-range-editor--datetimerange.el-input:hover,
  ::v-deep .el-range-editor--datetimerange.el-input__inner:hover {
    border-color: #9673f6;
  }
  ::v-deep .el-range-input {
    cursor: pointer;
    background-color: #f7f7f7;
  }
  ::v-deep .el-date-editor .el-range__icon:before {
    content: "\e78e";
    position: absolute;
    right: 10px;
    color: #9673f6;
  }
  ::v-deep .el-date-editor .el-range__close-icon::before {
    position: absolute;
    right: 30px;
  }
}
::v-deep .el-range-table td.in-range div {
  background-color: #ececf5;
}
::v-deep .el-range-table td.start-date span,
::v-deep .el-range-table td.end-date span {
  background: #8365f6;
}
.el-button + .el-button {
  background: #8365f6;
  color: #fff;
  border: 0;
}
::v-deep .el-button.is-plain:hover,
::v-deep .el-button.is-plain:focus {
  background: #8365f6;
  color: #fff;
  border: 0;
}
</style>
