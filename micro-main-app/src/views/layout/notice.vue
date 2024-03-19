<template>
  <div class='notice' v-if='showMarquee && marqueeData && marqueeData.detailsList && marqueeData.detailsList.length'>
    <!--    <img src='@/assets/image/admin/icon_notice.png' class='icon' />-->
    <el-carousel class='list' indicator-position='none' arrow='never' direction='vertical'
                 :loop='true' :interval='3000'>
      <el-carousel-item v-for='(item, index) in marqueeData.detailsList'
                        :class="isClientMode ? 'compatibility' : '' "
                        :key='index'>
        <div class='item' :title='item.advertisementNoticeDto.noticeText'
             @click='clickNotice(item.advertisementNoticeDto, index)'>
          <div class='content-icon' :style='"backgroundImage: url("+item.advertisementNoticeDto.posterLink+")"'></div>
          <div class='content'>{{ item.advertisementNoticeDto.noticeText }}</div>
          <!--          <div class='content'>日日日日日日日一日日日日日日日日日子</div>-->
          <div class='close'>
            <i v-if='!!marqueeData.allowClose' class='iconfont icon-window-close' @click='close'></i>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <!--    <el-dialog-->
    <!--      :title='title'-->
    <!--      :visible.sync='isDialogVisible'-->
    <!--      width='700px'-->
    <!--      class='dialog'-->
    <!--    >-->
    <!--      <el-scrollbar>-->
    <!--        <div v-html='content' class='dialog-content'></div>-->
    <!--      </el-scrollbar>-->
    <!--      <div slot='footer' class='dialog-footer'>-->
    <!--        <el-button type='primary' @click='isDialogVisible = false'>-->
    <!--          我知道了-->
    <!--        </el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import { ADVERTISEMENT_JUMPMODE_ENUM, ADVERTISEMENT_TYPE_ENUM } from '@/enum/admin'
import { advertisementConfirmByUser, getAdvertisementDetails } from '@/services/api/common'
import dayjs from 'dayjs'

export default {
  name: 'Notice',
  data() {
    return {
      isDialogVisible: false,
      noticeList: [],
      title: '',
      content: '',
      showMarquee: true,
      advertisement: []
    }
  },
  created() {
    this.getAdvertisement()
    // UserService.getSystemConfigData().then((res) => {
    //   let notice = {}
    //   if (res.data && res.data.dataList) {
    //     res.data.dataList.forEach((item) => {
    //       if (item.SystemConfigName === "ReminderTitle") {
    //         notice.title = item.SystemConfigValue
    //       } else if (item.SystemConfigName === "ReminderContent") {
    //         notice.content = item.SystemConfigValue
    //       }
    //     })
    //     if (notice.title) {
    //       this.noticeList.push(notice)
    //     }
    //   }
    // })
  },
  computed: {
    marqueeData() {
      if (!this.advertisement) return []
      const flag = this.advertisement.some(i => i.advertisementType === ADVERTISEMENT_TYPE_ENUM.MARQUEE)
      if (!flag) return
      return this.advertisement.find(i => i.advertisementType === ADVERTISEMENT_TYPE_ENUM.MARQUEE)
    }
  },
  methods: {
    // 跑马灯接口调用
    async getAdvertisement() {
      const detail = await getAdvertisementDetails({
        channelCode: 'pc',
        pageCode: 'pcHomePage',
        adTypeList: ['30'],
        latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })
      this.advertisement = detail.data || []
      this.$store.commit('SET_ADVERTISEMENT', detail.data)
    },
    clickNotice(item, index) {
      const { jumpMode, h5Link, modelRoute } = item
      /**
       * 跑马灯支持四种交互
       * 无交互
       * 弹窗
       * 内部链接
       * 外部链接
       * */
      switch (jumpMode) {
        case ADVERTISEMENT_JUMPMODE_ENUM.NONE:
          break
        case ADVERTISEMENT_JUMPMODE_ENUM.H5:
          if (!h5Link) break
          this.$router.push({
            path: '/admin/message-center',
            query: {
              url: h5Link
            }
          })
          break
        case ADVERTISEMENT_JUMPMODE_ENUM.NORMAL:
          if (!modelRoute) break
          this.$router.push({
            path: modelRoute
          })
          break
      }
      advertisementConfirmByUser({
        advertisementCodeList: [this.marqueeData.detailsList[index].advertisementCode],
        channelSource: 'pc',
        eventType: 2
      })
        .finally(() => {
          this.getAdvertisement()
        })
      // 弹窗
      // this.isDialogVisible = true
      // let notice = this.noticeList[index]
      // this.title = notice.title
      // this.content = notice.content
      
      // 外部链接
      // this.$router.push({
      //   name: "outside-page",
      //   params: {
      //     url: "http://www.baidu.com"
      //   }
      // })
    },
    close() {
      const advertisementCodeList = this.marqueeData.detailsList.map(i => i.advertisementCode)
      advertisementConfirmByUser({
        advertisementCodeList,
        channelSource: 'pc',
        eventType: 2
      })
      this.showMarquee = false
    }
  }
}
</script>

<style lang='scss' scoped>
$notice-height: 45px;

.notice {
  width: 277px;
  display: flex;
  align-items: center;
  //position: absolute;
  //left: 50%;
  //transform: translateX(-50%);
  
  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    //float: left;
    //color: #ffffff;
    //margin: 14px 10px 0 0;
  }
  
  .list {
    width: calc(100% - 6px);
    margin: 0 6px;
    height: $notice-height;
    line-height: $notice-height;
    
    /deep/ .el-carousel__container {
      height: $notice-height;
    }
    
    .item {
      width: 253px;
      height: 45px;
      color: #ffffff;
      font-size: 14px;
      //animation: 10s wordsLoop linear infinite normal;
      cursor: pointer;
      position: relative;
      box-sizing: border-box;
      padding-left: 24px;
      
      .content-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .content {
        display: inline-block;
        max-width: calc(100% - 24px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .close {
        display: inline-block;
        line-height: 45px;
        overflow: hidden;
        margin-left: 12px;
        
        .iconfont {
          font-size: 8px;
          color: #ffffff;
        }
      }
    }
  }
  
  
  .dialog {
    &-content {
      height: 100px;
      padding: 30px 10px;
      line-height: 26px;
    }
  }
}

.compatibility {
  // 带壳端transition属性实现有问题，可能引起页面刷新
  transition: unset !important;
}

// @keyframes wordsLoop {
//   0% {
//     transform: translateX(100%);
//     -webkit-transform: translateX(100%);
//   }
//   100% {
//     transform: translateX(-100%);
//     -webkit-transform: translateX(-100%);
//   }
// }
</style>