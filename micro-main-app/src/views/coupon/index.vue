<template>
  <div class='main-container coupon-container' v-loading='loading'>
    <tabbar :count='count' @tab-change='tabChange'></tabbar>
    <single-coupon :couponList='couponList' :pagination='pagination' :status='status' @page-change='pageChange' />
    <div class='discription'>
      <div class='title'>优惠券使用说明</div>
      <div class='content'>
        <span>请您在使用跨越优惠券前，认真阅读并充分理解本规则的全部内容，在确认充分理解并同意后开始使用跨越优惠券。<br /></span>
        一、您可以通过跨越速运APP、微信公众号或 微信小程序“跨越寄件”参与活动，您参与活动获得的运费优惠券可通过本终端使用。<br />
        二、本公司会不时对各类运费优惠券的使用规则进行调整，您同意具体使用规则以本终端提示的为准，您使用优惠券的操作视为对优惠券使用规则的确认。您同意并确认本公司对优惠券抵扣的运费不开具发票。<br />
        三、跨越优惠券的具体使用除应满足每个优惠券面载明的使用规则外，还应满足以下规则:<br />
        <div style='padding:0 2em;'>
          1、付款方式：寄付；<br />
          <b>2、一张奖券仅能使用在一个运单，一个运单仅能使用一张奖券 不兑现、不找零、不可转赠；<br /></b>
          <b>3、使用优惠券减免的运费，不再开具发票；<br /></b>
          <b>4、跨越优惠券仅可用于抵扣您发货时产生的运费，不能抵扣增值服务费;<br /></b>
          5、优惠券应在券面载明的有效期内使用，过期作废;<br />
          6、运费不满足优惠券使用条件为抵扣失败，抵扣失败的优惠券将返回客户优惠券列表，如抵扣失败且已过有效期的优惠券视为已作废;
        </div>
        四、本公司已发放的优惠券如存在显失公平等不符合运营目的的情形(包括但不限于发放类别错误、价格配置失误等)，本公司有权将您已领取未使用的优惠券及您已使用的优惠券作废;需要您将已使用优惠券抵扣的运费补足<br />
        <b>五、如您恶意刷优惠券或以营利为目的参与活动，本公司有权取消您参与活动资格及优惠券使用权利。</b>
      </div>
    </div>
    <ky-text-image-popup ref='kyTextImagePopupRef' />
    <ky-activity-popup ref='kyActivityPopupRef' />
  </div>
</template>

<script>
import SingleCoupon from './components/SingleCoupon'
import tabbar from './components/tabbar'
import { queryCouponCount, getCouponList } from '@api/coupon'
import { ticketReliefTypeEnum, ticketStatus } from '@/views/coupon/enum/couponEnum'
import messagePopup from '@/components/ky-message-popup/message-popup.js'

export default {
  name: 'coupon',
  mixins:[messagePopup],
  components: {
    tabbar,
    SingleCoupon
  },
  data() {
    return {
      loading: false,
      couponList: [],
      status: ticketStatus.UNUSED,
      totalCount: 'unusedCount',
      count: {},
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0
      }
    }
  },
  created() {
    this.queryCouponCount()
    this.getCouponList()
  },
  mounted(){
    this.handlePopup('pcCoupon')
  },
  methods: {
    tabChange(status, totalCount) {
      this.status = status
      this.totalCount = totalCount
      this.loading = true
      this.pagination = {
        ...this.pagination,
        pageIndex: 1,
        pageSize: 10
      }
      this.queryCouponCount()
      this.getCouponList()
    },
    /** 获取优惠券列表 */
    async getCouponList() {
      if (!this.loading) this.loading = true
      const result = await getCouponList(this.status, this.pagination.pageIndex, this.pagination.pageSize)
      this.couponList = result?.externalTicketVOList || []
      this.loading = false
    },
    /** 获取优惠券数量 */
    async queryCouponCount() {
      const data = await queryCouponCount()
      this.count = data || {}
      this.pagination = {
        pageIndex: 1,
        pageSize: 10,
        totalCount: this.count[this.totalCount]
      }
    },
    pageChange(page) {
      this.pagination.pageIndex = page
      this.getCouponList()
    }
  },
}
</script>

<style lang='scss' scoped>
.coupon-container {
  margin: 0 20px 24px;
  
  .discription {
    background: #fbfbfb;
    padding: 32px;
    margin-top: 70px;
    
    .title {
      font-size: 20px;
      font-weight: bold;
      color: #353535;
      line-height: 28px;
      padding-bottom: 24px;
    }
    
    .content {
      font-size: 12px;
      font-weight: 400;
      color: #999999;
      line-height: 23px;
      
      b {
        font-weight: bold;
      }
      
      span {
        color: red;
      }
    }
  }
}
</style>