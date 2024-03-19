<template>
  <div class='header-form'>
    <div class='form-item'>
      <ky-select-date-picker
        v-if='needSendTime'
        :clearable='false'
        placeholder='选择日期'
        type='date'
        v-model='formDate.startDate'
        size='small'
        :dateTypeOption='dateTypeOption'
        @dateTpyeChange='changeDateType'
        @change='getTime'
      ></ky-select-date-picker>
      <template v-else>
        <span class='label'>寄件时间</span>
        <ky-date-picker
          :editable='false'
          :clearable='false'
          placeholder='选择日期'
          type='date'
          style='width: 250px; border-radius: 18px; background: #f6f8fb'
          v-model='formDate.startDate'
          size='small'
          @changeData='changeData'
          @change='getTime'
        ></ky-date-picker>
      </template>
    </div>
    <div class='form-item'>
      <span class='label'>服务方式</span>
      <el-select
        v-model='formDate.serviceType'
        clearable
        multiple
        collapse-tags
        @change='changeServiceType'
        size='small'
        :append-to-body='false'
      >
        <el-option
          v-for='(item, index) in serviceOption'
          :key='`0-${index}`'
          :label='item.label'
          :value='item.value'
        ></el-option>
      </el-select>
    </div>
    <div class='form-item'>
      <span class='label'>付款方式</span>
      <el-select
        v-model='formDate.payMode'
        @clear='clearPayMode'
        clearable
        multiple
        collapse-tags
        size='small'
        @change='changepayMode'
        :append-to-body='false'
      >
        <el-option
          v-for='(item, index) in payOption'
          :key='`0-${index}`'
          :label='item.label'
          :value='item.value'
        ></el-option>
      </el-select>
    </div>
    <el-button
      type='primary'
      round
      icon='el-icon-search'
      size='small'
      @click='search'
      :loading='isLoading'
    >查询
    </el-button
    >
  </div>
</template>

<script>
import * as API from '@/services/api/total.js'
import { cloneDeep } from 'lodash'
import { initParm, dtTypeLookUp, payLookUp, serviceLookUp } from '../comfig'
import dayjs from 'dayjs'
import KySelectDatePicker from '@/components/ky-select-date-picker'

