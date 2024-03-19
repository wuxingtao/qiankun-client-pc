<template>
  <ky-drawer direction="rtl" :visible.sync="visible" title="操作详情" class="">
    <div class="detail-wrapper">
      <div class="detail-info">
        <div class="detail-item">
          <span class="label">操 作 人：</span
          ><span class="value">{{ detailInfo.operatorName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作时间：</span
          ><span class="value">{{ detailInfo.updationDate | dateTimeHMFormat }}</span>
        </div>
        <div class="detail-item">
          <span class="label">被操作人：</span
          ><span class="value">
            <span>{{ detailInfo.userPhone }} {{ detailInfo.userName }}</span>
            <user-label>{{ detailInfo.userExternalTypeFormat }}</user-label>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">操作类型：</span><span class="value">{{ detailInfo.typeStr }}</span>
        </div>
      </div>
      <div class="detail-content">
        <p class="label c_999 mb_16">操作内容：</p>
        <div class="detail-table">
          <div
            class="detail-tr"
            v-if="showMultipleTr"
            v-for="(item, index) in detailInfo.contentLists"
            :key="index"
          >
            <div class="detail-td ellipsis" :title="item.firstLabel || detailInfo.typeStr">
              {{ item.firstLabel || detailInfo.typeStr }}
            </div>
            <div class="detail-td">
              <template v-if="item.firstLabel">
                <div v-if="item.secondStr" class="mb_8">{{ item.secondStr }}</div>
                <div v-for="(childItem, childIndex) in item.secondLists" class="level--2">
                  <p class="second-label">{{ childItem.label }}</p>
                  <ul>
                    <li v-for="(v, k) in childItem.lists" :key="k">{{ v }}</li>
                  </ul>
                </div>
              </template>
              <template v-else>
                <p class="mb_8">{{ detailInfo.content }}</p>
              </template>
            </div>
          </div>
          <div class="detail-tr detail-tr-single" v-else>
            <div class="detail-td ellipsis" :title="detailInfo.typeStr">
              {{ detailInfo.typeStr }}
            </div>
            <div class="detail-td">{{ detailInfo.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </ky-drawer>
</template>

<script>
import { defineComponent, reactive, toRefs, watch, computed } from '@vue/composition-api'
import useUam from '@views/permission-manage/hooks/useUam'
import { permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import { dateTimeHM } from '@views/permission-manage/permissionUtil'

export default defineComponent({
  name: 'reccord-detail',
  props: {},
  components: {
    'ky-drawer': () => import('../../components/ky-drawer'),
    'user-label': () => import('@views/permission-manage/components/user-label.vue')
  },
  setup() {
    const state = reactive({
      visible: false,
      detailInfo: {
        contentLists: []
      }
    })

    // 是否展示表格行
    const showMultipleTr = computed(() => {
      return /10|60/.test(state.detailInfo.type)
    })

    watch(
      () => state.visible,
      val => {
        if (!val) {
          handleClose()
        }
      }
    )

    const { uam_user_type } = useUam()

    function openDrawer(row) {
      state.visible = true
      state.detailInfo = {
        ...row,
        userExternalTypeFormat: uam_user_type(row.userExternalType),
        contentLists: dataTrans(row.content)
      }
    }

    function dataTrans(str) {
      let result = []
      const lists = str.split(' ') || []
      lists
        .filter(i => i)
        .forEach(item => {
          let splitInfo = {
            firstLabel: '',
            secondLists: [],
            secondStr: ''
          }
          if (/([\u4e00-\u9fa5]*)：([\s\S]*)/gi.test(item)) {
            splitInfo.firstLabel = RegExp.$1
            if (RegExp.$2.indexOf('【') > -1) {
              const secondArr = RegExp.$2.split('，')
              secondArr.forEach(childItem => {
                if (/([\u4e00-\u9fa5]*)【([\s\S]*)】/gi.test(childItem)) {
                  splitInfo.secondLists.push({
                    label: RegExp.$1,
                    lists: RegExp.$2 ? RegExp.$2.split('/') : []
                  })
                }
              })
            } else {
              splitInfo.secondStr = RegExp.$2
            }
          }
          result.push(splitInfo)
        })
      return result
    }

    function handleClose() {}

    return { ...toRefs(state), showMultipleTr, permissionLevel, openDrawer, handleClose }
  },
  filters: {
    dateTimeHMFormat(val) {
      return dateTimeHM(val)
    }
  }
})
</script>

<style lang="scss" scoped>
.detail-wrapper {
  padding: 0 20px 20px;
}

.detail-info {
  .detail-item {
    margin-bottom: 16px;

    &:first-child {
      .label {
        word-spacing: 3px;
      }
    }

    .label {
      color: #999999;
      display: inline-block;
      margin-right: 10px;
    }

    .value {
    }
  }
}

.detail-table {
  border: 1px solid #e6e6ea;
  width: 100%;

  .detail-tr {
    border-bottom: 1px solid #e6e6ea;
    display: flex;
    align-items: center;
    background-color: #f7f8fe;

    .detail-td {
      &:first-child {
        font-weight: bold;
        padding: 10px 20px;
        width: 100px;
        text-align: center;
      }

      &:last-child {
        padding: 16px 16px 8px;
        border-left: 1px solid #e6e6ea;
        background-color: #ffffff;
        width: 100%;
      }

      .second-label {
        margin-bottom: 10px;
        position: relative;
        padding-left: 12px;

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

      ul {
        display: flex;
        flex-wrap: wrap;
        padding-left: 8px;
      }

      li {
        padding: 6px;
        margin: 4px;
        background: #f5f7fc;
        border-radius: 2px;
        white-space: nowrap;
      }
    }

    &:last-child {
      border-bottom: 0;
    }
  }

  .detail-tr-single {
    line-height: 1.4;

    .detail-td {
      &:last-child {
        padding: 8px 16px;
      }
    }
  }

  .level--2 {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
