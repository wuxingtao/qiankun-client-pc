<template>
  <div class='container'>
  <el-form ref='query' class='form' :model='form' label-position='right'>
  <el-row>
  <el-col :span='cfg.span ? cfg.span : 5' v-for='(cfg, index) in configFold' :key='index'>
    <el-form-item
      class='form-item'
      :label='cfg.title'
      :label-width="cfg.titleOptions && cfg.titleOptions.length ? '0' : '80px'"
      :prop='cfg.field'
      :ref='cfg.field'
      :class="cfg.titleOptions && cfg.titleOptions.length ? 'customer-label' : ''">
      <el-select
        v-if='cfg.titleOptions && cfg.titleOptions.length'
        v-model='form[cfg.titleField]'
        size='medium'
        style='width: 80px'
        class='no_border'
        popper-class='title-field'
        :prop='cfg.titleField'
        @change='titleFieldChange(cfg.field)'>
        <el-option
          v-for='(option, index) in cfg.titleOptions'
          :key='index'
          :label='option.label'
          :value='option.value'
        />
      </el-select>
      <el-input
        v-if="cfg.type === 'input'"
        v-model='form[cfg.field]'
        size='medium'
        :maxlength='cfg.options.maxlength[form[cfg.titleField]]'
        :clearable='cfg.clearable || false'
        :placeholder="
                cfg.placeholder ||
                cfg.titleOptions.find(i => i.value === form[cfg.titleField]).placeholder ||
                ''
              "
        :style="cfg.titleOptions ? 'width:calc(100% - 80px)' : ''"></el-input>
      <el-date-picker
        v-if="cfg.type === 'datePicker'"
        v-model='form[cfg.field]'
        span='4'
        popper-class='date_picker'
        size='medium'
        type='daterange'
        class='datetimeType'
        :range-separator='cfg.rangeSeparator'
        :start-placeholder='cfg.startPlaceholder'
        :end-placeholder='cfg.endPlaceholder'
        :format='cfg.format'
        :style="cfg.titleOptions ? 'width:calc(100% - 80px)' : ''"
        :picker-options='cfg.getPickerOptions()'
        :editable='false'
        :clearable='false'>
      </el-date-picker>
      <el-select
        v-if="cfg.type === 'select'"
        v-model='form[cfg.field]'
        :multiple='cfg.multiple || false'
        :collapse-tags='cfg.collapseTags || false'
        :value-key='cfg.field'
        :clearable='cfg.clearable || false'
        size='medium'
        popper-class='select-field'>
        <el-option
          v-for='(item, index) in cfg.selectOptions'
          :key='index'
          :label='item.label'
          :value='item.value'>
        </el-option>
      </el-select>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <div class='operation_button'>
      <el-button v-if='!expand' type='text' @click='packUpHandler(true)'>
        展开选项
        <i class='iconfont icon-open' />
      </el-button>
      <el-button v-if='expand' type='text' @click='packUpHandler(false)'>
        收起选项
        <i class='iconfont icon-pack-up' />
      </el-button>
      <el-button type='primary' size='medium' @click='queryHandler'>查询</el-button>
      <el-button size='medium' @click='resetHandler(true)'>重置</el-button>
    </div>
  </el-col>
  </el-row>
  </el-form>
  </div>
</template>

<script>
import dayjs from "dayjs"
import queryConfig from "../config/query"
import { mapGetters } from "vuex"
import { cloneDeep } from "lodash"