export default {
  name: 'header-form',
  components: { KySelectDatePicker },
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
    needSendTime: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 监听切换角色
    'formData.customerFlag'(n) {
      if (n) {
        this.formData.payMode = this.formDate.payMode
        this.formData.serviceType = this.formDate.serviceType
        this.formData.startDate = this.formDate.startDate
        this.formData.dateType = this.formDate.dateType
        this.$emit('search', this.formData)
      }
    }
  },
  data() {
    return {
      oldCode: [],
      isLoading: false,
      payOption: payLookUp,
      serviceOption: [],
      serviceDataCode: [],
      dateType: 'shipingTime',
      formDate: {},
      dateTypeOption: [
        {
          label: '寄件时间',
          value: 'shipingTime'
        },
        {
          label: '需派时间',
          value: 'agentDeliveryAging'
        }
      ]
    }
  },
  created() {
    this.getOverviewServiceType()
    this.formDate = {
      payMode: this.formData.payMode,
      serviceType: this.formData.serviceType,
      startDate: this.formData.startDate
    }
  },
  methods: {
    // 格式化时间
    getTime(time) {
      this.formData.dtType = 0
      this.formData.dtTime = 0
      let start = time[0] ? dayjs(time[0]).format('YYYY-MM-DD') : ''
      let end = time[1] ? dayjs(time[1]).format('YYYY-MM-DD') : ''
      this.formDate.startDate = [start, end]
    },
    changeDateType(value) {
      this.dateType = value
    },
    // 获取服务方式
    async getOverviewServiceType() {
      this.serviceOption = []
      let reg = await API.overviewServiceType()
      if (reg.code === 0) {
        let serviceTypes = reg.data.serviceTypes || []
        let types = []
        let service = []
        let all = {
          label: '全部',
          value: '1'
        }
        serviceTypes.forEach((type) => {
          types.push(type.type)
        })
        serviceLookUp.forEach((item) => {
          if (types.includes(item.value)) {
            service.push(item)
          }
        })
        if (service.length > 1) {
          service.unshift(all)
        }
        this.serviceOption = service
      }
    },
    // 点击搜索
    search() {
      this.isLoading = true
      setTimeout(() => {
        this.formData.payMode = this.formDate.payMode
        this.formData.serviceType = this.formDate.serviceType
        this.formData.startDate = this.formDate.startDate
        this.formData.dateType = this.dateType
        // 兼容可选时间组件
        let start = this.formDate.startDate[0] ? dayjs(this.formDate.startDate[0]).format('YYYY-MM-DD') : ''
        let end = this.formDate.startDate[1] ? dayjs(this.formDate.startDate[1]).format('YYYY-MM-DD') : ''
        let data = cloneDeep(this.formDate)
        if (this.dateType === 'shipingTime') {
          data = {
            ...data,
            startDate: start,
            endDate: end,
            agentDeliveryAgingStart: '',
            agentDeliveryAgingEnd: ''
          }
        } else {
          data = {
            ...data,
            startDate: '',
            endDate: '',
            agentDeliveryAgingStart: start,
            agentDeliveryAgingEnd: end
          }
        }
        // 这里的emit只是通知父组件。。。父组件根本没有接收这个值。。。
        this.$emit('search', data)
        this.isLoading = false
      }, 500)
    },
    // 初始化
    reset() {
      this.formData = cloneDeep(initParm)
    },
    // 寄件时间改变
    changeData(value) {
      this.$nextTick(() => {
        //等时间变更重置后再次设置
        this.formData.dtType = dtTypeLookUp[value]
        this.formData.dtTime = this.formData.dtType
      })
      this.formData.payMode = this.formDate.payMode
      this.formData.serviceType = this.formDate.serviceType
      this.formData.startDate = this.formDate.startDate
      this.$emit('search', this.formData)
    },
    // 付款方式
    clearPayMode() {
      this.formDate.payMode = []
    },
    // 付款方式
    changepayMode(values) {
      if (values.length === 0) {
        this.formDate.payMode = []
        return
      }
      let value = values[values.length - 1]
      let ary = []
      let aryAll = []
      let active = []
      this.payOption.forEach((item) => {
        if (item.value !== '1') {
          ary.push(item.value)
        }
        if (!values.includes(item.value)) {
          active.push(item.value)
        }
        aryAll.push(item.value)
      })
      if (value === '1') {
        this.formDate.payMode = aryAll
      } else {
        const isAll = values.some((item) => {
          if (item === '1') {
            return true
          }
        })
        if (isAll) {
          this.formDate.payMode = active
        } else {
          if (values.length === this.payOption.length - 1) {
            this.formDate.payMode = []
          } else {
            this.formDate.payMode = [value]
          }
        }
      }
    },
    /*服务方式全选*/
    changeServiceType(value) {
      this.formDate.serviceType = this.productTypeChange(
        value,
        this.serviceOption
      )
    },
    productTypeChange(codes, looks) {
      const lookValues = looks.map((item) => item.value)
      const codesLength = codes.length
      const isAll = codes.some((item) => {
        if (item === '1') {
          return true
        }
      })
      if (isAll) {
        if (codes[codesLength - 1] === '1') {
          this.oldCode = lookValues
          return lookValues
        } else {
          let co = codes.filter((i) => i > 1)
          this.oldCode = co
          return co
        }
      } else {
        const productTypes = lookValues.filter((i) => i > 1).join(',')
        if (codes.join(',') === productTypes) {
          const is1 = this.oldCode.some((item) => {
            if (item === '1') {
              return true
            }
          })
          
          if (is1) {
            this.oldCode = []
            return []
          } else {
            this.oldCode = lookValues
            return lookValues
          }
        } else {
          if (codes.length === looks.length - 1) {
            this.oldCode = lookValues
            return lookValues
          }
        }
      }
      this.oldCode = codes
      return codes
    }
  }
}
</script>

<style scoped lang='scss'>
.header-form {
  padding-left: 3.2rem;
  background: #ffffff;
  height: 44px;
  display: flex;
  align-items: center;
  
  .form-item {
    margin-right: 1.2rem;
    
    .update-time {
      margin-right: 5px;
      
      i {
        font-size: 1.4rem;
        color: #ccc;
        cursor: pointer;
      }
    }
    
    .label {
      color: #0c092b;
      font-size: 1.4rem;
      margin-right: 1rem;
    }
  }
  
  .el-button {
    padding: 8px 14px;
    background: #5445e4;
  }
  
  ::v-deep .el-tag.el-tag--info {
    background: #f6f8fb;
    border-color: #f6f8fb;
    color: #333333;
  }
  
  /*input 圆角*/
  ::v-deep .el-input__inner {
    border-radius: 4px;
    background: #f6f8fb;
    border: 0 !important;
  }
  
  ::v-deep .ky-date-picker {
    border-radius: 18px;
    background: #f6f8fb;
    border: 0 !important;
  }
  
  ::v-deep .el-range-input {
    background: #f6f8fb;
  }
  
  /deep/ {
    .ky-select-date-picker {
      margin-left: 10px;
      
      .no_border {
        .el-input__inner {
          padding-left: 0;
        }
      }
      
      
      .ky-date-picker {
        height: 32px;
        line-height: 32px;
        
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
  
  
  /*时间箭头*/
  /*   ::v-deep .el-range-separator {
        font-size: 0;
        width: 13px;
        height: 13px;
        background: url("../../../../assets/image/date-arrow.png") no-repeat top left;
        background-size: contain;
    }*/
}
</style>
