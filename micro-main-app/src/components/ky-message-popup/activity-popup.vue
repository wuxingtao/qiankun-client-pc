<template>
  <el-dialog width="400px" :visible.sync="dialogVisible" title='' class="message-popup" :close-on-click-modal="false" :modal-append-to-body="false">
    <div class="container">
      <div class="content" :style="'backgroundImage: url('+messageModel.posterLink+')' " @click="jumpToTarget">
      </div>
      <div class="down" v-if="messageModel.configCloseButton==='1'">
        <svg-icon icon-class='close-popup' @click="handelClose"></svg-icon>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { advertisementConfirmByUser } from '@/services/api/common'
import router from '@/router'

export default {
  name: 'activity-popup',
  data () {
    return {
      dialogVisible: false,
      messageModel: {},
      advertisementCode: ''
    }
  },
  methods: {
    showDialog (model) {
      this.dialogVisible = true,
      this.messageModel = model.advertisementPopupDto
      this.advertisementCode = model.advertisementCode
    },
    async jumpToTarget () {
      let isClose = true
      let apiButton = false
      let twoConfirm = true
      const model = this.messageModel.buttonList[0]
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

    },
    handelClose () {
      this.confirmByUser(2)
      this.dialogVisible = false
    },
    //按钮事件
    //isHandleResult 是否需要处理结果
    async confirmByUser (eventType, isHandleResult = false) {
      let res = await advertisementConfirmByUser({
        advertisementCodeList: [this.advertisementCode],
        channelSource: 'pc',
        eventType: eventType,
        buttonIndex: this.messageModel.buttonList[0].buttonIndex
      }, !isHandleResult)
      if (isHandleResult) {
        if (res.code !== 0) {
          return false
        } else {
          return true
        }
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
        box-shadow: none;
        background-color: transparent;
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
    .container {
      .content {
        background-repeat: no-repeat;
        height: 512px;
        cursor: pointer;
        background-size: cover;
        -webkit-background-size: cover;
        -o-background-size: cover;
        background-position: center 0;
      }
      .down {
        margin-top: 24px;
        .svg-icon {
          width: 42px;
          height: 42px;
        }
        text-align: center;
      }
    }
  }
</style>