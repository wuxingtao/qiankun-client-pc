<template>
  <div class='material-panel-receipt'>
    <section v-loading='loading' class='material-panel-weight-body'>
      <keep-alive>
        <component ref='receiptKeepAliveRef' :is='mode' :images='images' :loading='loading' />
      </keep-alive>
    </section>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { KyIcon } from '@comps'
import API from '@api/waybill'
import { mapState } from 'vuex'
import { downloadFileByUrls } from '@utils/commonUtil'
import MaterialPanelImages from './material-panel-images'
import MaterialPanelRouter from './material-panel-router'
import MaterialPanelFeedback from './material-panel-feedback'
import { downloadPicType } from '@/views/waybill/enum/queryEnum'

export default {
  name: 'materialPanelWeight',
  props: {
    loading: Boolean,
    images: {
      type: Array,
      default: () => []
    }
  },
  components: { KyIcon, MaterialPanelRouter, MaterialPanelImages, MaterialPanelFeedback },
  data() {
    return {
      downLoading: false,
      mode: 'MaterialPanelImages',
      receiveDate: false,
      timer: null,
      requestCount: 0,
      step: 0 // 轮询
    }
  },
  computed: {
    route() {
      return this.$store.state.material.waybillRoute
    },
    ...mapState(['userInfo'])
  },
  methods: {
    setRaidoButton(mode) {
      this.mode = mode
    },
    /** 意见反馈 */
    async onFeedbackClick() {
      const waybillNumber = this.$store.state.material.activedCode
      const data = this.$store.state.material.feedbackData
      console.log(data, '经手单号信息')
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
        this.$refs.materialPanelFeedback.showDialog(waybillNumber)
      }
    },
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
        picType: downloadPicType.WAYBILL_UPLOAD_IMAGE_RECEIPT
      }
      API.createWaybillMaterial(params).then(res => {
        if (res.code === 0) {
          if (res.data > 0) {
            this.step = Math.ceil(res.data / 3)
            this.getWaybillMaterialUrl()
          } else {
            this.downLoading = false
            this.$message.warning('回单下载失败，请稍后再试')
          }
        }
      }).catch(() => {
        this.downLoading = false
        clearTimeout(this.timer)
      })
    },
    /** 获取批量下载回单任务结果 */
    async getWaybillMaterialUrl() {
      console.log('step===>', this.step)
      
      /** 轮询超过1分钟，当作超时处理 */
      if (this.requestCount >= this.step) {
        clearTimeout(this.timer)
        this.downLoading = false
        return this.$message.warning('下载回单照片超时，请重新操作')
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
            this.$message.warning('无回单资料，不可下载')
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
          this.$message.warning('该运单不存在回单图片')
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
