<template>
  <div class="auth-table">
    <div class="auth-table__header">
      <div class="auth-table__item">
        <div class="auth-table__td">一级权限</div>
        <div class="auth-table__td">二级权限</div>
      </div>
    </div>
    <div class="auth-table__content">
      <template v-if="data.length > 0">
        <el-tabs tab-position="left" v-model="activeTabIndex">
          <el-tab-pane
            v-for="(item, index) in data"
            :key="index"
            class="auth-table__item"
            :name="String(index)"
          >
            <div class="auth-table__td tree-1" slot="label">
              <el-checkbox
                v-model="item.checkAll"
                :indeterminate="item.isIndeterminate"
                @change="val => handleTopCheckAll(val, item)"
              ></el-checkbox>
              <span class="pl_10">{{ item.authName }}</span>
              <i class="el-icon-arrow-right fs_12--strict"></i>
            </div>
            <ul
              :class="[
                'auth-table__lists',
                'tree-lists-2',
                item.code === 'frontPage' && 'is-front'
              ]"
              v-if="item.authInfos"
            >
              <div
                :class="['tree-2 tree-checkbox', childItem.report ? 'tree-report' : 'tree-normal']"
                v-for="(childItem, childIndex) in item.authInfos"
                :key="childIndex"
              >
                <template v-if="!childItem.report">
                  <el-tooltip
                    effect="light"
                    :content="
                      (!!childItem.disabledDynamic && childItem.disableNotice) ||
                      childItem.descriptionWeb
                    "
                    :open-delay="500"
                    :disabled="
                      !(
                        (!!childItem.disabledDynamic && childItem.disableNotice) ||
                        childItem.descriptionWeb
                      )
                    "
                  >
                    <el-checkbox
                      v-model="childItem.check"
                      class="td-checkbox"
                      :label="childItem.authName"
                      :key="childItem.code"
                      @change="val => handleCheckCommonChange(val, item)"
                      :disabled="!!childItem.disabledDynamic || !!childItem.disabledFront"
                    >
                      {{ childItem.authName }}
                    </el-checkbox>
                  </el-tooltip>
                </template>
                <template v-else>
                  <div class="auth-table__title f_w_700 inline-block">
                    <!--    字段权限全选      -->
                    <el-checkbox
                      v-model="childItem.checkAll"
                      :indeterminate="childItem.isIndeterminate"
                      @change="val => handleCheckAllChange(val, childItem)"
                    ></el-checkbox>
                    <span class="pl_8 fs_14 f_w_b">{{ childItem.authName }}</span>
                  </div>
                  <div class="report-lists tree-3 tree-checkbox">
                    <el-checkbox-group
                      v-model="childItem.checkedLists"
                      @change="val => handleCheckedLastChange(val, childItem)"
                    >
                      <template v-for="(v, k) in childItem.authInfos">
                        <el-tooltip
                          effect="light"
                          :content="(!!v.disabledDynamic && v.disableNotice) || v.descriptionWeb"
                          :open-delay="500"
                          :disabled="
                            !((!!v.disabledDynamic && v.disableNotice) || v.descriptionWeb)
                          "
                        >
                          <el-checkbox
                            class="td-checkbox"
                            :label="v"
                            :key="v.code"
                            :disabled="!!v.disabledDynamic || !!v.disabledFront"
                          >
                            {{ v.authName }}
                          </el-checkbox>
                        </el-tooltip>
                      </template>
                    </el-checkbox-group>
                  </div>
                </template>
              </div>
            </ul>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else>
        <div class="auth-nodata c_999 fs_14">暂无数据</div>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'auth-edit',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    // 是否勾选副授权号
    checkPayment: {
      type: Boolean,
      default: () => false
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      activeTabIndex: 0
    })

    function handleCheckedLastChange(val, target) {
      const checkedCount = val.length
      target.checkAll = checkedCount === target.authInfos?.length
      target.isIndeterminate = checkedCount > 0 && checkedCount < target.authInfos?.length
      TopCheckChange()
    }

    function handleCheckAllChange(val, target) {
      target.checkedLists = val
        ? target.authInfos?.filter(v => v.permissionId && !v.disabledDynamic && !v.disabledFront)
        : []
      target.isIndeterminate =
        target.checkedLists?.length > 0 && target.checkedLists?.length < target.authInfos?.length
      // 功能权限特殊处理,存在禁用标识不选中
      if (target.type === '10' && !target.disabledDynamic && !target.disabledFront) {
        target.check = val
      }
      TopCheckChange()
    }

    // 1级权限监听
    function TopCheckChange() {
      const currentObject = props.data[state.activeTabIndex]
      currentObject.checkAll = currentObject.authInfos.every(item => item.checkAll)
      currentObject.isIndeterminate =
        !currentObject.checkAll &&
        currentObject.authInfos.filter(item => item.checkedLists?.length > 0).length > 0
    }

    /**
     * 全选1级
     * @param val
     * @param item
     */
    function handleTopCheckAll(val, item) {
      item.isIndeterminate = false

      item.authInfos.forEach((childItem, childIndex) => {
        // 全选第二级增加禁用字段识别
        if (childItem.authInfos?.find(item => item.disabledDynamic || item.disabledFront)) {
          childItem.checkAll = false
        } else {
          childItem.checkAll = val
        }
        handleCheckAllChange(val, childItem)
      })
      // TODO: 二级权限特殊处理，避免遍历过多，待后续后台增加二级标识
      if (
        item.code === 'frontPage' ||
        item.authName === '通用权限' ||
        item.code === 'payAuth' ||
        item.authName === '付款授权'
      ) {
        item.checkedLists = val ? item.authInfos.filter(v => v.check) : []
      }

      // 检测存在禁用选项更新全选选中标识
      const checkedChildList = item.authInfos.filter(item => {
        return (!item.authInfos && item.check) || (item.authInfos && item.checkAll)
      })
      if (checkedChildList.length === item.authInfos.length) {
        item.checkAll = true
      } else {
        item.checkAll = false
        item.isIndeterminate = checkedChildList.length > 0
      }
    }

    // 通用权限选中
    function handleCheckCommonChange(val, item) {
      item.checkedLists = item.authInfos?.filter(
        childItem => childItem.check && childItem.permissionId
      )
      item.checkAll = item.authInfos?.length === item.checkedLists.length
      item.isIndeterminate =
        item.checkedLists.length > 0 && item.checkedLists.length < item.authInfos.length
    }

    return {
      ...toRefs(state),
      handleCheckedLastChange,
      handleCheckAllChange,
      handleTopCheckAll,
      handleCheckCommonChange
    }
  }
})
</script>

