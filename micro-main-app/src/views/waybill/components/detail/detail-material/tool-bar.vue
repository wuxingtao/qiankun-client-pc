<template>
  <div class='toolbar'>
    <section class='toolbar-left'>
      <tool-filter :row='receiptData' />
      <div class='toolbar-buttons'>
        <el-button-group :class='contentName'>
          <el-button @click="onContentChange('image')">回单图片</el-button>
          <el-button :disabled='!routeData' @click="onContentChange('route')">回单路由</el-button>
        </el-button-group>
      </div>
    </section>
    <section class='toolbar-right' v-if="contentName === 'image'">
      <!--    回单tab操作栏-->
      <template v-if="tabType === 'waybill_upload_image_receipt'">
        <tool-transform v-if='datalist.length > 0' @change='onTransformChange' :transform='transform'>
          <template>
            <el-button type='text' class='toolbar-transform-item' @click='onDownLoadAll'>
              <ky-icon type='icondownload' />
              <span class='toolbar-transform-item-label'>下载回单</span>
            </el-button>
            <el-button
              type='text'
              class='toolbar-transform-item'
              @click='onFeedBackShow'>
              <ky-icon style='margin-left:1px;' type='iconmaterial-download' />
              <span class='toolbar-transform-item-label'>
              反馈
                <!-- {{ feedbackAudit ? '反馈审核中' : '反馈' }} -->
            </span>
              <!-- <el-tooltip :content="feedbackMessage" placement="top">
                <div style="display: inline-block;">
                  <ky-icon type="icon-info" />
                </div>
              </el-tooltip> -->
            </el-button>
          </template>
        </tool-transform>
        <template v-if='tabs.length > 1'>
          <tool-pagination @change='onPaginationChange' :total='ydList.length' :page='page' />
        </template>
      </template>
      <!--      复磅照片操作栏-->
      <!--      <template v-else-if="tabType === 'waybill_upload_image_weight'">-->
      <!--        <el-button type='text' class='toolbar-transform-item' @click='onDownLoadAll'>-->
      <!--          <ky-icon type='icondownload' />-->
      <!--          <span class='toolbar-transform-item-label'>下载复磅照片</span>-->
      <!--        </el-button>-->
      <!--      </template>-->
    </section>
    
    <express-feedback ref='ExpressFeedback' />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { KyIcon } from '@comps'
import API from '@api/waybill'
import ToolFilter from './tool-filter'
import ToolTransform from './tool-transform'
import ToolPagination from './tool-pagination'
import ExpressFeedback from './express-feedback'
import { downloadFileByUrls } from '@utils/commonUtil'

export default {
  props: {
    tabs: Array,
    page: Number,
    ydList: Array,
    transform: Object,
    routeData: Object,
    pictureInfo: Object,
    datalist: Array,
    tabType: String
  },
  components: { KyIcon, ToolFilter, ToolTransform, ToolPagination, ExpressFeedback },
  data() {
    return {
      contentName: 'image',
      message: '如需重拍请在货物签收后一个月内申请'
    }
  },
  computed: {
    /** 运单数据 */
    receiptData() {
      return this.ydList[this.page - 1]
    },
    /** 回单是否审核中 */
    feedbackAudit() {
      return this.pictureInfo && this.pictureInfo.receipt && this.pictureInfo.receipt.pictureStatus === '20'
    },
    /** 回单反馈提示内容 */
    feedbackMessage() {
      let message = '如需重拍请在货物签收后一个月内申请'
      if (this.feedbackAudit) {
        message = '回单图片正在审核中,不能重复反馈'
      }
      return message
    },
    /** 是否显示回单反馈 */
    feedbackVisible() {
      const follow = this.pictureInfo && this.pictureInfo.follow
      return (
        follow && follow.receiveDate && dayjs(follow.receiveDate)
          .add(30, 'd')
          .isAfter(dayjs())
      )
    }
  },
  methods: {
    /** 图片操作 */
    onTransformChange(transform) {
      this.$emit('transform-change', transform)
    },
    /** 运单分页切换 */
    onPaginationChange(page) {
      this.$emit('page-change', page)
    },
    /** 内容切换 */
    onContentChange(name) {
      this.contentName = name || 'image'
      this.$emit('content-change', this.contentName)
    },
    /** 回单反馈 */
    onFeedBackShow() {
      const data = this.$store.state.material.feedbackData
      if (!data) {
        this.$message.warning('当前运单没有回单数据，无法反馈')
      } else {
        const receiveDate = data.follow && dayjs(Number(data.follow.receiveDate)).add(30, 'd').isAfter(dayjs())
        /** 只能反馈最近30天 */
        if (!receiveDate) {
          return this.$message.warning('只支持对近30天以内的回单进行反馈')
        }
        /** 审核中 */
        if (!data.receipt || String(data.receipt.pictureStatus) === '20') {
          return this.$message.warning('回单反馈正在审核中，请不要重复提交')
        }
        this.receiveDate = receiveDate
        this.$refs.ExpressFeedback.showDialog(this.receiptData)
      }
    },
    /** 下载所有回单 */
    async onDownLoadAll() {
      const params = {
        bizCode: this.tabType,
        bizIds: this.ydList
      }
      const res = await API.getByBizCodeAndBizIds(params)
      if (res.code === 0) {
        const filesUrl =
          res.data &&
          res.data.reduce((total, cur) => {
            total.push(...cur.files.map(f => f.visit))
            return total
          }, [])
        if (filesUrl.length > 0) {
          if (this.isClientMode) {
            if (this.$native.existsNativeFunc('net_downLoadFileByBatch_New')) {
              let result = []
              res.data &&
              res.data.map(n => {
                let arr = n.files.map((f, index) => ({
                  visit: f.visit,
                  bizId: n.bizId + (index > 0 ? '_' + index : '')
                }))
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
    }
  }
}
</script>
<style lang='scss' scoped>
@import './style.scss';
</style>
