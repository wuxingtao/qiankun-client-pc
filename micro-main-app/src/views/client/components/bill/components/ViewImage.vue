<template>
  <div class="clientdialog">
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="912px"
               height="680px">
      <div slot="title"
           class="title">
        {{title}}
        <span class="title-ydCode">运单号:{{ydCode}}</span>
      </div>
      <div class="toolBar">
        <ul class="toolBar-left">
          <li @click="rotateToLeft">
            <img src="@/assets/image/bill/icon_turnLeft.png" />
            <span> 左转</span>
          </li>
          <li @click="rotateToRight">
            <img style="transform: rotateY(180deg);"
                 src="@/assets/image/bill/icon_turnLeft.png" />
            <span>右转</span>
          </li>
          <li @click="zoomIn">
            <i class="el-icon-zoom-in"></i><span>放大</span>
          </li>
          <li @click="reset">
            <i class="el-icon-refresh-left"></i><span>还原</span>
          </li>
        </ul>
        <ul class="toolBar-right">
          <li @click="viewPrevious"> <img src="@/assets/image/bill/icon_previous.png" /></li>
          <li>{{currentIndex}}/{{imgs.length}}</li>
          <li @click="viewNext"><img style="transform: rotateY(180deg);"
                 src="@/assets/image/bill/icon_previous.png" /></li>
        </ul>
      </div>
      <div class="container">

        <img ref='img'
             :style="{'transform': 'rotate('+rotateDegree+'deg) scale('+scale+')'}"
             :src="'data:image/png;base64,'+imgs[currentIndex-1]">
      </div>
      <span slot="footer"
            class="dialog-footer">

      </span>
    </el-dialog>
  </div>
</template>

<script>

import { getPhone } from '@/utils/storage'
export default {
  data () {
    return {
      title: '查看图片',
      dialogVisible: false,
      ydCode: '',
      imageType: 1,//图片运单类型
      rotateDegree: 0,
      scale: 1.0,
      imgs: [],
      currentIndex: 1,
      // url32:  require("@/assets/image/bill/mybillBanner.png")
    }
  },
  watch: {
    // rotateDegree () {
    //   this.$refs.img.style.transform = ''
    //   // this.$refs.img.style.transform = 'rotate(' + rotateDegree + 'deg) scale(' + scale + ')'
    //   this.$refs.img.style.transform = 'rotate(' + this.rotateDegree + 'deg)';
    // },
    // scale () {
    //   this.$refs.img.style.transform = ''
    //   // this.$refs.img.style.transform = 'rotate(' + rotateDegree + 'deg) scale(' + scale + ')'
    //   this.$refs.img.style.transform = 'scale(' + this.scale + ')'
    // }
  },
  methods: {

    showDialog (values) {
      Object.assign(this.$data, this.$options.data())
      this.dialogVisible = true
      this.title = values.title
      this.ydCode = values.ydCode
      this.imageType = values.imageType
      this.imgs = values.imgs
    },
    rotateToLeft () {
      this.rotateDegree -= 90
    },
    rotateToRight () {
      this.rotateDegree += 90
    },
    zoomIn () {
      if (this.scale < 2.5) {
        this.scale += 0.2
      }
    },
    reset () {
      this.rotateDegree = 0
      this.scale = 1
    },
    viewPrevious () {
      if (this.currentIndex > 1) {
        this.currentIndex--
      }
    },
    viewNext () {
      if (this.currentIndex < this.imgs.length) {
        this.currentIndex++
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .title {
    font-size: 14px;
    color: #333333;
    font-weight: bold;
    padding: 5px 0;
    .title-ydCode {
      display: inline-block;
      padding-left: 16px;
    }
  }

  .toolBar {
    i {
      font-weight: bolder;
    }
    height: 33px;
    padding-top: 6px;
    font-size: 12px;
    color: #7352bf;
    .toolBar-left {
      width: 500px;
      line-height: 12px;
      & > li {
        padding-right: 31px;
        float: left;
        cursor: pointer;
        span {
          margin-left: 4px;
          padding-top: 2px;
          display: inline-block;
        }
      }
    }
    .toolBar-right {
      float: right;
      & > li {
        padding-right: 11px;
        font-size: 14px;
        float: left;
        cursor: pointer;
      }
    }
  }
  .container {
    width: 872px;
    height: 543px;
    overflow: scroll;
    position: relative;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
  }
  /deep/.el-dialog .el-dialog__footer {
    border-top: none;
  }
</style>
