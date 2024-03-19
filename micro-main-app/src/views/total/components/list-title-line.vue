<template>
    <h2 class="list-title-line" :style="{'fontSize':fontSize,'color':color}">
        <span class="line" :style="{ background }"></span>
        <slot></slot>
        <el-select v-if="visibleSelect" @change="change" :style="{'width': width,'margin-left': '10px'}" size="mini" :value="timeType" @input="input" placeholder="请选择">
            <el-option
                    style="height: 28px;"
                    v-for="item in timeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
            </el-option>
        </el-select>
    </h2>
</template>

<script>
export default {
  name: 'list-title-line',
  props: {
    fontSize: {
      type: String,
      default: '1.4rem'
    },
      color: {
          type: String,
          default: '#333333'
      },
      background: {
          type: String,
          default: '#7653d6'
      },
      visibleSelect: {
          type: Boolean,
          default: false
      },
      width:{
          type: String,
          default: '60px'
      },
      value: {
          type: Number,
          default: 1
      }
  },
    methods: {
        change(value){
           this.$emit('change',value)
        },
        input(value) {
            this.$emit('input', value)
        }
    },
    watch: {
        value(n) {
            this.timeType = n
        }
    },
    data(){
      return {
          timeType: this.value || 1,
          timeOptions:[
              {
                  value: 1,
                  label: '天'
              },
              {
                  value: 2,
                  label: '月'
              }
          ],
      }
    }
}
</script>

<style scoped lang="scss">
    .list-title-line {
        position: relative;
        width: 100%;
        height: 28px;
        line-height: 28px;
        padding-left: 10px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        color: #333333;
        .line {
          position: absolute;
          left: 0;
          width: 3px;
          top: 50%;
          height: 16px;
          margin-top: -8px;
        }

    }
    /deep/ .el-input--mini .el-input__inner {
        height: 20px;
        line-height: 20px;
    }
</style>
