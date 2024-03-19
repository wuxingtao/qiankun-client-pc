<template>
<div class="list-left-right">
    <div class="left" v-if="icon" @click="select">
        <i class="iconfont icon-i" :style="{'background': iconBg,color:iconColor}" :class="[icon]"></i>
    </div>
    <div class="left-url" v-else-if="url" :style="{'background': 'url('+url+')', 'background-size': '100% 100%','background-repeat': 'no-repeat'}">
    </div>
    <div class="right">
        <div class="text" @click="titleFn" :style="{'font-size': titleSize,'font-weight': titleWeight,'color':titleColor}">{{title}}</div>
        <div class="number" @click="totalFn" :style="{'font-size': totalSize, 'font-weight': totalWeight,'color':totalColor}">{{total}}</div>
    </div>
</div>
</template>
<script>
export default {
  name: "list-left-right",
  props:{
    icon:{
      type: String,
      default:''
    },
    titleWeight:{
      type: [Number,String],
      default:''
    },
    totalWeight:{
      type: [Number,String],
      default: 600
    },
    url:{
      type: String,
      default:''
    },
    iconColor:{
      type: String,
      default: '#fff'
    },
    iconBg:{
      type: String,
      default: '#DAE9FF'
    },
    title:{
      type: String,
      default:''
    },
    titleSize:{
      type: String,
      default:'1.2rem'
    },
    totalSize:{
      type: String,
      default:'2.4rem'
    },
    totalColor:{
      type: String,
      default:'#0C092B'
    },
    titleColor:{
      type: String,
      default:'#7F7E8D'
    },
    total:{
      type: [String,Number],
      default:''
    }
  },
  computed:{
    urlStyle(){
      if(this.url){
        return  {
          'background': `url(${this.url})`,
          'background-size': '100% 100%',
          'background-repeat': 'no-repeat'
        }
      }

    }
  },
  methods:{
    select(){
      this.$emit('select')
    },
    titleFn(){
      this.$emit('titleFn')
    },
    totalFn(){
      this.$emit('totalFn')
    }
  }
}
</script>

<style scoped lang="scss">
  .list-left-right {
    display: flex;
    
    .left {
      width: 4rem;
      height: 4rem;
      line-height: 4rem;
      border-radius: 50%;
      text-align: center;
      
      .icon-i {
          font-size: 2rem;
      }
    }

    .left-url {
      width: 4rem;
      height: 4rem;
      line-height: 4rem;
      margin-right: 1rem;
      text-align: center;
      display: inline-block;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }

    .right {
      flex: 1;

      .text {
        color: #7F7E8D;
        font-size: 1.2rem;
        white-space: nowrap;
      }

      .number {
        font-style: normal;
        font-size: 2.4rem;
        color: #0C092B;
        max-width: 10rem;
        margin-top: 0.5rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
      }
    }
  }
</style>
