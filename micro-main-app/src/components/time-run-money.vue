<template>
    <el-dialog
            width="500px"
            :visible="visible"
            center
            :close-on-click-modal="false"
            @close="close">
        <div class="time-run-money">
            <div class="header-bg">
             <div class="header-wrap">
                 <i class="close-icon el-icon-close" @click="close"></i>
             </div>
            </div>
            <div class="header-text">
                {{text}}
            </div>
            <div style="padding: 5px 20px;">
                <ky-table :data="tableData" :maxHeight="maxHeight" class="rum-money-table">
                    <el-table-column  prop="optimizeStartTime" label="生效时间" width="160px">
                        <template slot-scope="{row}">
                            <div v-if="row.optimizeStartTime">自{{row.optimizeStartTime}}起</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="disFullName" class="dis-full-name-cell" label="生效区域">
                        <template slot-scope="{row}">
                            <div style="line-height: initial" v-if="row&&row.disFullName.length>0">
                                <div v-for="(text,index) in row.disFullName" :key="index" style="padding: 12px 0;">{{text}}</div>
                            </div>
                        </template>
                    </el-table-column>
                </ky-table>
            </div>
            <el-row :gutter="20" style="text-align: center;padding: 20px 0 5px 0;margin: 0;border-top: 1px solid #fef9ff">
                    <el-button style="width: 105px;padding: 8px 23px;" type="primary" round @click="close">我已了解</el-button>
            </el-row>
        </div>
    </el-dialog>
</template>
<script>
export default {
  name: 'time-run-money',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tableData:{
      type: Array,
      default: ()=>[]
    },
    maxHeight:{
      type: Number,
      default: 342
    },
    url:{
      type: String,
      default: '/admin/order'
    }
  },
  data(){
    return {
      text:'尊敬的客户您好，以下区域已完成时效优化，原先增加的工作日已取消，您的货物可以以更快的速度到达收件地址啦',
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
   /deep/ .el-dialog__header{
       display: none;
    }
   /deep/ .el-dialog__body{
       padding: 0;
   }
   /deep/ .el-dialog--center .el-dialog__body{
       padding: 0;
   }
    .time-run-money{
        border-radius: 10px;
        width: 100%;
        padding-bottom: 20px;
        .header-wrap{
            height: 30px;
            width: 100%;
            text-align: right;
            .close-icon{
                display: inline-block;
                height: 20px;
                width: 20px;
                font-size: 20px;
                margin: 5px;
                font-style: normal;
              /*  background: url("../assets/image/time-run-money-close.png") no-repeat;
                background-size: 100% 100%;*/
                cursor: pointer;
                color: #fff;
                border-radius: 50%;
                border: 1px solid #fff;
                &:hover{
                    color: #a07cfe;
                    border: 1px solid #a07cfe;
                }
            }
        }
        .header-bg{
            position: relative;
            height: 145px;
            width: 100%;
            background: url("../assets/image/time-run-moey@2x.png") no-repeat;
            background-size: 100% 100%;
            border-radius: 10px;

        }
        .header-text{
            padding: 5px 20px;
            font-size: 14px;
            line-height: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .dis-full-name{
            overflow-y: scroll;
            margin: 10px 0;
            max-height: 200px;
            // 滚动条
            &::-webkit-scrollbar { /*滚动条整体样式*/
                width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
                height: 5px;
            }

            &::-webkit-scrollbar-thumb { /*滚动条里面小方块*/
                border-radius: 5px;
                background-color: #ab90e8;;
            }

            &::-webkit-scrollbar-track { /*滚动条里面轨道*/
                -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                background: #EDEDED;
            }
        }
    }
</style>
