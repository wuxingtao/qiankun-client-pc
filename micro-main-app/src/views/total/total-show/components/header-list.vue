<template>
  <div class="header-list">
    <div class="title-wrap">
      <list-title-icon class="title" title="近7天物流实时状态" trigger="hover" :popoverData="popoverData" :fontSize="'2rem'"></list-title-icon>
      <div class="time">
        <div class="time-content">*更新时间</div>
        <!--  <div class="time-content">{{startTime}}</div>
          <div class="time-content">〜</div>-->
        <div class="time-content">{{endTime}}</div>
        <!--  <div class="time-content">|</div>-->
        <!--   <div class="time-content">近7天</div>-->
      </div>
    </div>
    <div class="bg"></div>
    <div class="data" style="z-index: 100" v-for="(item,index) in list" :key="item.id?item.id:index">
      <list-item class="data-item" v-if="item.auth" :style="{cursor: item.totalColor?'pointer':'default'}" @totalFn="totalFn(item)" :totalColor="item.totalColor" :total="item.total" :title="item.title" :url="item.url"></list-item>
    </div>
    <ky-export-progress :text-inside="true" :visible.sync="visibleProgress" :exportUrl="exportUrl" :params="initParams"></ky-export-progress>
  </div>
</template>

<script>
import {getAuth} from '@/utils/total'
import ListTitleIcon from '../../components/list-title-icon'
import ListItem from '../../components/list-item'
import {getCustomerId } from "@/utils/storage"
import {numberInt,toZero} from '@/utils/total.js'
import KyExportProgress from '@/components/ky-export-progress/index.vue'
import dayjs from "dayjs"

export default {
  name: "header-list",
  components:{
    ListItem,
    ListTitleIcon,
    KyExportProgress
  },
  props:{
    data:{
      type:Object,
      default:()=>({})
    },
    formData:{
      type:Object,
      default:()=>({})
    }
  },
  data() {
    return {
      initParams: {},
      exportUrl: 'web.report.navigate.export',
      visibleProgress: false,
      popoverData:[
        { title: '已揽收', content: '截止当前时间近七天货物已揽收的运单票数', auth:getAuth(this,'collected')},
        { title: '运输中', content: '截止当前时间近七天运输中未派件的运单票数', auth:getAuth(this,'transiting')},
        { title: '派送中', content: '截止当前时间近七天派送中的运单票数', auth:getAuth(this,'delivey')},
        { title: '未签收', content: '截止当前时间近七天未签收的运单票数', auth:getAuth(this,'notsigned')}
      ]
    }
  },
  computed:{
    startTime(){
      if(this.data.startTime){
        let month= dayjs(this.data.startTime).month()+1
        let date = dayjs(this.data.startTime).date()
        let h = dayjs(this.data.startTime).hour()
        let m =dayjs(this.data.startTime).minute()
        let s = dayjs(this.data.startTime).second()
        return toZero(month) +'-' + toZero(date)+ " "+toZero(h)+":"+toZero(m)+':'+toZero(s)
      }
    },
    endTime(){
      if(this.data.endTime){
        let month= dayjs(this.data.endTime).month()+1
        let date = dayjs(this.data.endTime).date()
        let h = dayjs(this.data.endTime).hour()
        let m =dayjs(this.data.endTime).minute()
        let s = dayjs(this.data.endTime).second()
        return toZero(month) +'-' + toZero(date)+ " "+toZero(h)+":"+toZero(m)+':'+toZero(s)
      }
    },
    list(){
      let list=[
        {
          id: 1,
          auth:getAuth(this,'collected'),
          title: '已揽收(票)',
          total: numberInt(this.data.collectedNum),
          url: require("../../../../assets/image/total/yilanshou.png")
        },
        {
          id: 2,
          auth:getAuth(this,'transiting'),
          title: '运输中(票)',
          total: numberInt(this.data.transportNum),
          url: require("../../../../assets/image/total/yunshuzhong.png")
        },
        {
          id: 3,
          auth:getAuth(this,'delivey'),
          title: '派件中(票)',
          total: numberInt(this.data.deliveryNum),
          url: require("../../../../assets/image/total/paijianzhong.png")
        },
        {
          id: 4,
          auth:getAuth(this,'notsigned'),
          title: '未签收(票)',
          total: numberInt(this.data.unSignNum),
          /* totalColor:'#5445E4',*/
          url: require("../../../../assets/image/total/weiqianshou.png")
        }
      ]
      return list
    }
  },
  methods:{
    totalFn(item){
    /*  if(item.id===4 && getAuth(this,'export')){
        if(item.total<=0){
          this.$message.error('没有导出的数据')
          return
        }
        this.getNavigateQueryRealTime()
      }*/
    },
    async getNavigateQueryRealTime() {
      this.$confirm('是否要导出数据？', '导出', {}).then(() => {
        let params = {
          customerId: getCustomerId(),
          dataType: this.formData.customerFlag
        }
        this.initParams={
          params
        }
        this.visibleProgress=true
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  .header-list {
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    height: 7.6rem;
    border-bottom: 1px solid #EBEBEB;
    .title-wrap{
      display: flex;
      min-width: 400px;
      width: 27.6vw
    }
    .title {
      height: 7.6rem;
      line-height: 7.6rem;
      font-size: 2rem;
      font-weight: 600;
      color: #0C092B;
      margin: 0 2rem 0 3.2rem;
    }

    .time {
      flex: 1;
      font-size: 1.2rem;
      color: #7F7E8D;
      margin-right: 4.2rem;
      height: 7.6rem;
      line-height: 8rem;
     /* width: 32rem;*/
      .time-content {
        display: inline;
        margin: 0 0.5rem;
      }
    }

    .data-item {
        margin-right: 14rem;
        z-index: 100;
    }

    .bg {
      position: absolute;
      z-index: 90;
      right: 0;
      width: 58rem;
      height: 5rem;
      background: url('../../../../assets/image/total/header_list_bg.png') no-repeat 100%;
    }
  }
</style>
