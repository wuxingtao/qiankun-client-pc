<template>
  <div>
    <el-dialog width='600px' class='wrapper' :close-on-click-modal='false' :close-on-press-escape='false'
               :visible.sync='dialogVisible'>
      <div class='top'>
        <div class='background'></div>
        <i class='iconfont icon-window-close close' @click.stop='goGuide'></i>
      </div>
      <div class='middle'>
        <p class='title'>
          <i class='iconfont icon-upgrade-text'></i>
        </p>
        <div class='message'>
          <p>界面视觉全面优化</p>
          <p>信息层级更加清晰</p>
          <p>运单列表支持勾选导出</p>
          <p>运单查询支持多维度筛选</p>
        </div>
        <div class='i-know' @click.stop='goGuide'></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'Upgrade',
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },
    goGuide() {
      this.$emit('go-guide')
      this.dialogVisible = false
    }
  }
}
</script>

<style lang='scss' scoped>
.wrapper {
  
  /deep/ .el-dialog__header {
    display: none;
  }
  
  /deep/ .el-dialog__body {
    padding: 0;
  }
  
  /deep/ .el-dialog {
    margin: 18vh auto 0 !important;
  }
  
  .top {
    width: 600px;
    height: 147px;
    position: relative;
    
    .close {
      color: #ffffff;
      margin-left: 574px;
      margin-top: 12px;
      font-size: 12px;
      cursor: pointer;
      position: absolute;
    }
    
    .background {
      position: absolute;
      top: -75px;
      background-image: url("../../assets/image/upgrade-header.png");
      background-position: center;
      background-size: 100%;
      background-repeat: no-repeat;
      width: 600px;
      height: 222px;
    }
  }
  
  .middle {
    margin: 0 auto;
    width: 528px;
    padding: 0 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .title {
      width: 100%;
      height: 28px;
      font-size: 28px;
      font-weight: bold;
      text-align: center;
      color: #8365f6;
      line-height: 28px;
      margin-top: 24px;
      
      i {
        font-size: 26px;
      }
    }
    
    .message {
      margin: 33px 0 34px;
      width: 532px;
      height: 136px;
      background-color: #F5F3FF;
      text-align: left;
      padding: 12px 20px;
      box-sizing: border-box;
      
      p {
        line-height: 28px;
        position: relative;
        padding-left: 18px;
        color: #03050D;
        
        &::before {
          content: '';
          width: 4px;
          height: 4px;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          background-color: #999;
          border-radius: 50%;
        }
      }
    }
    
    
    .i-know {
      width: 200px;
      height: 76px;
      margin-bottom: 10px;
      background-image: url("~@assets/image/iknow.png");
      background-position: center;
      background-size: 100%;
      background-repeat: no-repeat;
      
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>