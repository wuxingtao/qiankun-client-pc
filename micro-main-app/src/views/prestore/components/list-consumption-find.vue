<template>
    <el-form ref="form"
             :inline="true"
             :model="form"
             class="ui bd-b"
             label-position="left">
        <!-- 明细类型 -->
        <el-form-item prop="waybillNumber">
            <b class="ui display block">运单号</b>
            <el-input clearable  size="medium"
                      placeholder="运单号"
                      v-model="form.waybillNumber"></el-input>
        </el-form-item>

        <!-- 查询日期 -->
        <el-form-item prop="date"
                      class="ui mg-r20 u3">
            <b class="ui display block">寄件时间</b>
            <el-date-picker :editable="false"  size="medium"
                            class="ui u12"
                            v-model="date"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="yyyy-MM-dd"
                            @change="dateChange"
                            :picker-options="pickerOptions">
            </el-date-picker>
        </el-form-item>

        <!-- 查询按钮 -->
        <el-form-item class="pg-r10 align">
            <b class="ui display block">&nbsp;</b>
            <el-button type="primary" size="medium"
                       @click="onFind && onFind(form)">查询</el-button>
            <el-button size="medium" @click="resetForm('form')">重置</el-button>
            <el-button size="medium" @click="onExportExcel"
                       :loading="exportLoading">
                <i class="iconfont icon-export ui mg-r4"></i>导出消费明细
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script>
const defaultForm = {
  startTime: '',         // 开始时间
  endTime: '',           // 结束时间
  waybillNumber: '',     // 运单号
}
export default {
  props: {
    onFind: {
      type: Function,
      default: undefined
    },
    exportLoading:{
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      date: '',
      form: defaultForm,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近二周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 14)
            picker.$emit('pick', [start, end])
          }
        }],
      },
    }
  },
  methods: {
    onExportExcel(){
      this.$emit('onExportExcel')
    },
    submitForm() {
      console.log(this.date)
      if (this.onFind) {
        this.onFind(this.form)
      }
    },
    resetForm(formName) {
      this.form = defaultForm
      this.$refs[formName].resetFields()
      this.dateChange()
    },
    dateChange(date) {
      let endTime = '', startTime = ''
      if (date) {
        startTime = this.date[0]
        endTime = this.date[1]
        if(startTime){
          startTime+=  ' 00:00:00'
        }
        if(endTime){
          endTime+= ' 23:59:59'
        }
      } else {
        this.date = startTime = endTime = ''
      }
      this.form.startTime = startTime
      this.form.endTime = endTime
    }
  }
}
</script>
<style lang="scss" scoped>
 /deep/ {
   .el-input--suffix .el-input__inner {
     border-radius: 18px;
   }
   .el-button{
    border-radius: 18px;
  }
  .el-range-editor.el-input__inner {
    border-radius: 18px;
  }
 }
</style>

