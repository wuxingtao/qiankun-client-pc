<template>
  <div role="radio" class="coupon-item-wrap">
    <div
      v-if="item"
      @click="onClick(item)"
      :class="`coupon-item ${item.status === 0 ? 'disable' : ''}`">
      <template>
        <ky-icon class="coupon-item-select" :type="active === item.prizeCode ? 'iconcoupon-active' : 'iconcoupon-cancel'" />
      </template>
      <template>
        <div class="coupon-item-reason">
          <el-popover
            placement="right" 
            width="230" 
            trigger="hover">
            <dl class="coupon-item-issue-desc">
              <dt class="coupon-item-issue-desc-dt">
                <ky-icon slot="reference" type="iconcoupon-item-issue" />
                <label>不可用原因</label>
              </dt>
              <dd v-for="desc in item.unusableDescList" :key="desc" class="coupon-item-issue-desc-dd">
                <label class="coupon-item-issue-desc-dots">&nbsp;</label>
                <span>{{ desc }}</span>
              </dd>
            </dl>
            <div slot="reference">
              <span>不可用</span>
              <ky-icon style="margin-left: 5px;" type="iconfaq" />
            </div>
          </el-popover>
        </div>
      </template>
      <div class="coupon-item-inner">
        <div class="coupon-item-row">
          <div class="coupon-item-row-amount">
            <div class="font-bold font-red font-28" :style="item.relieType === 4 ? 'font-size: 24px;': ''">
              {{ item.title }}
            </div>
            <div class="coupon-type font-red">{{ relieTypes[item.relieType] }}</div>
          </div>
          <div class="mg-t10 coupon-item-row-desc">
            {{ item.desc }}
          </div>
        </div>
        <div class="coupon-item-row">
          <div class="font-gray mg-t8">
            <label>券编码：</label>
            <span>{{ item.prizeCode }}</span>
          </div>
          <div class="font-gray mg-t8">
            <label>有效期：</label>
            <span>{{ item.validityBegin }} ~ {{ item.validityEnd }}</span>
            <el-popover
              popper-class="coupon-item-issue-poper" 
              placement="right" 
              width="348" 
              trigger="hover">
              <dl class="coupon-item-issue-desc">
                <dt class="coupon-item-issue-desc-dt">
                  <ky-icon slot="reference" type="iconcoupon-item-issue" />
                  <label>使用规则</label>
                </dt>
                <!-- 非免单券 -->
                <template v-if="item.relieType !== 4">
                  <dd class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">服务方式：</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ lookup(item.serviceMode, serviceModes, '|') }}
                    </div>
                  </dd>
                  <dd v-if="item.startArea" class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">限始发地</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ item.startArea }}
                    </div>
                  </dd>
                  <dd v-if="item.endArea" class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">限目的地：</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ item.endArea }}
                    </div>
                  </dd>
                  <dd v-if="item.specifyDate" class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">指定日期：</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ lookup(item.specifyDate, specifyDates, ',') }}
                    </div>
                  </dd>
                  <dd style="margin-top: 10px; font-size: 12px;">
                    一张奖券仅限抵扣单个运单运费，单个运单仅能使用一张奖券<b style="font-weight: bold;">不兑现、不找零、不退款、一次性使用</b>，使用优惠券减免的运费，不再开具发票
                  </dd>
                </template>
                <!-- 免单券 -->
                <template v-else>
                  <dd v-if="item.startArea" class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">限始发地</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ item.startArea }}
                    </div>
                  </dd>
                  <dd v-if="item.endArea" class="coupon-item-issue-desc-dd">
                    <label class="coupon-item-issue-desc-label">限目的地：</label>
                    <div class="coupon-item-issue-desc-content">
                      {{ item.endArea }}
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
              </dl>
              <el-button type="text" slot="reference" style="margin-left: 5px; padding: 0; font-size: 12px;">
                <ky-icon type="iconcoupon-issue" />
              </el-button>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { KyIcon } from '@comps'
