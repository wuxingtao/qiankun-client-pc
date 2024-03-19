<template>
  <ky-dialog
    class="dialog-batch-result_container"
    title=""
    :visible.sync="dialogVisible"
    :show-close="false"
    confirm-text=""
    cancel-text=""
    width="500px"
    append-to-body
  >
    <i class="iconfont icon-info2" />
    <div class="msg-info">
      本次保存成功<span>{{ successCount }}票</span>
      <template v-if="restrictCount > 0">
        ，因限制下单保存失败<span>{{ restrictCount }}票</span>
      </template>
      <template v-if="failCount > 0">
        ，提交失败<span>{{ failCount }}票</span>
      </template>
    </div>
    <div class="detail">
      <div class="total">
        <span>共计提交：</span>
        <span>{{ totalCount }}票</span>
      </div>
      <div>
        <span>提交成功：</span>
        <span>{{ successCount }}票</span>
      </div>
      <div class="fail" v-if="restrictCount > 0">
        <span>限制下单：</span>
        <span
          >{{ restrictCount }}票
          <span>(限制下单的运单不可保存)</span>
        </span>
      </div>
      <div class="fail" v-if="failCount > 0">
        <span>提交失败：</span>
        <span>{{ failCount }}票</span>
      </div>
    </div>
    <div class="download-wrapper" v-if="failCount > 0">
      <span>
        下载提交失败运单
        <el-button class="ky-button-icon" icon="iconfont icon-download" @click="downloadFailData"
          >下载</el-button
        >
      </span>
    </div>
    <div class="btn-wrapper">
      <el-button @click="handleClose('waybill')">不处理，我要去查件</el-button>
      <el-button type="primary" @click="handleClose(failCount > 0 ? 'resubmit' : 'close')">
        {{ failCount > 0 ? '重新提交失败运单' : '我知道了' }}
      </el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { computed, reactive, toRefs, watch } from '@vue/composition-api'
import batchImportUtil from '../utils/batch-import'
import * as commonUtil from '@/utils/commonUtil'
import dayjs from 'dayjs'
import fileUtil from '@/utils/fileUtil'
import deliveryApi from '@api/delivery'