<style lang="scss" scoped>
$borderColor: #e6e6ea;
$textColor: #03050d;

.auth-table {
  border: 1px solid $borderColor;

  .auth-table__header {
    background: rgba(247, 248, 254, 1);
    font-size: 14px;
    color: $textColor;

    .auth-table__td {
      padding: 11px 16px;
      font-weight: bold;
      border-right: 1px solid $borderColor;

      &:last-child {
        border-right: 0;
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
    width: 100%;

    .auth-table__td {
      &:last-child {
        border-bottom: 0;
      }
    }
  }

  .tree-lists-2 {
    padding: 20px;
    border-width: 0 0 0 1px;
    border-color: $borderColor;
    border-style: solid;
    min-height: 300px;

    &:last-child {
      padding-bottom: 10px;
    }

    &.is-front {
      margin-top: 8px;
    }

    //width: 160px;
  }

  .tree-normal {
    &.tree-2 {
      display: inline-block;
    }
  }

  .tree-checkbox {
    display: inline-block;
    width: 150px;
    margin: 0 20px 8px 8px;
    overflow: hidden;

    .td-checkbox {
      width: 130px;
      margin-bottom: 20px;
    }

    /deep/ {
      .el-checkbox__label {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }
    }
  }

  .tree-report {
    width: 100%;
    margin-left: 0;
    margin-bottom: 4px;

    .auth-table__title {
      width: 100%;
      font-weight: bold;
      color: $textColor;
      background: rgba(247, 248, 254, 1);
      border-radius: 2px;
      padding: 7px 8px;
      margin-bottom: 20px;

      span,
      label {
        vertical-align: middle;
      }
    }

    .report-lists {
      width: 100%;
      margin-bottom: 0;
    }
  }

  .td-text {
    padding: 5px 10px;
    margin: 0 8px 10px 0;
    background: #f0f1f2;
    border-radius: 2px;
  }

  .auth-nodata {
    padding: 20px 20px;
    text-align: center;
  }
}

/deep/ {
  .el-checkbox__label {
    color: #03050d;
  }

  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #03050d;
  }
}

.el-tabs {
  /deep/ {
    .el-tabs__header {
      width: 192px;
      margin-right: 0;
      padding: 16px 0;

      .auth-table__td {
        width: auto;
        min-width: initial;
        max-width: initial;
        padding: 0;
      }
    }

    .el-tabs--left .el-tabs__item.is-left {
      text-align: left;
    }

    .el-tabs__nav-wrap {
      padding: 0 8px;

      &::after {
        display: none;
      }
    }

    .el-tabs__nav {
      .el-tabs__active-bar {
        display: none;
      }

      .el-tabs__item {
        &.is-active {
          background: #f5f7ff;
          border-radius: 4px;
        }

        .auth-table__td {
          display: flex;
          align-items: center;

          span {
            flex: 1;
            text-align: left;
          }
        }
      }
    }

    .el-tabs__content {
      .auth-table__item {
        border-bottom: 0;
      }
      #pane-0 {
        ul:first-child {
          margin-top: 8px;
        }
      }
    }
  }
}

.disabled-table {
  /deep/ {
    .el-checkbox__input .el-checkbox__inner {
      background-color: #edf2fc;
      border-color: #dcdfe6;
      cursor: not-allowed;
      &::after {
        border-color: #c0c4cc;
      }
    }
    .el-checkbox__input + span.el-checkbox__label,
    .tree-1 .el-checkbox + span {
      color: #c0c4cc;
      cursor: not-allowed;
    }
    .el-icon-arrow-right {
      color: #666666;
    }
  }
}
</style>
