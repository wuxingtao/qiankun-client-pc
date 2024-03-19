<template>
  <div class="clientdialog">
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" top="10vh" width="724px" height="680px">
      <div slot="title" class="title">
        <span class="title-word">{{title}}</span>
        <span class="title-line"></span>
        <span class="title-ydNo">运单号:{{this.currentInfo.ydCode}}</span>
      </div>
      <div class="toolBar" v-if="currentInfo.image">
        <ul class="toolBar-left">
          <li @click="rotateToLeft" class="toolBar-li-left">
            <el-image :src="turnLeft" class="img"></el-image>
            <span>左转</span>
          </li>
          <li @click="rotateToRight" class="toolBar-li-left">
            <el-image :src="turnRight" class="img"></el-image>
            <span>右转</span>
          </li>
          <li @click="zoomIn" class="toolBar-li-left">
            <el-image :src="zoom" class="img"></el-image>
            <span>放大</span>
          </li>
          <li @click="reset" class="toolBar-li-left">
            <el-image :src="restore" class="img"></el-image>
            <span>还原</span>
          </li>
          <li @click="handleDownloadReceiptImages" class="toolBar-li-left">
            <el-image :src="download" class="img"></el-image>
            <span>下载回单</span>
          </li>
          <li @click="feedback" v-if="feedbackVisible" class="toolBar-li-left-feedback">
            <el-image :src="edit" class="img"></el-image>
            <span class="feedback">反馈</span>
            <el-tooltip :content="feedbackTipMessage" placement="top">
              <svg-icon icon-class="question" class-name="icon-question" />
            </el-tooltip>
          </li>
        </ul>
        <ul class="toolBar-right">
          <li>
            <!-- <el-image :src="leftNextTen" class="img-next" @click="handLeleftNextTen"></el-image> -->
            <el-image :src="leftNext" class="img-next" @click="handLeleftNext"></el-image>
          </li>
          <li class="page-wrap">
            <el-input class="page" v-model="currentIndex" />
            <span>/{{ allLength }}</span>
          </li>
          <li>
            <!-- <el-image :src="RightNextTen" class="img-next" @click="handRightNextTen"></el-image> -->
            <el-image :src="RightNext" class="img-next" @click="handRightNext"></el-image>
          </li>
        </ul>
      </div>
      <div class="container">
        <div v-if="currentInfo.image" class="container-img" id="gunlun" @mousewheel="gunlun">
          <div ref="imgWrap">
            <img ref="img" :style="{'transform': 'rotate('+rotateDegree+'deg) scale('+scale+')'}" :src="'data:image/png;base64,'+currentInfo.image" class="container-img" @mousedown="moveImg">
            <!-- <el-image :style="{'transform': 'rotate('+rotateDegree+'deg) scale('+scale+')'}"  :src="'data:image/png;base64,'+currentInfo.image" fit="fill" style="width:684px;height:426px;" ></el-image> -->
          </div>
        </div>
        <div v-else class="empty-wrap">
          <!-- <el-image :src="empty" class="empty"></el-image> -->
          <svg-icon icon-class="none-data2" class="empty" />
          <span>查无回单</span>
        </div>
      </div>
      <express-detail ref="expressDetailRef" layout="detail" :ydCode="currentInfo.ydNo"></express-detail>
      <!-- <span slot="footer" class="dialog-footer">

      </span> -->
    </el-dialog>
    <receipt-feedback ref="receiptFeedback" />
  </div>
</template>

<script>
import ReceiptFeedback from './receipt-feedback'
import dayjs from 'dayjs'
import ExpressDetail from '@/components/express/express-detail'
import { downloadReceiptImages, queryWaybillImages } from '@/services/api/waybillOld'
import { downloadFileByUrls } from '@utils/commonUtil'

