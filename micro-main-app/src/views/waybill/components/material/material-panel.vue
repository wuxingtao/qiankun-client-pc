<template>
  <div class='material-panel material-loading'>
    <el-tabs class='material-panel-tabs ky-tabs' v-model='activeName' @tab-click='onTabsClick'>
      <el-tab-pane v-for='item in tabs' :key='item.name' :label='item.label' :name='item.name' />
    </el-tabs>
    <keep-alive>
      <component ref='keepAliveRef' :is='activeName' :images='images' :loading='loading' :feedbackType='feedbackType' />
    </keep-alive>
  </div>
</template>
<script>
import API from '@api/waybill'
import {
  MaterialNodata,
  MaterialPanelReport,
  MaterialPanelReceipt,
  MaterialPanelDelivery,
  MaterialPanelWeight
} from './components'
import { downloadPicType } from '@/views/waybill/enum/queryEnum'

export default {
  components: {
    MaterialNodata,
    MaterialPanelReport,
    MaterialPanelReceipt,
    MaterialPanelDelivery,
    MaterialPanelWeight
  },
  data() {
    return {
      loading: false,
      activeName: 'MaterialPanelReceipt',
      tabs: [
        { id: 1, label: '回单联', name: 'MaterialPanelReceipt' },
        { id: 2, label: '运单联', name: 'MaterialPanelReport' },
        { id: 3, label: '签收联', name: 'MaterialPanelDelivery' },
        { id: 3, label: '复磅照片', name: 'MaterialPanelWeight' },
      ],
      feedbackType: '', // 回单类型
      form: {
        vo: {
          bizId: 'downloadPicType.WAYBILL_UPLOAD_IMAGE_RECEIPT',
          bizCode: 'waybill_upload_image_receipt',
        },
        page: 1,
        pageSize: 100,
      },
      images: [],
    }
  },
  watch: {
    '$store.state.material.activedCode': {
      handler: function(newVal) {
        this.form.vo.bizId = newVal
        this.getWaybillImages()
      },
      immediate: true
    },
  },
  methods: {
    /** 查询回单/运单联/签收联图片 */
    async getWaybillImages() {
      if (this.$refs.keepAliveRef?.setRaidoButton) {
        this.$refs.keepAliveRef.setRaidoButton('MaterialPanelImages')
      }
      if (!this.form.vo.bizId) {
        return
      }
      this.images = []
      this.loading = true
      try {
        if (this.activeName !== 'MaterialPanelWeight') {
          const { data } = await API.getWaybillImages(this.form)
          if (data && data.rows.length > 0) {
            this.images = data.rows.map(item => item.url)
          }
          /** 回单联时查询回单路由数据 */
          if (this.activeName === 'MaterialPanelReceipt') {
            this.feedbackType = data.receiptFlag
            this.queryReceiptPictureInfo(this.form.vo.bizId)
          } else {
            this.feedbackType = ''
            this.loading = false
          }
        } else {
          const { data } = await API.getWaybillCompoundImages({ waybillNumber: this.form.vo.bizId })
          // const { data } = await API.getWaybillCompoundImages({ waybillNumber: 'KY5000001015731' })
          if (data && data.length > 0) {
            this.images = data.map(item => item.visit)
          }
          this.loading = false
        }
      } catch (err) {
        this.loading = false
      }
    },
    /** 查询经手单号 */
    async queryReceiptPictureInfo(waybillNumber) {
      const { data } = await API.getReceiptListPicInfo(waybillNumber)
      const row = data && data.rows[0]
      
      this.$store.dispatch('material/SET_FEEDBACK_STATUS', row)
      if (!row || !row.receipt || !row.receipt.handleNumber) {
        this.loading = false
        this.$store.dispatch('material/SET_WAYBILL_ROUTE', null)
        return
      }
      this.getWaybillRoute(row.receipt.handleNumber)
    },
    /** 查询回单路由 */
    async getWaybillRoute(waybillNumber) {
      let { data } = await API.getWaybillRoute({ waybillNumber })
      if (!data || data.routeNodeVos.length <= 0) {
        data = null
      }
      this.$store.dispatch('material/SET_WAYBILL_ROUTE', data)
      this.loading = false
    },
    onTabsClick() {
      let bizCode = ''
      switch (this.activeName) {
        /** 回单联 */
        case 'MaterialPanelReceipt':
          bizCode = downloadPicType.WAYBILL_UPLOAD_IMAGE_RECEIPT
          break
        /** 运单联 */
        case 'MaterialPanelReport':
          bizCode = downloadPicType.WAYBILL_UPLOAD_IMAGE_REPORT
          break
        /** 签收联 */
        case 'MaterialPanelDelivery':
          bizCode = downloadPicType.WAYBILL_UPLOAD_IMAGE_DELIVERY
          break
        /** 复磅照片 */
        case 'MaterialPanelWeight':
          bizCode = downloadPicType.WAYBILL_UPLOAD_IMAGE_WEIGHT
          break
        default:
          break
      }
      this.form.vo.bizCode = bizCode
      this.form.vo.bizId = this.$store.state.material.activedCode
      this.getWaybillImages()
    },
    setRadioButton() {
      if (this.activeName === 'MaterialPanelReceipt') {
        this.$refs.keepAliveRef.setRaidoButton('MaterialPanelImages')
      }
    },
  },
}
</script>
<style lang='scss'>
@import './style.scss';
</style>
