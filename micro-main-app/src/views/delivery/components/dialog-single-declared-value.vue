<template>
  <ky-dialog custom-class='declared-value__container' class="dialog-2021" :title="dialogVisibleTemp?'保价声明':''" width='600px' :loading='loadingList.some(f=>f.loading)' :visible.sync='dialogVisible' is-form-page :visibleFooter='dialogVisibleTemp' confirm-text='保价' cancel-text='不保价' @confirm='handleConfirm' @cancel="handleCancel" append-to-body show-close @opened='onDialogOpened'>
    <div class="input__wrapper">
      <el-input ref='input' class='declared-value--input' v-model.trim='declaredValue' clearable v-kyerestrict.positiveOrZero :maxlength='7' placeholder='请填写金额' @blur='handleDeclaredValueChange'>
        <template slot='append'>
          <div class='declared-value--input-unit'>(元)</div>
        </template>
      </el-input>
      <div class='premium' v-if='visiblePremium'>
        保费：<span>{{ premium ? Number(premium).toFixed(2) + '元' : '--' }}</span>
      </div>
    </div>

    <div class='description'>
      <declared-value />
    </div>
    <div slot="footer-left">
      <el-checkbox v-model="isChecked">我已知晓，下次不再提醒</el-checkbox>
    </div>
  </ky-dialog>
</template>

<script>
import { watch, reactive, ref, nextTick, computed } from '@vue/composition-api'
import useSingleFee from '../hooks/useSingleFee'
import { debounce } from 'lodash'
import DeclaredValue from '@comps/agreements/declared-value'
import * as storageUtil from '@/utils/storage'

export default {
  components: {
    DeclaredValue
  },
  props: {
    formData: {
      type: Object
    }
  },
  setup (props, { emit, root }) {
    const input = ref(null)
    const dialogVisible = ref(false)
    const dialogVisibleTemp = ref(false)
    const declaredValue = ref('')
    const premium = ref('')
    // const loading = ref(false)
    const loadingList = reactive([])
    const currentRow = ref(null) //批量导入或填写时使用
    let currentRowModel = null
    const isChecked = ref(false)

    const visiblePremium = computed(()=>props.formData?.payWay === '10' && premium.value)

    const { getServiceCharge, setTableRowDeclaredValue } = useSingleFee({ formData: props.formData })
    // title等按钮文本动态清空文本是解决批量表格里提示的问题
    watch(dialogVisible, flag => {
      if (flag) {
        nextTick(() => dialogVisibleTemp.value = true)
        return
      }
      setTimeout(() => {
        dialogVisibleTemp.value = flag
      }, 300)
    })
    const showDialog = (data, row, rowModel) => {
      loadingList.length = 0
      declaredValue.value = data.declaredValue
      premium.value = data.premium
      currentRow.value = row
      currentRowModel = rowModel
      dialogVisible.value = true
      isChecked.value = storageUtil.getOrSetDeclaredValueFlag()
    }

    const handleDeclaredValueChange = debounce(async function () {
      const loadingTemp = { loading: true }
      try {
        loadingList.push(loadingTemp)
        const value = await getServiceCharge('insuredFee', declaredValue.value, currentRowModel)
        premium.value = declaredValue.value ? value : ''
      } finally {
        loadingTemp.loading = false
      }
    }, 500)

    const saveCheckFlag = ()=>{
      if(isChecked.value){
        storageUtil.getOrSetDeclaredValueFlag(true)
      }else{
        storageUtil.removeDeclaredValueFlag()
      }
    }
    const handleCancel = async()=>{
      declaredValue.value = ''
      handleConfirm()
    }
    const handleConfirm = async () => {
      if (declaredValue.value?.length > 7) {
        root.$message.warning('保价声明最大长度不能超过7位数')
        return
      }
      premium.value = await getServiceCharge('insuredFee', declaredValue.value, currentRowModel)
      const declaredValueValue = declaredValue.value
      const row = currentRow.value
      const result = {
        isFromDialog:true,
        declaredValue: declaredValueValue ? Number(declaredValueValue) : '',
        premium: premium.value,
        row
      }

      if (row) {
        setTableRowDeclaredValue(row, declaredValueValue,premium.value)
      }
      saveCheckFlag()
      emit('on-confirm', result)
      dialogVisible.value = false
    }

    const onDialogOpened = () => {
      input.value.focus()
    }

    return {
      input,
      loadingList,
      dialogVisible,
      declaredValue,
      dialogVisibleTemp,
      premium,
      visiblePremium,
      handleDeclaredValueChange,
      handleConfirm,
      handleCancel,
      showDialog,
      onDialogOpened,
      isChecked
    }
  }
}
</script>

<style lang='scss' scoped>
  /deep/ .declared-value__container {
    .el-dialog__body {
      display: flex;
      flex-direction: column;
      .input__wrapper {
        .premium {
          margin-top: 10px;
          font-size: 12px;
          color: #999999;

          & > span {
            color: #ee1d06;
          }
        }

        .declared-value--input {
          width: 240px;
          position: relative;
          .el-input__suffix {
            bottom: 10px !important;
            right: 17px !important;
            margin-bottom: 30px !important;
          }
          .el-input-group__append {
            font-size: 12px;
          }
        }

        .declared-value--input-unit {
          position: absolute;
          left: -18px;
          top: 7px;
          z-index: 100;
        }
      }

      .description {
        box-sizing: border-box;
        background: #f7f7f7;
        border-radius: 2px;
        margin-top: 22px;
        overflow-y: scroll;
        @include scroll-bar;
      }
    }
    .el-dialog__footer {
      display: flex;
      & > div:first-of-type {
        display: flex;
        align-items: center;
        .el-checkbox__input{
          line-height: 12px;
        }
        .el-checkbox__label {
          font-size: 12px;
          padding-left: 8px;
          color: #666666;
        }
      }
    }
  }
</style>
