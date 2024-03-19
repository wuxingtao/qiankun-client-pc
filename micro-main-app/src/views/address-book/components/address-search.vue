<template>
  <div class="address-book-search flex flex_ai_c">
    <div class="address-search-input">
      <el-input
          v-model='searchValue'
          slot='reference'
          ref='input'
          size='small'
          maxlength="100"
          clearable
          placeholder='输入姓名或电话或公司名称进行搜索'
      >
      </el-input>
    </div>
    <el-button class="fs_14 ml_12 f_w_600" type='primary' @click='handleSearch' size='small'><i
        class="iconfont icon-search fs_13--strict f_w_600 mr_6"></i>搜索
    </el-button>
    <el-button class="ml_12 f_w_600" size="medium" @click="clearValue">清空</el-button>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs,watch } from '@vue/composition-api'

export default defineComponent({
  name: 'address-search',
  props: {},
  setup ({props},{emit}) {
    const state = reactive({
      searchValue: ''
    })

    watch(()=>state.searchValue,(val)=>{
      emit('change',val)
    })

    function handleSearch(){
      emit('search',state.searchValue)
    }

    function clearValue(){
      state.searchValue = ''
    }

    return { ...toRefs(state),handleSearch,clearValue}
  }
})
</script>

<style lang="scss" scoped>
.address-book-search {
  height: 56px;
  background: #ffffff;
  margin-bottom: 8px;
  padding: 0 8px;

  .address-search-input {
    width: 300px;
  }
  .f_w_600{
    span{
      font-weight: bold;
    }
  }
}

</style>
