<template>
  <div class='ky-search-form ky-search-form20210713'>
    <el-form ref='ruleForm' :model='formData' v-bind='$attrs' v-on='$listeners'>
      <div class='form-body'>
        <slot name='start' v-bind='{data:formData,row:{}}'></slot>
        <div class='form-col' :style="{width:item.width?item.width: '335px'}" v-for='(item,index) in componentData'
             :key='item.prop+index'>
          <el-form-item :label='item.label' :label-width='item.labelWidth' :style='formItemStyle'
                        :key='`form-item-${index}-${item.prop}`'>
            <component
              v-if='item.component'
              :is='item.component'
              v-bind='item.attrs'
              v-on='item.listeners'
              :key='`components-${index}-${item.prop}`'
              v-model="formData[item['prop']]"
            >
              <template v-if='item.children&&Object.keys(item.children).length>0'>
                <component
                  style='width: 100%'
                  :is='item.children.component'
                  v-bind='item.children.attrs'
                  v-on='item.children.listeners'
                  v-for='(child,index) in item.children.options'
                  :key='`child-${index}-${item.children.prop}`'
                  :label="item.children.lableKey?child[item.children.lableKey]: child['label']"
                  :value="item.children.valueKey?child[item.children.valueKey]:child['value']"
                >
                </component>
                <slot :name='item.children.slot' v-bind='{data:formData,row:item.children}'></slot>
              </template>
            </component>
            <slot :name='item.slot' v-bind='{data:formData,row:item}'></slot>
          </el-form-item>
        </div>
        <slot name='end' v-bind='{data:formData,row:{}}'></slot>
        <div class='form-col' v-if='showSearchButton||showResetButton'>
          <el-button v-if='showSearchButton' type='primary' round style='width: 85px;' size='medium'
                     @click="$emit('search')">查询
          </el-button>
          <el-button v-if='showResetButton' type='primary' round style='width: 85px;' size='medium'
                     @click="$emit('reset')">重置
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ky-search-form',
  props: {
    /*form数据*/
    formData: {
      type: Object,
      default: () => ({})
    },
    /*组件配置*/
    componentData: {
      type: Array,
      default: () => [],
      required: true
    },
    formItemBottom: {
      type: String,
      default: ''
    },
    showSearchButton: {
      type: Boolean,
      default: false
    },
    showResetButton: {
      type: Boolean,
      default: false
    },
    isPackUp: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    formItemStyle() {
      if (this.formItemBottom) {
        return { 'margin-bottom': this.formItemBottom }
      }
    }
  },
  data() {
    return {
      /*  data:[
          {
            prop: 'time',
            label:'时间',
            slot:'',
            width: '',
            component:'el-date-picker',
            attrs:{
              size:"medium",
              editable:false,
              clearable:false,
              type:"daterange",
              rangeSeparator:"",
              startPlaceholder:"开始日期",
              endPlaceholder:"结束日期",
              format:"yyyy/MM/dd",
            },
            listeners:{
              change: this.change
            },
          },
          {
            prop: 'name',
            label:'姓名',
            slot:'',
            component:'el-select',
            attrs:{
              multiple:true,
              collapseTags:true,
              size:"medium"
            },
            listeners:{
              change: this.change
            },
            children: {
              prop: '',
              label:'',
              options: [
                {
                  label: '测试1',
                  value: '1'
                },
                {
                  label: '测试2',
                  value: '2'
                }
              ],
              lableKey: '',
              valueKey: '',
              component:'el-option',
              attrs:{
              },
              listeners:{
              },
            }
          },
        ],*/
    }
  },
  methods: {
    /* change(value){
      console.log(value)
    }*/
  }
}
</script>

<style scoped lang='scss'>
.ky-search-form {
  /*input 圆角*/
  /deep/ .el-input__inner {
    border-radius: 4px;
  }
  
  /* 时间图标*/
  /*  /deep/ .el-icon-date {
        position: absolute;
        right: 10px;
        color: #7556ed;
    }*/
  /*时间箭头*/
  /deep/ .el-range-separator {
    font-size: 0;
    width: 13px;
    height: 13px;
    background: url("../../../assets/image/date-arrow.png") no-repeat top left;
    background-size: contain;
  }
  
  /deep/ .el-date-editor--daterange.el-input,
  /deep/ .el-date-editor--daterange.el-input__inner,
  /deep/ .el-date-editor--timerange.el-input,
  /deep/ .el-date-editor--timerange.el-input__inner {
    width: 250px;
  }
  
  .form-body {
    .form-col {
      display: inline-block;
    }
  }
  
  /deep/ .el-select {
    width: 100%;
  }
  
  /deep/ .el-input--medium .el-input__icon {
    line-height: 40px;
  }
  
  /deep/ .el-form-item__label {
    color: #333;
  }
  
  /deep/ .el-form--inline .el-form-item {
    width: 100%;
  }
  
  /deep/ .el-form--inline .el-form-item .el-form-item__content {
    width: 100%;
  }
}
</style>
