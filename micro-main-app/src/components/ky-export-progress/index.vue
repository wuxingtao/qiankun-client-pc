<template>
    <el-dialog
            width="250px"
            :visible="visible"
            center
            :close-on-click-modal="false"
            @close="close">
        <div class="ky-export-progress">
            <div class="export-title">{{exportTitle}}</div>
            <div class="export-bg">
            </div>
            <div class="export-progress">
                <el-progress v-bind="$attrs" :percentage="percentage" :stroke-width="16"></el-progress>
            </div>
        </div>
    </el-dialog>
</template>
<script>
import * as API from '@/services/api/total.js'
export default {
  name: 'ky-export-progress',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    params: { // 导出接口参数
      type: Object,
      default: () => ({})
    },
    exportUrl: { // 导出接口
      type: String,
      required: true,
      default: ''
    },
    searchUrl: { // 实时查询进度接口
      type: String,
      default: 'web.report.download.status'//'file.file.result'
    },
    fileName:{
      type: String,
      default: '导出明细'
    }
  },
  data() {
    return {
      percentage: 0,
      exportStatus: 'process',
      progressTimer: null,
      timeIndex: 0
    }
  },
  computed: {
    exportTitle() {
      if (this.exportStatus === 'process') {
        return '正在导出,请稍等'
      }
      if (this.exportStatus === 'exception') {
        return '导出出现异常,请稍后再试'
      }
      if (this.exportStatus === 'finish') {
        return '导出完成！'
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.progressTimer)
  },
  watch: {
    visible(n) {
      if (n === true) {
        this.export()
      } else {
        this.percentage = 0
        this.timeIndex=0
        clearInterval(this.progressTimer)
      }
    }
  },
  methods: {
    async export() {
      let _this = this
      this.percentage = 0
      this.timeIndex=0
      this.exportStatus= 'process'
      API.exportDataFn(this.exportUrl, this.params).then(expor => {
        let fn = async () => {
          if (expor.code === 0) {
            if (expor.data && expor.data.taskId) {
              let reg = await API.fileResultFn(this.searchUrl, expor.data.taskId)
              if (reg.code === 0) {
                let page = reg.data.page
                let pageTotal = reg.data.pageTotal
                let num=(page/pageTotal)* 100 || 0
                this.percentage = parseInt(num)
                this.exportStatus = reg.data.status
                this.timeIndex=0
                if (reg.data.successful === true && reg.data.status === 'finish') {
                  clearInterval(this.progressTimer)
                  _this.downloadTemplate(reg.data.url)
                }
                if (this.exportStatus === 'exception') {
                  _this.$message({
                    message: '导出失败,请重试',
                    type: 'error'
                  })
                  clearInterval(this.progressTimer)
                  _this.close()
                }
              } else {
                clearInterval(this.progressTimer)
                this.$message({
                  message: '导出失败,请重试',
                  type: 'error'
                })
                _this.close()
              }
            }
          } else {
            clearInterval(this.progressTimer)
            this.$message({
              message: expor.msg || '导出失败,请重试',
              type: 'error'
            })
            _this.close()
          }
        }
        fn()
        this.progressTimer = setInterval(() => {
          fn()
          this.timeIndex++
          if(this.timeIndex>30000){
            this.$message({
              message: expor.msg || '导出失败,请重试',
              type: 'error'
            })
            clearInterval(this.progressTimer)
            _this.close()
          }
        }, 1000)

      }).catch(() => {
        this.$message({
          message: '导出失败,请重试',
          type: 'warning'
        })
        this.close()
      })

    },
    // 下载
    async downloadTemplate (url) {
      if (!this.$native.isClientMode()) {
        window.location.href =  url
        this.$message({
          message: '导出成功！',
          type: 'success'
        })
        this.close()
      } else {
        let res= await this.$native.downLoadFile(url, 'excel', this.fileName+'.xls')
        const result = res && JSON.parse(res)
        if (result&&result.code == 0) {
          this.$message({message: '导出成功！', type: 'success'})
        } else{
          this.$message.error('导出失败！')
        }
        this.close()
      }
    },
    close() {
      this.percentage = 0
      this.timeIndex=0
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
    /deep/ .el-dialog__header {
        display: none;
    }

    /deep/ .el-dialog__body {
        padding: 0;
    }

    /deep/ .el-dialog--center .el-dialog__body {
        padding: 0;
    }

    .ky-export-progress {
        width: 100%;
        padding: 10px 0;

        .export-title {
            padding: 8px 0;
            text-align: center;
            font-size: 16px;
            color: #606266;
        }

        .export-progress {
            margin: 0 10px;
        }

        .export-bg {
            margin: 10px auto;
            width: 120px;
            height: 60px;
            background: url("../../assets/image/total/progress.gif") no-repeat;
            background-size: 100% 100%;
        }
    }
</style>
