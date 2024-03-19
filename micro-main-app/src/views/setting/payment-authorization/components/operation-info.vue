<template>
  <div class='route-node'>
    <div class='route-node-step' v-for='(item, index) in examineInfoList' :key='index'>
      <div class='route-node-step__left'>
        <div class='title'>{{ showOperationTitle(item.operatorType) }}</div>
      </div>
      <div class='route-node-step__center'>
        <div class="circle"></div>
      </div>
      <div class='route-node-step__right'>
        <div class='time'><span class="label-operation">操作人：</span>{{ item.operatorPerson }}</div>
         <div class='time' v-if="item.authRange"><div class="label-operation">授权范围：</div><div>{{ item.authRange }}</div></div>
        <div class='time'><span class="label-operation">操作时间：</span>{{ item.examineDate }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'operation-info',
  props: {
    examineInfoList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    showOperationTitle (status) {
      let name = ''
      switch (status) {
        case 10:
          name = '审核中'
          break
        case 20:
          name = '已授权'
          break
        case 30:
          name = '已拒绝'
          break
        case 40:
          name = '已解除'
          break
      }
      return name
    },
  }
}
</script>
<style lang="scss" scoped>
  .route-node {
    position: relative;
    margin-top: 4px;
    background-color: #ffffff;

    &-step {
      display: flex;
      padding: 20px 0;
      color: #888ea6;

      &__left {
        flex-shrink: 0;
        width: 40px;
      }

      &__center {
        position: relative;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        width: 72px;

        .circle {
          width: 8px;
          height: 8px;
          background: #d7d7db;
          border: 3px solid #fafafa;
          border-radius: 50%;
        }
        &::after {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          content: '';
          width: 0;
          height: calc(100% + 18px);
          border-left: 2px dashed #e5e5e5;
        }
      }

      &__right {
        flex: 1;
      }

      &:first-child {
        color: #8365f6;

        .time,
        .desc {
          color: #333333;
        }
        .title {
          font-weight: bold;
          color: #333333;
        }
        .circle {
          width: 10px;
          height: 10px;
          background: #8365f6;
          border: 3px solid #fafafa;
          border-radius: 50%;
        }
      }

      &:last-child:not(:first-child) {
        .route-node-step__center::after {
          display: none;
        }
      }
    }

    .title {
      line-height: 12px;
      font-size: 12px;
      font-weight: bold;
      text-align: right;
      color: #888ea6;
    }

    .label-operation {
      width: 80px;
      color: #999999;
      flex-shrink: 0;
    }
    .time {
      line-height: 22px;
      font-size: 12px;
      display: flex;
    }

    .desc {
      // margin-top: 6px;
      line-height: 12px;
      font-size: 12px;
      text-align: justify;
    }

    .iconfont {
      font-size: 12px;
      line-height: 12px;
    }
  }
</style>