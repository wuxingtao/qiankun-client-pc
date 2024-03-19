<template>
  <ky-dialog title="修改运单" :visible.sync="dialogVisible" width="820px" append-to-body>
    <div class="rows-summary" v-if="isBatch">
      第{{ currentIndex + 1 }}条<i />共{{ rowCount }}条
      <div class="btn-wrapper">
        <el-button
          size="mini"
          class="btn-delete"
          plain
          :disabled="rowCount === 1"
          @click="handleDelete"
          >删除本条</el-button
        >
        <el-button size="mini" plain :disabled="currentIndex <= 0" @click="currentIndex -= 1"
          >上一条</el-button
        >
        <el-button
          size="mini"
          plain
          :disabled="currentIndex === rowCount - 1"
          @click="currentIndex += 1"
          >下一条</el-button
        >
      </div>
    </div>
    <single-info-whole
      v-if="dialogVisibleCopy"
      ref="singleInfoWholeRef"
      :isModify="true"
      :ydNo="ydNo"
      :visibleOfCoupon="false"
      :tempFormData.sync="formData"
      :tempShareData.sync="shareData"
      @loading-change="loading = $event"
    >
      <template #dialog-sender-title>
        <div class="yd-no">
          运单号：{{ ydNo }}
          <el-button type="text" v-clipboard="ydNo">
            <svg-icon icon-class="copy" class="icon-copy" />复制
          </el-button>
        </div>
      </template>
    </single-info-whole>
    <dialog-waybill-footer
      slot="footer"
      :visible.sync="dialogVisible"
      :loading="loading"
      :shareData="shareData"
      :confirmButtonEvent="handleClickSave"
      :confirmButtonText="isBatch ? '保存并完善下一票' : '保存'"
    />
  </ky-dialog>
</template>

<script>
import useAddress from '@/hooks/useAddress'
import { reactive, ref, nextTick, watch, computed } from '@vue/composition-api'
import deliveryApi from '@api/delivery'
import { getFormData, getShareData } from '../utils/formData'
import SingleInfoWhole from './single-info-whole'
import DialogWaybillFooter from './dialog-waybill-footer'

const payModes = {
  10: '寄方付',
  20: '收方付',
  30: '第三方付',
}

const mjWays = {
  10: '打卡板',
  20: '打木架',
  30: '打木箱',
}

