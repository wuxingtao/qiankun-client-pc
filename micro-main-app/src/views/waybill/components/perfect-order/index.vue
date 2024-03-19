<template>
  <div class="perfect-order-container" v-drag>
    <div class="perfect-order" @click="perfectOrder">
      <!-- <el-image :src="perfectImg" >2</el-image> -->
     <span class="count">{{count}}</span> 
    </div>
  </div>
</template>

<script>

export default {
  name: 'perfect-order',
  props: {
    count: {
      type: String,
    }
  },
  data () {
    return {
      perfectImg: require('@assets/image/waybill/perfect-order.png'),
    }
  },
  methods: {
    perfectOrder () {
      console.log('完善运单')
    }
  }
}
</script>

<style lang="scss" scoped>
  .perfect-order-container {
    user-select: none;
    position: fixed;
    right: 0;
    top: 80%;
    z-index: 3;
    .perfect-order {
      width: 117px;
      height: 107px;
       position: relative;
      background: url('~@/assets/image/waybill/perfect-order.png') no-repeat ;
      // background-size: cover;
    }
    .count{
      color: white;
      position:absolute;
      top:44px;
      right: 21px;
      width: 18px;
      text-align: center;
      transform: scale(.8);
    }
  }
</style>