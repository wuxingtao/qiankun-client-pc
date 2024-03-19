<template>
  <div class="header" >
    <div class="btn">
      <i class="iconfont icon-window-minimize" @click="$native.win.minimize"></i>
      <i class="iconfont icon-window-close" @click="$native.win.close"></i>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
.header {
  height: 56px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  -webkit-app-region: drag;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  .title {
    font-size: 18px;
    color: #333333;
    font-weight: bold;
  }

  .btn {
    > i {
      color: #909399;
      font-size: 12px;
      margin-left: 30px;
      cursor: pointer;
    }
  }
}

.border {
  border-bottom: 1px solid #F1F1F5;
}
</style>

