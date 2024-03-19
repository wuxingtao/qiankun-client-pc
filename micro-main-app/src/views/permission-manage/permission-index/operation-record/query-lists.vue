<template>
  <div class="query-container">
    <el-input
      placeholder="搜索用户名或手机号"
      v-model="formData.userPhoneSelect"
      :maxlength="11"
      suffix-icon="iconfont icon-search fs_12--strict"
      size="small"
      @input="querySearch"
      clearable
    />
    <div class="suggestion-lists mtb_16">
      <ul>
        <li 
          :class="[
            'suggestion-item',
            formData.userSelect.id === item.id && 'suggestion-item-active'
          ]"
          v-for="(item, index) in userListsFilter"
          :index="item.id" :key="index"
          @click="handleSelect(item)"
        >
          <div class="role-info">
            <span class="phone f_w_b mr_8" v-html="item.userTelFormat"></span>
            <span class="name mr_10" :title="item.userName">{{ item.userName }}</span>
            <user-label class="user-label" v-if="item.userLevelName"
              >{{ item.userLevelName }}
            </user-label>
            <span class="user-label" v-else></span>
          </div>
        </li>
        <div class="no-data" v-show="userListsFilter.length === 0">
          <span>暂无匹配数据</span>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  onActivated,
  onMounted,
  watchEffect,
  computed
} from '@vue/composition-api'
import { uam_userList } from '@api/permission'
import { permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import useUam from '@views/permission-manage/hooks/useUam'
import Format from '@utils/format'

export default defineComponent({
  name: 'query-lists',
  props: {},
  components: {
    'user-label': () => import('@views/permission-manage/components/user-label.vue')
  },
  setup(props, { emit }) {
    const state = reactive({
      formData: {
        userPhoneSelect: '',
        userSelect: {}
      },
      userLists: [],
      userListsFilter: []
    })

    const { uam_user_type, uam_current_user } = useUam()

    const auth_user_info = computed(() => {
      return uam_current_user()
    })

    onMounted(() => {
      handleUamUser()
    })

    onActivated(() => {
      handleUamUser()
    })

    function _createFilter(queryString) {
      return lists => {
        return (
          lists.userTel?.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          lists.userName?.toLowerCase().indexOf(queryString.toLowerCase()) > -1
        )
      }
    }

    function querySearch(queryString) {
      let results = queryString
        ? state.userLists.filter(_createFilter(queryString))
        : state.userLists
      return results.map(item => {
        return {
          ...item,
          userLevelName:
            item.userExternalType !== permissionLevel.NORMAL
              ? uam_user_type(item.userExternalType)
              : '',
          userTelFormat: item.userTel.replace(
            new RegExp(`(${queryString})`, 'ig'),
            '<span style=\'color:#8365f6\'>$1</span>'
          )
        }
      })
    }

    watchEffect(() => {
      state.userListsFilter = querySearch(state.formData.userPhoneSelect)
    })

    function handleSelect(item) {
      // state.formData.userPhoneSelect = item.userTel
      state.formData.userSelect = item
      emit('select', item)
    }

    function getUserSelect() {
      return state.formData.userSelect
    }

    async function handleUamUser() {
      let res = await uam_userList({ owner: false })
      if (res.code === 0 && res.data) {
        state.userLists = res.data
      }
      const selectItem =
        state.userLists.find(item => item.userTel === auth_user_info.value.userTel) || {}
      // 默认选中自己
      handleSelect(selectItem)
    }

    return { ...toRefs(state), querySearch, handleSelect, getUserSelect, permissionLevel }
  }
})
</script>

<style lang="scss" scoped>
.suggestion-lists {
  .suggestion-item {
    background-color: #ffffff;
    border: 1px solid #e6e6ea;
    border-radius: 4px;
    margin-bottom: 4px;
    padding: 10px 18px;
    cursor: pointer;

    &:hover,
    &.suggestion-item-active {
      background-color: #f6f8ff;
    }

    &.suggestion-item-active {
      border: 1px solid #8365f6;
    }

    .role-info {
      .phone {
        color: #03050d;
      }

      .name {
        //max-width: 50%;
        width: 30%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
        vertical-align: middle;
        color: #666666;
      }

      .user-label {
        width: 50px;
      }
    }
  }
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999999;
}
</style>
