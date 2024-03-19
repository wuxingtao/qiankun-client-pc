<template>
  <div class="freight-description-route__container">
    <div v-if="!isInTable" class="tip">
      <i class="iconfont icon-info4"/>
      如需查询单票预估运费，可点击“列表-预估费用-明细”查看
    </div>
    <div v-else class="content">
      <div class="column">
        <div class="name">{{row.jjContactPerson.value || '--'}}</div>
        <div class="city">{{getCity('qhAddress')}}</div>
      </div>
      <div class="line"></div>
      <div class="column">
        <div class="name">{{row.sjContactPerson.value || '--'}}</div>
        <div class="city">{{getCity('sjAddress')}}</div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  props: {
    routeInfo: {
      type: Object
    },
    isInTable:{
      type: Boolean
    },
    row:{type:Object}, // 批量表格行数据
  },
  setup(props){
    const getCity = field => {
      const { districtList } = props.row[field].data || {}
      return districtList?.length>1? districtList[1] : '--' 
    }
    return{
      getCity
    }
  }
}
</script>

<style lang="scss">
  .freight-description-route__container {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
      font-size: 12px;
    .tip{
      height: 30px;
      background: #faf9ff;
      border-radius: 1px;
      color: #333333;
      display: flex;
      flex: 1;
      align-items: center;
      .iconfont{
        margin: 0 8px 0 12px;
        color: #8365f6;
      }
    }
    .content {
      display: flex;
      align-items: center;
      justify-content: center;
      background: url('~@assets/image/delivery/description-route-bg.png');
      width: 500px;
      height: 72px;

      .column {
        text-align: center;
        .name {
          color: $--color-text-primary;
          font-size: 16px;
          padding-bottom: 10px;
        }
        .city {
          color: #8f8fa8;
        }
      }
      .line {
        width: 138px;
        height: 10px;
        margin: 0 32px;
        background: url('~@assets/image/delivery/description-route-line.png');
      }
    }
  }
</style>