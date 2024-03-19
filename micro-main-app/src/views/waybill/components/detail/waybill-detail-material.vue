<template>
  <ky-page-container
    :title='back.title'
    :showGoBack='back.showGoBack'
    :beforeRoutePath='back.beforeRoutePath'
  >
    <el-tabs class='ky-tabs' v-model='activeName' @tab-click='onTabChange'>
      <el-tab-pane v-for='item in tabs' :key='item.name' :label='item.label' :name='item.name' />
    </el-tabs>
    
    <section class='material-wrap'>
      <section class='material-mask'></section>
      <template v-if='ydList.length > 0'>
        <tool-bar
          ref='ToolBar'
          :yd-list='ydList'
          :class='styles[activeName]'
          :page='pageIndex'
          :transform='transform'
          :route-data='routeData'
          :tabs='tabs'
          :datalist='datalist'
          :pictureInfo='pictureInfo'
          :tabType='activeName'
          @content-change='onContentChange'
          @page-change='onPageChange'
          @transform-change='onTransformChange'
        />
      </template>
      <div class='waybill-detail-material' v-loading='loading'>
        <!-- 回单图片 -->
        <express-image
          ref='ExpressImage'
          v-if="contentName === 'image'"
          :transform='transform'
          :datalist='datalist'
          :activeName='activeName'
          :feedbackType='feedbackType'
        />
        <!-- 回单路由 -->
        <express-route v-else :route-data='routeData' />
      </div>
    </section>
  </ky-page-container>
</template>
<script>
import API from '@api/waybill'
import { ToolBar, ExpressImage, ExpressRoute } from './detail-material'

