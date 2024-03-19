<template>
  <div class="waybill-progress">
    <div class="progress-bar" :style="{ width: exportProgress.progressWidth }"></div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  name: 'waybillProgress',
  data () {
    return {
      exportProgress: {
        code: '', // [4001,4002,4003,4004]
        status: '', // ['start','wroking','finish','fail']
        progressWidth: '', // 进度条
        showProcess: false, // 是否显示进度条
        startTime: 0
      }
    }
  },
  computed:{
    ...mapState('waybill',['exportProcess']),
  },
  watch:{
    exportProcess(val){
      this.exportProgress.progressWidth = `${val}%`
    }
  },
  methods: {

    /**
     * 进度条加载
     * @param showProgress 是否显示进度条
     * @param callback 回调函数
     */
    progressInit (showProgress = false,callback) {
      let timerTool = null
      if (showProgress) {
        clearInterval(timerTool)
        this.exportProgress = Object.assign(this.exportProgress, {
          showProcess: true,
          progressWidth: 0,
          startTime: 0
        })
        timerTool = setInterval(() => {
          if (this.exportProgress.startTime >= 99)  return clearInterval(timerTool)
          this.exportProgress.startTime = this.exportProgress.startTime + Math.floor(Math.random() + 1)
          this.exportProgress.progressWidth = this.exportProgress.startTime + '%'
        }, 10)
      } else {
        clearInterval(timerTool)
        if (this.exportProgress.startTime <= 99) {
          timerTool = setInterval(() => {
            if (this.exportProgress.startTime >= 99) {
              clearInterval(timerTool)
              this.exportProgress.progressWidth = '100%'
              this.exportProgress.showProcess = false
              callback && callback()
              return
            }
            this.exportProgress.startTime = this.exportProgress.startTime + Math.floor(Math.random() + 1)
            this.exportProgress.progressWidth = this.exportProgress.startTime + '%'
          }, 10)
        } else {
          this.exportProgress.progressWidth = '100%'
          this.exportProgress.showProcess = false
          clearInterval(timerTool)
          callback && callback()
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.waybill-progress{
  position: absolute;
  width: 100%;
  height: 3px;
  left: 0;
  bottom: 0;
}
.progress-bar {
  height: 3px;
  width: 0;
  background: #65ca8c;
  border-radius: 2px;
}
</style>
