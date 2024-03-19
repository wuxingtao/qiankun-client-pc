<template>
  <div class="clientdialog">
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" top="10vh" width="912px" height="680px">
      <div slot="title" class="title">
        {{title}}
        <span class="title-ydNo">运单号:{{this.currentInfo.ydNo}}</span>
      </div>
      <div class="toolBar">
        <ul class="toolBar-left">
          <li @click="rotateToLeft">
            <svg-icon icon-class="turn-left" /> 左转 
          </li>
          <li @click="rotateToRight"> 
            <svg-icon icon-class="turn-left" class-name="icon-rotate" /> 右转
          </li>
          <li @click="zoomIn">
            <svg-icon icon-class="zoom"  /> 放大
          </li>
          <li @click="reset">
            <svg-icon icon-class="restore"/> 还原
          </li>
          <li @click="handleDownloadReceiptImages" v-if="imageType === 3">
            <svg-icon icon-class="download"/> 下载{{ getWord() }}
          </li>
          <li @click="feedback" v-if="feedbackVisible">
            <svg-icon icon-class="edit2"/> 反馈 
            <el-tooltip :content="feedbackTipMessage" placement="top"> <svg-icon icon-class="question" class-name="icon-question"/></el-tooltip>
          </li>
        </ul>
        <ul class="toolBar-right">
          <li @click="viewPrevious"> 
            <svg-icon icon-class="next" />
          </li>
          <li>{{currentIndex}}/{{ydImageInfoList.length}}</li>
          <li @click="viewNext">
            <svg-icon icon-class="next" class-name="icon-rotate" />
          </li>
        </ul>
      </div>
      <div class="container"> 
        <img ref='img' :style="{'transform': 'rotate('+rotateDegree+'deg) scale('+scale+')'}" :src="'data:image/png;base64,'+this.currentInfo.image" class='container-img'>
      </div>
      <span slot="footer" class="dialog-footer">

      </span>
    </el-dialog>
    <receipt-feedback ref="receiptFeedback"/>
  </div>
</template>

<script>
import ReceiptFeedback from './receipt-feedback'
import dayjs from 'dayjs'
import {downloadReceiptImages} from '@/services/api/waybillOld'
import {downloadFileByUrls} from '@utils/commonUtil'

export default {
  name: 'ViewImage',
  components:{ReceiptFeedback},
  data() {
    return {
      title: '查看图片',
      dialogVisible: false, 
      rotateDegree: 0,
      scale: 1.0,
      ydImageInfoList: [],
      imageType: 1, //图片运单类型
      receiptDataList:[],
      currentIndex: 1 ,
      getWaybillImageInfoFunc:null
    }
  },
  mounted(){
    this.$store.dispatch('client/setSystemConfigAction')
  },
  watch: {
    currentIndex(){
      const info=this.currentInfo
      if(!info.image&&info.existsImage){
        let list=  this.getWaybillImageInfoFunc(info.ydNo,this.type,this.receiptDataList)
        this.ydImageInfoList.splice(this.currentIndex-1,1)
        this.ydImageInfoList.push(list)
      }
    }
  },
  computed:{  
    currentInfo(){
      return this.ydImageInfoList&&this.ydImageInfoList[this.currentIndex-1] || {}
    },
    feedbackVisible(){
      if(this.imageType!==3||!this.$store.state.client.hasSetReceiptImage){
        return false
      } 
      return this.currentInfo.receiveDate&&dayjs(this.currentInfo.receiveDate).add(30, 'd').isAfter(dayjs())
    },
    feedbackTipMessage(){
      if(this.feedbackVisible){
        let msg='如需重拍请在货物签收后7天内申请' 
        if(this.currentInfo.pictureStatus&&this.currentInfo.pictureStatus=='20'){
          msg='回单图片正在审核中,不能重复反馈'
        }
        return msg
      }
    }
  },
  methods: {
    showDialog({ydImageInfoList, type, receiptDataList ,getWaybillImageInfoFunc}) {
      Object.assign(this.$data, this.$options.data())
      this.dialogVisible = true
      const typeDict={1:'运单联',2:'签收联',3:'回单联'}
      this.title = '查看' + typeDict[type]
      this.imageType=type,
      this.ydImageInfoList = ydImageInfoList,
      this.receiptDataList = receiptDataList ,
      this.getWaybillImageInfoFunc=getWaybillImageInfoFunc
    },
    getWord() {
      switch(this.imageType) {
        case 1:
          return '运单联'
        case 2:
          return '签收联'
        case 3: 
          return '回单联'
      }
    },
    feedback(){
      const ydNo=this.ydImageInfoList[this.currentIndex-1].ydNo
      this.$refs.receiptFeedback.showDialog(ydNo)
    },
    async handleDownloadReceiptImages(){
      let res=await  downloadReceiptImages(this.ydImageInfoList.map(m=>m.ydNo))
      if(res.code===0){ 
        const filesUrl= res.data&&res.data.reduce((total,cur)=>{
          total.push(...cur.files.map(f=>f.visit))
          return total
        },[])
        // console.log('filesUrl :>> ', filesUrl)
        if(filesUrl.length>0){
          if(this.isClientMode){ 
            this.$message('文件已开始在后台下载,请稍后查看')
            this.$native.downLoadFileByBatch(JSON.stringify(filesUrl),'.jpg')
          }else{
            downloadFileByUrls(filesUrl) 
          }
                    
        }else{
          this.$message.warning('该运单不存在回单图片')
        }
      }
    },
    rotateToLeft() {  //TODO:优化（图片居中）
      this.rotateDegree -= 90
    },
    rotateToRight() {
      this.rotateDegree += 90
    },
    zoomIn() {
      if (this.scale < 2.5) {
        this.scale += 0.2
      }
    },
    reset() {
      this.rotateDegree = 0
      this.scale = 1
    },
    viewPrevious() {
      if (this.currentIndex > 1) {
        this.currentIndex--
      }
    },
    viewNext() {
      if (this.currentIndex < this.ydImageInfoList.length) {
        this.currentIndex++
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .icon-rotate {
    transform: rotateY(180deg);
  }
  .icon-question{
    color: red;
  }
  .title {
    font-size: 14px;
    color: #333333;
    font-weight: bold;
    padding: 5px 0;
    .title-ydNo {
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
    overflow:hidden;
    position: relative;
      .container-img {
      width: 872px;
      height: 543px;
      overflow: hidden;
    }
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
