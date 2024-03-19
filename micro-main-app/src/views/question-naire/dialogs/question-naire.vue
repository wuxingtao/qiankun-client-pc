<template>
  <el-dialog width="570px" @close="close" :visible.sync="dialogVisible" class="question" :modal-append-to-body="false" :close-on-click-modal="false">
    <div class="container">
      <div class="top">
        <svg-icon icon-class='questionnaire_close' @click="dialogVisible=false"></svg-icon>
      </div>
      <div class="middle">
        <div class="title">{{title}}</div>
        <div class="description">{{description}}</div>
      </div>
      <div class="down">
        <el-button type="primary" @click="submit">立即参与</el-button>
         <!-- <div class="qrcode_img" ref="qrcode"></div>
         <p>请使用微信扫描二维码，立即参与问卷。</p> -->
      </div>
    </div>
  </el-dialog>
</template>

<script>
import QRCode from 'qrcodejs2'
import { getToken } from '@/utils/storage'
export default {
  name: 'QuestionNaire',
  data () {
    return {
      dialogVisible: false,
      title: '',
      description: '',
      uuid: '',
      url:''

    }
  },
  methods: {
    close(){
      this.$emit('close')
    },
    showDialog (title, description, url, uuid) {
      this.dialogVisible = true
      this.title=title,
      this.description=description,
      this.url=url
      this.uuid = uuid
      // this.$nextTick(()=>{
      //   this.createQrcode()
      // })
    },
    submit(){
      // this.$router.push({path:'/admin/question-naire',query:{url:this.url}})
      this.$router.push({
        path: '/admin/survey',
        query: {
          p: this.uuid,
          sourceKey: 30,
          pageKey: 300,
        }
      })
      this.dialogVisible=false
    },
    // 问卷二维码
    createQrcode() {
      const link = this.url+'&sourceKey=30&pageKey=300&token='+getToken()
      console.log(link)
      new QRCode(this.$refs.qrcode, {
        width: 200,
        height: 200,
        text: link,
        colorDark: '#333',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      })
    },

  },
}
</script>

<style lang="scss" scoped>
  .question {
    /deep/.el-dialog__header{
      display: none;
    }
    /deep/.el-dialog__body {
      padding:0;
    }
    .svg-icon{
      width: 24px;
      height: 24px;
      position:absolute;
      top:16px;
      right: 16px;
    }
    .top {
      background: url("../../../assets/image/question-naire.png") no-repeat;
      height: 190px;
      width: 570px;
    }
    .title {
      font-size: 21px;
      text-align: center;
      line-height: 29px;
      font-weight: bold;
      color: #333;
      padding: 30px 20px;
      overflow: hidden;
    }
    .description {
      text-indent: 2em;
      font-size: 14px;
      color: #666;
      line-height: 28px;
      padding: 0 20px;
    }
    .down {
      text-align: center;
      padding-bottom: 40px;
      .qrcode_img{
         padding:10px;
         margin: 20px auto;
         width: 200px;
         border: 1px solid #bebebe;
         border-radius: 8px;
      }
    }
  }
</style>
