<template>
  <div>
    <template v-if="couponList && couponList.length">
      <div class="coupon-list">
        <div v-for="(item, index) in couponList" :key="index" class="coupon-container">
          <div
            v-if="status === ticketStatus.UNUSED && item.usingType === 10"
            class="coupon-container__handleActive"
            @click="handleActive(item.prizeCode)"
          >
            激活
          </div>
          <div class="content" :class="status === ticketStatus.EXPIRED ? 'expired' : ''">
            <p>
              <span class="prise" v-if="item.relieType === 4">{{ item.title }}</span>
              <span class="free" v-else>{{ item.title }}</span>
              <span class="type" v-if="item.usingType && item.usingType === 10">账单券</span>
              <span class="type" v-else>{{ checkType(item.relieType) }}</span>
              <span class="limit" v-if="status === ticketStatus.UNUSED && item.remainDaysEnd">{{
                item.remainDaysEnd
              }}</span>
              <span
                v-if="status !== ticketStatus.UNUSED && item.deductionMonth"
                class="deduction-month"
                >{{ deductionMonthTag(item.deductionMonth) }}</span
              >
              <i class="iconfont stamp" :class="getIcon"></i>
            </p>
            <p class="mark">{{ item.desc }}</p>
          </div>
          <div class="declear">
            <div
              class="declear__valid-period"
              :style="status === ticketStatus.EXPIRED ? 'color: #c0c0c0;' : ''"
            >
              有效期：{{ item.validityBegin }} 至 {{ item.validityEnd }}
              <!-- 气泡 -->
              <el-popover
                popper-class="coupon-item-issue-poper"
                trigger="hover"
                @show="tipIndex = index"
                @hide="tipIndex = null"
                placement="right"
                width="348"
              >
                <div class="coupon-item-issue-desc">
                  <div class="coupon-item-issue-desc-dt">
                    <ky-icon slot="reference" type="iconcoupon-item-issue" />
                    <label>使用规则</label>
                  </div>
                  <!-- 非免单券 -->
                  <template v-if="item.relieType !== ticketReliefTypeEnum.FREE">
                    <div class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">服务方式：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ lookup(item.serviceMode, serviceModes, '|') }}
                      </div>
                    </div>
                    <div v-if="item.startArea" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">限始发地：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ transformSymbol(item.startArea) }}
                      </div>
                    </div>
                    <div v-if="item.endArea" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">限目的地：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ transformSymbol(item.endArea) }}
                      </div>
                    </div>
                    <div v-if="item.specifyDate" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">指定日期：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ lookup(item.specifyDate, specifyDates, ',') }}
                      </div>
                    </div>

                    <template v-if="item.usingType && item.usingType === 10">
                      <!-- 账单券 -->
                      <div class="coupon-item-issue-desc-style">
                        <span>一张奖券仅限抵扣单月账单运费，单月账单仅能使用一张奖券</span>
                      </div>
                      <div class="coupon-item-issue-desc-style">
                        <b style="font-weight: bold">不兑现、不找零、不退款、一次性使用</b
                        >，使用优惠券减免的运费，不再开具发票
                      </div>
                      <div class="coupon-item-issue-desc-style">
                        <span>仅限企业寄件使用，个体寄件不可用</span>
                      </div>
                    </template>
                    <template v-else>
                      <!-- 下单券 -->
                      <div class="coupon-item-issue-desc-style">
                        <span>一张奖券仅限抵扣单个运单运费，单个运单仅能使用一张奖券</span>
                      </div>
                      <div class="coupon-item-issue-desc-style">
                        <b style="font-weight: bold">不兑现、不找零、不退款、一次性使用，</b
                        >使用优惠券减免的运费，不再开具发票
                      </div>
                    </template>
                  </template>
                  <!-- 免单券 -->
                  <template v-else>
                    <dd v-if="item.startArea" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">限始发地：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ transformSymbol(item.startArea) }}
                      </div>
                    </dd>
                    <dd v-if="item.endArea" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">限目的地：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ transformSymbol(item.endArea) }}
                      </div>
                    </dd>
                    <dd class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">服务方式：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ lookup(item.serviceMode, serviceModes, '|') }}
                      </div>
                    </dd>
                    <dd class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">免单范围：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ lineFreeRanges[item.lineFreeRange] }}
                      </div>
                    </dd>
                    <dd v-if="item.lineFreeWeightRange" class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">计重范围：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ item.lineFreeWeightRange }}
                      </div>
                    </dd>
                    <dd class="coupon-item-issue-desc-dd">
                      <label class="coupon-item-issue-desc-label">单票上限：</label>
                      <div class="coupon-item-issue-desc-content">
                        {{ item.lineFreeLimit === -1 ? '不限' : item.lineFreeLimit }}
                      </div>
                    </dd>
                  </template>
                </div>
                <div
                  slot="reference"
                  :class="tipIndex === index ? 'iconfontReference-light' : 'iconfontReference'"
                ></div>
              </el-popover>
            </div>
            <p>券编码：{{ item.prizeCode }}</p>
          </div>
        </div>
      </div>
      <pagination
        :pagination='pagination'
        @size-change="handleSizeChange"
        @current-change="pageChange"
      />
    </template>
    <template v-else>
      <div class="none-data">
        <img src="@/assets/image/client/coupon/none-data.png" />
        <div>{{ `暂无${status === ticketStatus.UNUSED ? '可用' : ''}优惠券` }}</div>
      </div>
    </template>
    <active-dialog
      :couponList="couponList"
      ref="activeDialogRef"
      :prizeCode="prizeCode"
    ></active-dialog>
  </div>
