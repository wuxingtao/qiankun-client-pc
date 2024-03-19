<template>
  <div class="line-chart-container">
    <svg-icon :icon-class="icon" />
    <div>
      <div class="label-wrapper">
        <span>{{text}}</span>
        <span>{{data.proportion}}</span>
      </div>
      <div class="line-wrapper" ref="lineWrapper" @mousemove="handleMouseMove">
        <div class="value" :style="{'background':activeColor,'width':data.proportion}"></div>
        <div class="tip" v-if="data.type===0" :style="{left:left+'px'}" ref="tip">
          <div><span class="label">回单原件</span><span class="value">{{data.masterCopyCount}}份</span></div>
          <div><span class="label">回单图片</span><span class="value">{{data.imageCount}}份</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: { type: String, require: true },
    text: { type: String, require: true },
    activeColor: { type: String, default: '#9a73ff' },
    data:{type:Object}
  },
  mounted(){
    this.setLineWrapperRect()
  },
  data(){
    return{
      left:0,
      lineWrapperRect:{},
    }
  },
 
  activated(){ 
    window.addEventListener('resize',this.setLineWrapperRect) 
  },
  deactivated(){
    window.removeEventListener('resize', this.setLineWrapperRect)

  },
  beforeDestroy(){
    window.removeEventListener('resize', this.setLineWrapperRect)
  },
  methods:{
    setLineWrapperRect(){
      this.lineWrapperRect=this.$refs.lineWrapper.getBoundingClientRect()
    },
    handleMouseMove(e){
      if(!this.$refs.tip){
        return
      }
      const tipWidth=this.$refs.tip.clientWidth
      if( e.clientX+tipWidth<this.lineWrapperRect.right){
        this.left=e.offsetX+15
      }else{
        this.left=e.offsetX-tipWidth-10
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .line-chart-container {
    display: flex;
    align-items: center;
    color: #333333;
    font-size: 14px;
    & > svg {
      width: 42px;
      height: 42px;
      margin-right: 16px;
    }
    & > div:first-of-type {
      flex: 1;
    }
    .label-wrapper {
      display: flex;
      & > :last-child {
        margin-left: auto;
      }
    }
    .line-wrapper {
      margin-top: 12px;
      height: 6px;
      background: #e4e4e4;
      border-radius: 3px;
      // overflow: hidden;
      position: relative;
      cursor: pointer;
      .value {
        height: 100%;
        border-radius: 3px;
      }
      .tip{
        z-index: 2;
        display: none;
        padding: 14px 12px;
        border-radius: 6px;
        background: #ffffff;
        box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset; 
        color: #333333;
        &>div{
          white-space:nowrap;
          &:not(:last-of-type){
          margin-bottom: 12px;
        }
        }
        .label{
          color: #999999;
          padding-right: 17px;
        }
      }
      &:hover>.tip{
        position: absolute; 
        display: block;
      }
    }
  }
</style>