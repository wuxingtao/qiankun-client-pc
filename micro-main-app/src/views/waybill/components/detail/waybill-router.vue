<template>
  <div class='route-node'>
    <div class='route-node-step' :class="{ 'route-node-step--error': item.nodeStatus === 0 }"
         v-for='(item, index) in displayList' :key='index'>
      <div class='route-node-step__left'>
        <div class='title'>{{ item.nodeName }}</div>
      </div>
      <div class='route-node-step__center'>
        <i :class="['iconfont', index===0 ?'iconcoupon-active':'dot']"></i>
      </div>
      <div class='route-node-step__right'>
        <div class='time'>{{ item.date }}</div>
        <div class='desc'>{{ item.desc }}
          <el-image v-if='item.nodeCode&&item.timeQuantum' :src='greenCodeUrl' class='green-img'
                    @click="showGreenCode(item.nodeCode+'+'+item.timeQuantum)"></el-image>
        </div>
      </div>
    </div>
    <green-code-image ref='greenCodeRef'></green-code-image>
  </div>
</template>

<script>
import dayjs from "dayjs"
import GreenCodeImage from "./green-code-image"

const nodeIcons = {
  "node-start": require("@/assets/image/router/node-start.png"),
  "node-end": require("@/assets/image/router/node-end.png"),
  "node-plane-start": require("@/assets/image/router/node-plane-start.png"),
  "node-plane-end": require("@/assets/image/router/node-plane-end.png"),
  "node-process": require("@/assets/image/router/node-process.png")
}
export default {
  name: "waybill-router",
  components: {
    GreenCodeImage
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      greenCodeUrl: require("@/assets/image/waybill/goods-green-code.png")
    }
  },
  computed: {
    displayList() {
      return this.list.map(node => ({
        ...node,
        date: dayjs(node.date).format("YYYY-MM-DD HH:mm"),
        iconImg: nodeIcons[node.icon]
      }))
    }
  },
  methods: {
    showGreenCode(val) {
      this.$refs.greenCodeRef.showDialog(val)
    }
  }
}
</script>

<style lang='scss' scoped>
.route-node {
  position: relative;
  margin-top: 4px;
  background-color: #ffffff;
  
  &-step {
    display: flex;
    padding-top: 24px;
    color: #888ea6;
    
    &:not(:first-child) {
      color: #8F8FA8;
    }
    
    &__left {
      flex-shrink: 0;
      width: 90px;
    }
    
    &__center {
      position: relative;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      width: 72px;
      
      &::after {
        position: absolute;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        content: '';
        width: 0;
        height: calc(100% + 8px);
        border-left: 2px dashed #e5e5e5;
      }
      
      .dot {
        width: 8px;
        height: 8px;
        background: #d7d7db;
        border-radius: 50%;
      }
    }
    
    &__right {
      flex: 1;
      padding-right: 38px;
    }
    
    &__right {
      flex: 1;
    }
    
    .time,
    .desc {
      color: #03050d;
    }
    
    &:last-child {
      .route-node-step__center::after {
        display: none;
      }
    }
    
    &--error {
      .title {
        color: #ff706d;
      }
    }
  }
  
  .title {
    font-weight: bold;
    text-align: right;
    // color: #03050D;
  }
  
  .time {
    line-height: 12px;
  }
  
  .desc {
    margin-top: 6px;
    line-height: 22px;
    text-align: justify;
    
    .green-img {
      width: 56px;
      height: 12px;
      line-height: 22px;
      padding: 0 12px;
      text-align: justify;
      cursor: pointer;
    }
  }
}

</style>
