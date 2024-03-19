<template>
    <div class="main-server-flow" :style="{'width':isAuth===true?'300px':'200px'}" v-loading="data.qualityAreaListLoading">
        <div class="main-server">
          <div>
              <div class="main-server-flow-title">始发城市总票数</div>
              <div class="main-server-flow-number">{{thousand(mapTitleData.totalCountryVotes)}}</div>
          </div>
          <div v-if="isAuth">
            <div class="main-server-flow-title">始发城市时效达成率</div>
            <div class="main-server-flow-number">
              {{ mapTitleData.agingAchievedRate ? mapTitleData.agingAchievedRate : 0}}
              <span class="main-flow">{{ mapTitleData.agingAchievedRate ? '%' : '' }}</span>
            </div>
          </div>
        </div>
        <div class="main-server-flow-city">
          <div class="starting-city">始发城市:</div>
          <div class="start-city-status">
            <el-select v-model="formData.shipingCity" size="mini" @change="changeTop20" :popper-append-to-body="false">
                  <el-option v-for="(item, index) in top20Optiond" :key="`0-${index}`" :label="item.label" :value="item.value">
                  </el-option>
              </el-select>
          </div>
          <i class="iconfont iconjiantou" style="color: #ccc" v-if="isAuth"></i>
          <div class="end-city-status" v-if="isAuth">
            <el-select v-model="topSize" size="mini" style="width: 100%;" @change="changeTop20" :popper-append-to-body="false">
              <el-option v-for="(item, index) in topOptiond" :key="`0-${index}`" :label="item.label" :value="item.value">
              </el-option>
          </el-select>
          </div>
        </div>
    </div>
</template>

<script>
import {getAuth} from '@/utils/total'
import {cloneDeep} from "lodash"
import * as API from '@/services/api/total.js'
import { thousands } from '@/utils/total'
export default {
  name: "main-server-flow",
  props:{
    formData:{
      type: Object,
      default:()=>({})
    },
    data:{
      type: Object,
      default:()=>({})
    }
  },
  computed:{
    isAuth(){
      if(getAuth(this,'reachRate')){
        return true
      }
    },
    mapTitleData(){
      if(this.data&&this.data.agingFlow&&Object.keys(this.data.agingFlow).length>0){
        return this.data.agingFlow
      }else{
        return {}
      }
    },
    top20Optiond(){
      if(this.data&&this.data.qualityAreaList && this.data.qualityAreaList.length>0){
        let data=cloneDeep(this.data.qualityAreaList) || []
        data.forEach((item)=>{
          item.label=item.areaCityName || ''
          item.value=item.areaCityName || ''
        })
        return data || []
      }
      return []
    },
    topOptiond() {
      return [
        {
          label: 'TOP20目的城市',
          value: 20
        },
        {
          label: 'TOP30目的城市',
          value: 30
        },
        {
          label: 'TOP50目的城市',
          value: 50
        },
        {
          label: '全部目的城市',
          value: 0
        }
      ]
    }
  },
  data(){
    return {
      value:'',
      topSize: 20
    }
  },
  methods:{
    async changeTop20(){
      this.data.agingFlow={}
      let reg= await API.qualityAgingFlow({...this.formData,topSize: this.topSize})
      if(reg.code=== 0){
        return this.data.agingFlow=reg.data || {}
      }
    },
    thousand(num) {
      return thousands(num, 0)
    }
  }
}
</script>

<style scoped lang="scss">
    .main-server-flow{
        position: absolute;
        top: 10px;
        left: 10px;
        width: 300px;
        opacity: 1;
        background: #ffffff;
        border-radius: 2px;
        padding: 16px;
        box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.09);
        box-sizing: border-box;

        .main-server {
          display: flex;
          justify-content: space-between;
        }

        .main-server-flow-title{
            font-size: 12px;
            color: #7f7e8d;
            // padding-left: 15px;
        }
       .main-server-flow-number{
           font-size: 24px;
           color:  #0C092B;
           padding: 5px 0;
           overflow: hidden;
           text-overflow:ellipsis;
           white-space: nowrap;

           .main-flow {
             font-size: 16px;
           }

       }

       .main-border {
         width: 1px;
         height: 40px;
         background: #e6e6e6;
       }

        .main-server-flow-city{
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 25px;
            background: #eef3fc;
            font-size: 12px;
            color: #0c092b;
            padding: 0 12px;

            .start-city-status {
              width: 50px;
            }

            .end-city-status {
              width: 97px;
            }
        }
        /*input 圆角*/
        /deep/ .el-input__inner {
            padding-left: 0;
            border-radius: 18px;
            background: #eef3fc;
            border: 0 !important;
            padding-right: 0px;
        }

        /deep/ .el-input__suffix {
          width: 14px;
          right: 1px;
        }

        /deep/ .el-col {
          color: #0c092b;
          font-size: 12px;
        }

        /deep/ i.el-select__caret {
          appearance: none;
          -moz-appearance: none;
          -webkit-appearance: none;
          background: url("~@/assets/image/total/arrows-caret-down.png") no-repeat center center transparent;
          background-size: 13px 9px;
          transition: transform .3s;
          transform: rotate(0deg);
        }

        /deep/ i.el-select__caret.is-reverse {
          transform: rotate(180deg);
        }

        /deep/ .el-icon-arrow-up:before {
          content: '';
        }

    }

</style>
