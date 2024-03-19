<template>
  <el-select v-model='serviceWayValue' size="small" @change='handleChange($event)' @visible-change="handleVisibleChange" :disabled='col.readOnly  || row.serviceWay.readOnly' popper-class="serviceWay__table-editable-select-popper">
    <template slot='empty'>
       <div class='el-select-dropdown__empty'>
         <div v-if='row.serviceWay.loading'>
            <i class='el-icon-loading' /> 加载中...
          </div>
          <div class="el-select-dropdown__empty-tip" v-else-if="serviceWayTip">
              {{ serviceWayTip}}
          </div>
          <template v-else>
            无数据
          </template>
       </div>
    </template>
     <service-way-template :options="options"/>
  </el-select>
</template>

<script>
import { nextTick, ref, watch, computed } from '@vue/composition-api'
import ServiceWayTemplate from '@views/delivery/components/common/service-way-template'

export default {
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    }
  },
  components:{
    ServiceWayTemplate
  },
  setup (props, { emit }) {
    const serviceWayValue = ref(props.row.serviceWay.value)
    const options = ref(props.row.serviceWay.options)

    watch(() => props.row.serviceWay, val => {
      options.value = val.options
      nextTick(() => {
        serviceWayValue.value = val.value
      })
    }, {
      deep: true
    })

    const serviceWayTip = computed(()=>{
      const data = props.row.serviceWay.data
      if(!data || Object.keys(data).length<1){
        return ''
      }
      return props.row.serviceWay.data
    })
    const handleChange = $event => {
      const params = {
        fieldName: 'serviceWay', val: props.row.serviceWay, row: props.row, value: $event.value || $event
      }
      emit('change', params)
    }
    const handleVisibleChange = e =>{
      emit('visible-change', e)
    }

    return {
      serviceWayValue,
      options,
      handleChange,
      handleVisibleChange,
      serviceWayTip
    }
  }
}
</script>

<style lang="scss">
  .serviceWay__table-editable-select-popper {
    &.el-select-dropdown {
        .el-select-dropdown__empty {
            padding: 10px;
            font-size: 12px;
             &-tip{
              height: 132px;
              box-sizing: border-box;
              padding-top: 92px;
              color: #666666;
              line-height: 18px;
              background-image: url("~@assets/image/waybill/no-form-data.png");
              background-size: 68px 68px;
              background-repeat: no-repeat;
              background-position: center 20px;
            }
        }
    }
  }
</style>