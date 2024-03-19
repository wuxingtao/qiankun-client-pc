<template>
  <div class='express-image'>
    <div :class='`express-image-el express-image-${waybills[activeName].className}`'>
      <template v-if='srcList.length && srcList[index]'>
        <el-image
          v-if='preview'
          :src='srcList[index]'
          :style='style'
          :fit='fit'
          :preview-src-list='srcList'>
          <div slot='error' class='express-image-nodata'></div>
        </el-image>
        <img v-else :src='srcList[index]' />
      </template>
      <template v-else>
        <express-nodata :text='noDataText' />
      </template>
    </div>
    <template v-if='srcList.length > 1'>
      <div v-show='index < (this.srcList.length - 1)' class='express-image-right' @click="onImageChange('next')">
        <ky-icon type='iconmaterial-right' />
      </div>
      <div v-show='index > 0' class='express-image-left' @click="onImageChange('prev')">
        <ky-icon type='iconmaterial-left' />
      </div>
    </template>
  </div>
</template>
<script>
import { KyIcon } from "@comps"
import ExpressNodata from "./express-nodata"
import { receiptFlag } from "@/views/waybill/enum/receiptFlagEnum"

export default {
  props: {
    /** 是否开启预览功能 */
    preview: {
      type: Boolean,
      default: true
    },
    datalist: Array,
    transform: Object,
    activeName: String,
    feedbackType: String
  },
  components: { KyIcon, ExpressNodata },
  data() {
    return {
      fit: "contain",
      style: "",
      waybills: {
        waybill_upload_image_receipt: {
          label: "回单联",
          className: "receipt"
        },
        waybill_upload_image_report: {
          label: "运单联",
          className: "report"
        },
        waybill_upload_image_delivery: {
          label: "签收联",
          className: "delivery"
        },
        waybill_upload_image_weight: {
          label: "复磅照片",
          className: "weight"
        }
      },
      index: 0
    }
  },
  watch: {
    // 图片旋转
    transform() {
      this.style = `transform: rotate(${this.transform.rotate}deg) scale(${this.transform.scale})`
    }
  },
  computed: {
    srcList() {
      return this.datalist.map(item => item.url || item.visit) || []
    },
    noDataText() {
      switch (this.feedbackType) {
        case receiptFlag.NONE:
          return "您未选择回单服务，暂无回单"
        case receiptFlag.IMAGE:
          return "暂无回单"
        default:
          return `暂无${this.waybills[this.activeName].label}数据`
      }
    }
  },
  methods: {
    onImageChange(mode) {
      let index = 0
      let len = this.srcList.length - 1
      /** 上一条 */
      mode === "prev" && (index = this.index === 0 ? len : --this.index)
      /** 下一跳 */
      mode === "next" && (index = this.index === len ? 0 : ++this.index)
      this.index = index
    },
    resetIndex() {
      this.index = 0
    }
  }
}
</script>
<style lang='scss' scoped>
@import './style.scss';
</style>
