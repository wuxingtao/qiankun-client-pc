<template>
  <div class="auth-table">
    <div class="auth-table__header">
      <div class="auth-table__item">
        <div class="auth-table__td">一级权限</div>
        <div class="auth-table__td">二级权限</div>
      </div>
    </div>
    <div :class="['auth-table__content',hideExclusive && 'table-exclusive-hide']">
      <template v-if="data.length > 0">
        <div class="auth-table__item" v-for="(item,index) in data" :key="index"
             :class="[item.hideItem && 'is-exclusive']">
          <div :class="['auth-table__td tree-1',item.exclusive && 'is-exclusive']">{{ item.authName }}</div>
          <ul :class="['auth-table__lists','tree-lists-2']"
              v-if="item.authInfos">
            <!--  是否报表字段    -->
            <div :class="['tree-2',childItem.report ? 'tree-report' : 'tree-normal']"
                 v-for="(childItem,childIndex) in item.authInfos" :key="childIndex">
              <template v-if="!childItem.report">
                <div :class="['td-text',childItem.exclusive && 'is-exclusive']">{{ childItem.authName }}</div>
              </template>
              <template v-else>
                <div
                    :class="['auth-table__title f_w_700 inline-block',(childItem.exclusive || childItem.hideItem) && 'is-exclusive']">
                  {{ childItem.authName }}
                </div>
                <div class="report-lists tree-3 inline-block">
                  <span v-for="(v,k) in childItem.authInfos" :key="k"
                        :class="['report-text td-text',v.exclusive && 'is-exclusive']">{{
                      v.authName
                    }}</span>
                </div>
              </template>
            </div>

          </ul>
        </div>
      </template>
      <template v-else>
        <div class="auth-nodata c_999 fs_14">暂无数据</div>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'auth-view',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    // 是否隐藏专属权限
    hideExclusive: {
      type: Boolean,
      default: () => true
    }
  },
  setup () {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
$borderColor: #e6e6ea;
/* 专属权限隐藏 */
.table-exclusive-hide {
  .is-exclusive {
    display: none !important;
  }
}

.is-exclusive.td-text {
  position: relative;
  padding-right: 54px !important;

  &::after {
    content: '';
    position: absolute;
    height: 60%;
    width: 60px;
    right: 0;
    top: 0;
    background: url('~@assets/image/permission/is-exclusive.png') no-repeat top right;
    background-size: contain;
  }
}

.auth-table {
  border: 1px solid $borderColor;

  .auth-table__header {
    background: rgba(247, 248, 254, 1);
    font-size: 14px;
    color: #03050D;

    .auth-table__td {
      padding: 11px 16px;
      font-weight: bold;
      border-right: 1px solid $borderColor;

      &:last-child {
        border-right: 0;
      }
    }
  }

  .auth-table__content {
    .auth-table__item {
      &:last-child {
        border-bottom: 0;
      }
    }
  }

  .auth-table__td {
    width: 160px;
    padding: 8px 16px;

    &.tree-1 {
      min-width: 160px;
      max-width: 160px;
    }
  }

  .auth-table__item {
    border-bottom: 1px solid $borderColor;
    display: flex;
    align-items: center;
  }

  .auth-table__lists {
    .auth-table__td {
      &:last-child {
        border-bottom: 0;
      }
    }
  }

  .tree-lists-2 {
    padding: 16px 20px;
    border-width: 0 0 0 1px;
    border-color: $borderColor;
    border-style: solid;

    &:last-child {
      padding-bottom: 2px;
    }

    //width: 160px;
  }

  .tree-normal {
    &.tree-2 {
      display: inline-block;
    }
  }

  .tree-report {
    margin: 12px 0;

    &:first-child {
      margin-top: 2px;
    }

    .auth-table__title {
      position: relative;
      margin-right: 6px;
      margin-bottom: 16px;
      padding-left: 12px;
      color: #333333;
      white-space: nowrap;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        width: 3px;
        height: 12px;
        background: linear-gradient(360deg, #b5b5b5, #666666);
        border-radius: 0px 2px 2px 0px;
      }
    }

    .report-lists {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .td-text {
    padding: 6px 10px;
    margin: 0 8px 10px 0;
    background-color: #f5f7fc;
    border-radius: 2px;
  }

  .auth-nodata {
    padding: 20px 20px;
    text-align: center;
  }
}
</style>
