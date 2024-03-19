<template>
  <div
    v-if='data.limitReason && data.noticeMessage && visible'
    class='affect-wrapper'
    :class="isInMap ? 'popper affect_'+getAffectStyle(data.limitReason) : 'affect_'+getAffectStyle(data.limitReason) ">
    <div class='bg_wrapper'
         id='bg_wrapper'
         :style="'backgroundImage: url('+getAffectUrl(data.limitReason)+')'"></div>
<!--    <img :src='getAffectUrl(data.limitReason)' style="'height:'getHeight" />-->
<!--    <span :style="'backgroundImage: url('+getAffectUrl(data.limitReason)+')'"> </span>-->
<!--    <el-image class='bg_wrapper'-->
<!--              style="'height:'getHeight"-->
<!--              :src="getAffectUrl(data.limitReason)"></el-image>-->
    <p id='inner_content' ref='content'>
      <span>{{ data.noticeMessage }}</span>
    </p>
    <i v-if='data.limitType === affectTypeEnum.WARNING'
       class='iconfont icon-close' @click='visible = false'></i>
    <!--    <p>【限行】该地区外地车牌号XXXXXXX，限制时间：2022年3月16日。</p>-->
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api"
import { getAffectStyle, getAffectUrl } from "../utils/methods"
import { affectTypeEnum } from "@/views/waybill/enum/affectEnum"

export default defineComponent({
  name: "affect-notice",
  props: {
    data: Object,
    isInMap: Boolean
  },
  data() {
    return {
      visible: true,
      affectTypeEnum
    }
  },
  mounted() {
    // this.$nextTick(()=>{
    //   this.getHeight()
    // })
  },
  computed: {
  },
  methods: {
    getAffectStyle,
    getAffectUrl,
    // getHeight() {
    //   const height = document.getElementById('inner_content')?.offsetHeight
    //   const bgWrapper = document.getElementById('bg_wrapper')
    //   if(bgWrapper) bgWrapper.style.height = height + 'px'
    // }
  }
})
</script>

<style lang='scss' scoped>
@import "../style/common";

.popper {
  display: flex;
  min-width: 454px;
  border: 1px solid #ffffff;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.08);
  width: calc(100% - 12px) !important;


  .icon-close {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
  }
}

.affect-wrapper {
  display: inline-flex;
  align-items: center;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
  padding-right: 24px;
  background-repeat: no-repeat;
  background-size: 100px 100%;
  background-position: left center;

  .bg_wrapper {
    flex-shrink: 0;
    width: 24px;
    height: 28px;
    margin-left: 4px;
    //height: 100%;
    //min-height: 25px;
    //max-height: 42px;
    background-repeat: no-repeat;
    background-position: center left;
    background-size: contain;
  }

  > p {
    display: inline;
    //min-width: calc(100% - 52px);
    //max-width: calc(100% - 34px);
    //width: calc(100% - 57px);
    padding: 4px 0;

    > span {
      //  min-width: calc(100% - 52px);
      //  max-width: calc(100% - 34px);
      // padding-right: 16px;
      font-size: 12px;
      text-align: left;
      line-height: 17px;
      //overflow: hidden;
      //text-overflow: ellipsis;
      //display: -webkit-box;
      //-webkit-line-clamp: 2;
      //-webkit-box-orient: vertical;
    }
  }

  .icon-close {
    width: 12px;
    height: 12px;
    font-size: 12px;
    //position: absolute;
    //transform: translateY(-50%);
    //top: 50%;
    //right: 8px;
    margin: 0 8px;
  }
}
</style>
