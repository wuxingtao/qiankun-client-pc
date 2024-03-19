<template>
  <guide-popover
    v-if='showGuide'
    content='[运单备注] 移到这里啦~'
    storageKey='isShowDeliveryMarkPopover'
    :popper-options='popoverOptions'
    :disabled="guideOptions.disabled || activeTabName !== 'single'"
  >
    <section class='info-wrapper info-remarks' ref='popoverReference'>
      <single-info-header
        :is-show-in-dialog='isShowInDialog'
        icon='icon-category-remarks'
        title='运单备注'
      />
      <el-form class='page-style1 form' :model='formData' label-position='top' label-width='88px'
               @submit.native.prevent>
        <el-row :gutter='20'>
          <el-col :span='24'>
            <el-form-item prop='jjRemark' :error='errorMsgs.jjRemark'>
              <el-input
                :title='formData.jjRemark'
                v-model='formData.jjRemark'
                size='medium'
                clearable
                show-word-limit
                :maxlength='150'
                placeholder='请输入备注'
                class='input-remark'
                @change='inputValueChange'
              ></el-input>
              <div
                class='sugesstion-tip'
                v-show='shareData.suggestions.jjRemark.tip'
                @click="setSuggestionItemValue('jjRemark')">
                {{ shareData.suggestions.jjRemark.tip }}
                <i
                  class='el-icon-circle-close'
                  @click.stop="shareData.suggestions.jjRemark.tip = ''"
                ></i>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class='wrapper'>
        <span class='wrapper-label'>备注选项：</span>
        <div class='wrapper-tags'>
          <el-tag v-for='(item, index) in remarksTags' class='tag' :key='index' @click='addTag(item)'>
            {{ item }}
          </el-tag>
        </div>
      </div>
    </section>
  </guide-popover>
  <section v-else class='info-wrapper info-remarks'>
    <single-info-header
      :is-show-in-dialog='isShowInDialog'
      icon='icon-category-remarks'
      title='运单备注'
    />
    <el-form class='page-style1 form' :model='formData' label-position='top' label-width='88px'
             @submit.native.prevent>
      <el-row :gutter='20'>
        <el-col :span='24'>
          <el-form-item prop='jjRemark' :error='errorMsgs.jjRemark'>
            <el-input
              :title='formData.jjRemark'
              v-model='formData.jjRemark'
              size='medium'
              clearable
              show-word-limit
              :maxlength='150'
              placeholder='请输入备注'
              class='input-remark'
              @change='inputValueChange'
            ></el-input>
            <div
              class='sugesstion-tip'
              v-show='shareData.suggestions.jjRemark.tip'
              @click="setSuggestionItemValue('jjRemark')">
              {{ shareData.suggestions.jjRemark.tip }}
              <i
                class='el-icon-circle-close'
                @click.stop="shareData.suggestions.jjRemark.tip = ''"
              ></i>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class='wrapper'>
      <span class='wrapper-label'>备注选项：</span>
      <div class='wrapper-tags'>
        <el-tag v-for='(item, index) in remarksTags' class='tag' :key='index' @click='addTag(item)'>
          {{ item }}
        </el-tag>
      </div>
    </div>
  </section>
</template>

<script>
import useSingleSuggestion from '../hooks/useSingleSuggestion'
import SingleInfoHeader from './single-info-header'
import { reactive, computed, ref } from '@vue/composition-api'
// import useSingleValidate from '../hooks/useSingleValidate'
import useSingleCommon from '../hooks/useSingleCommon'
import GuidePopover from '@comps/guide-popover'

export default {
  props: {
    tempShareData: { type: Object },
    tempFormData: { type: Object },
    isShowInDialog: { type: Boolean },
    showGuide: { type: Boolean }, // 判断新手引导展示的页面
    activeTabName: { type: String }
  },
  components: {
    SingleInfoHeader,
    GuidePopover
  },
  setup(props, { root, emit }) {
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const errorMsgs = reactive({
      jjRemark: ''
    })
    const guideOptions = reactive({
      disabled: false
    })
    useSingleCommon({ formData, shareData, emit })
    const { setSuggestionItemValue } = useSingleSuggestion({
      formData, shareData
    })
    
    // 设置popover不越出高度
    const popoverReference = ref(null)
    const popoverOptions = reactive({ boundariesElement: '.info-wrapper', removeOnDestroy: true })
    // const { validateFields } = useSingleValidate({
    //   formData, shareData
    // })
    const remarksTags = computed(() => root.$store.state.delivery.waybillHistoryRemarksList)
    const addTag = tag => {
      let remarks = formData.jjRemark
      remarks = (remarks ? `${remarks},` : '') + tag
      if (remarks.length > 150) {
        return
      }
      formData.jjRemark = remarks
    }
    
    const inputValueChange = async () => {
      // await validateFields({ fields: 'jjRemark', errorMsgs })
    }
    
    function disabledGuide() {
      guideOptions.disabled = true
    }
    
    function hideDialog() {
      disabledGuide()
    }
    
    return {
      shareData,
      formData,
      errorMsgs,
      remarksTags,
      guideOptions,
      inputValueChange,
      setSuggestionItemValue,
      addTag,
      disabledGuide,
      hideDialog,
      popoverReference,
      popoverOptions
    }
  }
}
</script>

<style lang='scss' scoped>
@import '../styles/single-common.scss';

.info-remarks {
  .category-caption-dialog {
    margin-bottom: 9px;
  }
  
  .category-caption {
    margin-bottom: 1px;
  }
  
  .form {
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }
  
  /deep/ .input-remark > input {
    padding-right: 65px !important;
  }
  
  .input-remark {
    /deep/ {
      .el-input__suffix-inner {
        width: 100px;
        height: 100%;
        display: flex;
        position: relative;
        justify-content: flex-end;
        align-items: center;
      }
      
      .el-input__count {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 0;
      }
      
      .el-input__icon {
        position: absolute;
        top: 50%;
        right: 50px;
        transform: translateY(-50%);
        line-height: 32px;
      }
    }
    
    ///deep/ .el-input__count {
    //  position: absolute;
    //  top: 50%;
    //  transform: translateY(-50%);
    //}
    
  }
  
  .wrapper {
    padding: 14px 5px 0px;
    margin-bottom: 4px;
    display: flex;
    align-items: flex-start;
    
    .wrapper-label {
      top: 6px;
      position: relative;
    }
    
    .wrapper-tags {
      width: 91%;
    }
    
    .tag {
      height: 24px;
      line-height: 24px;
      margin-bottom: 8px;
      margin-right: 10px;
      background: #ECEFF5;
      font-size: $--font-size-small;
      border: 1px solid #DEE1E6;
      border-radius: 2px;
      color: #666666;
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
  }
}

</style>
