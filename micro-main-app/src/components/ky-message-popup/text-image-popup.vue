<template>
  <el-dialog :width="isAdjustPriceNotice?'670px':'400px'" :visible.sync="dialogVisible" title='' class="message-popup" :close-on-click-modal="false" :modal-append-to-body="false" :visibleFooter="false">
    <div :style="messageModel.posterLink?'background-image: url('+messageModel.posterLink+')':''" :class="messageModel.posterLink?'picture':'default-set'"></div>
    <div class="container">
      <div class="header">
        <svg-icon icon-class='message-popup-close' @click="handelClose" v-if="messageModel.configCloseButton==='1'"></svg-icon>
      </div>
      <div class="title">{{messageModel.title}}</div>
      <adjust-price-notice ref="adjustPriceNoticeRef" v-if="isAdjustPriceNotice" />
      <div v-else :class="{'content':true,'image-content':messageModel.posterLink}" id="container" v-html="htmlText">
      </div>
      <div class="down">
        <el-button :loading="loading" :type="messageModel.buttonList.length===1||index===1?'primary':''" v-for="(item,index) in messageModel.buttonList" :key="index" class='ky-button' @click="submit(item)">{{item.buttonText}}</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { advertisementConfirmByUser } from '@/services/api/common'
import AdjustPriceNotice from '@views/delivery/adjust-price/components/weight'
import router from '@/router'
import deliveryApi from '@api/delivery'

export default {
  name: 'text-image-popup',
  props: {
    imageUrl: {
      typeof: String
    }
  },
  components: {
    AdjustPriceNotice
  },
  data () {
    return {
      dialogVisible: false,
      messageModel: {},
      htmlText: '',
      isAdjustPriceNotice: false,
      loading: false
    }
  },
  methods: {
    async showDialog (model) {
      this.messageModel = model.advertisementPopupDto
      this.advertisementCode = model.advertisementCode
      this.htmlText = model.advertisementPopupDto?.popupDetail
      const customerParam = model.advertisementPopupDto?.customerParam
      if (customerParam?.adjustId) {
        const params = { adjustId: customerParam.adjustId, customerCode: customerParam.customerCode }
        const res = await deliveryApi.getAdjustPriceDetail(params)
        if (res.code !== 0 || !res.data) {
          return
        }
        this.dialogVisible = true
        this.isAdjustPriceNotice = true
        this.$nextTick(async () => {
          await this.$refs.adjustPriceNoticeRef.loadData(res.data)
        })
        return
      }
      this.dialogVisible = true
    },
    async submit (model) {
      try {
        this.loading = true
        let isClose = true
        let apiButton = false
        let twoConfirm = true
        if (model.twoConfirmStatus === 1) {
          twoConfirm = true
          this.dialogVisible = false
          setTimeout(() => {
            this.$kye_message.warnConfirm(model.twoConfirmPopupText, {
              confirmButtonText: model.twoConfirmButtonTextTwo,
              cancelButtonText: model.twoConfirmButtonTextOne,
              title: model.twoConfirmPopupTitle,
              type: 'warning',
              closeOnClickModal: false
            }).then(() => {
              twoConfirm = false
              this.handleSubmit(isClose, apiButton, model)
            }).catch(() => {
              setTimeout(() => {
                this.$nextTick(() => {
                  this.dialogVisible = true
                })
              }, 200)
            })
          }, 200)
        } else {
          twoConfirm = false
        }
        if (twoConfirm) {
          return
        }
        this.handleSubmit(isClose, apiButton, model)

      } finally {
        this.loading = false
      }
    },
    async handleSubmit (isClose, apiButton, model) {
      switch (model.jumpMode) {
        case 1:
          if (model.h5Link && model.h5Link.includes('http') > 0) {
            router.push({
              path: '/admin/message-center',
              query: {
                url: model.h5Link
              }
            })
          }
          break
        case 2:
          if (model.modelRoute) {
            router.push({
              path: model.modelRoute,
            })
          }
          break
        case 4:
          {
            if (!await this.confirmByUser(1, model.buttonIndex, true)) {
              isClose = false
            }
            apiButton = true
          }
          break
      }
      if (!apiButton) {
        this.confirmByUser(1, model.buttonIndex)
      }
      if (isClose) {
        this.dialogVisible = false
      }
    },
    handelLink (params) {
      if (params && params.includes(':')) {
        let arr = params.split(':')
        switch (arr[0]) {
          case 'http':
          case 'https':
            router.push({
              path: '/admin/message-center',
              query: {
                url: params
              }
            })
            break
          case 'native':
            router.push({
              path: params.replace('native:/', '')
            })
            break
        }
        this.dialogVisible = false
      }
    },
    handelClose () {
      this.confirmByUser(2)
      this.dialogVisible = false
    },

    //按钮事件
    //isHandleResult 是否需要处理结果
    async confirmByUser (eventType, buttonIndex, isHandleResult = false) {
      let res = await advertisementConfirmByUser({
        advertisementCodeList: [this.advertisementCode],
        channelSource: 'pc',
        eventType: eventType,
        buttonIndex: buttonIndex
      }, !isHandleResult)
      if (isHandleResult) {
        if (res.code !== 0) {
          return false
        } else {
          return true
        }
      }
    }

  },
  watch: {
    htmlText () {
      this.$nextTick(() => {
        document.querySelectorAll('#container a').forEach(el => {
          let href = el.getAttribute('href')
          el.setAttribute('href', 'javascript:void(0);')
          el.addEventListener('click', () => this.handelLink(href))

        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .message-popup {
    /deep/ {
      .el-dialog {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 0 !important;
        transform: translate(-50%, -50%);
        border-radius: 4px;
        box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
          0px 3px 6px -4px rgba(0, 0, 0, 0.12);
      }
      .el-dialog__header {
        display: none;
      }
      .el-dialog__body {
        padding: 0;
      }
      .el-button {
        padding: 11px 30px;
      }
    }
    .picture {
      height: 206px;
      width: 100%;
      background-size: cover;
      -webkit-background-size: cover;
      -o-background-size: cover;
      background-position: center 0;
      background-repeat: no-repeat;
    }
    .default-set {
      height: 30px;
    }
    .container {
      padding: 20px 20px 20px 24px;

      .header {
        position: absolute;
        right: 10px;
        top: 10px;
      }

      .title {
        width: 100%;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        color: #333333;
        line-height: 25px;
        white-space: pre-wrap;
      }
      .content {
        //padding: 20px 0 26px 0;
        margin: 20px 0 26px 0;
        width: 360px;
        font-size: 13px;
        font-weight: 400;
        text-align: left;
        color: #333333;
        line-height: 22px;
        white-space: pre-wrap;
        height: 245px;
        overflow-y: auto;
      }
      .image-content {
        height: 66px;
      }
      .down {
        el-button {
          padding: 11px 30px;
        }
        text-align: center;
      }
    }
  }
</style>