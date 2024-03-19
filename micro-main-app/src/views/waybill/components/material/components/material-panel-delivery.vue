<template>
  <div class='material-panel-delivery' v-loading='loading'>
    <template v-if='images.length <= 0 && !loading'>
      <material-nodata />
    </template>
    <template v-else>
      <el-image
        class='material-panel-delivery-image'
        fit='scale-down'
        :src='images[0]'
        :preview-src-list='images'>
        <!-- <div slot="error"><material-nodata /></div> -->
      </el-image>
    </template>
    <div class='material-panel-download-other'>
      <el-button size='small' :loading='downLoading' type='text' @click='createWaybillMaterial'>
        <i class='iconfont icondownload' style='margin-right: 4px' type='icondownload'></i>
        <span>下载全部签收联</span>
      </el-button>
    </div>
  </div>
</template>
<script>
import MaterialNodata from './material-nodata'
import API from '@api/waybill'
import { downloadPicType } from '@/views/waybill/enum/queryEnum'
import { downloadFileByUrls } from '@utils/commonUtil'
import { mapState } from 'vuex'

export default {
  props: {
    loading: Boolean,
    images: {
      type: Array,
      default: () => []
    }
  },
  components: { MaterialNodata },
  data() {
    return {
      downLoading: false,
      timer: null
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    async createWaybillMaterial() {
      this.downLoading = true
      this.requestCount = 0
      clearTimeout(this.timer)
      const queryListParams = this.$store.state.material.queryListParams
      const params = {
        ...queryListParams,
        mobile: this.userInfo.phone,
        /** 只下载已签收状态 */
        waybillStatus: ['40'],
        picType: downloadPicType.WAYBILL_UPLOAD_IMAGE_DELIVERY
      }
      API.createWaybillMaterial(params).then(res => {
        if (res.code === 0) {
          if (res.data > 0) {
            this.step = Math.ceil(res.data / 3)
            this.getWaybillMaterialUrl()
          } else {
            this.downLoading = false
            this.$message.warning('签收联下载失败，请稍后再试')
          }
        }
      }).catch(() => {
        this.downLoading = false
        clearTimeout(this.timer)
      })
    },
    /** 获取批量下载回单任务结果 */
    async getWaybillMaterialUrl() {
      /** 轮询超过1分钟，当作超时处理 */
      if (this.requestCount >= this.step) {
        clearTimeout(this.timer)
        this.downLoading = false
        return this.$message.warning('下载签收联照片超时，请重新操作')
      }
      
      API.getWaybillMaterialUrl().then(res => {
        this.requestCount += 1
        const { data } = res
        /** 轮询有结果 */
        if (data) {
          clearTimeout(this.timer)
          if (data.length > 0) {
            this.onDownLoadFiles(res)
          } else {
            this.$message.warning('无签收联资料，不可下载')
          }
          this.downLoading = false
        } else {
          this.timer = setTimeout(this.getWaybillMaterialUrl, 3000)
        }
      }).catch(() => {
        this.downLoading = false
        clearTimeout(this.timer)
      })
    },
    async onDownLoadFiles(res) {
      if (res.code === 0) {
        const filesUrl =
          res.data &&
          res.data.reduce((total, cur) => {
            total.push(...cur.receiptPic)
            return total
          }, [])
        if (filesUrl.length > 0) {
          if (this.isClientMode) {
            if (this.$native.existsNativeFunc('net_downLoadFileByBatch_New')) {
              let result = []
              res.data &&
              res.data.map(n => {
                let arr = n.receiptPic.map((f, index) => ({
                  visit: f,
                  bizId: n.waybillNum + (index > 0 ? '_' + index : '')
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
          this.$message.warning('该签收联不存在回单图片')
        }
      }
      this.downLoading = false
    }
  }
}
</script>
<style lang='scss'>
@import '../style.scss';
</style>