</template>

<script>
import { ticketReliefNameEnum, ticketReliefTypeEnum, ticketStatus } from '../enum/couponEnum'
import { KyIcon } from '@comps'
import { debounce } from 'lodash'
import ActiveDialog from './activeDialog.vue'
import dayjs from 'dayjs'
import Pagination from '@/components/ky-table/pagination'

export default {
  props: {
    couponList: {
      type: Array,
      default: () => [],
    },
    status: {
      type: Number,
      default: 0,
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0,
        }
      },
    },
  },
  components: {
    KyIcon,
    ActiveDialog,
    Pagination,
  },
  data() {
    return {
      ticketReliefTypeEnum,
      ticketStatus,
      // serviceModes: {
      //   10: '当天达',
      //   20: '次日达',
      //   30: '隔日达',
      //   40: '陆运件',
      //   50: '同城次日',
      //   70: '同城即日',
      //   160: '省内次日',
      //   170: '省内即日',
      //   210: '空运',
      //   220: '专运',
      // },
      lineFreeRanges: {
        10: '全免(含增值服务费)',
        20: '免运单运费',
        '-1': '不限',
      },
      specifyDates: {
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
        7: '周日',
      },
      tipIndex: null,
      prizeCode: '',
    }
  },
  methods: {
    checkType(value) {
      switch (value) {
        case ticketReliefTypeEnum.RELIEF:
          return ticketReliefNameEnum.RELIEF
        case ticketReliefTypeEnum.DISCOUNT:
          return ticketReliefNameEnum.DISCOUNT
        case ticketReliefTypeEnum.LAPSE:
          return ticketReliefNameEnum.LAPSE
        case ticketReliefTypeEnum.MONEY_OFF:
          return ticketReliefNameEnum.MONEY_OFF
        case ticketReliefTypeEnum.FREE:
          return ticketReliefNameEnum.FREE
      }
    },
    lookup(str, lookup, delimiter) {
      if (!str) {
        return
      }
      const result = str.split(delimiter).reduce((arr, nextItem) => {
        const item = lookup[nextItem]
        if (item) {
          arr.push(item)
        }
        return arr
      }, [])
      return result.join('、')
    },
    pageChange: debounce(function (page) {
      this.$emit('page-change', page)
    }, 300),
    /** 抵扣月份 */
    deductionMonthTag(deductionMonth) {
      if (deductionMonth) {
        const date = dayjs(deductionMonth)
        const year = date.format('YY')
        const month = date.format('MM')
        return `抵扣${year}年${month}月账单`
      } else {
        return ''
      }
    },
    /** 激活 */
    handleActive(prizeCode) {
      this.$refs['activeDialogRef'].activeDialogVisible = true
      this.prizeCode = prizeCode
    },
    handleSizeChange(val) {
      this.$parent.pagination.pageSize = val
      this.$parent.getCouponList()
    },
    /** 符号转换 */
    transformSymbol(type) {
      return type ? type.replace(/\//g, '、') : ''
    }
  },
  computed: {
    getIcon() {
      switch (this.status) {
        case ticketStatus.IN_USE:
          return 'icon-in-use'
        case ticketStatus.HAS_BEEN_USED:
          return 'icon-has-been-used'
        case ticketStatus.EXPIRED:
          return 'icon-expired'
        default:
          return ''
      }
    },
    serviceModes() {
      const result = this.$store.state.common.serviceWayDict.reduce((serverType, item) => {
        serverType[item.value] = item.label
        return serverType
      }, {})
      return result
    }
  },
}
</script>

<style lang='scss' scoped>
@import './SingleCoupon.scss';
</style>