export default {
  props: {
    fold: {
      type: Number,
      default: 0
    },
    isPackUp: {
      //查询条件是否收起
      type: Boolean,
      default: false
    }
  },
  name: "Query",
  data() {
    return {
      form: this.initData(),
      expand: false,
      pickerOptions: {
        tempSelectedDate: "",
        onPick: ({ maxDate, minDate }) => {
          this.pickerOptions.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.pickerOptions.tempSelectedDate = ""
          }
        },
        disabledDate: time => {
          if (time < dayjs().add(-6, "month") || time > dayjs()) {
            return true
          }
          if (this.pickerOptions.tempSelectedDate !== "") {
            const minDate = dayjs(this.pickerOptions.tempSelectedDate).add(-1, "day")
            const maxDate = dayjs(this.pickerOptions.tempSelectedDate).add(30, "day")
            return time.getTime() < minDate || time.getTime() > maxDate
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(["newServiceWay", "newPayCustomerInfo"]),
    configFold() {
      if (!this.fold || this.expand) return this.queryConfig
      return this.queryConfig.slice(0, this.fold)
    },
    queryConfig() {
      /**
       * 修正查询配置
       * 如果没有付款公司的权限，付款公司会返回空数组，这时候不展示付款公司
       * 付款公司服务方式由接口返回选项，默认选择全部
       * */
      let cache = cloneDeep(queryConfig)
      if (!this.newPayCustomerInfo || !this.newPayCustomerInfo.length) {
        cache = cache.filter(i => i.field !== "customerCodes")
      }
      cache.forEach((item, index) => {
        if (item.field === "customerCodes") {
          cache[index].selectOptions = this.newPayCustomerInfo.map(i => {
            return {
              label: i.customerShortName,
              value: i.customerCode
            }
          })
        }
        if (item.field === "serviceMode") {
          const serviceWay = this.newServiceWay.map(i => {
            return {
              label: i.serviceTypeName,
              value: i.serviceTypeCode
            }
          })
          cache[index].selectOptions = [
            {
              label: "全部",
              value: ""
            },
            ...serviceWay
          ]
        }
      })
      return cache
    }
  },
  created() {
    this.$store.dispatch("client/setNewServiceWayAction")
    this.$store.dispatch("client/setNewPayCustomerInfo")
  },
  methods: {
    initData() {
      const config = queryConfig
      const form = {}
      config.forEach(i => {
        form[i.field] = (i.options?.value && (typeof (i.options.value) === "function" ?
          i.options.value()[i.field] :
          i.options.value[i.field])) || ""
        i.titleField
          ? (form[i.titleField] = (i.options?.value && i.options.value[i.titleField]) || "")
          : null
      })
      return form
    },
    packUpHandler(bol) {
      this.expand = bol
      this.$emit("update:isPackUp", !bol)
    },
    queryHandler() {
      this.$reportUtils.clkSearchOrderButton({ button_name: "查询" })
      this.$emit("query", this.dataFomatter(this.form))
    },
    titleFieldChange(field) {
      this.form[field] = ""
    },
    dataFomatter() {
      const formData = JSON.parse(JSON.stringify(this.form))
      queryConfig.forEach(cfg => {
        if (cfg.output) {
          if (Array.isArray(cfg.output)) {
            if (cfg.titleOptions?.length) {
              // 收/寄件查询格式化
              const { formatter, field } = cfg.output.find(
                ite => ite.field === formData[cfg.titleField]
              )
              formData[field] = formatter(formData[cfg.field])
              delete formData[cfg.field]
              delete formData[cfg.titleField]
            } else {
              // 时间格式修正
              cfg.output.forEach((ite, ind) => {
                formData[ite.field] = ite.formatter(formData[cfg.field][ind])
              })
              delete formData[cfg.field]
            }
          } else {
            const { formatter, field } = cfg.output
            formData[field] = formatter(formData[cfg.field])
          }
        }
      })
      // 处理付款公司数组化
      return formData
    },
    resetHandler(all = true) {
      this.$reportUtils.clkSearchOrderButton({ button_name: "重置" })
      if (all) {
        this.$refs.query.resetFields()
        this.form = this.initData()
      } else {
        this.configFold.forEach(item => {
          if (item.field !== "dateRange") {
            this.$refs[item.field][0]?.resetField()
          }
        })
      }
    },
    getQueryFormData() {
      return this.dataFomatter(this.form)
    }
  }
}
</script>

<style lang='scss' scoped>
.container {
  padding-top: 12px;
  border-bottom: 8px solid #f5f7fb;
  position: relative;
  
  .form {
    margin-right: 14px;
    overflow: hidden;
  }
  
  .form-item {
    padding: 0 6px;
    margin-bottom: 12px;
  }
  
  .customer-label {
    /deep/ .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  
  /deep/ .el-form-item__content {
    height: 32px;
    line-height: 32px;
    // margin-left: 70px !important;
  }
  
  /deep/ .el-form-item__label {
    line-height: 15px;
    // padding: 0 8px 0 0;
    color: #333;
    position: relative;
    top: 9px;
    vertical-align: middle;
    display: inline-block;
    width: 80px !important;
  }
  
  /deep/ .el-select--medium {
    height: 32px;
    line-height: 32px;
    width: 100%;
  }
  
  /deep/ .el-input--medium,
  /deep/ .el-input__inner {
    height: 32px;
    line-height: 32px;
    font-size: $--font-size-small;
    //width: calc(100% - 70px) !important;
  }
  
  /deep/ .el-range-input,
  /deep/ .el-range-separator,
  /deep/ .el-input__icon {
    height: 30px;
    line-height: 30px;
  }
  
  .el-date-editor {
    /deep/ .el-range-separator,
    /deep/ .el-input__icon {
      text-align: left;
    }
    
    /deep/ .el-range-input {
      text-align: center;
    }
  }
  
  /deep/ .el-range-input {
    width: 50%;
  }
  
  /deep/ .el-form-item__label {
    padding: 0 8px 0 0;
  }
  
  /deep/ .el-date-editor--daterange.el-input__inner {
    width: 100%;
    min-width: 219px;
    
    .el-range__close-icon {
      display: none;
    }
  }
  
  .no_border {
    width: 80px !important;
    
    /deep/ .el-input {
      width: 70px;
    }
    
    /deep/ .el-input__inner {
      border: 0 !important;
      padding-right: 18px;
      padding-left: 0;
      text-align: right;
      width: 80px;
      font-size: 13px;
      // padding: 0 20px 0 5px;
      // text-align: right;
    }
    
    /deep/ .el-input__suffix {
      position: absolute;
      right: -6px;
    }
    
    /deep/ .el-input__suffix-inner {
      display: block;
    }
    
    /deep/ .el-input__icon {
      width: 100%;
      font-size: 8px;
    }
  }
  
  .operation_button {
    white-space: nowrap;
    height: 32px;
    line-height: 32px;
    font-size: $--font-size-small;
    display: flex;
    margin-left: 8px;
    justify-content: flex-start;
    padding-right: 6px;
    
    .el-button {
      height: 32px;
      padding: 0 20px;
      line-height: 32px;
      font-size: $--font-size-small;
    }
    
    .el-button--text {
      padding: 0 0 0 22px;
    }
    
    i {
      font-size: $--font-size-small;
      color: #9378fa;
    }
  }
}

.el-col-6 {
  width: 28.75%;
}

.el-col-5 {
  width: 17.75%;
}
</style>

<style lang='scss'>
.date_picker {
  border: none;
  border-radius: 4px;
  
  .el-date-table th {
    border-top: solid 1px #ebeef5;
    border-bottom: none;
  }
  
  .start-date span,
  .end-date span {
    border-radius: 4px !important;
  }
  
  .el-date-table__row .disabled div {
    background-color: #fff;
  }
  
  .el-date-range-picker__content.is-left {
    border-right: none;
  }
}

.title-field,
.select-field {
  li {
    font-size: 12px;
  }
}
</style>
