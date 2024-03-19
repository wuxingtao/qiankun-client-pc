<template>
  <div class='operation-buttons'>
    <div class='waybill-status-buttons'>
      <el-button
        v-if='waybillCustomerSource === customerSourceEnum.SENDED'
        class='status-button'
        :class="selectValue === statusEnum.CANCEL ? 'active' : ''"
        @click='clickHandler(statusEnum.CANCEL, "已取消")'
      >已取消{{ waybillStatus.cancelCount | formatSummaryCount }}
      </el-button
      >
      <el-button
        v-if='waybillCustomerSource === customerSourceEnum.SENDED'
        class='status-button'
        :class="selectValue === statusEnum.INFORM ? 'active' : ''"
        @click='clickHandler(statusEnum.INFORM, "待通知取货")'
      >待通知取货{{ waybillStatus.stayInformedCount | formatSummaryCount }}
      </el-button
      >
      <el-button
        class='status-button'
        v-if='waybillCustomerSource === customerSourceEnum.SENDED'
        :class="selectValue === statusEnum.PICKUP ? 'active' : ''"
        @click='clickHandler(statusEnum.PICKUP, "待揽件")'
      >待揽件{{ waybillStatus.stayTookCount | formatSummaryCount }}
      </el-button
      >
      <el-button
        class='status-button'
        :class="selectValue === statusEnum.UNSIGNED ? 'active' : ''"
        @click='clickHandler(statusEnum.UNSIGNED, "待签收")'
      >待签收{{ waybillStatus.staySignCount | formatSummaryCount }}
      </el-button
      >
      <el-button
        class='status-button'
        :class="selectValue === statusEnum.SIGNED ? 'active' : ''"
        @click='clickHandler(statusEnum.SIGNED, "已签收")'
      >已签收{{ waybillStatus.signCount | formatSummaryCount }}
      </el-button
      >
      <el-button
        class='status-button'
        :class="selectValue === statusEnum.ALL ? 'active' : ''"
        @click='clickHandler(statusEnum.ALL, "全部")'
      >全部{{ waybillStatus.allCount | formatSummaryCount }}
      </el-button
      >
    </div>
    <waybill-operation-buttons :selectedRows='selectedRows' :waybillStatus='selectValue'
                               :waybillCustomerSource='waybillCustomerSource' v-bind='$attrs'
                               @close-overlay="$emit('close-overlay')"
                               @handleQueryData='handleQueryData' @updateLoading='updateLoading' />
  </div>
</template>

<script>
import { customerSourceEnum, statusEnum } from "../enum/queryEnum"
import WaybillOperationButtons from "./waybill-operation-buttons.vue"
import customerSource from "@/views/waybill/config/customerSource"

export default {
  name: "waybillStatus",
  props: {
    waybillCustomerSource: {
      type: String,
      required: true
    },
    waybillStatus: {
      type: Object,
      default: () => {
        return {
          allCount: 0,
          signCount: 0,
          stayInformedCount: 0,
          staySignCount: 0,
          stayTookCount: 0,
          cancelCount: 0
        }
      }
    },
    selectedRows: {
      type: Array
    }
  },
  components: {
    WaybillOperationButtons
  },
  data() {
    return {
      customerSourceEnum,
      statusEnum,
      cache: {
        send: statusEnum.INFORM, // 我发出的
        received: statusEnum.UNSIGNED, // 我收到的
        paied: statusEnum.UNSIGNED // 我付款的
      },
      customerSource
    }
  },
  computed: {
    selectValue() {
      switch (this.waybillCustomerSource) {
        case customerSourceEnum.SENDED:
          return this.cache.send
        case customerSourceEnum.RECEIVED:
          return this.cache.received
        case customerSourceEnum.PAIED:
          return this.cache.paied
      }
    }
  },
  filters: {
    formatSummaryCount(count) {
      count = Number(count)
      if (!count) {
        return ""
      }
      return `(${count})`
    }
  },
  mounted() {
    this.$watch("waybillCustomerSource", (newVal, oldVal) => {
      if (newVal !== oldVal) {
        this.$nextTick(() => this.$emit("change", this.selectValue))
      }
    })
  },
  methods: {
    clickHandler(value, btnText) {
      const obj = this.customerSource.find(i => i.value === this.waybillCustomerSource)
      this.$reportUtils.clkSearchOrderCardSecond({ first_module: obj.label, button_name: btnText })
      switch (this.waybillCustomerSource) {
        case customerSourceEnum.SENDED:
          this.cache.send = value
          break
        case customerSourceEnum.RECEIVED:
          this.cache.received = value
          break
        case customerSourceEnum.PAIED:
          this.cache.paied = value
          break
      }
      this.$emit("change", value)
    },
    handleQueryData() {
      this.$emit("handleQueryData")
    },
    changeWaybillStatus(tab, status) {
      // 暴露接口以供外部调用修改转态
      this.cache[tab] = status
    },
    updateLoading(val) {
      this.$emit("updateLoading", val)
    }
  }
}
</script>

<style lang='scss' scoped>
.operation-buttons {
  margin-top: 12px;
  white-space: nowrap;
  padding: 0 20px;
}

.waybill-status-buttons {
  .status-button {
    font-size: 12px;
    color: #03050D;
    
    &.active {
      background: white;
      border-color: #9378fa;
      color: #9378fa;
      border-right: 1px solid #9378fa;
    }
    
    &.active span {
      font-weight: 800;
    }
  }
  
  /deep/ {
    .el-button {
      margin: 0;
      min-width: 90px;
      border-radius: 0;
      border-right: unset;
      padding: 8px 12px;
    }
    
    .el-button:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      //border-radius: 19px;
    }
    
    .el-button:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border-right: 1px solid #dcdfe6;
      //border-radius: 19px;
      &.active {
        border-right: 1px solid #9378fa;
      }
    }
  }
}
</style>
