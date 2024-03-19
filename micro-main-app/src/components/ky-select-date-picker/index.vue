<template>
  <div class='ky-select-date-picker'>
    <el-select
      v-model='dateType'
      style='width: 80px'
      class='no_border'
      popper-class='select-type'
      prop='select'
      :size='size'
      :editable='editable'
      @change='dateTypeChange'>
      <el-option
        v-for='(option, index) in dateTypeOption'
        :key='index'
        :label='option.label'
        :value='option.value' />
    </el-select>
    <div class='ky-date-picker'>
      <el-date-picker
        v-model='startTime'
        v-bind='$attrs'
        :style='{width:width}'
        :editable='editable'
        @change='changeStart'>
      </el-date-picker>
      <span class='el-range-separator  ky-range-separator'></span>
      <el-date-picker
        v-model='endTime'
        v-bind='$attrs'
        :style='{width:width}'
        @change='changeEnd'></el-date-picker>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ky-select-date-picker',
  props: {
    dateTypeOption: {
      type: Array,
      required: true
    },
    dateTypeConfig: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'medium'
    },
    width: {
      type: String,
      default: '125px'
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dateType: this.dateTypeOption[0].value,
      startTime: '',
      endTime: ''
    }
  },
  watch: {
    value: {
      handler(n) {
        if (n) {
          let [start, end] = n || []
          this.startTime = start || ''
          this.endTime = end || ''
        }
      },
      immediate: true
    }
  },
  methods: {
    dateTypeChange(value) {
      this.dateType = value
      this.$emit('dateTpyeChange', value)
    },
    changeStart(value) {
      let time = [value, this.endTime]
      this.$emit('input', time)
      this.$emit('change', time)
    },
    changeEnd(value) {
      let time = [this.startTime, value]
      this.$emit('input', time)
      this.$emit('change', time)
    }
  }
}
</script>

<style lang='scss' scoped>
.ky-select-date-picker {
  display: flex;
  margin-left: -80px;
  align-items: center;
  
  .no_border {
    width: 80px !important;
    
    /deep/ {
      .el-input {
        width: 70px;
      }
      
      .el-input__inner {
        border: 0 !important;
        padding-right: 18px;
        text-align: right;
        width: 80px;
        background: #fff;
      }
      
      .el-input__suffix {
        position: absolute;
        right: -6px;
      }
      
      .el-input__suffix-inner {
        display: block;
      }
      
      .el-input__icon {
        width: 100%;
        font-size: 8px;
      }
    }
  }
  
  .ky-date-picker {
    display: inline-block;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    min-width: 265px;
    //height: 32px;
    line-height: 32px;
    
    .ky-range-separator {
      display: inline-block;
      font-size: 0;
      width: 13px;
      height: 13px;
      background: url("../../assets/image/date-arrow.png") no-repeat top left;
      background-size: contain;
    }
    
    ::v-deep .el-input__inner {
      border: none;
      padding-right: 5px;
    }
    
    /deep/ {
      .el-input__inner {
        height: 32px;
        line-height: 32px;
        font-size: 12px;
      }
      
      .el-input__prefix {
        font-size: 12px;
        
        .el-input__icon {
          line-height: 32px;
        }
      }
    }
  }
}

</style>
<style lang='scss'>
.select-type {
  li {
    font-size: 12px;
  }
}
</style>