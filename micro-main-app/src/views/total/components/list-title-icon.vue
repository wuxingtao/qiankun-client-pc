<template>
  <div class="list-title-icon">
    <i v-if="url" class="icon-left" :style="{'background-image': 'url(' + url + ')'}"></i>
    <div v-if="title" class="title" :style="{'font-size': fontSize }">{{title}}</div>
    <ky-popover v-bind="$attrs">
      <div v-if="upTime" style="paddingLeft: 10px;">
        数据更新时间至：{{ upTime }}
      </div>
      <el-table :data="popover" style="width: 100%">
        <el-table-column prop="title" label="指标" width="110px">
        </el-table-column>
        <el-table-column prop="content" label="说明" width="355px">
          <template slot-scope="scope">
            <div>{{ scope.row.content }}</div>
          </template>
        </el-table-column>
      </el-table>
      <i class="iconfont icon-help icon-right" slot="reference"></i>
    </ky-popover>
  </div>
</template>

<script>
import KyPopover from '@/components/ky-popover/src/main.vue'
export default {
  name: 'list-title-icon',
  props: {
    upTime: {
      type: String,
      default: '',
    },
    popoverData: {
      type: Array,
      default: () => [],
    },
    url: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '#',
    },
    fontSize: {
      type: String,
      default: '1.8rem',
    }
  },
  components:{
    KyPopover
  },
  computed:{
    popover(){
      return  this.popoverData.filter((item)=>{
        return item.auth
      })
    }
  },
  data() {
    return {
      /* popoverData:[
        { title: '应付费用', content: '在您的查询时间范围内，您产生的所有支出费用；' },
        { title: '运单运费', content: '在您的查询时间范围内，您所下单的所有运单产生的运单费用；' },
        { title: '总增值费', content: '在您的查询时间范围内，您所下单的所有运单所附带的增值费用，如打木架服务费等；' },
        { title: '优惠金额', content: '在您的查询时间范围内，您所使用的所有有效优惠券总金额；' },
        { title: '另补税金', content: '在您的查询时间范围内，您所下单的所有运单产生的补税金总额；' },
        { title: '单票均价', content: '单票均价=应付费用 / 发货总票数，其中已剔除服务方式为整车的运单；' }
      ],*/
    }
  }
}
</script>

<style lang="scss" scoped>
  .list-title-icon {
    display: flex;
    align-items: center;

    .icon-left {
      width: 2rem;
      height: 2rem;
      text-align: center;
      margin-right: 0.5rem;
      display: inline-block;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }

    .title {
      padding-right: 0.5rem;
      font-weight: 600;
    }

    .icon-right {
      font-size: 1.4rem;
      color: #ccc;
      cursor: pointer;
    }
    .drag-icon{
      position: relative;
      .popover-content{
        position: absolute;
        z-index: 99999;
        left: 15px;
        top: 6px;
      }
    }
  }
</style>
