<template>
  <div class='empty-wrapper'>
    <slot name='header'>
      <!--      <svg-icon icon-class="none-data2" />-->
      <img class='empty' src='../../assets/image/waybill/no-form-data.png' />
    </slot>
    <slot>
      <div v-if='msg' v-html='msg'></div>
      <div v-else class='text c_666'>
        暂无数据
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'none-data',
  props: {
    msg: { type: String }
  }
}
</script>

<style lang='scss' scoped>

.migration-table {
  .empty-wrapper {
    width: 160px;
    height: 160px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
.empty-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px auto;
  line-height: 20px;
  color: #909399;
  font-size: 14px;
  //position: absolute;
  //left: 50%;
  //top: 50%;
  //transform: translate(-50%, -50%);
  //.svg-icon {
  //  width: 150px;
  //  height: 150px;
  //  margin-bottom: 24px;
  //}
  .empty {
    display: inline-block;
    width: 160px;
    height: 160px;
  }

  .text {
    font-size: 14px;
  }
}
</style>
