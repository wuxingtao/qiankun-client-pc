<template>
  <div class="adjust-price-notice-weight__container">
    <ky-ui-label title="调价原因" />
    <div class="reason" v-html="customerTips"></div>
    <ky-ui-label title="调价标准" />
    <table>
      <thead>
        <th v-for="(item, index) in tableColumn" :key="index">{{ item }}</th>
      </thead>
      <tbody>
        <tr v-for="(row, index) in tableData" :key="index">
          <td>{{ row.col1 }}</td>
          <td>{{ row.col2 }}</td>
        </tr>
      </tbody>
    </table>

    <template v-if="visibleScope">
      <ky-ui-label title="调价范围" />
      <div class="scope">
        <!-- <div class="row routes">
          <div>路线</div>
          <div>
            <div v-for="(item, index) in routes" :key="index" v-html="item"></div>
          </div>
        </div> -->
        <div class="row area-name">
          <div>始发地</div>
          <div>{{ (beginAreaName || '所有地区').replace(/-/gi, '、') }}</div>
        </div>
        <div class="row area-name">
          <div>目的地</div>
          <div>{{ (endAreaName || '所有地区').replace(/-/gi, '、') }}</div>
        </div>
        <div class="row service-text" v-if="serviceText">
          <div>服务方式</div>
          <div>{{ serviceText }}</div>
        </div>
      </div>
    </template>

    <ky-ui-label title="调价时间" />
    <div class="time-span">{{ timeSpan }}</div>
  </div>
</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import { reactive, toRefs } from '@vue/composition-api'
import dayjs from 'dayjs'

export default {
  components: {
    KyUiLabel
  },
  setup(props, { root }) {
    const state = reactive({
      tableColumn: ['重量区间', '收费规则'],
      tableData: [{ col1: '', col2: '' }],
      customerTips: '',
      visibleScope: false,
      // routes: [],
      serviceText: '',
      timeSpan: '',
      beginAreaName: '',
      endAreaName: ''
    })

    const loadData = async resData => {
      if (!resData) {
        return
      }
      let {
        beginTime,
        endTime,
        beginAreaName,
        endAreaName,
        serviceTypeName,
        adjustType,
        adjustAmount,
        weightAdjustAmount
      } = resData
      state.visibleScope = beginAreaName || endAreaName || serviceTypeName
      state.serviceText = serviceTypeName
      const formatDate = dt => dayjs(dt).format('YYYY/MM/DD')
      state.timeSpan = `${formatDate(beginTime)} - ${formatDate(endTime)}`
      state.beginAreaName = beginAreaName
      state.endAreaName = endAreaName
      // state.routes = (beginAreaName || '').split('-').map(m => {
      //   const getHtml = text => `<span style="color:#ff8038">【${text}】</span>`
      //   if (!m && !endAreaName) {
      //     return getHtml('所有路线')
      //   }
      //   return `从${getHtml(beginAreaName || '全国')}发往${getHtml(endAreaName || '全国')}`
      // })

      state.customerTips = resData?.customerTips?.replace(/\n/g, '<br/>')
      // if(customerTips){
      //   state.customerTips = `<span style="font-weight:bold">${customerTips}</span>`
      // }
      if ([1, 2].includes(adjustType)) {
        adjustAmount += adjustType === 1 ? '元' : '%'
        state.tableColumn = ['调价类型', '调价额度（元）']
        const text = adjustType === 1 ? '固定' : '折扣'
        state.tableData = [{ col1: `按票${text}加价`, col2: adjustAmount }]
      } else if (adjustType === 3) {
        state.tableColumn = ['重量区间（kg）', '收费规则（元）']
        state.tableData = []
        weightAdjustAmount.forEach(item => {
          state.tableData.push({
            col1: `${item.beginWeight}~${item.endWeight}`,
            col2: `每${item.mode === 2 ? '公斤' : '票'}加收${item.price}元`
          })
        })
      }
    }

    return {
      ...toRefs(state),
      loadData
    }
  }
}
</script>

<style lang='scss' scoped>
.adjust-price-notice-weight__container {
  margin: 32px 0;
  color: $--color-text-primary;
  .ky-ui-label {
    margin: 20px 0 12px;
    &:first-of-type {
      margin-top: 0;
    }
  }
  .reason {
    line-height: 18px;
  }
  .reason,
  table,
  .scope,
  .time-span {
    margin-left: 9px;
  }
  table {
    width: calc(100% - 18px);
    thead th {
      height: 36px;
    }
    thead,
    tr {
      height: 36px;
      border: 1px solid #ececec;
      &:first-of-type {
        width: 178px;
      }
    }
    th,
    td {
      vertical-align: middle;
      text-align: left;
      padding-left: 16px;
      // font-size: $--font-size-medium;
      color: $--color-text-primary;
    }
    th {
      height: 36px;
      background-color: $--table-header-background-color;
      color: $--table-header-font-color;
      font-weight: bold;
    }
  }
  .scope {
    margin-right: 9px;
    .row {
      display: flex;
      border: 1px solid #ececec;
      &:not(:last-child) {
        border-bottom: none;
      }
      & > div {
        &:first-of-type {
          box-sizing: border-box;
          padding-left: 16px;
          border-right: 1px solid #ececec;
          background-color: $--table-header-background-color;
          font-weight: bold;
          width: 98px;
        }
        &:last-of-type {
          flex: 1;
        }
      }
    }
    @mixin row-right-cell {
      box-sizing: border-box;
      padding: 9px 20px;
      min-height: 36px;
      line-height: 18px;
    }
    // .routes {
    //   & > div {
    //     &:first-child {
    //       display: flex;
    //       // justify-content: center;
    //       align-items: center;
    //     }
    //     &:last-child div {
    //       @include row-right-cell;
    //       &:not(:last-child) {
    //         border-bottom: 1px solid #ececec;
    //       }
    //     }
    //   }
    // }
    .service-text {
      div {
        @include row-right-cell;
      }
    }
    .area-name {
      div {
        @include row-right-cell;
        &:last-of-type {
          color: #ff8038;
        }
      }
    }
  }
  .time-span {
    font-weight: bold;
  }
  // .tip {
  //   margin: 24px 0 0px;
  //   color: $--color-tip;
  //   .dot {
  //     width: 4px;
  //     height: 4px;
  //     background: $--color-tip;
  //     border-radius: 50%;
  //   }
  // }
}
</style>