export default {
  components: {
    SingleInfoWhole,
    DialogWaybillFooter,
  },
  activated() {
    this.$store.dispatch('supplier/setExistSupplierInfoAction')
  },
  setup(props, { emit, root }) {
    const loading = ref(false)
    const isBatch = ref(false)
    const modelList = ref([])
    const dialogVisible = ref(false)
    const currentRow = ref({})
    const currentIndex = ref(0)
    const dialogVisibleCopy = ref(false) //解决窗体关闭时闪烁问题
    const ydNo = ref('')
    const singleInfoWholeRef = ref(null)
    const shareData = reactive(getShareData())
    const formData = reactive(getFormData())
    const { parseAddress } = useAddress()
    watch(dialogVisible, flag => {
      if (!flag) {
        singleInfoWholeRef.value.clearFormData({ inFormData: formData, inShareData: shareData })
        singleInfoWholeRef.value.hideDialog()
      }
    })

    const rowCount = computed(() => {
      return modelList.value.length
    })

    const handleClickSave = async () => {
      const wholeRef = singleInfoWholeRef.value
      try {
        shareData.loadingFlags.saveData = true
        const model = await wholeRef.getFormDataModel()
        if (!model) {
          return
        }
        console.log(model, '表单')
        const user = JSON.parse(sessionStorage.getItem('USER_DATA'))
        const sizeList = model.sizeList.reduce((arr, item) => {
          if (item) {
            const size = {
              ...item,
              len: item.length,
              number: item.count,
            }
            arr.push(size)
          }
          return arr
        }, [])
        const serviceWay =
          (await root.$store.state.common.serviceWayDict?.find(
            o => o.value == model.serviceWay
          )?.label) || ''
        const params = {
          ...model,
          /** 付款方式 */
          payWay: payModes[model.payWay],
          /** 包装服务 */
          mjWay: mjWays[model.mjWay] || '无需包装',
          /** 服务方式 */
          serviceWay: serviceWay,
          /** 登陆手机 */
          mobile: user.phone,
          /** 登陆账户绑定的客户编码 */
          companyNo: user.customCode,
          /** 尺寸 */
          sizeList,
          /** 数据ID */
          id: currentRow.value.id,
          /** 声明价值 */
          money: model.declaredValue,
          /** 打印标识 */
          type: currentRow.value.type,
          /** 声明价值来源 */
          insuranceValueSource: model.insuranceValueSource || currentRow.value.insuranceValueSource,
          /** 收货仓库 */
          receiptHouseName: currentRow.value.pickupWareHouseName,
          /** 货主 */
          cargoOWner: currentRow.value.cargoOWner,
          /** 索尼定制 */
          sonyCustomizeds: currentRow.value.sonyCustomizeds,
          /** 上游单号 */
          upstreamNumber: currentRow.value.upstreamNumber,
          /** 体积 */
          volume: currentRow.value.volume,
          /** 仓库类型 */
          houseType: model.houseType || currentRow.value.houseType,
          /** 发货模式 */
          deliveryModel: model.deliveryMode || currentRow.value.deliveryModel,
          /** 代理公司 */
          shortCompany: currentRow.value.shortCompany,
        }
        console.log(params, '保存入参')
        const res = await deliveryApi.saveGrayWaybillData(params)
        if (res.code === 0) {
          root.$message.success(res.msg)
          /** 批量编辑 */
          if (isBatch.value) {
            emit('save-success')
            changeModeList()
          } else {
            emit('save-success', 'edit')
            dialogVisible.value = false
            nextTick(() => (dialogVisibleCopy.value = false))
          }
        }
      } finally {
        shareData.loadingFlags.saveData = false
      }
    }

    const showDialog = (data, mode = false) => {
      let row = data
      /** 批量编辑 */
      if (Array.isArray(data)) {
        row = data[0]
        modelList.value = data
      }
      isBatch.value = mode
      dialogVisible.value = true
      dialogVisibleCopy.value = true
      currentIndex.value = 0
      showModel(row)
    }

    /** 列表字段转换成弹窗表单字段-[编辑功能] */
    const adapterEditForm = async row => {
      const qhAddressData = await parseAddress(row.deliveryAddress)
      const sjAddressData = await parseAddress(row.pickupAddress)
      const form = {
        /** 数据ID */
        id: row.id,
        /** 运单号 */
        ydNo: row.waybillNumber,
        /** 寄件公司 */
        jjCompany: row.deliveryCompanyName,
        /** 寄件人 */
        jjContactPerson: row.deliveryPerson,
        /** 寄件人手机 */
        sms: row.deliveryMobile,
        /** 寄件人座机 */
        jjTelePhone: row.deliveryPhone,
        /** 取货地址 */
        qhAddressData: qhAddressData,
        /** 取货联系人 */
        qhContactPerson: row.contactPerson,
        /** 取货人手机 */
        qhContactWay: row.contactPhone,
        /** 收件公司 */
        sjCompany: row.pickupCompanyName,
        /** 收件人 */
        sjContactPerson: row.pickupPerson,
        /** 收件人手机 */
        sjMobile: row.pickupMobile,
        /** 收件人座机 */
        sjTelephone: row.pickupPhone,
        /** 收件地址 */
        sjAddressData: sjAddressData,
        /** 是否本人签收 */
        isSignSelf: row.selfSignFlag,
        /** 退货仓 */
        sendHouseName: row.deliveryWareHouseName,
        /** 付款方式 */
        payWay: row.payMode,
        /** 付款账号 */
        payAccount: row.payAccount,
        /** 服务方式- 字段有问题（要传中文），要找松哥核对 */
        serviceWay: row.serviceMode,
        /** 托寄物 */
        goods: row.goodsType,
        /** 总件数 */
        count: row.count,
        /** 总重量 */
        weight: row.weight,
        /** 规格尺寸 */
        sizeList: row.preWaybillGoodsSizeList,
        /** 唯品会入仓号 */
        vipshopCode: row.vipshopCode,
        /** 自定义字段1 */
        customColumnValue_01: row.customColumnValue_01,
        /** 自定义字段2 */
        customColumnValue_02: row.customColumnValue_02,
        /** 自定义字段3 */
        customColumnValue_03: row.customColumnValue_03,
        /** 保价声明 */
        declaredValue: row.declarativeValue,
        /** 代收货款 */
        dsMoney: row.collectionAmount,
        /** 包装服务 */
        mjWay: row.woodenFrameCode,
        /** 签回单 */
        receiptFlag: row.receiptFlag,
        /** 回单份数 */
        hdCount: row.receiptCount,
        /** 备注 */
        jjRemark: row.waybillRemark,
      }
      return form
    }

    const showModel = row => {
      ydNo.value = row.waybillNumber
      currentRow.value = row
      nextTick(async () => {
        const model = await adapterEditForm(row)
        singleInfoWholeRef.value.showModel(model)
      })
    }

    const changeModeList = () => {
      const currentRow = modelList.value[currentIndex.value]
      modelList.value.splice(currentIndex.value, 1)
      if (currentIndex.value === rowCount.value) {
        currentIndex.value = rowCount.value - 1
      }
      const row = modelList.value[currentIndex.value] || null
      console.log(row, '当前行')
      if (row) {
        showModel(row)
      }
      console.log(modelList.value.length, '批量操作条数')
      /** 批量操作至最后一条时，切换为单条操作模式 */
      if (modelList.value.length === 1) {
        isBatch.value = false
      }

      return currentRow
    }

    return {
      singleInfoWholeRef,
      ydNo,
      loading,
      isBatch,
      rowCount,
      modelList,
      showModel,
      changeModeList,
      currentIndex,
      dialogVisible,
      dialogVisibleCopy,
      shareData,
      formData,
      handleClickSave,
      showDialog,
    }
  },
  watch: {
    currentIndex (index) {
      if (index < 0) {
        return
      }
      const row = this.modelList[index]
      this.showModel(row)
    },
  },
  methods: {
    async handleDelete() {
      this.$kye_message.confirm('确定删除该运单吗？').then(async () => {
        const row = await this.changeModeList()      
        await this.$emit('delete', [row])
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.ky-dialog {
  /deep/.el-dialog__body {
    padding: 12px 0 !important;
    margin: 0 !important;
    background-color: #fff;
    .notice-container {
      min-width: 708px;
    }
    .yd-no {
      margin-left: auto;
      display: flex;
      align-items: center;
      padding-left: 8px;
      font-size: 12px;
      font-weight: bold;
      height: 28px;
      color: rgba(51, 51, 51, 0.93);
      background: url('~@/assets/image/shipment/yd-no-bg.png') no-repeat;
      background-position-x: right;
      button {
        position: relative;
        padding-left: 25px;
        font-size: 12px;
        &::before {
          content: '';
          display: block;
          position: absolute;
          right: 60px;
          top: 12px;
          width: 1px;
          height: 14px;
          background: #dcdae2;
        }
        .icon-copy {
          padding-right: 6px;
        }
      }
    }
    .rows-summary {
      position: relative;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f1f1f5;
      padding: 11px 13px;
      margin: 20px;
      background-color: #f6f6f6;
      font-weight: bold;
      & > i {
        display: inline-block;
        width: 1px;
        height: 14px;
        background: #d8d8d8;
        margin: 0 10px 0 12px;
      }
      .btn-wrapper {
        position: relative;
        margin-left: auto;

        .el-button {
          border-radius: 4px;
          width: 76px;
          height: 32px;
          & > span {
            font-weight: bold;
          }
          &:not(.is-disabled) {
            border: 1px solid #8365f6;
            color: #8365f6;
          }
        }
        .el-button + .el-button {
          margin-left: 12px;
        }
        .btn-delete {
          margin-right: 12px;

          &::after {
            position: absolute;
            top: 6px;
            left: 88px;
            content: '';
            display: block;
            border-right: 1px solid #f1f1f5;
            height: 22px;
          }
        }
      }
    }
    .single-info-whole--container {
      background-color: #fff;
      .notices {
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