export default {
  props: {
    resetFormData: { type: Function }
  },
  setup(props, { root }) {
    const state = reactive({
      dialogVisible: false,
      resolveResult: null,
      totalCount: 0, //提交总条数
      failCount: 0, //失败条数
      failModelList: null, //失败数据
      restrictCount: 0, //限寄条数
      restrictModelList: null,
      operationType: '' //操作类型
    })
    watch(
      () => state.dialogVisible,
      flag => {
        if (!flag) {
          state.resolveResult && state.resolveResult()
        }
      }
    )
    const successCount = computed(() => {
      return state.totalCount - state.failCount - state.restrictCount
    })
    const showDialog = async ({ failModelList, totalCount, restrictModelList }, operationType) => {
      state.dialogVisible = true
      state.totalCount = totalCount
      state.failCount = failModelList?.length || 0
      state.failModelList = failModelList
      state.restrictCount = restrictModelList?.length || 0
      state.restrictModelList = restrictModelList
      state.operationType = operationType
      return new Promise(resolve => {
        state.resolveResult = resolve
      })
    }
    const handleClose = type => {
      if (type === 'close') {
        state.dialogVisible = false
        return
      }
      if (type === 'waybill') {
        root.$router.push({
          name: 'waybill-v3',
          params: { refreshData: true, operationType: state.operationType }
        })
      } else {
        state.resolveResult({ continue: true })
        state.resolveResult = null
      }
      state.dialogVisible = false
    }

    const downloadFailData = () => {
      exportFailData()
    }

    const exportFailData = async () => {
      const columns = batchImportUtil.getCopyOfTableColumns()
      const customColumns = columns
        .filter(c => c.prop.startsWith('customColumnValue_'))
        .sort((a, b) => a.customFieldCode - b.customFieldCode)
      // const ignoreColumns = ['coupon','superZoneTip','estimateFreight']
      // const theadColumns = columns.filter(f=>!f.hide&&!ignoreColumns.includes(f.prop))
      const filename = `提交失败运单${dayjs().format('YYYY年MM月DD HH-mm-ss')}.xls`
      const jsonData = state.failModelList.map(m => {
        columns.forEach(c => {
          if (!m[c.prop]) {
            m[c.prop] = ''
          }
        })
        let sizeList = ''
        if (m.sizeList?.length > 0) {
          sizeList = m.sizeList.map(s => `${s.length}*${s.width}*${s.height}*${s.count || 1}`)
          sizeList = commonUtil.trim(sizeList, '*')
        }
        const payAccount = m.payWay == '10' ? '' : m.payAccount
        const isSignSelf = m.isSignSelf ? '是' : '否'
        const { serviceWayDict, payWayOptions, wrapOptions, receiptOptions } =
          root.$store.state.common
        const mjWay = wrapOptions?.find(o => o.value === m.mjWay)?.label || ''
        const receiptFlag = receiptOptions?.find(o => o.value === m.receiptFlag)?.label || ''
        const payWay = payWayOptions?.find(o => o.value === m.payWay)?.label || ''
        const serviceWay = serviceWayDict?.find(o => o.value == m.serviceWay)?.label || ''
        const customColumnValues = customColumns.map(c => m[c.prop])
        return {
          ...m,
          mjWay,
          payWay,
          receiptFlag,
          serviceWay,
          payAccount,
          sizeList,
          isSignSelf,
          customColumnValues
        }
      })
      // const params ={jsonData,theadColumns,filename}
      // clientUtil.exportExcel(params)

      const { isSignBySelf } = root.$store.getters
      const kaMappings = customColumns.map(m => ({
        customerField: m.text,
        orderMustStatus: m.required ? 1 : 0
      }))
      const params = {
        selfSignFlag: isSignBySelf ? 10 : 20,
        errorDatas: jsonData,
        kaCustomerMappings: kaMappings
      }
      const res = await deliveryApi.getBatchImportFailDataExcelUrl(params)
      if (res.code === 0) {
        fileUtil.downloadFileByUrl(res.data.url, filename)
      }
    }

    return {
      ...toRefs(state),
      showDialog,
      handleClose,
      successCount,
      downloadFailData
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-batch-result_container {
  font-size: 14px;
  color: #333;
  /deep/ {
    .el-dialog__header {
      height: 38px;
      border-bottom: none !important;
      box-sizing: border-box;
    }
    .el-dialog__footer {
      display: none;
    }
    .el-dialog__body {
      margin-top: 0 !important;
      padding: 0 0 20px 34px !important;
      position: relative;
      .icon-info2 {
        font-size: 18px;
        position: absolute;
        left: 10px;
        top: 2px;
        color: #f67f2c;
      }
      .msg-info {
        font-size: 18px;
        font-weight: bold;
        color: #03050d;
        line-height: 25px;
        & > span {
          font-size: 18px;
          font-weight: bold;
          color: #ff8038;
        }
      }
      .detail {
        box-sizing: border-box;
        background: #f7f8fe;
        border-radius: 2px;
        padding: 8px 0 0 12px;
        margin: 12px 0 20px 0;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        & > div {
          padding-bottom: 8px;

          & > span {
            &:first-of-type {
              display: inline-block;
              width: 90px;
            }
            &:last-of-type {
              font-weight: bold;
              color: #03050d;
            }
          }
          &.fail {
            & > span:last-of-type {
              color: #ff8038;
              & > span {
                color: #8f8fa8;
                font-size: 12px;
              }
            }
          }
        }
      }
      .download-wrapper {
        color: #666666;
        .ky-button-icon > span {
          margin-left: 4px;
        }
      }
      // .el-checkbox{
      //   color: #666666;
      //    .el-checkbox__inner{
      //      width: 12px;
      //      height: 12px;
      //      &::after{
      //        top: 0px;
      //        left: 3px;
      //      }
      //    }
      //     .el-checkbox__label{
      //       font-size: 12px;
      //        color: #666666 !important;
      //     }
      // }
      .btn-wrapper {
        margin-top: 32px;
        text-align: right;
        button {
          box-sizing: border-box;
          line-height: 12px;
          padding: 10px 10px;
        }
      }
    }
  }
}
</style>