export default {
  name: 'ViewAllImage',
  components: { ReceiptFeedback, ExpressDetail },
  data () {
    return {
      title: '查看回单联',
      dialogVisible: false,
      rotateDegree: 0,
      scale: 1.0,
      ydImageInfoList: [],
      imageType: 1, //图片运单类型
      receiptDataList: [],
      currentIndex: 1,
      getWaybillImageInfoFunc: null,
      currentInfo: {},
      allInfo: [],
      ydNoList: [],
      turnLeft: require('@assets/image/turn-left.png'),
      turnRight: require('@assets/image/turn-right.png'),
      zoom: require('@assets/image/zoom.png'),
      restore: require('@assets/image/restore.png'),
      download: require('@assets/image/download.png'),
      edit: require('@assets/image/edit.png'),
      leftNextTen: require('@assets/image/left-next-ten.png'),
      leftNext: require('@assets/image/left-next.png'),
      RightNextTen: require('@assets/image/right-next-ten.png'),
      RightNext: require('@assets/image/right-next.png'),
      empty: require('@assets/image/no-receipt.png'),
      params: {
        zoomVal: 1,
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
        flag: false
      },
      main: Object
    }
  },
  computed: {
    allLength () {
      return this.allInfo.length > this.ydNoList.length ? this.allInfo.length : this.ydNoList.length
    },
    feedbackVisible () {
      if (!this.$store.state.client.hasSetReceiptImage) return false
      return this.currentInfo.receiveDate && dayjs(this.currentInfo.receiveDate).add(30, 'd').isAfter(dayjs())
    },
    feedbackTipMessage () {
      if (this.feedbackVisible) {
        let msg = '如需重拍请在货物签收后一个月内申请'
        if (this.currentInfo.pictureStatus && this.currentInfo.pictureStatus == '20') {
          msg = '回单图片正在审核中,不能重复反馈'
        }
        return msg
      }
    }
  },
  watch: {
    currentIndex () {
      this.currentInfo = this.allInfo[this.currentIndex - 1]
      this.$refs.expressDetailRef.detailInit({ ydCode: this.currentInfo.ydCode, goodsStatus: 1 })
    }
  },
  methods: {
    async handleDownloadReceiptImages () {
      let res = await downloadReceiptImages(this.ydNoList.map(m => m.ydCode))
      if (res.code === 0) {
        const filesUrl = res.data && res.data.reduce((total, cur) => {
          total.push(...cur.files.map(f => f.visit))
          return total
        }, [])
        if (filesUrl.length > 0) {
          if (this.isClientMode) {
            if (this.$native.existsNativeFunc('net_downLoadFileByBatch_New')) {
              let result = []
              res.data && res.data.map(n => {
                let arr = n.files.map((f, index) => ({ visit: f.visit, bizId: n.bizId + (index > 0 ? '_' + index : '') }))
                result.push(...arr)
                return arr
              })
              const isOK = await this.$native.downLoadFileByBatchNew(JSON.stringify(result), '.jpg')
              if (isOK) {
                this.$message('文件已开始在后台下载,请稍后查看')
              }
            } else {
              this.$native.downLoadFileByBatch(JSON.stringify(filesUrl), '.jpg')
            }
          } else {
            downloadFileByUrls(filesUrl)
          }

        } else {
          this.$message.warning('该运单不存在回单图片')
        }
      }
    },
    showDialog (arr, ydNoList) {
      Object.assign(this.$data, this.$options.data())
      this.dialogVisible = true
      this.currentInfo = arr[0] || {}
      this.allInfo = arr
      this.ydNoList = ydNoList
      this.$nextTick(() => {
        this.$refs.expressDetailRef.detailInit({ ydCode: (arr[0] || {}).ydCode, goodsStatus: 1 })
      })
    },
    handLeleftNext () {
      this.currentIndex = this.currentIndex - 1 <= 0 ? 1 : this.currentIndex - 1
    },
    async handRightNext () {
      let arr = [], array = [...this.allInfo]
      this.currentIndex = this.currentIndex + 1 >= this.allLength ? this.allLength : this.currentIndex + 1
      if (!this.allInfo[this.currentIndex + 1]) {
        let index = this.ydNoList.findIndex(item => item.ydCode === this.currentInfo.ydCode)
        if (this.ydNoList[index + 1]) {
          let ydCode = (this.ydNoList[index + 1]).ydCode
          if (this.allInfo.findIndex(m => m.ydCode === ydCode) > -1) {
            index = index + 1
          }
          if (index >= this.ydNoList.length - 1) {
            return
          }
          let res = await queryWaybillImages((this.ydNoList[index + 1]).ydCode, 3)
          res.data.base64.forEach(item => {
            arr.push({ image: item, ...this.ydNoList[index + 1] })
          })
        }
        arr.forEach(item => {
          array.push({ ...item })
        })
        this.allInfo = array
      }
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
    lessen () {
      if (this.scale > 0.3) {
        this.scale -= 0.2
      }
    },
    reset () {
      this.rotateDegree = 0
      this.scale = 1
    },
    feedback () {
      const ydNo = this.allInfo[this.currentIndex - 1].ydCode
      this.$refs.receiptFeedback.showDialog(ydNo)
    },
    // 滚轮滑动
    gunlun (e) {
      let direction = e.deltaY > 0 ? 'down' : 'up'
      if (direction === 'up') {
        this.zoomIn()
      } else {
        this.lessen()
      }
    },
    moveImg (e) {
      e.preventDefault()
      // 获取元素
      let imgWrap = this.$refs.imgWrap
      let img = this.$refs.img
      let odiv = e.target
      let x = e.clientX - odiv.offsetLeft
      let y = e.clientY - odiv.offsetTop
      // 添加鼠标移动事件
      imgWrap.addEventListener('mousemove', move)
      function move (e) {
        img.style.left = e.clientX - x + 'px'
        img.style.top = e.clientY - y + 'px'

      }
      // 添加鼠标抬起事件，鼠标抬起，将事件移除
      img.addEventListener('mouseup', () => {
        imgWrap.removeEventListener('mousemove', move)
      })
      // 鼠标离开父级元素，把事件移除
      imgWrap.addEventListener('mouseout', () => {
        imgWrap.removeEventListener('mousemove', move)
      })
    },
    rollImg () {
      /* 获取当前页面的缩放比 若未设置zoom缩放比，则为默认100%，即1，原图大小 */
      let zoom = parseInt(this.$refs.img.style.zoom) || 100
      /* event.wheelDelta 获取滚轮滚动值并将滚动值叠加给缩放比zoom wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动 */
      zoom += event.wheelDelta / 12
      /* 最小范围 和 最大范围 的图片缩放尺度 */
      if (zoom >= 80 && zoom < 500) {
        this.$refs.img.style.zoom = zoom + '%'
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
  .icon-rotate {
    transform: rotateY(180deg);
  }
  .icon-question {
    color: red;
  }
  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #333333;
    font-weight: bold;
    padding: 5px 0;
    .title-word {
      font-weight: bold;
      font-size: 18px;
    }
    .title-line {
      display: inline-block;
      width: 1px;
      height: 17px;
      background: #e6e6e6;
      margin: 0 16px;
    }
    .title-ydNo {
      display: inline-block;
    }
  }

  .toolBar {
    display: flex;
    justify-content: space-between;
    padding: 0 0 10px 12px;
    box-sizing: border-box;

    .toolBar-li-left-feedback {
      display: flex;
      align-items: center;
      cursor: pointer;

      .feedback {
        margin: 0 4px;
      }

      .img {
        width: 12px;
        height: 12px;
      }
    }

    .toolBar-left,
    .toolBar-right {
      display: flex;
      align-items: center;
      cursor: pointer;

      .toolBar-li-left {
        display: flex;
        justify-content: center;
        margin-right: 28px;

        .img {
          width: 12px;
          height: 12px;
          margin-right: 4px;
        }
      }

      .page-wrap {
        margin-left: 6px;
        margin-right: 8px;
        .page {
          width: 40px;
          height: 24px;
          // border: 1px solid #dcdae2;
          border-radius: 5px;
          margin-right: 8px;
          // padding-left: 8px;
          // padding-right: 8px;
        }

        /deep/ .el-input__inner {
          height: 24px;
          line-height: 24px;
          padding: 0 8px;
          text-align: center;
        }
      }
    }
  }
  .container {
    // display: flex;
    // justify-content: center;
    // align-items: center;
    width: 684px;
    height: 426px;
    background: #f9f9f9;
    border: 1px solid #e3e3e3;
    margin-bottom: 20px;

    .container-img {
      width: 684px;
      height: 426px;
      overflow: hidden;
    }

    .empty-wrap {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      .empty {
        width: 110px;
        height: 110px;
      }
    }
  }
  /deep/.el-dialog .el-dialog__footer {
    border-top: none;
  }
</style>
