<template>
    <div :class="[mini?'ky-tabs_mini_r':'ky-tabs_r']">
        <el-tabs v-model="activeTabName" @tab-click="handleClick" :type="type" class="shipment-container-tabs">
            <el-tab-pane :label="tab.label" :name="tab.name" v-for="(tab,index) in data" :key="tab.id?tab.id:tab.label+index">
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
export default {
  name: "ky-tabs-r",
  props:{
    data:{
      type:Array,
      default:()=>[]
    },
    value:[Number,String],
    mini:{
      type:Boolean,
      default: false
    },
    type:{
      type:String,
      default:""
    }
  },
  data(){
    return {
      activeTabName: this.value
    }
  },
  watch:{
    value(n){
      this.activeTabName=n
    }
  },
  methods:{
    handleClick(){
      this.$emit('input',this.activeTabName)
      this.$emit('click',this.activeTabName)
    }
  }
}
</script>

<style lang="scss" scoped>
    /*tab*/
    .ky-tabs_r{
        /deep/ {
            .el-tabs {
                .el-tabs__header {
                    background-color: #fff !important;
                    padding: 0;
                    margin: 0;
                    .el-tabs__nav-wrap {
                        &::after {
                            display: none;
                        }
                        .el-tabs__active-bar {
                            height: 4px;
                            border-radius: 4px;
                        }
                        .el-tabs__item {
                            padding-right: 23px;
                            height: 51px !important;
                            line-height: 47px !important;
                            font-size: 16px;
                            font-weight: bold;
                            color: #333333;
                            &.is-active {
                                color: #8365f6 !important;
                            }
                        }
                    }
                }
            }
            .batch.tabs-with-footer .el-tabs__header{
                visibility: hidden;
            }
        }
    }
    .ky-tabs_mini_r{
        /deep/ {
            .el-tabs {
                .el-tabs__header {
                    background-color: #fff !important;
                    padding: 0;
                    margin: 0;
                    .el-tabs__nav-wrap {
                        &::after {
                            display: none;
                        }
                        .el-tabs__active-bar {
                            height: 2px;
                            border-radius: 2px;
                        }
                        .el-tabs__item {
                            padding: 0 20px;
                            height: 40px;
                            box-sizing: border-box;
                            line-height: 40px;
                            display: inline-block;
                            list-style: none;
                            font-size: 14px;
                            font-weight: 500;
                            color: #303133;
                            position: relative;
                            &.is-active {
                                color: #8365f6 !important;
                            }
                        }
                    }
                }
            }
            .batch.tabs-with-footer .el-tabs__header{
                visibility: hidden;
            }
        }
    }
</style>