export default {
  props: {
    item: {
      type: Object
    },
    active: [String, Number]
  },
  components: { KyIcon },
  data() {
    return {
      visible1: false,
      relieTypes: {
        0: '减免券',
        1: '折扣券',
        2: '直减券',
        3: '满减券',
        4: '免单券'
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
      lineFreeRanges: {
        '10': '全免(含增值服务费)',
        '20': '免运单运费',
        '-1': '不限'
      },
      extendContent: [
        {
          label: '限始发地',
          key: 'startArea'
        },
        {
          label: '限目的地',
          key: 'endArea'
        },
        {
          label: '服务方式',
          key: 'serviceMode',
          lookup: [
            {
              label: '当天达',
              value: '10'
            },
            {
              label: '次日达',
              value: '20'
            },
            {
              label: '隔日达',
              value: '30'
            },
            {
              label: '陆运件',
              value: '40'
            },
            {
              label: '同城次日',
              value: '50'
            },
            {
              label: '同城即日',
              value: '70'
            },
            {
              label: '省内次日',
              value: '160'
            },
            {
              label: '省内即日',
              value: '170'
            },
            {
              label: '空运',
              value: '210'
            },
            {
              label: '专运',
              value: '220'
            }
          ],
          delimiter: '|'
        },
        {
          label: '免单范围',
          key: 'lineFreeRange',
          lookup: [
            {
              label: '全免(含增值服务费)',
              value: '10'
            },
            {
              label: '免运单运费',
              value: '20'
            }
          ],
          delimiter: '|'
        },
        {
          label: '计重范围',
          key: 'lineFreeWeightRange'
        },
        {
          label: '单票上限',
          key: 'lineFreeLimit'
        }
      ]
    }
  },
  computed: {
    serviceModes() {
      const result = this.$store.state.common.serviceWayDict.reduce((serverType, item) => {
        serverType[item.value] = item.label
        return serverType
      }, {})
      return result
    }
  },
  methods: {
    onClick(item) {
      if (item.status === 0) {
        return
      }
      if (item.prizeCode === this.active) {
        item = null
      }
      this.$emit('change', item)
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
  }
}
</script>

<style lang="scss" scoped>
$border-color: rgb(233, 233, 233);

/deep/ .coupon-item-issue-desc {
  font-size: 12px;
  &-dt {
    label {
      font-size: 12px;
      font-weight: 600;
      color: #03050d;
      margin-left: 6px;
    }
  }
  &-dd {
    font-size: 12px;
    overflow: hidden;
    margin-top: 16px;
  }
  &-label,
  &-content {
    float: left;
  }
  &-label {
    width: 70px;
    color: #999;
  }
  &-content {
    width: 238px;
  }
  &-dots {
    width: 4px;
    height: 4px;
    display: inline-block;
    vertical-align: middle;
    background: #999999;
    border-radius: 50%;
    margin-right: 10px;
  }
}

/deep/ {
  .coupon-item-issue-poper {
    .el-button {
      padding: 0 20px;
    }
  }
}
.coupon-item-wrap {
  margin-right: 15px;
  margin-bottom: 15px;
  position: relative;
  max-height: 155px;
  width: 292px;
 
  .coupon-item {
    width: 100%;
    height: 133px;
    position: relative;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    background: #fff url(~@/assets/image/waybill/coupon-item-bg.png) no-repeat;
    background-size: 438px 45px;
    &.disable {
      // pointer-events: none;
      background: #fff url(~@/assets/image/waybill/coupon-item-disable-bg.png) no-repeat;
      background-size: 438px 45px;
      .gray-filter {
        opacity: 0.5;
        filter: grayscale(100%);
      }
      .mg-t10 {
         @extend .gray-filter;
      }
      .coupon-type {
        color: #8B8B8B !important;
        background: #EBEBEB !important;
      }
      .font {
        &-red {
          color: #ee1d06;
          // @extend .gray-filter;
        }
        
        &-gray {
          color: #999;
          @extend .gray-filter;
        }
        &-bold {
          font-weight: 800;
          @extend .gray-filter;
        }
        &-28 {
          font-size: 28px;
          @extend .gray-filter;
        }
        &-center {
          text-align: center;
          @extend .gray-filter;
        }
      }
      .coupon-item-select {
        display: none;
      }
      .coupon-item-reason {
        display: block;
      }
    }

    &-radio {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      outline: 0;
      opacity: 0;
    }

    &-reason {
      height: 25px;
      line-height: 25px;
      box-sizing: border-box;
      background: #fff7f2;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      color: #fe743c;
      font-size: 12px;
      position:absolute;
      top: 1px;
      right: 1px;
      cursor: pointer;
      display: none;
      width: 74px;
      background: linear-gradient(270deg,#fffcfa, #ffeee7);
      border-radius: 1px 4px 1px 10px;
      padding-left: 12px;
    }

    &-select {
      position: absolute;
      right: 8px;
      top: 8px;
      z-index: 1000;
      font-size: 14px;
    }
    &-issue {
      margin-left: 3px;
      cursor: pointer;
    }
    &-inner {
      width: 100%;
      height: 100%;
      padding: 6px 16px;
      border-radius: 6px;
      box-sizing: border-box;
      border: solid 1px $border-color;
      &::after {
        position: absolute;
        top: 63%;
        left: 50%;
        width: 93%;
        height: 1px;
        transform: translate(-50%, -50%);
        content: '';
        border-bottom: dashed 1px $border-color;
      }
    }
    &::after,
    &::before {
      content: '';
      position: absolute;
      top: 63%;
      left: -4px;
      width: 6px;
      height: 6px;
      z-index: 1000;
      border-radius: 50%;
      transform: translateY(-50%);
      background-color: #fff;
      border: solid 1px $border-color;
    }
    &::before {
      left: auto;
      right: -4px !important;
    }

    &-row {
      height: 78px;
      &-amount {
        display: flex;
        height: 30px;
        position: relative;
        top: 2px;
        align-items: center;
      }
      &-desc {
        color: #03050d;
        height: 30px;
        line-height: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        // white-space: nowrap;
      }
      &:last-child {
        height: 40px;
      }
    }

    .mg-t10 {
      margin-top: 10px;
    }
    .mg-t4 {
      margin-top: 4px;
    }
    .mg-t8 {
      margin-top: 8px;
    }
    .mg-l8 {
      margin-left: 8px;
    }

    .coupon-type {
      font-size: 12px;
      padding: 4px;
      margin-left: 6px;
      transform: scale(0.8);
      border-radius: 2px;
      display: inline-block;
      background: #ffebe9;
    }

    .font {
      &-red {
        color: #ee1d06;
      }
      &-gray {
        color: #999;
      }
      &-bold {
        font-weight: 800;
      }
      &-28 {
        font-size: 28px;
      }
      &-center {
        text-align: center;
      }
    }
  }
}
</style>
