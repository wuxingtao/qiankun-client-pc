<template>
  <el-dialog title="回单照片"
             :visible.sync="dialogVisibleImg"
             @close="closeDialogVisibleImg"
             width="1053px">
    <div class="waybill-compile_img noselect">
      <div>
        <slot name="btn"></slot>
      </div>
      <div class="btn-icon"
           :style="{width: imgConfig.width ? imgConfig.width + 'px' : '100%'}">
        <el-button type="text"
                   @click="imgLeft"
                   icon="layout layout-zuozhuan1">左转</el-button>
        <el-button type="text"
                   @click="imgRight"
                   icon="layout layout-youzhuan1">右转</el-button>
        <el-button type="text"
                   @click="imgBig"
                   icon="layout layout-fangda1">放大</el-button>
        <el-button type="text"
                   @click="imgSmall"
                   icon="layout layout-suoxiao1">缩小</el-button>
        <el-button type="text"
                   @click="imgRestore"
                   icon="layout layout-huanyuan">还原</el-button>
        <template v-if="imgConfig.btns && imgConfig.btns.length > 0">
          <el-button type="text"
                     v-for="(item, index) in imgConfig.btns"
                     :key="index"
                     :icon="item.icon ? 'iconfont ' + item.icon : ''"
                     @click="() => {item.click && item.click()}">{{item.label}}</el-button>
        </template>
        <span class="pager"
              v-if="(imgConfig.imgSrc && typeof imgConfig.imgSrc === 'object')">
          <i class="el-icon-caret-left"
             @click="prevImge">&nbsp;</i>
          <span class="text-num">{{currentIndex}}&nbsp;/&nbsp;{{imgConfig.imgSrc.length}}&nbsp;</span>
          <i class="el-icon-caret-right"
             @click="nextImge"></i>
        </span>
        <slot name="topbtn"></slot>
      </div>
      <div class="imgbox"
           ref="imgbox"
           v-loading="loading"
           :style="{width: imgConfig.width ? imgConfig.width + 'px' : '100%', height: imgConfig.height+'px'}">
        <img width="100%"
             ondragstart="return false;"
             @mousedown='ticketMousedow'
             @mouseout='ticketMouseout'
             @mouseup='ticketMouseup'
             @mousewheel="ticketMousewheel"
             @mousemove="ticketMousemove"
             ref="ticketImg"
             v-show="!!loadImgSrc"
             :src="loadImgSrc" />
        <div v-show="!loadImgSrc">
          <div class="no-img">
            <i class="layout layout-icon_magnifier"></i>
            <span class="no-img-txt">找不到图片</span>
          </div>
        </div>
      </div>
      <div class="bottomContent">
        <slot name="bottom"></slot>
      </div>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: 'kye-image',
    props: {
      config: {
        type: Object,
        default () {
          return {}
        }
      },
    },
    data () {
      return {
        isMove: false, // 标记是否移动事件
        lastStatus: {
          scale: 1,
          rotate: 0,
          translateX: 0,
          translateY: 0,
          mouseX: 0,
          mouseY: 0
        },
        loadImgSrc: '',
        currentIndex: 1,
        loading: true,
        imgConfig: {
          width: 0,
          height: 600,
          imgSrc: '',
          maxScale: 4.0, // 最大放大倍数
          minScale: 0.5, // 最小放大倍数
          step: 0.06 // 每次放大、缩小 倍数的变化值
        },
        dialogVisibleImg: false
      }
    },
    methods: {
      initConfig () {
        this.imgConfig = { ...this.imgConfig, ...this.config }
        this.currentIndex = (Number(this.imgConfig.index) + 1) || 1
        let { imgSrc } = this.imgConfig
        if (imgSrc) {
          if (typeof imgSrc === 'string') {
            this.loadImgSrc = imgSrc
          } else if (Array.isArray(imgSrc)) {
            if (imgSrc.length === 0) {
              this.currentIndex = 0
              this.loadImgSrc = ''
            } else {
              this.loadImgSrc = imgSrc[this.currentIndex - 1]
            }
          }
        } else {
          this.loadImgSrc = ''
        }
        this.loadImg(this.loadImgSrc)
      },
      loadImg (imgSrc) {
        this.loading = true
        let img = new Image()
        img.src = imgSrc
        img.onload = () => {
          this.loading = false
        }
        img.onerror = (imgSrc) => {
          this.loading = false
        }
        this.imgRestore()
      },
      isMax () {
        let number = (this.lastStatus.scale >= this.imgConfig.maxScale) ? this.imgConfig.maxScale : this.lastStatus.scale + this.imgConfig.step
        return number
      },
      isMin () {
        let number = (this.lastStatus.scale <= this.imgConfig.minScale) ? this.imgConfig.minScale : this.lastStatus.scale - this.imgConfig.step
        return number
      },
      imgBig () {
        this.lastStatus.scale = this.isMax()
        this.toTransfrom()
      },
      imgSmall () {
        this.lastStatus.scale = this.isMin()
        this.toTransfrom()
      },
      toTransfrom () {
        let str = `translate3d(${this.lastStatus.translateX}px,${this.lastStatus.translateY}px,0.1px) scale3d(${this.lastStatus.scale},${this.lastStatus.scale},0.0001) rotate(${this.lastStatus.rotate}deg)`
        if (this.$refs.ticketImg) {
          this.$refs.ticketImg.style.transform = str
          this.$refs.ticketImg.style.webkitTransform = str
          this.$refs.ticketImg.style.msTransform = str
          this.$refs.ticketImg.style.omzTransform = str
        }

        // this.ticketImg.style.transform = str
        // this.ticketImg.style.webkitTransform = str
        // this.ticketImg.style.msTransform = str
        // this.ticketImg.style.omzTransform = str
      },
      imgLeft () {
        this.lastStatus.rotate = parseInt(this.lastStatus.rotate / 90) * 90 - 90
        this.toTransfrom()
      },
      imgRight () {
        this.lastStatus.rotate = parseInt(this.lastStatus.rotate / 90) * 90 + 90
        this.toTransfrom()
      },
      imgRestore () {
        this.lastStatus = {
          scale: 1,
          rotate: 0,
          translateX: 0,
          translateY: 0
        }
        this.toTransfrom()
      },
      windowToCanvas (x, y) {
        var box = this.$refs.imgbox.getBoundingClientRect()
        return {
          x: x - box.left,
          y: y - box.top
        }
      },
      drawImgByMove (x, y) {
        this.lastStatus.translateX = this.lastStatus.translateX + (x - this.lastStatus.mouseX)
        this.lastStatus.translateY = this.lastStatus.translateY + (y - this.lastStatus.mouseY)
        this.lastStatus.mouseX = x
        this.lastStatus.mouseY = y
        this.toTransfrom()
      },
      ticketMousedow (e) {
        this.isMove = true
        // this.$refs.imgbox.style.cursor = 'move'
        let box = this.windowToCanvas(e.clientX, e.clientY)
        this.lastStatus.mouseX = box.x
        this.lastStatus.mouseY = box.y
      },
      ticketMouseout (e) {
        this.isMove = false
        // this.$refs.imgbox.style.cursor = 'default'
      },
      ticketMouseup (e) {
        this.isMove = false
        // this.$refs.imgbox.style.cursor = 'default'
      },
      ticketMousemove (e) {
        if (this.isMove) {
          var box = this.windowToCanvas(e.clientX, e.clientY)
          this.drawImgByMove(box.x, box.y)
        }
      },
      ticketMousewheel (e) {
        e.preventDefault()
        if (e.wheelDelta > 0) {
          this.lastStatus.scale = this.isMax()
        } else {
          this.lastStatus.scale = this.isMin()
        }
        this.toTransfrom()
      },
      prevImge () {
        let { imgSrc } = this.imgConfig
        if (Array.isArray(imgSrc) && imgSrc.length === 0) {
          this.currentIndex = 0
          return
        }
        this.currentIndex -= 1
        if (this.currentIndex === 0) {
          this.currentIndex = 1
        }
        this.lastStatus.rotate = 0
        this.toTransfrom()
        this.loadImgSrc = this.imgConfig.imgSrc[this.currentIndex - 1]
        this.loadImg(this.loadImgSrc)
        this.$emit('change', this.currentIndex - 1)
      },
      nextImge () {
        let { imgSrc } = this.imgConfig
        if (Array.isArray(imgSrc) && imgSrc.length === 0) {
          this.currentIndex = 0
          return
        }
        this.currentIndex += 1
        if (this.currentIndex >= imgSrc.length) {
          this.currentIndex = imgSrc.length
        }
        this.lastStatus.rotate = 0
        this.toTransfrom()
        this.loadImgSrc = this.imgConfig.imgSrc[this.currentIndex - 1]
        this.loadImg(this.loadImgSrc)
        this.$emit('change', this.currentIndex - 1)
      },
      changeIndex (index) {
        const i = Number(index)
        const imgSrcArr = this.imgConfig.imgSrc
        if (i > -1 && Array.isArray(imgSrcArr) && imgSrcArr.length > 0) {
          this.currentIndex = i + 1
          this.loadImgSrc = imgSrcArr[i]
          this.loadImg(this.loadImgSrc)
        }
      },
      handleKeydown (e) {
        if (e.keyCode === 37) {
          this.prevImge()
        } else if (e.keyCode === 39) {
          this.nextImge()
        }
      },
      closeDialogVisibleImg () {
        this.dialogVisibleImg = false
      },
      showDialogVisibleImg () {
        this.dialogVisibleImg = true
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.ticketImg = this.$refs.ticketImg
        this.initConfig()
      })
      document.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy () {
      document.removeEventListener('keydown', this.handleKeydown)
    },
    watch: {
      'config.index' (val) {
        this.changeIndex(val)
      },
      'config.imgSrc' (val) {
        this.initConfig()
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '../../assets/style/variable.scss';

  .overHider {
    overflow: hidden;
  }
  .waybill-compile_img {
    position: relative;
    padding-bottom: 20px;
    box-sizing: border-box;
  }
  .imgbox {
    clear: both;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border: 1px solid #eeeeee;
    background-color: #f1f1f5;
  }
  .waybill-compile_img img {
    display: block;
    clear: both;
  }
  .no-img {
    color: #cccccc;
    text-align: center;
    .layout {
      font-size: 36px;
    }
    .no-img-txt {
      display: block;
      padding-top: 20px;
      font-size: 16px;
    }
  }
  .btn-icon {
    display: flex;
    flex-wrap: wrap;
    user-select: none;
    padding: 12px 0 4px;
    .pager {
      display: inline-block;
      width: 110px;
      line-height: 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 0 0 10px;
    }
    i {
      padding: 0 2px;
      color: $theme;
    }
  }
  .el-icon-caret-left::before {
    font-size: 22px;
  }
  .el-icon-caret-right::before {
    font-size: 22px;
  }
</style>