export default {
  components: { ToolBar, ExpressRoute, ExpressImage },
  data() {
    return {
      back: {
        title: '查看运单资料',
        showGoBack: true,
        beforeRoutePath: '/admin/waybill-v3'
      },
      activeName: 'waybill_upload_image_receipt',
      tabs: [
        { id: 1, label: '回单', name: 'waybill_upload_image_receipt' },
        { id: 2, label: '运单联', name: 'waybill_upload_image_report' },
        { id: 3, label: '签收联', name: 'waybill_upload_image_delivery' },
        { id: 4, label: '复磅照片', name: 'waybill_upload_image_weight' }
      ],
      styles: {
        'waybill_upload_image_receipt': 'receipt',
        'waybill_upload_image_report': 'report',
        'waybill_upload_image_delivery': 'delivery',
        'waybill_upload_image_weight': 'weight'
      },
      historyRouter: '',
      waybillType: '',
      datalist: [],
      feedbackType: '', // 回单路由类型
      form: {
        vo: {
          bizId: '',
          bizCode: ''
        },
        page: 1,
        pageSize: 100
      },
      contentName: 'image',
      transform: {
        scale: 1,
        rotate: 0
      },
      loading: false,
      ydList: [],
      pageIndex: 1,
      routeData: {},
      pictureInfo: {}
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    init() {
      const data = JSON.parse(window.sessionStorage.getItem('YDNO_LIST'))
      this.tabs = this.tabDataFilter(data.type)
      this.ydList = data.ydNoList || []
      this.datalist = []
      this.$nextTick(() => {
        this.$refs.ToolBar.onContentChange('image')
      })
      this.activeNameValue = 'waybill_upload_image_receipt'
      if (data.ydNoList && data.ydNoList.length > 0) {
        this.getWaybillImages()
      }
    },
    tabDataFilter(type) {
      let tabs = [
        { id: 1, label: '回单', name: 'waybill_upload_image_receipt' },
        { id: 2, label: '运单联', name: 'waybill_upload_image_report' },
        { id: 3, label: '签收联', name: 'waybill_upload_image_delivery' },
        { id: 4, label: '复磅照片', name: 'waybill_upload_image_weight' }
      ]
      if (!type) {
        this.activeName = 'waybill_upload_image_receipt'
        return tabs
      }
      this.activeName = type
      tabs = tabs.filter(item => {
        if (type === item.name) {
          return item
        }
      })
      return tabs
    },
    /** Tab切换 */
    onTabChange() {
      /** ky-tabs组件的activeName取值异常，需要手动赋值——待处理*/
      // this.activeName = paneName
      this.datalist = []
      this.pageIndex = 1
      if (this.$refs.ToolBar) {
        this.$refs.ToolBar.onContentChange('image')
      }
      setTimeout(() => {
        this.$refs.ExpressImage.resetIndex()
      }, 0)
      this.getWaybillImages()
    },
    /** 查询回单/运单联/签收联图片 */
    async getWaybillImages() {
      if (this.ydList.length <= 0) {
        return
      }
      this.loading = true
      try {
        /*
        * 复磅照片单独接口
        * */
        if (this.activeName !== 'waybill_upload_image_weight') {
          const code = this.ydList[this.pageIndex - 1] // .receipt.waybillNumber
          this.form.vo.bizCode = this.activeName
          this.form.vo.bizId = code
          const { data } = await API.getWaybillImages(this.form)
          if (data) {
            this.datalist = data.rows || []
          }
          /** 回单 */
          if (this.activeName === 'waybill_upload_image_receipt') {
            this.feedbackType = data.receiptFlag
            this.queryReceiptPictureInfo(code)
          } else {
            this.feedbackType = ''
            this.loading = false
          }
        } else {
          const code = this.ydList[this.pageIndex - 1]
          const { data } = await API.getWaybillCompoundImages({ waybillNumber: code })
          // const { data } = await API.getWaybillCompoundImages({ waybillNumber: 'KY5000001015731' })
          this.datalist = data || []
          this.loading = false
        }
      } catch (err) {
        this.loading = false
      }
    },
    /** 通过运单号查询经手单号 */
    async queryReceiptPictureInfo(waybillNumber) {
      const { data } = await API.getReceiptListPicInfo(waybillNumber)
      const row = data && data.rows[0]
      
      this.pictureInfo = row
      this.$store.dispatch('material/SET_FEEDBACK_STATUS', row)
      if (!row || !row.receipt || !row.receipt.handleNumber) {
        this.loading = false
        return (this.routeData = null)
      }
      this.getWaybillRoute(row.receipt.handleNumber)
    },
    /** 查询回单路由 */
    async getWaybillRoute(waybillNumber) {
      const { data } = await API.getWaybillRoute({ waybillNumber })
      if (data && data.routeNodeVos.length > 0) {
        this.routeData = data
      } else {
        this.routeData = null
      }
      this.loading = false
    },
    /** 放大/缩小/还原 */
    onTransformChange(option) {
      this.transform = option
    },
    /** 显示内容切换 */
    onContentChange(name) {
      this.contentName = name
    },
    /** 分页 */
    onPageChange(page) {
      /** 屏蔽重复请求 */
      if (this.pageIndex === page) {
        return
      }
      this.pageIndex = page
      this.getWaybillImages()
    }
  }
  ,
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.historyRouter) {
        vm.historyRouter = from.fullPath
      }
      
      if (vm.historyRouter === from.fullPath) {
        vm.back.beforeRoutePath = from.fullPath
      } else {
        vm.back.beforeRoutePath = vm.historyRouter
      }
    })
  }
}
</script>

<style lang='scss'>
@mixin waybill-loading {
  .el-loading-mask {
    height: 110%;
    width: 100%;
    top: -25px;
    background-color: rgba(255, 255, 255, 1) !important;
    
    .el-loading-spinner .circular {
      display: none;
    }
    
    .el-loading-spinner {
      background: url(~@/assets/image/loading.gif) no-repeat !important;
      background-size: 48px 48px;
      width: 120px !important;
      height: 120px !important;
      position: absolute;
      top: 50% !important;
      left: 50% !important;
      z-index: 1000;
      transform: translate3d(-50%, -50%, 0);
    }
  }
}

.material-wrap {
  min-width: 1000px;
  position: relative;
  
  .material-mask {
    width: 100%;
    height: 96%;
    z-index: 0;
    top: 45px;
    left: 0;
    background: #f8f8f8;
    position: absolute;
  }
}

.waybill-detail-material {
  // margin-top: 20px;
  min-height: 520px;
  position: relative;
  @include waybill-loading;
}

.ky-tabs {
  font-size: 20px;
  
  .el-tabs__header {
    margin-bottom: 20px;
  }
  
  .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #f1f1f5;
  }
  
  .el-tabs__item {
    height: 50px;
    line-height: 50px;
    font-size: 14px !important;
    color: rgba(51, 51, 51, 0.93);
    
    &.is-active {
      font-weight: bold;
      color: #8365f6;
    }
  }
  
  .el-tabs__active-bar {
    height: 4px;
    border-radius: 4px;
  }
}
</style>