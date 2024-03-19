<template>
    <div class="tool-totals">
        <div class="tool">
            <div class="total-list">
                <template v-for="(item,index) in data">
                      <div v-if="item.visible" :key="item.id?item.id:index" class="total-list-margin">
                       <span class="total-list-label">{{item.label}}</span>
                       <span  class="total-list-number">{{item.total}}</span>
                        <span v-if="item.unit&&item.total" style="color: #909399">{{item.unit}}</span>
                     </div>
                </template>
            </div>
            <div style="width: 200px;text-align: right">
                <el-button v-if="isExport" :disabled="isExportDisabled"  type="text" @click="$emit('exportData')">
                    <svg-icon icon-class="waybill-batch-export-button" class="icon-tabs" />导出
                </el-button>
                <el-button type="text" :disabled="isSortDisabled" @click="$emit('sortData')">
                    <svg-icon icon-class="waybill-setting" class="icon-tabs-right" /> 自定义排序
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "tool-totals",
  props:{
    data:{
      type:Array,
      default:()=>[]
    },
    isExport: {
      type:Boolean,
      default:false
    },
    isExportDisabled: {
      type:Boolean,
      default:false
    },
    isSortDisabled: {
      type:Boolean,
      default:false
    },
  },
}
</script>

<style scoped lang="scss">
    .tool-totals{
        background: linear-gradient(270deg,#ffffff 10%, #f1f3ff 14%);

        .tool {
            display: flex;
            align-items: center;
            padding-left: 10px;
        }

        .total-list{
            flex: 1;
           /* padding-top: 6px;
            padding-bottom: 6px;*/
            font-size: 14px;
            font-weight: bold;
            color: #333333;
            .total-list-margin {
                display: inline-block;
                margin-right: 24px;
                height: 30px;
                line-height: 30px;
            }
            .total-list-label{
                font-size: 14px;
                font-weight: bold;
                color: #333333;
            }
            .total-list-number{
                padding:0 5px;
                font-size: 14px;
                font-weight: bold;
                color: #333333;
            }
        }
    }

    .icon-tabs {
        padding-right: 8px;
    }

    .icon-tabs-right {
        padding-right: 1px;
    }

    /deep/ .el-button--text {
        padding-top: 0;
        padding-bottom: 0;
    }

</style>
