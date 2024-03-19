<template>
    <div class="main-service-table-wrap">
        <ky-table ref="kyTable" :data="info" v-bind="$attrs" @sort-change="changeSort" class="main-service-table">
                <el-table-column
                        prop="sort"
                        label="排名"
                        align="center"
                        headerAlign="center"
                        :width="isAuth===true?120:120">
                    <template slot-scope="{$index}">
                        <i :class="['sort-icon','sort-icon'+$index]"></i>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="shipingCity"
                        align="center"
                        label="寄件城市"
                        :width="isAuth===true?150:150">
                </el-table-column>
                <el-table-column
                        prop="receiveCity"
                        label="收件城市"
                        align="center"
                        :width="isAuth===true?150:150">
                </el-table-column>
                <el-table-column
                        prop="sumVotes"
                        align="center"
                        sortable
                        label="票数"
                        :sort-orders="['ascending', 'descending']"
                        :width="isAuth===true?150:150">
                </el-table-column>
                <el-table-column
                        v-if="isAuth"
                        prop="agingAchievedRate"
                        align="center"
                        sortable
                        :sort-orders="['ascending', 'descending']"
                        min-width="100px"
                        label="时效达成率">
                    <template slot-scope="scope">
                        <!-- <div style="text-align: left">
                            <el-progress :stroke-width="10" :percentage="scope.row.agingAchievedRate"></el-progress>
                        </div> -->
                        <div class="percentage">
                            <div class="percentage-gradual">
                                <div class="percentage-first" :style="{'width': `${scope.row.agingAchievedRate}%`}"></div>
                            </div>
                            <div class="percentage-ratio">{{ scope.row.agingAchievedRate }}%</div>
                        </div>
                    </template>
                </el-table-column>
            </ky-table>
        <div class="no-aging-achieved-rate"  v-if="!isAuth"></div>
    </div>
</template>

<script>
import {cloneDeep} from "lodash"
import {getAuth} from '@/utils/total'
export default {
  name: "main-service-table",
  props:{
      isSortAgingTop5:{
          type:Boolean,
          default:false
      },
    data:{
      type:Array,
      default:()=>[]
    },
   /* changeSort: { type: Function }*/
  },
  /* shipingAreaCode	寄件区号	string
        shipingCity	寄件地址	string
        receiveCity	收件城市	string
        receiveAreaCode	收件区号	string
        agingAchievedRate	时效达成率	number
        agingAchievedVotes	时效达成票数	number*/
  data(){
    return {
        prevProp: '',
        prevSort: 'descending'
    }
  },
    watch:{
        isSortAgingTop5(n){
            if(n===false&&this.$refs.kyTable){
                this.$refs.kyTable.$refs.table.columns.forEach((item)=>{
                    item.order = null;
                })
                this.$refs.kyTable.$refs.table.clearSort()
            }
        }
    },
  computed:{
    isAuth(){
      if(getAuth(this,'reachRate')){
        return true
      }
    },
    info(){
      if(this.data&&this.data.length>0){
        let data=cloneDeep(this.data)
        data.forEach((item)=>{
          if(!isNaN(item.agingAchievedRate)){
            if(item.agingAchievedRate<=0){
              item.agingAchievedRate=0
            }
          }
        })
        return data
      }
      return []
    }
  },
    methods:{
        changeSort({column, prop, order}){
            if (order !== null && this.prevProp !== prop && this.$refs.tableRef) {
                let columns = this.$refs.kyTable.$refs.table.columns.find(item => item.property === this.prevProp);
                if(columns){
                    columns.order = null;
                }
            }
            if (order === null) {
                if(this.prevProp===prop){
                    column.order =this.prevSort
                    return
                }else{
                    column.order = this.prevSort === 'descending' ? 'ascending' : 'descending';
                }
            }
            this.prevProp = prop;
            this.prevSort=order||  column.order
            order=order||  column.order
            this.$emit('change-sort-table',{column, prop, order})
        }
    }
}
</script>

<style scoped lang="scss">
    .main-service-table-wrap{
        width: 100%;
        display: flex;
        .no-aging-achieved-rate{
            flex: 1;
            height: 100%;
            background: url('../../../../assets/image/total/header_list_bg.png') no-repeat 100%;
            background-size: 100% 100%;
        }
    }
    .main-service-table{
        flex: 1;
        .percentage {
          padding-right: 8px;
          display: flex;
          align-items: center;

          .percentage-gradual {
            flex: 1;
            display: flex;
            height: 10px;
            background: #f7f8f9;
            border-radius: 1px;

            .percentage-first {
              height: 10px;
              background: linear-gradient(90deg,#8cbbff 41%, #cee2ff 94%);
              border-radius: 1px;
            }

          }

          .percentage-ratio {
            margin-left: 31px;
            color: #0c092b;
          }
        }

        /deep/  .empty-wrapper .svg-icon{
            height: 65px !important;
        }
        .sort-icon{
            display: inline-block;
            width: 14px;
            height: 19px;
            margin-left: 6px;
            margin-top: 5px;
        }
        .sort-icon0{
            background: url("../../../../assets/image/total/top1.png") no-repeat;
            background-size: 100% 100%;
        }
        .sort-icon1{
            background: url("../../../../assets/image/total/top2.png") no-repeat;
            background-size: 100% 100%;
        }
        .sort-icon2{
            background: url("../../../../assets/image/total/top3.png") no-repeat;
            background-size: 100% 100%;
        }
        .sort-icon3{
            background: url("../../../../assets/image/total/top4.png") no-repeat;
            background-size: 100% 100%;
        }
        .sort-icon4{
            background: url("../../../../assets/image/total/top5.png") no-repeat;
            background-size: 100% 100%;
        }
    }

    /deep/ .ky-table-container .element-table {
      min-height: 0px !important;
    }

    /deep/ .el-progress-bar{
            padding-right: 70px;
            margin-right: -70px;
    }

    /deep/ .el-table .cell {
      text-align: left;
      line-height: 14px;
    }

    /deep/ .el-table tr th:last-child .cell {
        justify-content: flex-end;
    }

    /deep/ .el-table__footer-wrapper  {
      height: 32px;
    }

    /deep/ .ky-table-container .element-table .el-table__fixed thead tr > th {
      padding: 0;
    }

    /deep/ .ky-table-container .element-table .el-table__header-wrapper thead tr > th {
       padding: 0;
    }

    /deep/ .ky-table-container .element-table .el-table__header-wrapper thead tr > th .cell .caret-wrapper {
      height: 28px;
      margin-top: 0;
    }

    /deep/ .ky-table-container .element-table .el-table__header-wrapper thead tr > th .cell .caret-wrapper .ascending {
      top: 3px;
    }

    /deep/ .ky-table-container .element-table .el-table__header-wrapper thead tr > th .cell .caret-wrapper .descending {
      bottom: 2px;
    }

   /deep/ .ky-table-container .element-table .el-table__body-wrapper tr td, /deep/ .ky-table-container .element-table .el-table__fixed tr td {
     height: 32px;
   }

   /deep/ .ky-table-container .element-table .el-table__header-wrapper thead tr > th > .cell {
     color: #7f7e8d !important;
   }

   /deep/ .ky-table-container .element-table .el-table__body-wrapper tr td > .cell {
     flex: 1;
     color: #0c092b !important;
   }

</style>
