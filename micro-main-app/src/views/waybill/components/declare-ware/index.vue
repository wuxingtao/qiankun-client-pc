<template>
  <ky-dialog
    :class="[
      'declare-ware__dialog page-style1 dialog-2021',
      type === 'batch' ? 'declare-batch' : 'declare-single',
      isClientMode ? 'client-mode' : 'web-mode'
    ]"
    title="请确认报关入仓服务"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :width="type === 'batch' ? '700px' : '500px'"
    append-to-body
    @confirm="confirm"
    @close="close"
    :loading="loading"
  >
    <div class="declare-ware__header">
      <p class="desc c_333 font-medium mb_12">
        <i class="iconfont icon-warn mr_8 fs_14--strict" style="color: #fe743c"></i
        >由于以下运单需要报关入仓服务，请确认是否需要：
      </p>
      <div class="desc-content">
        <div class="desc-content__item">
          <span v-if="type === 'batch'">如需要，将会收取入仓调价费，并建议您填写入仓资料</span>
          <span v-else v-html="fenceTipRender" class="f_w_b"></span>
        </div>
        <div class="desc-content__item">
          <span v-if="type === 'batch'"
            >若不选择，但运单实际涉及此服务，则可能<span class="high-light"
              >延时派送，并额外按票收取异常操作费，风险将由您承担</span
            ></span
          >
          <span v-else v-html="excTipsRender" class="f_w_b"></span>
        </div>
      </div>
    </div>

    <template v-if="type === 'batch'">
      <declare-content v-if="wareData && wareData.length > 0" :addressLists="wareData" />
      <div slot="footer-left">
        <span class="declare-total-amount"
          >同意：{{ totalAgree.length }}票，共计费用：<span class="high-amount f_w_b fs_14--strict"
            >¥{{ totalAgreeAmount }}</span
          ></span
        >
      </div>
    </template>
    <template v-else>
      <div slot="footer" class="dialog-footer w_full text_right">
        <el-button @click="handleSingleCancel">无需报关入仓</el-button>
        <el-button class="btn-i-know" size="medium" type="primary" @click="handleSingleAgree"
          >需要并同意</el-button
        >
      </div>
    </template>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api'
import DeclareContent from '@views/waybill/components/declare-ware/declare-content.vue'

export default {
  name: 'declare-ware',
  props: {
    type: {
      type: String,
      default: 'single'
    }
  },
  components: {
    DeclareContent
  },
  setup(props) {
    const state = reactive({
      dialogVisible: false,
      loading: false,
      // 是否勾选电子运单
      agreementChecked: true,
      wareData: [],
      resolveResult: null,
      fenceTipRender: computed(() => {
        const singleRow = state.wareData && state.wareData[0]
        if (!singleRow) {
          return
        }
        const value = singleRow['fenceTips']
        const value1 = singleRow['totalAmount']
        if (!value) {
          return ''
        }
        return value.replace(
          new RegExp(`(${value1})`, 'ig'),
          '<span class=\'high-amount\'>$1</span>'
        )
      }),
      excTipsRender: computed(() => {
        const singleRow = state.wareData && state.wareData[0]
        if (!singleRow) {
          return
        }
        const value = singleRow['excTips']
        const value1 = singleRow['excTotalAmount']
        if (!value) {
          return ''
        }
        return value.replace(
          new RegExp(`(${value1})`, 'ig'),
          '<span class=\'high-amount\'>$1</span>'
        )
      }),
      totalAgree: computed(() => {
        return state.wareData.filter(item => item.checkedCustomsCharge === '10') || []
      }),
      totalAgreeAmount: computed(() => {
        let result = '0'
        if (state.totalAgree && state.totalAgree.length > 0) {
          result = state.totalAgree
            .map(item => item.totalAmount)
            .reduce((acc, f) => Number(acc) + Number(f))
        }
        return Number(result).toFixed(2)
      })
    })

    function showDialog({ data }) {
      state.wareData = data
      state.dialogVisible = true

      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    }

    function confirm() {
      this.resolveResult && this.resolveResult({ data: state.wareData })
      state.dialogVisible = false
    }

    // 报关入仓-单票同意
    function handleSingleAgree() {
      this.resolveResult && this.resolveResult({ checkedCustomsCharge: '10' })
      state.dialogVisible = false
    }

    function handleSingleCancel() {
      this.resolveResult && this.resolveResult({ checkedCustomsCharge: '20' })
      state.dialogVisible = false
    }

    function close() {
      this.resolveResult && this.resolveResult({ type: 'close' })
    }

    return { ...toRefs(state), showDialog, confirm, close, handleSingleAgree, handleSingleCancel }
  }
}
</script>

<style lang="scss" scoped>
.declare-single {
  .declare-ware__header {
    margin-bottom: 8px;
  }
  .desc-content {
    line-height: initial;
  }
  .desc-content__item {
    &:first-child {
      margin-bottom: 8px;
    }
  }
}
.declare-ware__header {
  background: #fff9e6;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 12px;
  &__item {
    margin-bottom: 16px;
    line-height: 1.5;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: 500;
    &:last-child {
      margin-bottom: 0;
    }
  }
  * {
    font-size: 12px;
  }
}
.desc-content {
  line-height: 1.5;
  padding-left: 22px;
  color: #333333;
  font-family: PingFangSC, PingFangSC-Medium;
  font-weight: 500;
}
.declare-ware__dialog {
  font-size: 12px;
  .high-amount {
    color: #ff7374;
    font-size: 14px;
    font-family: PingFangSC, PingFangSC-Medium;
  }
  .declare-total-amount {
    color: #333333;
    font-size: 14px;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: bold;
  }
  /deep/ {
    .high-light {
      color: #fe743c;
    }
    .high-amount {
      color: #ff706d;
      font-size: 12px;
    }
    .el-dialog__footer {
      display: flex;
      align-items: center;
    }
    .desc-content__item {
      > span {
        line-height: 16px;
      }
      span {
        font-weight: bold;
      }
    }
  }
}
</style>
