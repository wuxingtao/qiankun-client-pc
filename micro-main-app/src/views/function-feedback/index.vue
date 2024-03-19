<template>
  <div class='function-feedback--container'>
    <div class='banner' :style="{'backgroundImage':`url(${bannerImg})`}">
      <div class='qrcode--wrapper'>
        <span>
          <img src='@/assets/image/qrcode-miniprogram-border.png' />
          <div>微信扫一扫{{ tip }}</div>
        </span>
        <span>
          <img src='@/assets/image/qrcode-app-border.png' />
          <div>下载APP{{ tip }}</div>
        </span>
      </div>
    </div>
    <div class='content--wrapper'>
      <div><i>*</i>请选择您要建议的功能</div>
      <ul class='item-list'>
        <li v-for='(item,index) in items' :key='item.type+index' :class='{active:feedbackType===item.code}'
            @click='feedbackType=item.code'>
          <i :class="['iconfont',item.icon]" />{{ item.text }}
        </li>
      </ul>
      <el-input class='content--input' type='textarea' :rows='7' :maxlength='200' show-word-limit resize='none'
                placeholder='欢迎您反馈跨越速运的使用建议，帮助我们做的更好（必填）' v-model='content'>
      </el-input>
      <div class='img--wrapper'>
        <div> 添加图片 <span>上传截图能更快解决问题哦（{{ fileList.length }}/5）</span></div>
        <ky-upload ref='kyUpload' :limit='5' :http-request='httpRequest' />
      </div>
    </div>
    <footer class='footer admin-footer'>
      <div class='btn-wrapper'>
        <el-button type='primary' :loading='loading' :disabled='!feedbackType||!content' @click='saveData'>提交
        </el-button>
      </div>
    </footer>
    <feedback-result :tip='tip' :visible.sync='visibleDialog' />
  </div>
</template>

<script>
import KyUpload from '@/components/ky-upload'
import FeedbackResult from './feedback-result.vue'
import { uploadImage, addFeedback, getFeedbackDeadline } from '@api/functionFeedback'
import { getLoginData } from '@/utils/storage'

export default {
  components: {
    KyUpload, FeedbackResult
  },
  data() {
    return {
      isMounted: false,
      loading: false,
      visibleDialog: false,
      tip: '查看反馈记录',
      bannerImg: require('@/assets/image/feedback/banner.png'),
      items: [{ type: 'order', icon: 'icon-palce-order', text: '下单问题', code: '10' },
        { type: 'query', icon: 'icon-query', text: '查件问题', code: '30', },
        { type: 'payment', icon: 'icon-payment', text: '支付问题', code: '80' },
        { type: 'invoice', icon: 'icon-invoice', text: '发票问题', code: '40' },
        { type: 'crash', icon: 'icon-crash', text: '卡顿/闪退', code: '90' },
        { type: 'others', icon: 'icon-others', text: '其他问题', code: '60' }],
      feedbackType: '60',
      content: '',
    }
  },
  mounted() {
    this.isMounted = true
  },
  activated() {
    this.init()
  },
  methods: {
    async init() {
      if (this.isShowRewardFeedback) {
        return
      }
      const res = await getFeedbackDeadline()
      if (res.code === 0 && res.data.isShowFeedbackIcon) {
        this.tip = '查看记录与提现'
        this.bannerImg = require('@/assets/image/feedback/banner-reward.png')
      } else {
        this.tip = '查看反馈记录'
        this.bannerImg = require('@/assets/image/feedback/banner.png')
      }
    },
    async saveData() {
      try {
        this.loading = true
        const { phone, userName, customerShortName } = getLoginData()
        const params = {
          content: this.content,
          feedbackType: this.feedbackType,
          imgIds: this.fileList.map(f => f.imgId),
          source: 'client',
          userName,
          phone,
          userCompanyName: customerShortName
        }
        const res = await addFeedback(params)
        if (res.code === 0) {
          this.feedbackType = this.content = ''
          this.$refs.kyUpload.fileList = []
          this.visibleDialog = true
        }
      } finally {
        this.loading = false
      }
    },
    async httpRequest(file, cb) {
      const res = await uploadImage(file.base64)
      if (res.code === 0) {
        cb({ url: res.data.imgUrl, imgId: res.data.imgId })
      }
    }
  },
  computed: {
    fileList() {
      if (!this.isMounted) {
        return []
      }
      return this.$refs.kyUpload && this.$refs.kyUpload.fileList || []
    },
    isShowRewardFeedback() {
      const ids = this.$store.getters.authorityIds
      const flag = ids && ids.includes('130')
      return flag
    }
  },
  watch: {
    isShowRewardFeedback: {
      handler(val) {
        if (!val) {
          return
        }
        this.tip = '查看记录与提现'
        this.bannerImg = require('@/assets/image/feedback/banner-reward.png')
        return
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
.function-feedback--container {
  @import "~@/assets/scss/footer.scss";
  @include scroll-bar;
  height: calc(100vh - 143px);
  padding: 30px;
  box-sizing: border-box;
  overflow: auto;
  
  .banner {
    // background: url("~@/assets/image/feedback/banner.png") no-repeat;
    background-repeat: no-repeat;
    background-position: left;
    background-size: cover;
    width: 940px;
    height: 163px;
    
    .qrcode--wrapper {
      box-sizing: border-box;
      padding: 28px 37px 0 0;
      display: flex;
      justify-content: flex-end;
      font-size: 12px;
      color: #fff;
      line-height: 17px;
      
      & > span {
        text-align: center;
        margin-top: -30px;
        
        img {
          display: block;
          width: 130px;
          height: 130px;
          padding-bottom: 4px;
        }
        
        div {
          font-size: 10px;
        }
      }
      
      span + span {
        margin-left: 60px;
      }
    }
  }
  
  .content--wrapper {
    margin-top: 19px;
    
    & > div:first-of-type {
      color: #333333;
      font-size: 14px;
      font-weight: bold;
      
      & > i {
        color: #fb2f2f;
        padding-right: 3px;
      }
    }
    
    .item-list {
      margin: 20px 0;
      display: flex;
      color: $--color-text-primary;
      
      & > li {
        position: relative;
        width: 148px;
        height: 40px;
        border-radius: 6px;
        background: #f7f8fa;
        box-sizing: border-box;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        
        &.active {
          border: 1px solid #9673f6;
          background: #fff;
          color: #9673f6;
          
          &::after {
            content: "";
            width: 12px;
            height: 10px;
            position: absolute;
            top: -1px;
            right: -1px;
            background: url("~@/assets/image/icon-checked.png");
          }
        }
        
        & > i {
          font-size: 23px;
          padding-right: 14px;
        }
      }
    }
    
    .content--input {
      max-width: 940px;
      
      /deep/ {
        .el-textarea__inner {
          background: #f7f8fa;
          border-radius: 6px;
        }
        
        .el-input__count {
          background: #f7f8fa;
          bottom: 10px;
          right: 16px;
        }
      }
    }
    
    .img--wrapper {
      margin-top: 20px;
      color: #333333;
      
      & > div:first-of-type {
        margin-bottom: 16px;
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        
        & > span {
          padding-left: 4px;
          font-size: 12px;
          font-weight: normal;
          color: #6e6d72;
        }
      }
    }
  }
  
  .footer {
    border-top: 7px solid #f2f4f7;
  }
}
</style>